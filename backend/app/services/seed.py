import csv
import json
from pathlib import Path
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import engine, Base
from backend.app.models.munim import (
    Merchant, Customer, Supplier, Product, Sale, SaleItem,
    PaymentTender, StockPolicy, StockMovement,
    Expense, SupplierBill, Settlement
)

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"

PRODUCT_ALIASES = {
    "M01-P01": ["milk", "పాలు", "పాల", "మిల్క్", "दूध", "doodh"],
    "M01-P02": ["tea", "టీ", "చాయ్", "చాయ", "చాయీ", "चाय", "chai"],
    "M01-P03": ["biscuits", "బిస్కెట్లు", "బిస్కెట్", "బిస్కట్", "बिस्कुट"],
    "M01-P04": ["rice", "బియ్యం", "వడ్లు", "चावल"],
    "M01-P05": ["oil", "నూనె", "వంట నూనె", "तेल"],
    "M01-P06": ["gift sweets", "స్వీట్స్", "మిఠాయి", "మిఠాయిలు", "मिठाई"],
    "M01-P07": ["namkeen", "నమ్కీన్", "కారప్పూస", "హాట్", "नमकीन"],
    "M01-P08": ["sugar", "పంచదార", "చక్కెర", "సాంబారు", "चीनी", "शक्कर"]
}

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_database(db: Session, force: bool = False) -> Dict[str, Any]:
    """
    Seed database from data/ CSVs.
    Safe to retry. If already seeded and not force, returns existing status.
    """
    init_db()

    existing_merchants = db.query(Merchant).count()
    existing_sales = db.query(Sale).count()
    existing_tenders = db.query(PaymentTender).count()

    if existing_merchants > 0 and existing_sales > 0 and existing_tenders > 0 and not force:
        return {
            "status": "already_seeded",
            "merchants": existing_merchants,
            "sales": existing_sales,
            "tenders": existing_tenders,
            "message": "Database already populated. Pass force=True to reseed."
        }

    if force:
        # Drop and recreate all tables to apply any schema updates cleanly
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    results = {}

    # 1. Merchants
    merchants_path = DATA_DIR / "merchants.csv"
    if merchants_path.exists():
        with open(merchants_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "name": str(row["name"]).strip(),
                    "business_type": str(row["business_type"]).strip(),
                    "timezone": str(row.get("timezone", "Asia/Kolkata")).strip(),
                    "currency": str(row.get("currency", "INR")).strip(),
                    "source": str(row.get("source", "synthetic")).strip()
                })
            db.bulk_insert_mappings(Merchant, records)
            db.commit()
            results["merchants"] = len(records)

    # 2. Customers
    cust_path = DATA_DIR / "customers.csv"
    if cust_path.exists():
        with open(cust_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "customer_id": str(row["customer_id"]).strip(),
                    "display_name": str(row["display_name"]).strip(),
                    "offer_opt_in": int(row.get("offer_opt_in", 0))
                })
            db.bulk_insert_mappings(Customer, records)
            db.commit()
            results["customers"] = len(records)

    # 3. Suppliers
    supp_path = DATA_DIR / "suppliers.csv"
    if supp_path.exists():
        with open(supp_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "supplier_id": str(row["supplier_id"]).strip(),
                    "display_name": str(row["display_name"]).strip(),
                    "payment_terms_days": int(row.get("payment_terms_days", 14))
                })
            db.bulk_insert_mappings(Supplier, records)
            db.commit()
            results["suppliers"] = len(records)

    # 4. Products
    prod_path = DATA_DIR / "products.csv"
    if prod_path.exists():
        with open(prod_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                p_id = str(row["product_id"]).strip()
                aliases = PRODUCT_ALIASES.get(p_id, [row["name"].strip().lower()])
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "product_id": p_id,
                    "name": str(row["name"]).strip(),
                    "category": str(row["category"]).strip(),
                    "supplier_id": str(row["supplier_id"]).strip() if row.get("supplier_id") else None,
                    "unit_price_paise": int(row.get("unit_price_paise", 0)),
                    "unit_cost_paise": int(row.get("unit_cost_paise", 0)),
                    "aliases_json": json.dumps(aliases)
                })
            db.bulk_insert_mappings(Product, records)
            db.commit()
            results["products"] = len(records)

    # 5. Sales (POS Orders)
    sales_path = DATA_DIR / "sales.csv"
    if sales_path.exists():
        with open(sales_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                c_id = str(row.get("customer_id", "")).strip()
                if not c_id or c_id.lower() == "nan":
                    c_id = None
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "sale_id": str(row["sale_id"]).strip(),
                    "sold_at": str(row["sold_at"]).strip(),
                    "customer_id": c_id,
                    "channel": str(row.get("channel", "upi")).strip(),
                    "status": str(row.get("status", "paid")).strip(),
                    "amount_paise": int(row.get("amount_paise", 0)),
                    "source": str(row.get("source", "synthetic")).strip()
                })
            db.bulk_insert_mappings(Sale, records)
            db.commit()
            results["sales"] = len(records)

    # 6. Sale Items
    items_path = DATA_DIR / "sale_items.csv"
    if items_path.exists():
        with open(items_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "sale_id": str(row["sale_id"]).strip(),
                    "line_no": int(row["line_no"]),
                    "product_id": str(row["product_id"]).strip(),
                    "quantity": int(row.get("quantity", 1)),
                    "unit_price_paise": int(row.get("unit_price_paise", 0)),
                    "unit_cost_paise": int(row.get("unit_cost_paise", 0))
                })
            db.bulk_insert_mappings(SaleItem, records)
            db.commit()
            results["sale_items"] = len(records)

    # 7. Payment Tenders (Collections)
    tenders_path = DATA_DIR / "payment_tenders.csv"
    if tenders_path.exists():
        with open(tenders_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                s_id = str(row.get("sale_id", "")).strip()
                if not s_id or s_id.lower() == "nan":
                    s_id = None
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "tender_id": str(row["tender_id"]).strip(),
                    "sale_id": s_id,
                    "tender_type": str(row.get("tender_type", "upi")).strip().lower(),
                    "amount_paise": int(row.get("amount_paise", 0)),
                    "status": str(row.get("status", "paid")).strip().lower(),
                    "paid_at": str(row["paid_at"]).strip(),
                    "source": str(row.get("source", "payment_pos")).strip()
                })
            db.bulk_insert_mappings(PaymentTender, records)
            db.commit()
            results["payment_tenders"] = len(records)

    # 8. Stock Policies
    pol_path = DATA_DIR / "stock_policies.csv"
    if pol_path.exists():
        with open(pol_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "policy_id": str(row["policy_id"]).strip(),
                    "product_id": str(row["product_id"]).strip(),
                    "reorder_point": int(row.get("reorder_point", 10)),
                    "target_stock": int(row.get("target_stock", 30)),
                    "reorder_qty": int(row.get("reorder_qty", 15)),
                    "lead_time_days": int(row.get("lead_time_days", 2))
                })
            db.bulk_insert_mappings(StockPolicy, records)
            db.commit()
            results["stock_policies"] = len(records)

    # 9. Stock Movements (Inventory Ledger)
    stk_path = DATA_DIR / "stock_movements.csv"
    if stk_path.exists():
        with open(stk_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "movement_id": str(row["movement_id"]).strip(),
                    "product_id": str(row["product_id"]).strip(),
                    "movement_date": str(row["movement_date"]).strip(),
                    "movement_type": str(row.get("movement_type", "daily_closing")).strip(),
                    "quantity": int(row.get("quantity", 0)),
                    "unit_cost_paise": int(row.get("unit_cost_paise", 0)),
                    "notes": str(row.get("notes", "")).strip()
                })
            db.bulk_insert_mappings(StockMovement, records)
            db.commit()
            results["stock_movements"] = len(records)

    # 10. Expenses
    exp_path = DATA_DIR / "expenses.csv"
    if exp_path.exists():
        with open(exp_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "expense_id": str(row["expense_id"]).strip(),
                    "expense_date": str(row["expense_date"]).strip(),
                    "category": str(row["category"]).strip(),
                    "amount_paise": int(row.get("amount_paise", 0))
                })
            db.bulk_insert_mappings(Expense, records)
            db.commit()
            results["expenses"] = len(records)

    # 11. Supplier Bills
    bills_path = DATA_DIR / "supplier_bills.csv"
    if bills_path.exists():
        with open(bills_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "bill_id": str(row["bill_id"]).strip(),
                    "supplier_id": str(row["supplier_id"]).strip(),
                    "billed_at": str(row["billed_at"]).strip(),
                    "due_at": str(row["due_at"]).strip(),
                    "total_paise": int(row.get("total_paise", 0)),
                    "status": str(row.get("status", "pending")).strip()
                })
            db.bulk_insert_mappings(SupplierBill, records)
            db.commit()
            results["supplier_bills"] = len(records)

    # 12. Settlements
    settle_path = DATA_DIR / "settlements.csv"
    if settle_path.exists():
        with open(settle_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                paid_at = str(row.get("paid_at", "")).strip()
                if not paid_at or paid_at.lower() == "nan":
                    paid_at = None
                records.append({
                    "merchant_id": str(row["merchant_id"]).strip(),
                    "settlement_id": str(row["settlement_id"]).strip(),
                    "sales_date": str(row["sales_date"]).strip(),
                    "expected_at": str(row["expected_at"]).strip(),
                    "paid_at": paid_at,
                    "status": str(row.get("status", "settled")).strip(),
                    "gross_paise": int(row.get("gross_paise", 0)),
                    "fee_paise": int(row.get("fee_paise", 0)),
                    "net_paise": int(row.get("net_paise", 0)),
                    "source": str(row.get("source", "synthetic")).strip()
                })
            db.bulk_insert_mappings(Settlement, records)
            db.commit()
            results["settlements"] = len(records)

    return {
        "status": "seeded_successfully",
        "counts": results
    }
