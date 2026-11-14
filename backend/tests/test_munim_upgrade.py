import json
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_expected_upgrade_fixture_match():
    with open("data/expected_upgrade.json", "r", encoding="utf-8") as f:
        expected = json.load(f)

    # 1. Check October 2026 POS Dashboard metrics
    res = client.get("/api/dashboard?merchant_id=M01&preset=last_month")
    assert res.status_code == 200
    oct_dash = res.json()

    paid_sales_paise = oct_dash["sales_summary"]["paid_sales_paise"]
    paid_orders = oct_dash["sales_summary"]["paid_order_count"]

    assert paid_sales_paise == expected["M01_october_paid_pos_revenue_paise"] # 21280000 (₹2,12,800)
    assert paid_orders == expected["M01_october_paid_orders"] # 888 orders

    # 2. Check October 2026 UPI Payment Tenders
    tenders_res = client.get("/api/payments/breakdown?merchant_id=M01&preset=last_month")
    assert tenders_res.status_code == 200
    tenders_data = tenders_res.json()

    upi_channel = next((c for c in tenders_data["channels"] if c["channel"] == "UPI"), None)
    assert upi_channel is not None
    assert upi_channel["amount_paise"] == expected["M01_october_paid_upi_paise"] # 16874000 (₹1,68,740)

    # 3. Check Milk October units and Nov 13 closing stock & reorder point
    sku_res = client.get("/api/inventory/skus/M01-P01?merchant_id=M01")
    assert sku_res.status_code == 200
    sku_data = sku_res.json()

    assert sku_data["on_hand"] == expected["M01_milk_closing_stock_2026_11_13"] # 4
    assert sku_data["reorder_point"] == expected["M01_milk_reorder_point"] # 12
    assert sku_data["is_low_stock"] is True

    # Check October milk units sold
    oct_milk_res = client.get("/api/inventory/skus/M01-P01?merchant_id=M01&from=2026-10-01&to=2026-10-31")
    assert oct_milk_res.status_code == 200
    assert oct_milk_res.json()["units_sold_in_range"] == expected["M01_october_milk_units"] # 352 units

def test_low_stock_endpoint():
    res = client.get("/api/inventory/low-stock?merchant_id=M01")
    assert res.status_code == 200
    data = res.json()
    assert data["low_stock_count"] >= 1
    items = data["items"]
    milk_item = next((i for i in items if i["product_id"] == "M01-P01"), None)
    assert milk_item is not None
    assert milk_item["on_hand"] == 4
    assert milk_item["reorder_point"] == 12

def test_ask_munim_milk_inventory_query():
    # English query
    payload_en = {"merchant_id": "M01", "locale": "en-IN", "question": "How much milk is left?"}
    res_en = client.post("/api/ask", json=payload_en)
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert data_en["intent"] == "inventory_on_hand"
    assert data_en["numeric_facts"]["on_hand"] == 4
    assert "4" in data_en["answer_text"]

    # Telugu query
    payload_te = {"merchant_id": "M01", "locale": "te-IN", "question": "పాలు ఎంత మిగిలాయి?"}
    res_te = client.post("/api/ask", json=payload_te)
    assert res_te.status_code == 200
    data_te = res_te.json()
    assert data_te["intent"] == "inventory_on_hand"
    assert data_te["numeric_facts"]["on_hand"] == 4

def test_ask_munim_upi_payment_query():
    payload = {"merchant_id": "M01", "locale": "en-IN", "question": "How much came through UPI?"}
    res = client.post("/api/ask", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "payment_breakdown"
    assert "upi_collected_formatted" in data["numeric_facts"]

def test_ask_munim_last_month_sales_query():
    payload = {"merchant_id": "M01", "locale": "en-IN", "question": "What sold most last month?"}
    res = client.post("/api/ask", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] in ("product_growth", "sku_performance")
    assert "2026-10-01 to 2026-10-31" in data["period"]

def test_live_event_does_not_mutate_inventory_or_double_count():
    # Record initial milk stock
    init_milk = client.get("/api/inventory/skus/M01-P01?merchant_id=M01").json()
    init_stock = init_milk["on_hand"]

    # Post live payment event
    event = {
        "sale_id": "M01-LIVE-001",
        "merchant_id": "M01",
        "sold_at": "2026-11-13T21:15:00+05:30",
        "amount_paise": 12500,
        "channel": "upi",
        "status": "paid",
        "source": "simulated_live"
    }
    res = client.post("/api/demo/events", json=event)
    assert res.status_code == 200

    # Stock must remain unchanged (payment-only record must never decrement inventory)
    post_milk = client.get("/api/inventory/skus/M01-P01?merchant_id=M01").json()
    assert post_milk["on_hand"] == init_stock

    # Reset demo
    reset_res = client.post("/api/demo/reset")
    assert reset_res.status_code == 200
