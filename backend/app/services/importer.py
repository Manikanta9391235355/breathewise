import csv
import io
import re
from typing import Dict, Any, List, Optional, Tuple
import openpyxl
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.models.munim import Sale

def parse_file_to_rows(file_bytes: bytes, filename: str) -> Tuple[List[str], List[Dict[str, Any]]]:
    filename_lower = filename.lower()
    headers = []
    rows = []

    if filename_lower.endswith(".csv"):
        text_content = file_bytes.decode("utf-8-sig", errors="replace")
        reader = csv.DictReader(io.StringIO(text_content))
        headers = [h.strip() for h in (reader.fieldnames or [])]
        for row in reader:
            rows.append({k.strip(): (v.strip() if v else "") for k, v in row.items()})

    elif filename_lower.endswith(".xlsx"):
        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
        sheet = wb.active
        raw_rows = list(sheet.iter_rows(values_only=True))
        if raw_rows:
            headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(raw_rows[0])]
            for r in raw_rows[1:]:
                if any(v is not None and str(v).strip() != "" for v in r):
                    row_dict = {}
                    for i, h in enumerate(headers):
                        val = r[i] if i < len(r) else ""
                        row_dict[h] = str(val).strip() if val is not None else ""
                    rows.append(row_dict)
    else:
        raise ValueError("Unsupported file format. Please upload .csv or .xlsx")

    return headers, rows

def validate_and_preview_sales_import(
    file_bytes: bytes,
    filename: str,
    merchant_id: str,
    db: Session,
    column_mapping: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    headers, raw_rows = parse_file_to_rows(file_bytes, filename)

    # Standard default mapping
    mapping = {
        "sale_id": "sale_id",
        "sold_at": "sold_at",
        "amount_paise": "amount_paise",
        "channel": "channel",
        "status": "status",
        "customer_id": "customer_id"
    }
    if column_mapping:
        mapping.update(column_mapping)

    # Existing sale_ids for duplicate checking
    existing_sales = db.query(Sale.sale_id).filter(Sale.merchant_id == merchant_id).all()
    existing_sale_ids = set(s[0] for s in existing_sales)

    validated_rows = []
    issues = []
    seen_in_batch = set()

    for idx, r in enumerate(raw_rows):
        row_num = idx + 1
        row_issues = []

        sale_id = r.get(mapping.get("sale_id", "sale_id"), "").strip()
        if not sale_id:
            row_issues.append("Missing sale_id")
        elif sale_id in seen_in_batch:
            row_issues.append(f"Duplicate sale_id in file: {sale_id}")
        elif sale_id in existing_sale_ids:
            row_issues.append(f"Sale ID {sale_id} already exists in database")
        else:
            seen_in_batch.add(sale_id)

        sold_at = r.get(mapping.get("sold_at", "sold_at"), "").strip()
        if not sold_at:
            row_issues.append("Missing sold_at timestamp")

        # Amount validation
        raw_amt = r.get(mapping.get("amount_paise", "amount_paise"), "").strip()
        amount_paise = 0
        try:
            amt_num = float(raw_amt.replace("₹", "").replace(",", "").strip())
            # If header is amount_paise or number > 1000, consider paise; if has decimal point like 125.00, convert to paise
            if "." in raw_amt:
                amount_paise = int(round(amt_num * 100))
            else:
                amount_paise = int(amt_num)
            if amount_paise <= 0:
                row_issues.append("Amount must be greater than zero")
        except Exception:
            row_issues.append(f"Invalid amount value: '{raw_amt}'")

        status = r.get(mapping.get("status", "status"), "paid").strip().lower()
        if status not in ("paid", "failed", "refunded"):
            status = "paid"

        channel = r.get(mapping.get("channel", "channel"), "upi").strip().lower() or "upi"
        customer_id = r.get(mapping.get("customer_id", "customer_id"), "").strip()
        if not customer_id or customer_id.lower() == "nan":
            customer_id = None

        if row_issues:
            issues.append({
                "row": row_num,
                "sale_id": sale_id or f"Row {row_num}",
                "errors": row_issues
            })
        else:
            validated_rows.append({
                "merchant_id": merchant_id,
                "sale_id": sale_id,
                "sold_at": sold_at,
                "customer_id": customer_id,
                "channel": channel,
                "status": status,
                "amount_paise": amount_paise,
                "source": "csv_import"
            })

    return {
        "filename": filename,
        "total_rows": len(raw_rows),
        "valid_count": len(validated_rows),
        "error_count": len(issues),
        "headers": headers,
        "preview_rows": validated_rows[:5],
        "issues": issues[:10],
        "can_commit": len(issues) == 0 and len(validated_rows) > 0,
        "staged_rows": validated_rows
    }

def commit_sales_import(validated_rows: List[Dict[str, Any]], merchant_id: str, db: Session) -> Dict[str, Any]:
    """
    Commit validated rows atomically into database.
    """
    if not validated_rows:
        return {"status": "no_rows", "committed": 0}

    # Ensure all rows belong to merchant_id
    records = []
    for r in validated_rows:
        r["merchant_id"] = merchant_id
        records.append(r)

    try:
        db.bulk_insert_mappings(Sale, records)
        db.commit()
        return {
            "status": "success",
            "committed_count": len(records),
            "merchant_id": merchant_id
        }
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Database commit failed: {str(e)}")
