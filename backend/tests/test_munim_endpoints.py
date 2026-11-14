import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["dataset_as_of"] == "2026-11-13"

def test_merchants():
    res = client.get("/api/merchants")
    assert res.status_code == 200
    merchants = res.json()
    assert len(merchants) >= 3
    ids = [m["merchant_id"] for m in merchants]
    assert "M01" in ids

def test_dashboard_baseline():
    res = client.get("/api/dashboard?merchant_id=M01")
    assert res.status_code == 200
    data = res.json()
    sales_sum = data["sales_summary"]
    # Baseline expected values: 25 paid orders and ₹6,850 (685000 paise)
    assert sales_sum["paid_order_count"] == 25
    assert sales_sum["paid_sales_paise"] == 685000
    # Overdue settlement: 58000 paise (₹580)
    assert data["settlements"]["overdue_paise"] == 58000
    # Lapsed regulars: 24
    assert data["winback_opportunity"]["eligible_customers_count"] == 24

def test_ask_telugu_signature():
    payload = {
        "merchant_id": "M01",
        "locale": "te-IN",
        "question": "ఈ రోజు ఎంత అమ్మాం?"
    }
    res = client.post("/api/ask", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "daily_brief"
    assert "25" in data["answer_text"]
    assert "6,850" in data["answer_text"]
    assert data["numeric_facts"]["paid_orders"] == 25
    assert data["numeric_facts"]["paid_sales_paise"] == 685000

def test_winback_preview_and_approval():
    prev_res = client.post("/api/actions/preview", json={"merchant_id": "M01", "action_type": "winback_offer", "offer_inr": 20})
    assert prev_res.status_code == 200
    prev_data = prev_res.json()
    assert prev_data["recipient_count"] == 24
    assert prev_data["max_discount_exposure"] == "₹480"

    preview_id = prev_data["id"]
    appr_res = client.post(f"/api/actions/{preview_id}/approve", json={"merchant_id": "M01"})
    assert appr_res.status_code == 200
    appr_data = appr_res.json()
    assert appr_data["status"] == "approved_and_dispatched"
    assert appr_data["outbox_receipt"]["recipients_delivered"] == 24

    # Retry approval (idempotent)
    appr_res2 = client.post(f"/api/actions/{preview_id}/approve", json={"merchant_id": "M01"})
    assert appr_res2.status_code == 200
    assert appr_res2.json()["status"] == "already_approved"

def test_simulated_live_event_and_idempotency():
    event = {
        "sale_id": "M01-LIVE-001",
        "merchant_id": "M01",
        "sold_at": "2026-11-13T21:15:00+05:30",
        "amount_paise": 12500,
        "channel": "upi",
        "status": "paid",
        "source": "simulated_live"
    }

    # First event submission
    res = client.post("/api/demo/events", json=event)
    assert res.status_code == 200

    dash = client.get("/api/dashboard?merchant_id=M01").json()
    assert dash["sales_summary"]["paid_order_count"] == 26
    assert dash["sales_summary"]["paid_sales_paise"] == 697500
    assert dash["sales_summary"]["paid_sales_formatted"] == "₹6,975"

    # Second event submission (idempotent duplicate)
    res2 = client.post("/api/demo/events", json=event)
    assert res2.status_code == 200
    assert res2.json()["status"] == "already_processed"

    dash2 = client.get("/api/dashboard?merchant_id=M01").json()
    assert dash2["sales_summary"]["paid_order_count"] == 26
    assert dash2["sales_summary"]["paid_sales_paise"] == 697500

    # Reset demo back to clean baseline
    reset_res = client.post("/api/demo/reset")
    assert reset_res.status_code == 200

    dash_clean = client.get("/api/dashboard?merchant_id=M01").json()
    assert dash_clean["sales_summary"]["paid_order_count"] == 25
    assert dash_clean["sales_summary"]["paid_sales_paise"] == 685000
