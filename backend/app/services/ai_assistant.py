import base64
import json
import logging
import re
import requests
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.services.analytics import (
    get_dashboard_metrics, get_lapsed_regulars, get_stockup_scenario,
    get_sku_details, get_low_stock_items, get_payment_breakdown,
    resolve_date_range, resolve_sku, paise_to_inr_str, DEMO_DATE
)
from backend.app.models.munim import ActionPreview, Product

logger = logging.getLogger(__name__)

# Development-only provider call counter (no keys, audio or transcripts logged)
PROVIDER_CALL_STATS = {
    "total_calls": 0,
    "stt_calls": 0,
    "tts_calls": 0,
    "chat_calls": 0,
    "last_error": None
}

def record_provider_call(call_type: str, success: bool = True, error: Optional[str] = None):
    PROVIDER_CALL_STATS["total_calls"] += 1
    if call_type == "stt":
        PROVIDER_CALL_STATS["stt_calls"] += 1
    elif call_type == "tts":
        PROVIDER_CALL_STATS["tts_calls"] += 1
    elif call_type == "chat":
        PROVIDER_CALL_STATS["chat_calls"] += 1
    if not success and error:
        PROVIDER_CALL_STATS["last_error"] = error[:100]

# All allowlisted intents
VALID_INTENTS = {
    "daily_brief",
    "sales_trend",
    "product_growth",
    "settlement_status",
    "winback",
    "stock_planning",
    "sku_performance",
    "inventory_on_hand",
    "low_stock",
    "payment_breakdown",
    "period_comparison",
    "general"
}

def extract_date_range_from_query(question: str) -> Tuple[str, str, str]:
    q = question.lower()
    if any(k in q for k in ["last month", "గత నెల", "పోయిన నెల", "గత నెలలో", "पिछले महीने", "october", "అక్టోబర్", "अक्टूबर"]):
        return "2026-10-01", "2026-10-31", "last_month"
    elif any(k in q for k in ["last 7 days", "గత 7 రోజులు", "గత వారం", "पिछले 7 दिन", "पिछले हफ्ते"]):
        return "2026-11-07", DEMO_DATE, "last_7_days"
    elif any(k in q for k in ["month to date", "ఈ నెల", "ఈ నెలలో", "इस महीने"]):
        return "2026-11-01", DEMO_DATE, "month_to_date"
    return DEMO_DATE, DEMO_DATE, "today"

def classify_intent_deterministic(question: str) -> Optional[str]:
    """
    Fast, deterministic intent matching covering all allowlisted intents
    in Telugu, Hindi, and English.
    """
    q = question.strip().lower()

    # 1. Inventory on hand / SKU Stock queries ("How much milk is left?", "పాల స్టాక్ ఎంత ఉంది?")
    if any(k in q for k in ["milk is left", "stock is left", "how much milk", "how much tea is left", "పాల స్టాక్", "పాలు ఎంత ఉన్నాయి", "పాలు ఎంత మిగిలాయి", "స్టాక్ ఎంత ఉంది", "దూధ్ కిత్నా బచా", "दूध कितना बचा", "स्टॉक कितना बचा"]):
        return "inventory_on_hand"

    # 2. Low stock queries ("Which items are low in stock?", "ఏ వస్తువులు తక్కువగా ఉన్నాయి?")
    if any(k in q for k in ["low stock", "running out", "reorder point", "తక్కువగా ఉన్నాయి", "స్టాక్ అయిపోయింది", "ఖాలీ అవుతున్న", "कम स्टॉक", "स्टॉक खत्म"]):
        return "low_stock"

    # 3. Payment Breakdown ("How much came through UPI?", "యూపీఐ ద్వారా ఎంత వచ్చింది?")
    if any(k in q for k in ["through upi", "came through upi", "via upi", "cash collection", "payment breakdown", "యూపీఐ ద్వారా", "యూపీఐ తో ఎంత", "నగదు ఎంత", "యూపీఐ కలెక్షన్", "upi se kitna", "यूपीआई से कितना", "कैश कितना"]):
        return "payment_breakdown"

    # 4. Period Comparison / Monthly summary ("What sold most last month?", "గత నెలలో అత్యధికంగా ఏమి అమ్ముడైంది?")
    if any(k in q for k in ["sold most last month", "what sold most", "last month sales", "october sales", "గత నెలలో", "గత నెల అమ్మకాలు", "అక్టోబర్ అమ్మకాలు", "పోయిన నెల", "पिछले महीने क्या बिका", "अक्टूबर की बिक्री"]):
        if any(p in q for p in ["sold most", "top", "ఏమి అమ్ముడైంది", "ఎక్కువ", "క్యా బికా"]):
            return "product_growth"
        return "period_comparison"

    # 5. SKU Performance ("How much milk did we sell?", "పాలు ఎంత అమ్మాం?")
    if any(k in q for k in ["milk did we sell", "how much milk sold", "tea sold", "పాలు ఎంత అమ్మాం", "పాలు ఎంత సేల్", "दूध कितना बिका"]):
        return "sku_performance"

    # 6. Win-back
    if any(k in q for k in ["రెగ్యులర్ కస్టమర్లు", "రావడం మానేశారా", "విన్-బ్యాక్", "regular customer", "lapsed", "stop coming", "win back", "winback", "inactive customer", "ग्राहक आना बंद"]):
        return "winback"

    # 7. Settlement Status
    if any(k in q for k in ["సెటిల్మెంట్", "డబ్బులు పడ్డాయా", "యూపీఐ సెటిల్మెంట్", "settlement", "payout", "overdue", "upi pending", "सेटलमेंट", "बकाया"]):
        return "settlement_status"

    # 8. Peak Sales Trend
    if any(k in q for k in ["పీక్", "పీక్ సమయం", "రద్దీ సమయం", "peak hour", "peak time", "busy time", "sales trend", "पीक समय", "भीड़ कब"]):
        return "sales_trend"

    # 9. Stock Planning Scenario
    if any(k in q for k in ["స్టాక్ రీ-ఆర్డర్", "సరుకు ఆర్డర్", "రీ-ఆర్డర్ ప్లాన్", "stock up", "reorder plan", "stock planning", "स्टॉक री-ऑर्डर"]):
        return "stock_planning"

    # 10. General Daily Brief ("ఈ రోజు ఎంత అమ్మాం?", "How much did we sell today?")
    if any(k in q for k in ["ఎంత అమ్మాం", "ఎంత అమ్మకం", "ఈ రోజు సేల్స్", "సేల్స్ ఎంత", "ఎంత వ్యాపారం", "how much did we sell", "sales today", "today sales", "today's sales", "daily summary", "kitni bikri", "aaj kitna"]):
        return "daily_brief"

    return None

def classify_intent_llm(question: str) -> str:
    """
    Classify free-form query using Sarvam AI LLM with strict allowlisted JSON output.
    """
    if not settings.SARVAM_API_KEY:
        return "general"

    url = f"{settings.SARVAM_BASE_URL}/v1/chat/completions"
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    system_msg = (
        "You are an intent classifier for Munim merchant assistant. "
        "Allowed intents: daily_brief, sales_trend, product_growth, settlement_status, winback, stock_planning, sku_performance, inventory_on_hand, low_stock, payment_breakdown, period_comparison, general. "
        "Reply with ONLY a JSON object: {\"intent\": \"<intent>\"}."
    )
    user_msg = f"Classify this merchant question: {question}"

    payload = {
        "model": settings.SARVAM_CHAT_MODEL,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ],
        "max_tokens": 30
    }

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=3.0)
        record_provider_call("chat", success=(r.status_code == 200))
        if r.status_code == 200:
            res = r.json()
            content = res["choices"][0]["message"].get("content", "")
            match = re.search(r'\{.*"intent"\s*:\s*"([a-zA-Z_]+)".*\}', content)
            if match:
                intent = match.group(1).lower()
                if intent in VALID_INTENTS:
                    return intent
    except Exception as e:
        record_provider_call("chat", success=False, error=str(e))

    return "general"

def speech_to_text_sarvam(audio_bytes: bytes, mime_type: str = "audio/wav", language_code: str = "te-IN") -> Tuple[Optional[str], Optional[str]]:
    if not settings.SARVAM_API_KEY:
        return None, "Sarvam API key is not configured."

    url = f"{settings.SARVAM_BASE_URL}/speech-to-text"
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY
    }
    files = {
        "file": ("audio.wav", audio_bytes, mime_type)
    }
    data = {
        "model": settings.SARVAM_STT_MODEL,
        "language_code": language_code
    }

    try:
        r = requests.post(url, headers=headers, files=files, data=data, timeout=5.0)
        record_provider_call("stt", success=(r.status_code == 200))
        if r.status_code == 200:
            res = r.json()
            return res.get("transcript", ""), None
        else:
            return None, f"STT failed ({r.status_code}): {r.text[:100]}"
    except Exception as e:
        record_provider_call("stt", success=False, error=str(e))
        return None, f"STT error: {str(e)}"

def text_to_speech_sarvam(text: str, language_code: str = "te-IN") -> Tuple[Optional[str], Optional[str]]:
    if not settings.SARVAM_API_KEY:
        return None, "Sarvam API key not configured."

    url = f"{settings.SARVAM_BASE_URL}/text-to-speech"
    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": [text[:500]],
        "target_language_code": language_code,
        "speaker": settings.SARVAM_TTS_SPEAKER,
        "model": settings.SARVAM_TTS_MODEL
    }

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=6.0)
        record_provider_call("tts", success=(r.status_code == 200))
        if r.status_code == 200:
            res = r.json()
            audios = res.get("audios", [])
            if audios:
                return audios[0], None
            return None, "No audio returned in response."
        else:
            return None, f"TTS failed ({r.status_code}): {r.text[:100]}"
    except Exception as e:
        record_provider_call("tts", success=False, error=str(e))
        return None, f"TTS error: {str(e)}"

def format_spoken_and_display_answer(
    intent: str,
    locale: str,
    metrics: Dict[str, Any],
    db: Session,
    merchant_id: str,
    question_text: str = ""
) -> Tuple[str, Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Computes verified factual answer and formatted text across all 11 allowlisted intents.
    """
    sales_sum = metrics["sales_summary"]
    orders = sales_sum["paid_order_count"]
    amount_formatted = sales_sum["paid_sales_formatted"]
    peak_period = sales_sum["peak_period"]
    date_label = metrics["date_range"].get("label", metrics["date_range"]["from"])

    action_preview = None

    # Intent 1: Inventory on Hand ("How much milk is left?")
    if intent == "inventory_on_hand":
        # Resolve SKU
        matched_sku, ambiguous = resolve_sku(db, merchant_id, "milk" if "milk" in question_text.lower() or "పాలు" in question_text.lower() or "పాల" in question_text.lower() or "दूध" in question_text.lower() else question_text)
        sku_id = matched_sku.product_id if matched_sku else "M01-P01"
        sku_name = matched_sku.name if matched_sku else "Milk"

        details = get_sku_details(db, merchant_id, sku_id)
        on_hand = details.get("on_hand", 4)
        reorder_point = details.get("reorder_point", 12)
        is_low = on_hand <= reorder_point

        numeric_facts = {
            "product_id": sku_id,
            "product_name": sku_name,
            "on_hand": on_hand,
            "on_hand_units": on_hand,
            "reorder_point": reorder_point,
            "is_low_stock": is_low,
            "as_of_date": DEMO_DATE
        }

        if locale == "te-IN":
            status_te = f"స్టాక్ తక్కువగా ఉంది (రీ-ఆర్డర్ పాయింట్: {reorder_point}). త్వరగా ఆర్డర్ చేయండి." if is_low else "స్టాక్ సరిపడా ఉంది."
            answer_text = f"ప్రస్తుతం {sku_name} స్టాక్ {on_hand} యూనిట్లు మాత్రమే మిగిలి ఉంది. {status_te}"
        elif locale == "hi-IN":
            status_hi = f"स्टॉक कम है (री-ऑर्डर बिंदु: {reorder_point})। कृपया पुनः ऑर्डर करें।" if is_low else "स्टॉक पर्याप्त है।"
            answer_text = f"वर्तमान में {sku_name} का केवल {on_hand} यूनिट स्टॉक बचा है। {status_hi}"
        else:
            status_en = f"Stock is low (reorder point: {reorder_point}). Reorder recommended." if is_low else "Stock level is healthy."
            answer_text = f"{sku_name} closing stock is {on_hand} units as of 13 November. {status_en}"

    # Intent 2: Low Stock List ("Which items are low in stock?")
    elif intent == "low_stock":
        low_items = get_low_stock_items(db, merchant_id)
        count = len(low_items)
        items_summary = ", ".join([f"{i['name']} ({i['on_hand']} left / reorder at {i['reorder_point']})" for i in low_items[:3]])

        numeric_facts = {
            "low_stock_count": count,
            "items": [{"name": i["name"], "on_hand": i["on_hand"], "reorder_point": i["reorder_point"]} for i in low_items]
        }

        if locale == "te-IN":
            answer_text = f"మీ దుకాణంలో {count} వస్తువుల స్టాక్ తక్కువగా ఉంది: {items_summary}."
        elif locale == "hi-IN":
            answer_text = f"आपकी दुकान में {count} सामानों का स्टॉक कम है: {items_summary}."
        else:
            answer_text = f"There are {count} low-stock items requiring reorder: {items_summary}."

    # Intent 3: Payment Breakdown ("How much came through UPI?")
    elif intent == "payment_breakdown":
        # Check if query specified last month or today
        from_d, to_d, preset = extract_date_range_from_query(question_text)
        pb = get_payment_breakdown(db, merchant_id, from_d, to_d)

        upi_channel = next((c for c in pb["channels"] if c["channel"] == "UPI"), None)
        cash_channel = next((c for c in pb["channels"] if c["channel"] == "CASH"), None)

        upi_amt = upi_channel["amount_formatted"] if upi_channel else "₹0"
        upi_pct = upi_channel["share_pct"] if upi_channel else 0.0
        total_amt = pb["total_collected_formatted"]

        numeric_facts = {
            "period": pb["period"],
            "total_collected": total_amt,
            "upi_collected": upi_amt,
            "upi_collected_formatted": upi_amt,
            "upi_share_pct": f"{upi_pct}%",
            "cash_collected": cash_channel["amount_formatted"] if cash_channel else "₹0"
        }

        period_desc = "అక్టోబర్ నెలలో" if preset == "last_month" else "ఈ రోజు"
        period_desc_en = "In October" if preset == "last_month" else "Today"
        period_desc_hi = "अक्टूबर महीने में" if preset == "last_month" else "आज"

        if locale == "te-IN":
            answer_text = f"{period_desc} యూపీఐ ద్వారా మొత్తం {upi_amt} వసూలైంది ({upi_pct}% వాటా). మొత్తం కలెక్షన్లు {total_amt}."
        elif locale == "hi-IN":
            answer_text = f"{period_desc_hi} यूपीआई से कुल {upi_amt} प्राप्त हुआ ({upi_pct}% हिस्सा)। कुल संग्रह {total_amt} रहा।"
        else:
            answer_text = f"{period_desc_en}, UPI collections totaled {upi_amt} ({upi_pct}% of total payments). Total collected was {total_amt}."

    # Intent 4: Product Growth / Month's Best Seller ("What sold most last month?")
    elif intent == "product_growth":
        top = metrics["top_products"]
        p1 = top[0]["name"] if len(top) > 0 else "Milk"
        p2 = top[1]["name"] if len(top) > 1 else "Tea"
        rev1 = top[0]["revenue_formatted"] if len(top) > 0 else "₹0"
        qty1 = top[0]["quantity"] if len(top) > 0 else 0

        numeric_facts = {
            "period": date_label,
            "top_product": p1,
            "units_sold": qty1,
            "revenue": rev1,
            "top_products": [{"name": p["name"], "quantity": p["quantity"], "revenue": p["revenue_formatted"]} for p in top[:3]]
        }

        if locale == "te-IN":
            answer_text = f"{date_label} లో {p1} అత్యధికంగా అమ్ముడైన వస్తువు ({qty1} యూనిట్లు, {rev1} వ్యాపారం). తర్వాత {p2} నిలిచింది."
        elif locale == "hi-IN":
            answer_text = f"{date_label} में {p1} सबसे ज्यादा बिका ({qty1} यूनिट, {rev1} की बिक्री)। इसके बाद {p2} रहा।"
        else:
            answer_text = f"During {date_label}, {p1} was your top-selling product with {qty1} units sold ({rev1}). Followed by {p2}."

    # Intent 5: Period Comparison / Monthly Summary ("October sales", "Last month sales")
    elif intent == "period_comparison":
        numeric_facts = {
            "period": date_label,
            "paid_orders": orders,
            "paid_pos_revenue": amount_formatted
        }
        if locale == "te-IN":
            answer_text = f"{date_label} కాలంలో మొత్తం {orders} ఆర్డర్లలో {amount_formatted} పీవోఎస్ వ్యాపారం నమోదైంది."
        elif locale == "hi-IN":
            answer_text = f"{date_label} में कुल {orders} ऑर्डर में {amount_formatted} की पीओएस बिक्री दर्ज की गई।"
        else:
            answer_text = f"For {date_label}, paid POS revenue was {amount_formatted} across {orders} completed orders."

    # Intent 6: Daily Brief
    elif intent == "daily_brief":
        numeric_facts = {
            "paid_orders": orders,
            "paid_sales_paise": sales_sum["paid_sales_paise"],
            "paid_sales_inr": int(sales_sum["paid_sales_paise"] / 100),
            "peak_period": peak_period,
            "peak_orders": sales_sum["peak_orders"],
            "date": date_label
        }
        if locale == "te-IN":
            answer_text = f"ఈ రోజు {orders} ఆర్డర్లలో మొత్తం {amount_formatted} వ్యాపారం జరిగింది. పీక్ సమయం {peak_period}."
        elif locale == "hi-IN":
            answer_text = f"आज {orders} ऑर्डर में कुल {amount_formatted} की बिक्री हुई है। पीक समय {peak_period} रहा।"
        else:
            answer_text = f"Today we had {orders} paid orders totaling {amount_formatted}. Peak sales were between {peak_period}."

    # Intent 7: Win-Back
    elif intent == "winback":
        lapsed = get_lapsed_regulars(db, merchant_id)
        count = len(lapsed)
        offer_inr = 20
        max_discount_inr = count * offer_inr

        numeric_facts = {
            "eligible_customers": count,
            "offer_inr": offer_inr,
            "max_discount_inr": max_discount_inr,
            "criteria": "opted_in=1, visits>=3, last_visit>=15_days_ago"
        }

        existing = db.query(ActionPreview).filter(
            ActionPreview.merchant_id == merchant_id,
            ActionPreview.action_type == "winback_offer",
            ActionPreview.status == "previewed"
        ).first()

        preview_id = existing.id if existing else f"PREV-{merchant_id}-WINBACK-001"
        if not existing:
            new_preview = ActionPreview(
                id=preview_id,
                merchant_id=merchant_id,
                action_type="winback_offer",
                status="previewed",
                created_at="2026-11-13T20:00:00+05:30",
                title="Win-back Regular Customers Offer",
                description=f"Send ₹20 discount offer to {count} opted-in lapsed regular customers.",
                payload_json=json.dumps({
                    "recipient_count": count,
                    "offer_amount_paise": offer_inr * 100,
                    "max_discount_paise": max_discount_inr * 100,
                    "customer_ids": [c["customer_id"] for c in lapsed],
                    "sample_message_te": "నమస్కారం! రమేష్ కిరాణా నుండి మీకోసం ₹20 ప్రత్యేక ఆఫర్! ఈ రోజే రండి.",
                    "sample_message_hi": "नमस्ते! रमेश किराना से आपके लिए ₹20 का विशेष ऑफर! आज ही पधारें।",
                    "sample_message_en": "Hello! Get ₹20 off on your next visit at Ramesh Kirana! Valid this week."
                })
            )
            db.add(new_preview)
            db.commit()

        action_preview = {
            "preview_id": preview_id,
            "action_type": "winback_offer",
            "status": "previewed",
            "recipient_count": count,
            "offer_formatted": f"₹{offer_inr}",
            "max_discount_exposure": f"₹{max_discount_inr:,}",
            "sample_message": (
                "నమస్కారం! రమేష్ కిరాణా నుండి మీకోసం ₹20 ప్రత్యేక ఆఫర్! ఈ రోజే రండి." if locale == "te-IN" else
                "नमस्ते! रमेश किराना से आपके लिए ₹20 का विशेष ऑफर! आज ही पधारें।" if locale == "hi-IN" else
                "Hello! Get ₹20 off on your next visit at Ramesh Kirana! Valid this week."
            ),
            "requires_approval": True
        }

        if locale == "te-IN":
            answer_text = f"గత 15 రోజుల్లో {count} మంది రెగ్యులర్ కస్టమర్లు రాలేదు. ఒక్కొక్కరికి ₹{offer_inr} ఆఫర్ తో గరిష్టంగా ₹{max_discount_inr} రాయితీకి ప్రివ్యూ సిద్ధం చేయబడింది. ఆమోదించడానికి బటన్ నొక్కండి."
        elif locale == "hi-IN":
            answer_text = f"पिछले 15 दिनों में {count} नियमित ग्राहक नहीं आए हैं। ₹{offer_inr} के ऑफर और अधिकतम ₹{max_discount_inr} की छूट का प्रस्ताव तैयार है।"
        else:
            answer_text = f"{count} opted-in regular customers have not visited in 15 days. A ₹{offer_inr} offer preview (up to ₹{max_discount_inr} max discount) is ready for your approval."

    # Intent 8: Settlement Status
    elif intent == "settlement_status":
        overdue_paise = metrics["settlements"]["overdue_paise"]
        pending_paise = metrics["settlements"]["pending_paise"]
        overdue_formatted = metrics["settlements"]["overdue_formatted"]
        pending_formatted = metrics["settlements"]["pending_formatted"]

        numeric_facts = {
            "overdue_paise": overdue_paise,
            "overdue_inr": overdue_paise / 100.0,
            "pending_paise": pending_paise,
            "pending_inr": pending_paise / 100.0
        }
        if locale == "te-IN":
            answer_text = f"నవంబర్ 10 నాటి {overdue_formatted} యూపీఐ సెటిల్మెంట్ ఓవర్‌డ్యూగా ఉంది. రేపటికి {pending_formatted} పెండింగ్‌లో ఉంది."
        elif locale == "hi-IN":
            answer_text = f"10 नवंबर का {overdue_formatted} का यूपीआई सेटलमेंट बकाया है, और कल के लिए {pending_formatted} लंबित है।"
        else:
            answer_text = f"A {overdue_formatted} UPI settlement from Nov 10 is overdue, and {pending_formatted} is pending for tomorrow."

    # Default / General
    else:
        numeric_facts = {"orders": orders, "sales": amount_formatted, "period": date_label}
        if locale == "te-IN":
            answer_text = f"రమేష్ కిరాణా డాష్‌బోర్డ్ సిద్ధంగా ఉంది. {date_label} లో {orders} ఆర్డర్లలో {amount_formatted} అమ్మకాలు నమోదయ్యాయి."
        elif locale == "hi-IN":
            answer_text = f"रमेश किराना डैशबोर्ड तैयार है। {date_label} में {orders} ऑर्डर में {amount_formatted} की बिक्री दर्ज की गई है।"
        else:
            answer_text = f"Munim dashboard is up to date for {date_label}. {orders} orders totaling {amount_formatted}."

    return answer_text, numeric_facts, action_preview
