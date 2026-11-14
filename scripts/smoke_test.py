"""
Munim AI Assistant — Comprehensive End-to-End Smoke Test
Paytm Build for India Hackathon | Track 1: Merchant Growth AI
"""

import sys
import io
import json
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def run_smoke_tests():
    print("==========================================================")
    print(" MUNIM AI ASSISTANT — SMOKE TEST SUITE")
    print("==========================================================")

    # 1. Health Endpoint
    print("\n[1/7] Testing GET /api/health...")
    r = requests.get(f"{BASE_URL}/api/health", timeout=5)
    assert r.status_code == 200, f"Health check failed with {r.status_code}"
    health = r.json()
    print(f"  Status: {health['status']} | DB: {health['database']} | As of: {health['dataset_as_of']}")
    print(f"  Merchants: {health['counts']['merchants']} | Sales: {health['counts']['sales']}")
    print(f"  Sarvam AI Configured: {health['sarvam_ai']['configured']}")

    # 2. Merchants List
    print("\n[2/7] Testing GET /api/merchants...")
    r = requests.get(f"{BASE_URL}/api/merchants", timeout=5)
    assert r.status_code == 200
    merchants = r.json()
    print(f"  Retrieved {len(merchants)} merchants: {[m['name'] for m in merchants]}")
    assert any(m['merchant_id'] == 'M01' for m in merchants), "M01 not found!"

    # 3. Dashboard Baseline (Ramesh Kirana - M01 on 2026-11-13)
    print("\n[3/7] Testing GET /api/dashboard?merchant_id=M01...")
    r = requests.get(f"{BASE_URL}/api/dashboard?merchant_id=M01&from=2026-11-13&to=2026-11-13", timeout=5)
    assert r.status_code == 200
    d = r.json()
    sales = d['sales_summary']
    settle = d['settlements']
    winback = d['winback_opportunity']

    print(f"  Paid Orders: {sales['paid_order_count']} (expected: 25)")
    print(f"  Paid Sales: {sales['paid_sales_formatted']} (expected: ₹6,850)")
    print(f"  Overdue Settlement: {settle['overdue_formatted']} (expected: ₹580)")
    print(f"  Lapsed Regulars: {winback['eligible_customers_count']} (expected: 24)")

    assert sales['paid_order_count'] == 25, f"Expected 25 orders, got {sales['paid_order_count']}"
    assert sales['paid_sales_paise'] == 685000, f"Expected 685000 paise, got {sales['paid_sales_paise']}"
    assert settle['overdue_paise'] == 58000, f"Expected 58000 overdue paise, got {settle['overdue_paise']}"
    assert winback['eligible_customers_count'] == 24, f"Expected 24 lapsed regulars, got {winback['eligible_customers_count']}"
    print("  --> Dashboard baseline matches expected_demo.json 100%!")

    # 4. Signature Voice Question: “ఈ రోజు ఎంత అమ్మాం?”
    print("\n[4/7] Testing POST /api/ask (Telugu signature query)...")
    ask_payload = {
        "merchant_id": "M01",
        "locale": "te-IN",
        "question": "ఈ రోజు ఎంత అమ్మాం?"
    }
    r = requests.post(f"{BASE_URL}/api/ask", json=ask_payload, timeout=10)
    assert r.status_code == 200
    ask_res = r.json()
    print(f"  Intent: {ask_res['intent']}")
    print(f"  Spoken Answer: {ask_res['answer_text']}")
    print(f"  Audio Generated (base64 bytes): {len(ask_res['audio_base64']) if ask_res['audio_base64'] else 'None'}")
    assert "25" in ask_res['answer_text'], "Expected 25 in spoken answer"
    assert "6,850" in ask_res['answer_text'], "Expected ₹6,850 in spoken answer"
    print("  --> Telugu spoken and displayed figures verified!")

    # 5. Win-Back Action Preview & Explicit Approval Flow
    print("\n[5/7] Testing Win-Back Action Preview and Approval...")
    r = requests.post(f"{BASE_URL}/api/actions/preview", json={"merchant_id": "M01", "action_type": "winback_offer"}, timeout=5)
    assert r.status_code == 200
    prev = r.json()
    print(f"  Preview ID: {prev['id']}")
    print(f"  Eligible Recipients: {prev['recipient_count']} customers")
    print(f"  Max Exposure: {prev['max_discount_exposure']}")
    assert prev['recipient_count'] == 24
    assert prev['max_discount_exposure'] == "₹480"

    # Approve
    r = requests.post(f"{BASE_URL}/api/actions/{prev['id']}/approve", json={"merchant_id": "M01"}, timeout=5)
    assert r.status_code == 200
    appr = r.json()
    print(f"  Approval Status: {appr['status']}")
    print(f"  Simulated Outbox Dispatch ID: {appr['outbox_receipt']['dispatch_id']}")
    print(f"  Delivered: {appr['outbox_receipt']['recipients_delivered']} recipients")
    assert appr['outbox_receipt']['recipients_delivered'] == 24

    # Idempotent re-approval
    r2 = requests.post(f"{BASE_URL}/api/actions/{prev['id']}/approve", json={"merchant_id": "M01"}, timeout=5)
    assert r2.status_code == 200
    assert r2.json()['status'] == 'already_approved'
    print("  --> Atomic idempotent approval verified!")

    # 6. Live Payment Simulation & Idempotency
    print("\n[6/7] Testing Live Payment Simulation (₹125 UPI)...")
    with open("data/simulated_event.json") as f:
        event = json.load(f)

    r = requests.post(f"{BASE_URL}/api/demo/events", json=event, timeout=5)
    assert r.status_code == 200
    d_after = requests.get(f"{BASE_URL}/api/dashboard?merchant_id=M01", timeout=5).json()
    print(f"  After Live Event: Orders = {d_after['sales_summary']['paid_order_count']} (expected: 26)")
    print(f"  After Live Event: Sales = {d_after['sales_summary']['paid_sales_formatted']} (expected: ₹6,975)")
    assert d_after['sales_summary']['paid_order_count'] == 26
    assert d_after['sales_summary']['paid_sales_paise'] == 697500

    # Repeat submission (must remain idempotent)
    r_dup = requests.post(f"{BASE_URL}/api/demo/events", json=event, timeout=5)
    assert r_dup.status_code == 200
    assert r_dup.json()['status'] == 'already_processed'
    d_dup = requests.get(f"{BASE_URL}/api/dashboard?merchant_id=M01", timeout=5).json()
    print(f"  After Duplicate Event: Orders = {d_dup['sales_summary']['paid_order_count']} | Sales = {d_dup['sales_summary']['paid_sales_formatted']}")
    assert d_dup['sales_summary']['paid_order_count'] == 26
    assert d_dup['sales_summary']['paid_sales_paise'] == 697500
    print("  --> Live payment simulation & idempotency verified!")

    # 7. Demo Reset for Rehearsals
    print("\n[7/7] Testing Demo Reset (Rehearsal Safety)...")
    r_reset = requests.post(f"{BASE_URL}/api/demo/reset", timeout=10)
    assert r_reset.status_code == 200
    d_reset = requests.get(f"{BASE_URL}/api/dashboard?merchant_id=M01", timeout=5).json()
    print(f"  After Reset: Orders = {d_reset['sales_summary']['paid_order_count']} (expected: 25)")
    print(f"  After Reset: Sales = {d_reset['sales_summary']['paid_sales_formatted']} (expected: ₹6,850)")
    assert d_reset['sales_summary']['paid_order_count'] == 25
    assert d_reset['sales_summary']['paid_sales_paise'] == 685000
    print("  --> Rehearsal reset verified back to baseline!")

    print("\n==========================================================")
    print(" ALL 7 SMOKE TESTS PASSED PERFECTLY!")
    print("==========================================================")

if __name__ == "__main__":
    run_smoke_tests()
