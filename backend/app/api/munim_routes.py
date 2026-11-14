import base64
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.munim import Merchant, Sale, Product, PaymentTender, StockPolicy, StockMovement, ActionPreview
from backend.app.schemas.munim import (
    AskRequest, ActionPreviewRequest, ActionApproveRequest,
    DemoEventRequest, ImportCommitRequest, VoiceTTSRequest, VoiceSTTRequest
)
from backend.app.services.analytics import (
    get_dashboard_metrics, get_lapsed_regulars, get_sku_details,
    get_low_stock_items, get_payment_breakdown, resolve_date_range,
    DEMO_DATE, paise_to_inr_str
)
from backend.app.services.ai_assistant import (
    classify_intent_deterministic, classify_intent_llm,
    extract_date_range_from_query,
    speech_to_text_sarvam, text_to_speech_sarvam,
    format_spoken_and_display_answer, PROVIDER_CALL_STATS
)
from backend.app.services.seed import seed_database
from backend.app.services.importer import validate_and_preview_sales_import, commit_sales_import

router = APIRouter()

@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    merchants_count = db.query(Merchant).count()
    sales_count = db.query(Sale).count()
    tenders_count = db.query(PaymentTender).count()
    return {
        "status": "healthy",
        "service": "Munim AI Assistant API (Upgraded)",
        "version": "1.1.0",
        "database": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
        "database_url_configured": bool(settings.DATABASE_URL),
        "demo_mode": True,
        "dataset_as_of": DEMO_DATE,
        "counts": {
            "merchants": merchants_count,
            "sales": sales_count,
            "tenders": tenders_count
        },
        "sarvam_ai": {
            "configured": bool(settings.SARVAM_API_KEY),
            "chat_model": settings.SARVAM_CHAT_MODEL,
            "tts_model": settings.SARVAM_TTS_MODEL,
            "stt_model": settings.SARVAM_STT_MODEL,
            "stats": PROVIDER_CALL_STATS
        }
    }

@router.get("/merchants")
def list_merchants(db: Session = Depends(get_db)):
    merchants = db.query(Merchant).all()
    return [
        {
            "merchant_id": m.merchant_id,
            "name": m.name,
            "business_type": m.business_type,
            "timezone": m.timezone,
            "currency": m.currency,
            "source": m.source
        }
        for m in merchants
    ]

@router.get("/dashboard")
def get_dashboard(
    merchant_id: str = Query("M01", description="Merchant ID"),
    from_date: Optional[str] = Query(None, alias="from", description="Start date YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, alias="to", description="End date YYYY-MM-DD"),
    preset: Optional[str] = Query(None, description="Preset: today, last_7_days, last_month, month_to_date"),
    db: Session = Depends(get_db)
):
    metrics = get_dashboard_metrics(db, merchant_id, from_date, to_date, preset)
    return metrics

@router.get("/inventory/low-stock")
def get_low_stock(merchant_id: str = Query("M01"), db: Session = Depends(get_db)):
    items = get_low_stock_items(db, merchant_id)
    return {"merchant_id": merchant_id, "low_stock_count": len(items), "items": items}

@router.get("/inventory/skus/{product_id}")
def get_sku(
    product_id: str,
    merchant_id: str = Query("M01"),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db)
):
    f_date = from_date or "2026-10-01"
    t_date = to_date or "2026-11-13"
    details = get_sku_details(db, merchant_id, product_id, from_date=f_date, to_date=t_date)
    if not details:
        raise HTTPException(status_code=404, detail="Product SKU not found")
    return details

@router.get("/payments/breakdown")
def get_payments(
    merchant_id: str = Query("M01"),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    preset: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    from_d, to_d, _ = resolve_date_range(preset, from_date, to_date)
    return get_payment_breakdown(db, merchant_id, from_d, to_d)

@router.post("/ask")
def ask_assistant(req: AskRequest, db: Session = Depends(get_db)):
    merchant_id = req.merchant_id or "M01"
    locale = req.locale or "te-IN"

    question_text = (req.question or "").strip()

    # Transcribe audio if provided
    if req.audio_base64:
        try:
            audio_bytes = base64.b64decode(req.audio_base64)
            transcription, err = speech_to_text_sarvam(audio_bytes, mime_type="audio/wav", language_code=locale)
            if transcription:
                question_text = transcription
        except Exception:
            pass

    if not question_text:
        question_text = "ఈ రోజు ఎంత అమ్మాం?" if locale == "te-IN" else "आज कितनी बिक्री हुई?" if locale == "hi-IN" else "How much did we sell today?"

    # 1. Date Range Resolution from question or request
    from_d = req.from_date
    to_d = req.to_date
    preset = None

    if not from_d and not to_d:
        q_from, q_to, q_preset = extract_date_range_from_query(question_text)
        from_d, to_d, preset = q_from, q_to, q_preset

    from_d, to_d, _ = resolve_date_range(preset, from_d, to_d)

    # 2. Intent Classification
    intent = classify_intent_deterministic(question_text)
    if not intent:
        intent = classify_intent_llm(question_text)

    # 3. Facts computation from database
    metrics = get_dashboard_metrics(db, merchant_id, from_d, to_d, preset)
    answer_text, numeric_facts, action_preview = format_spoken_and_display_answer(
        intent=intent,
        locale=locale,
        metrics=metrics,
        db=db,
        merchant_id=merchant_id,
        question_text=question_text
    )

    # 4. Spoken audio via Sarvam TTS
    audio_base64 = None
    try:
        audio_b64, tts_err = text_to_speech_sarvam(answer_text, language_code=locale)
        if audio_b64:
            audio_base64 = audio_b64
    except Exception:
        pass

    return {
        "intent": intent,
        "locale": locale,
        "question": question_text,
        "answer_text": answer_text,
        "audio_base64": audio_base64,
        "numeric_facts": numeric_facts,
        "period": f"{from_d} to {to_d}" if from_d != to_d else from_d,
        "data_as_of": DEMO_DATE,
        "data_source": "synthetic_database",
        "action_preview": action_preview,
        "provider_calls": PROVIDER_CALL_STATS["total_calls"]
    }

@router.post("/actions/preview")
def create_action_preview(req: ActionPreviewRequest, db: Session = Depends(get_db)):
    merchant_id = req.merchant_id or "M01"
    lapsed = get_lapsed_regulars(db, merchant_id)
    count = len(lapsed)
    offer_inr = req.offer_inr or 20
    max_discount_inr = count * offer_inr

    preview_id = f"PREV-{merchant_id}-WINBACK-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    new_preview = ActionPreview(
        id=preview_id,
        merchant_id=merchant_id,
        action_type="winback_offer",
        status="previewed",
        created_at=datetime.now().isoformat(),
        title="Win-back Regular Customers Offer",
        description=f"Send ₹{offer_inr} discount offer to {count} opted-in lapsed regular customers.",
        payload_json=json.dumps({
            "recipient_count": count,
            "offer_amount_paise": offer_inr * 100,
            "max_discount_paise": max_discount_inr * 100,
            "customer_ids": [c["customer_id"] for c in lapsed],
            "sample_message_te": f"నమస్కారం! రమేష్ కిరాణా నుండి మీకోసం ₹{offer_inr} ప్రత్యేక ఆఫర్! ఈ రోజే రండి.",
            "sample_message_hi": f"नमस्ते! रमेश किराना से आपके लिए ₹{offer_inr} का विशेष ऑफर! आज ही पधारें।",
            "sample_message_en": f"Hello! Get ₹{offer_inr} off on your next visit at Ramesh Kirana! Valid this week."
        })
    )
    db.add(new_preview)
    db.commit()

    return {
        "id": preview_id,
        "merchant_id": merchant_id,
        "action_type": "winback_offer",
        "status": "previewed",
        "recipient_count": count,
        "offer_inr": offer_inr,
        "offer_formatted": f"₹{offer_inr}",
        "max_discount_exposure": f"₹{max_discount_inr:,}",
        "sample_message": f"నమస్కారం! రమేష్ కిరాణా నుండి మీకోసం ₹{offer_inr} ప్రత్యేక ఆఫర్! ఈ రోజే రండి.",
        "requires_approval": True,
        "created_at": new_preview.created_at
    }

@router.post("/actions/{action_id}/approve")
def approve_action(action_id: str, req: ActionApproveRequest = None, db: Session = Depends(get_db)):
    merchant_id = req.merchant_id if req else "M01"

    preview = db.query(ActionPreview).filter(
        ActionPreview.id == action_id
    ).first()

    if not preview:
        preview = db.query(ActionPreview).filter(
            ActionPreview.merchant_id == merchant_id,
            ActionPreview.action_type == "winback_offer"
        ).order_by(ActionPreview.created_at.desc()).first()

    if not preview:
        raise HTTPException(status_code=404, detail=f"Action preview {action_id} not found")

    if preview.status in ("approved", "executed") and preview.outbox_receipt_json:
        receipt = json.loads(preview.outbox_receipt_json)
        return {
            "status": "already_approved",
            "action_id": preview.id,
            "approved_at": preview.approved_at,
            "outbox_receipt": receipt
        }

    now_ts = datetime.now().isoformat()
    dispatch_id = f"OUT-{preview.id[-12:]}"
    payload = json.loads(preview.payload_json) if preview.payload_json else {}
    recipients_count = payload.get("recipient_count", 24)

    receipt = {
        "dispatch_id": dispatch_id,
        "action_id": preview.id,
        "merchant_id": preview.merchant_id,
        "channel": "simulated_sms_whatsapp",
        "status": "dispatched",
        "recipients_delivered": recipients_count,
        "dispatched_at": now_ts,
        "sample_delivered_text": payload.get("sample_message_te", "నమస్కారం! రమేష్ కిరాణా నుండి మీకోసం ₹20 ఆఫర్!"),
        "audit_record": {
            "actor": f"merchant:{preview.merchant_id}",
            "action": "APPROVED_WINBACK_CAMPAIGN",
            "timestamp": now_ts,
            "verified_atomic": True
        }
    }

    preview.status = "executed"
    preview.approved_at = now_ts
    preview.outbox_receipt_json = json.dumps(receipt)
    db.commit()

    return {
        "status": "approved_and_dispatched",
        "action_id": preview.id,
        "approved_at": now_ts,
        "outbox_receipt": receipt
    }

@router.post("/demo/events")
def post_demo_event(event: DemoEventRequest, db: Session = Depends(get_db)):
    if event.merchant_id != "M01":
        raise HTTPException(status_code=400, detail="Demo events currently supported for merchant M01")

    existing = db.query(Sale).filter(
        Sale.merchant_id == event.merchant_id,
        Sale.sale_id == event.sale_id
    ).first()

    if existing:
        metrics = get_dashboard_metrics(db, event.merchant_id, DEMO_DATE, DEMO_DATE)
        return {
            "status": "already_processed",
            "sale_id": event.sale_id,
            "message": "Simulated live event already stored. Idempotent check passed.",
            "sales_summary": metrics["sales_summary"],
            "recent_transactions": metrics["recent_transactions"]
        }

    # Add new payment receipt (payment-only event)
    new_sale = Sale(
        merchant_id=event.merchant_id,
        sale_id=event.sale_id,
        sold_at=event.sold_at,
        customer_id=None,
        channel=event.channel,
        status=event.status,
        amount_paise=event.amount_paise,
        source=event.source or "simulated_live"
    )
    db.add(new_sale)

    # Also register matching tender collection
    new_tender = PaymentTender(
        merchant_id=event.merchant_id,
        tender_id=f"{event.merchant_id}-TND-{event.sale_id}",
        sale_id=event.sale_id,
        tender_type=event.channel,
        amount_paise=event.amount_paise,
        status=event.status,
        paid_at=event.sold_at,
        source="simulated_live"
    )
    db.add(new_tender)
    db.commit()

    metrics = get_dashboard_metrics(db, event.merchant_id, DEMO_DATE, DEMO_DATE)

    return {
        "status": "event_processed",
        "sale_id": event.sale_id,
        "amount_paise": event.amount_paise,
        "amount_formatted": paise_to_inr_str(event.amount_paise),
        "source": "simulated_live",
        "sales_summary": metrics["sales_summary"],
        "recent_transactions": metrics["recent_transactions"]
    }

@router.post("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    res = seed_database(db, force=True)
    metrics = get_dashboard_metrics(db, "M01", DEMO_DATE, DEMO_DATE)
    return {
        "status": "demo_reset_successful",
        "seed_result": res,
        "m01_baseline": {
            "paid_orders": metrics["sales_summary"]["paid_order_count"],
            "paid_sales_paise": metrics["sales_summary"]["paid_sales_paise"],
            "paid_sales_formatted": metrics["sales_summary"]["paid_sales_formatted"],
            "overdue_settlement": metrics["settlements"]["overdue_formatted"]
        }
    }

@router.post("/import/preview")
async def preview_import(
    file: UploadFile = File(...),
    merchant_id: str = Form("M01"),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    try:
        preview = validate_and_preview_sales_import(contents, file.filename, merchant_id, db)
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import/commit")
def commit_import(req: ImportCommitRequest, db: Session = Depends(get_db)):
    try:
        result = commit_sales_import(req.rows, req.merchant_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/voice/tts")
def voice_tts(req: VoiceTTSRequest):
    audio_b64, err = text_to_speech_sarvam(req.text, language_code=req.locale)
    if err and not audio_b64:
        raise HTTPException(status_code=502, detail=err)
    return {
        "audio_base64": audio_b64,
        "locale": req.locale,
        "format": "audio/wav"
    }

@router.post("/voice/stt")
def voice_stt(req: VoiceSTTRequest):
    try:
        audio_bytes = base64.b64decode(req.audio_base64)
        transcript, err = speech_to_text_sarvam(audio_bytes, mime_type=req.mime_type, language_code=req.locale)
        if err and not transcript:
            raise HTTPException(status_code=502, detail=err)
        return {
            "transcript": transcript,
            "locale": req.locale
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
