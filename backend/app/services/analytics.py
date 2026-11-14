import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, distinct
from backend.app.models.munim import (
    Merchant, Customer, Supplier, Product, Sale, SaleItem,
    PaymentTender, StockPolicy, StockMovement,
    Expense, SupplierBill, Settlement, ActionPreview
)

DEMO_DATE = "2026-11-13"

def paise_to_inr_str(paise: int) -> str:
    inr = paise / 100.0
    if inr.is_integer():
        return f"₹{int(inr):,}"
    return f"₹{inr:,.2f}"

def resolve_date_range(preset: Optional[str] = None, from_date: Optional[str] = None, to_date: Optional[str] = None) -> Tuple[str, str, str]:
    """
    Resolves date range with relative preset support:
    - 'today': 2026-11-13
    - 'last_7_days': 2026-11-07 to 2026-11-13
    - 'last_month': 2026-10-01 to 2026-10-31 (October 2026, previous completed calendar month)
    - 'month_to_date': 2026-11-01 to 2026-11-13
    - 'custom': from_date to to_date
    """
    if preset == "last_month":
        return "2026-10-01", "2026-10-31", "October 2026 (Last Month)"
    elif preset == "last_7_days":
        return "2026-11-07", DEMO_DATE, "Last 7 Days (07 Nov - 13 Nov 2026)"
    elif preset == "month_to_date":
        return "2026-11-01", DEMO_DATE, "November Month to Date (01 Nov - 13 Nov 2026)"
    elif preset == "today":
        return DEMO_DATE, DEMO_DATE, "Today (13 Nov 2026)"

    from_d = from_date or DEMO_DATE
    to_d = to_date or DEMO_DATE
    label = f"{from_d} to {to_d}" if from_d != to_d else f"{from_d}"
    return from_d, to_d, label

def get_matching_historical_weekdays(target_date_str: str, weeks_back: int = 4) -> List[str]:
    target_dt = datetime.strptime(target_date_str, "%Y-%m-%d")
    return [(target_dt - timedelta(days=7 * i)).strftime("%Y-%m-%d") for i in range(1, weeks_back + 1)]

def resolve_sku(db: Session, merchant_id: str, query_token: str) -> Tuple[Optional[Product], List[Product]]:
    """
    Resolves product by ID, Name or Telugu/Hindi aliases.
    Returns (matched_product, ambiguous_candidates).
    """
    token = query_token.strip().lower()
    prods = db.query(Product).filter(Product.merchant_id == merchant_id).all()

    # Exact product_id match
    for p in prods:
        if p.product_id.lower() == token:
            return p, []

    # Exact name match
    for p in prods:
        if p.name.lower() == token:
            return p, []

    # Alias or substring match
    matches = []
    for p in prods:
        aliases = []
        if p.aliases_json:
            try:
                aliases = json.loads(p.aliases_json)
            except Exception:
                pass
        aliases.append(p.name.lower())

        if any(token in a.lower() or a.lower() in token for a in aliases):
            matches.append(p)

    if len(matches) == 1:
        return matches[0], []
    elif len(matches) > 1:
        return None, matches
    return None, []

def get_sku_details(db: Session, merchant_id: str, product_id: str, from_date: str = "2026-10-01", to_date: str = "2026-11-13") -> Dict[str, Any]:
    prod = db.query(Product).filter(Product.merchant_id == merchant_id, Product.product_id == product_id).first()
    if not prod:
        return {}

    # Policy
    pol = db.query(StockPolicy).filter(StockPolicy.merchant_id == merchant_id, StockPolicy.product_id == product_id).first()
    reorder_point = pol.reorder_point if pol else 10
    target_stock = pol.target_stock if pol else 30

    # Stock on hand from movements as of DEMO_DATE
    stk = db.query(StockMovement).filter(
        StockMovement.merchant_id == merchant_id,
        StockMovement.product_id == product_id
    ).order_by(StockMovement.movement_date.desc()).first()
    on_hand = stk.quantity if stk else 0
    last_stock_date = stk.movement_date if stk else DEMO_DATE

    # Sales units in range
    start_ts = f"{from_date}T00:00:00"
    end_ts = f"{to_date}T23:59:59"

    sales = db.query(Sale.sale_id).filter(
        Sale.merchant_id == merchant_id,
        Sale.status == "paid",
        Sale.sold_at >= start_ts,
        Sale.sold_at <= end_ts
    ).all()
    sale_ids = [s.sale_id for s in sales]

    items = []
    if sale_ids:
        items = db.query(SaleItem).filter(
            SaleItem.merchant_id == merchant_id,
            SaleItem.sale_id.in_(sale_ids),
            SaleItem.product_id == product_id
        ).all()

    units_sold = sum(i.quantity for i in items)
    revenue_paise = sum(i.quantity * i.unit_price_paise for i in items)

    return {
        "product_id": prod.product_id,
        "name": prod.name,
        "category": prod.category,
        "unit_price_paise": prod.unit_price_paise,
        "unit_price_formatted": paise_to_inr_str(prod.unit_price_paise),
        "unit_cost_paise": prod.unit_cost_paise,
        "unit_cost_formatted": paise_to_inr_str(prod.unit_cost_paise),
        "on_hand": on_hand,
        "reorder_point": reorder_point,
        "target_stock": target_stock,
        "is_low_stock": on_hand <= reorder_point,
        "last_stock_date": last_stock_date,
        "units_sold_in_range": units_sold,
        "revenue_paise_in_range": revenue_paise,
        "revenue_formatted_in_range": paise_to_inr_str(revenue_paise),
        "period": f"{from_date} to {to_date}"
    }

def get_low_stock_items(db: Session, merchant_id: str) -> List[Dict[str, Any]]:
    policies = db.query(StockPolicy).filter(StockPolicy.merchant_id == merchant_id).all()
    prods = db.query(Product).filter(Product.merchant_id == merchant_id).all()
    prod_map = {p.product_id: p for p in prods}

    low_items = []
    for pol in policies:
        stk = db.query(StockMovement).filter(
            StockMovement.merchant_id == merchant_id,
            StockMovement.product_id == pol.product_id
        ).order_by(StockMovement.movement_date.desc()).first()
        qty = stk.quantity if stk else 0
        if qty <= pol.reorder_point:
            p = prod_map.get(pol.product_id)
            p_name = p.name if p else pol.product_id
            low_items.append({
                "product_id": pol.product_id,
                "name": p_name,
                "on_hand": qty,
                "reorder_point": pol.reorder_point,
                "suggested_reorder": max(1, pol.target_stock - qty),
                "unit_cost_paise": p.unit_cost_paise if p else 0,
                "unit_cost_formatted": paise_to_inr_str(p.unit_cost_paise if p else 0),
                "last_update": stk.movement_date if stk else DEMO_DATE
            })
    return sorted(low_items, key=lambda x: x["on_hand"])

def get_payment_breakdown(db: Session, merchant_id: str, from_date: str, to_date: str) -> Dict[str, Any]:
    start_ts = f"{from_date}T00:00:00"
    end_ts = f"{to_date}T23:59:59"

    tenders = db.query(PaymentTender).filter(
        PaymentTender.merchant_id == merchant_id,
        PaymentTender.paid_at >= start_ts,
        PaymentTender.paid_at <= end_ts
    ).all()

    breakdown = {}
    paid_total_paise = 0
    channel_counts = {}

    for t in tenders:
        tt = t.tender_type.lower()
        if tt not in breakdown:
            breakdown[tt] = {"count": 0, "amount_paise": 0, "paid_count": 0, "paid_amount_paise": 0}
        breakdown[tt]["count"] += 1
        breakdown[tt]["amount_paise"] += t.amount_paise

        if t.status == "paid":
            breakdown[tt]["paid_count"] += 1
            breakdown[tt]["paid_amount_paise"] += t.amount_paise
            paid_total_paise += t.amount_paise

    channel_list = []
    for ch, data in breakdown.items():
        pct = round((data["paid_amount_paise"] / paid_total_paise * 100), 1) if paid_total_paise > 0 else 0.0
        channel_list.append({
            "channel": ch.upper(),
            "count": data["paid_count"],
            "amount_paise": data["paid_amount_paise"],
            "amount_inr": data["paid_amount_paise"] / 100.0,
            "amount_formatted": paise_to_inr_str(data["paid_amount_paise"]),
            "share_pct": pct
        })

    return {
        "period": f"{from_date} to {to_date}",
        "total_collected_paise": paid_total_paise,
        "total_collected_formatted": paise_to_inr_str(paid_total_paise),
        "total_tenders": sum(c["count"] for c in channel_list),
        "channels": sorted(channel_list, key=lambda x: x["amount_paise"], reverse=True)
    }

def get_dashboard_metrics(
    db: Session,
    merchant_id: str,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    preset: Optional[str] = None
) -> Dict[str, Any]:
    from_date, to_date, period_label = resolve_date_range(preset, from_date, to_date)

    # 1. Fetch Merchant Details
    merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
    merchant_name = merchant.name if merchant else "Merchant"
    currency = merchant.currency if merchant else "INR"

    # 2. Paid POS Sales for Date Range
    start_ts = f"{from_date}T00:00:00"
    end_ts = f"{to_date}T23:59:59"

    paid_sales_q = db.query(Sale).filter(
        Sale.merchant_id == merchant_id,
        Sale.status == "paid",
        Sale.sold_at >= start_ts,
        Sale.sold_at <= end_ts
    )
    paid_sales = paid_sales_q.all()

    paid_order_count = len(paid_sales)
    paid_sales_paise = sum(s.amount_paise for s in paid_sales)
    avg_order_paise = int(paid_sales_paise / paid_order_count) if paid_order_count > 0 else 0

    # 3. Payment Tenders & Channel Breakdown
    payment_summary = get_payment_breakdown(db, merchant_id, from_date, to_date)

    # 4. Recent Transactions (newest first)
    all_recent_sales = db.query(Sale).filter(
        Sale.merchant_id == merchant_id,
        Sale.sold_at >= start_ts,
        Sale.sold_at <= end_ts
    ).order_by(Sale.sold_at.desc()).limit(15).all()

    customer_ids = [s.customer_id for s in all_recent_sales if s.customer_id]
    customer_map = {}
    if customer_ids:
        custs = db.query(Customer).filter(Customer.merchant_id == merchant_id, Customer.customer_id.in_(customer_ids)).all()
        customer_map = {c.customer_id: c.display_name for c in custs}

    transactions_list = []
    for s in all_recent_sales:
        time_part = s.sold_at[11:16] if len(s.sold_at) >= 16 else ""
        cust_name = customer_map.get(s.customer_id, "Anonymous Buyer" if not s.customer_id else s.customer_id)
        # Check tender link
        is_linked = s.source != "simulated_live"
        transactions_list.append({
            "sale_id": s.sale_id,
            "sold_at": s.sold_at,
            "time": time_part,
            "customer_id": s.customer_id,
            "customer_name": cust_name,
            "amount_paise": s.amount_paise,
            "amount_inr": s.amount_paise / 100.0,
            "amount_formatted": paise_to_inr_str(s.amount_paise),
            "channel": s.channel,
            "status": s.status,
            "source": s.source,
            "is_linked_pos": is_linked
        })

    # 5. Hourly Sales Pattern
    hourly_counts = {f"{h:02d}:00": {"count": 0, "amount_paise": 0} for h in range(6, 23)}
    for s in paid_sales:
        if len(s.sold_at) >= 13:
            h_str = s.sold_at[11:13] + ":00"
            if h_str in hourly_counts:
                hourly_counts[h_str]["count"] += 1
                hourly_counts[h_str]["amount_paise"] += s.amount_paise

    hourly_chart = [{"hour": h, "count": d["count"], "amount_paise": d["amount_paise"], "amount_inr": d["amount_paise"] / 100.0} for h, d in sorted(hourly_counts.items())]

    peak_period_str = "6:00 PM – 8:00 PM"
    peak_sales_paise = 0
    peak_orders = 0
    for start_h in range(6, 22, 2):
        slot_label = f"{start_h:02d}:00 – {start_h+2:02d}:00"
        h1 = f"{start_h:02d}:00"
        h2 = f"{start_h+1:02d}:00"
        c = hourly_counts.get(h1, {"count": 0, "amount_paise": 0})["count"] + hourly_counts.get(h2, {"count": 0, "amount_paise": 0})["count"]
        p = hourly_counts.get(h1, {"count": 0, "amount_paise": 0})["amount_paise"] + hourly_counts.get(h2, {"count": 0, "amount_paise": 0})["amount_paise"]
        if p > peak_sales_paise:
            peak_sales_paise = p
            peak_orders = c
            start_ampm = f"{start_h if start_h <= 12 else start_h - 12}{' AM' if start_h < 12 else ' PM'}"
            end_ampm = f"{start_h+2 if start_h+2 <= 12 else start_h+2 - 12}{' AM' if start_h+2 < 12 else ' PM'}"
            peak_period_str = f"{start_ampm} – {end_ampm}"

    # 6. Comparable Historical Weekdays
    historical_dates = get_matching_historical_weekdays(from_date, weeks_back=4)
    hist_stats = []
    for d in historical_dates:
        d_start = f"{d}T00:00:00"
        d_end = f"{d}T23:59:59"
        d_sales = db.query(Sale).filter(
            Sale.merchant_id == merchant_id,
            Sale.status == "paid",
            Sale.sold_at >= d_start,
            Sale.sold_at <= d_end
        ).all()
        hist_stats.append({
            "date": d,
            "orders": len(d_sales),
            "amount_paise": sum(s.amount_paise for s in d_sales)
        })

    avg_hist_paise = int(sum(h["amount_paise"] for h in hist_stats) / len(hist_stats)) if hist_stats else 0
    avg_hist_orders = int(sum(h["orders"] for h in hist_stats) / len(hist_stats)) if hist_stats else 0
    sales_delta_paise = paid_sales_paise - avg_hist_paise
    sales_delta_pct = round(((paid_sales_paise - avg_hist_paise) / avg_hist_paise * 100), 1) if avg_hist_paise > 0 else 0.0

    # 7. Settlements Summary
    settlements = db.query(Settlement).filter(Settlement.merchant_id == merchant_id).all()
    overdue_settlements = [s for s in settlements if s.status != "settled" and s.expected_at < DEMO_DATE]
    pending_settlements = [s for s in settlements if s.status != "settled" and s.expected_at >= DEMO_DATE]
    settled_settlements = [s for s in settlements if s.status == "settled" and s.sales_date == from_date]

    overdue_paise = sum(s.net_paise for s in overdue_settlements)
    pending_paise = sum(s.net_paise for s in pending_settlements)
    settled_today_paise = sum(s.net_paise for s in settled_settlements)

    recent_settlements_list = []
    sorted_settlements = sorted(settlements, key=lambda s: s.sales_date, reverse=True)[:10]
    for s in sorted_settlements:
        status_label = s.status
        if s.status != "settled" and s.expected_at < DEMO_DATE:
            status_label = "overdue"
        recent_settlements_list.append({
            "settlement_id": s.settlement_id,
            "sales_date": s.sales_date,
            "expected_at": s.expected_at,
            "paid_at": s.paid_at,
            "status": status_label,
            "gross_paise": s.gross_paise,
            "fee_paise": s.fee_paise,
            "net_paise": s.net_paise,
            "net_formatted": paise_to_inr_str(s.net_paise)
        })

    # 8. Gross Margin & Line-Item Costing
    paid_sale_ids = [s.sale_id for s in paid_sales]
    items = []
    if paid_sale_ids:
        items = db.query(SaleItem).filter(
            SaleItem.merchant_id == merchant_id,
            SaleItem.sale_id.in_(paid_sale_ids)
        ).all()

    covered_revenue_paise = sum(i.quantity * i.unit_price_paise for i in items)
    covered_cogs_paise = sum(i.quantity * i.unit_cost_paise for i in items)
    gross_profit_paise = covered_revenue_paise - covered_cogs_paise
    margin_pct = round((gross_profit_paise / covered_revenue_paise * 100), 1) if covered_revenue_paise > 0 else 0.0

    missing_cost_revenue_paise = max(0, paid_sales_paise - covered_revenue_paise)
    coverage_pct = round((covered_revenue_paise / paid_sales_paise * 100), 1) if paid_sales_paise > 0 else 100.0

    # 9. Top Products in Date Range
    prods = db.query(Product).filter(Product.merchant_id == merchant_id).all()
    product_map = {p.product_id: p for p in prods}

    item_agg = {}
    for i in items:
        p = product_map.get(i.product_id)
        p_name = p.name if p else i.product_id
        p_cat = p.category if p else "General"
        if i.product_id not in item_agg:
            item_agg[i.product_id] = {
                "product_id": i.product_id,
                "name": p_name,
                "category": p_cat,
                "quantity": 0,
                "revenue_paise": 0,
                "cogs_paise": 0,
                "profit_paise": 0
            }
        item_agg[i.product_id]["quantity"] += i.quantity
        rev = i.quantity * i.unit_price_paise
        cogs = i.quantity * i.unit_cost_paise
        item_agg[i.product_id]["revenue_paise"] += rev
        item_agg[i.product_id]["cogs_paise"] += cogs
        item_agg[i.product_id]["profit_paise"] += (rev - cogs)

    top_products = sorted(item_agg.values(), key=lambda x: x["revenue_paise"], reverse=True)[:8]
    for p in top_products:
        p["revenue_formatted"] = paise_to_inr_str(p["revenue_paise"])
        p["profit_formatted"] = paise_to_inr_str(p["profit_paise"])

    # 10. Low Stock Items (from stock_movements vs stock_policies)
    low_stock_items = get_low_stock_items(db, merchant_id)

    # 11. Opted-In Lapsed Regulars (Win-back)
    lapsed_regulars = get_lapsed_regulars(db, merchant_id)
    lapsed_count = len(lapsed_regulars)

    # 12. Supplier Bills Due / Pending
    bills = db.query(SupplierBill).filter(
        SupplierBill.merchant_id == merchant_id,
        SupplierBill.status != "paid"
    ).order_by(SupplierBill.due_at.asc()).limit(5).all()
    pending_bills_list = [{
        "bill_id": b.bill_id,
        "supplier_id": b.supplier_id,
        "billed_at": b.billed_at,
        "due_at": b.due_at,
        "total_paise": b.total_paise,
        "total_formatted": paise_to_inr_str(b.total_paise),
        "status": b.status
    } for b in bills]

    # 13. Stock-up scenario
    stockup_scenario = get_stockup_scenario(db, merchant_id, budget_inr=5000)

    # 14. Data sources & synchronization status
    data_sources_status = {
        "pos": {
            "source": "Local POS Terminal",
            "last_sync": f"{DEMO_DATE} 21:15:00",
            "total_records": db.query(Sale).filter(Sale.merchant_id == merchant_id).count(),
            "status": "synchronized"
        },
        "inventory": {
            "source": "Stock Ledger (Authoritative closing balances)",
            "last_sync": f"{DEMO_DATE} 20:00:00",
            "skus_covered": len(prods),
            "status": "synchronized"
        },
        "payments": {
            "source": "Paytm UPI & Card Tenders",
            "last_sync": f"{DEMO_DATE} 21:15:00",
            "total_records": db.query(PaymentTender).filter(PaymentTender.merchant_id == merchant_id).count(),
            "status": "synchronized"
        }
    }

    # Insight headline
    insight_text = (
        f"Peak sales occur between {peak_period_str} ({peak_orders} orders, {paise_to_inr_str(peak_sales_paise)}). "
        f"{lapsed_count} regular customers have lapsed visits."
    )
    if overdue_paise > 0:
        insight_text += f" Alert: {paise_to_inr_str(overdue_paise)} UPI settlement is overdue from Nov 10."
    if low_stock_items:
        low_names = ", ".join([f"{i['name']} ({i['on_hand']} left)" for i in low_stock_items[:2]])
        insight_text += f" Low stock alert: {low_names}."

    return {
        "merchant_id": merchant_id,
        "merchant_name": merchant_name,
        "business_type": merchant.business_type if merchant else "Kirana",
        "currency": currency,
        "date_range": {
            "from": from_date,
            "to": to_date,
            "preset": preset or "custom",
            "label": period_label,
            "demo_date": DEMO_DATE
        },
        "sales_summary": {
            "paid_sales_paise": paid_sales_paise,
            "paid_sales_inr": paid_sales_paise / 100.0,
            "paid_sales_formatted": paise_to_inr_str(paid_sales_paise),
            "paid_order_count": paid_order_count,
            "avg_order_paise": avg_order_paise,
            "avg_order_formatted": paise_to_inr_str(avg_order_paise),
            "hourly_chart": hourly_chart,
            "peak_period": peak_period_str,
            "peak_orders": peak_orders,
            "peak_sales_paise": peak_sales_paise,
            "peak_sales_formatted": paise_to_inr_str(peak_sales_paise)
        },
        "payments_breakdown": payment_summary,
        "comparable_weekday": {
            "historical_dates": historical_dates,
            "avg_hist_paise": avg_hist_paise,
            "avg_hist_formatted": paise_to_inr_str(avg_hist_paise),
            "avg_hist_orders": avg_hist_orders,
            "sales_delta_paise": sales_delta_paise,
            "sales_delta_formatted": paise_to_inr_str(sales_delta_paise),
            "sales_delta_pct": sales_delta_pct,
            "observed_pattern": (
                f"{'+' if sales_delta_paise >= 0 else ''}{sales_delta_pct}% vs prior 4 Fridays average ({paise_to_inr_str(avg_hist_paise)}). "
                f"Nov 10 sales dip was an observed anomaly."
            )
        },
        "settlements": {
            "overdue_paise": overdue_paise,
            "overdue_formatted": paise_to_inr_str(overdue_paise),
            "overdue_count": len(overdue_settlements),
            "pending_paise": pending_paise,
            "pending_formatted": paise_to_inr_str(pending_paise),
            "settled_today_paise": settled_today_paise,
            "settled_today_formatted": paise_to_inr_str(settled_today_paise),
            "recent_settlements": recent_settlements_list
        },
        "profitability": {
            "covered_revenue_paise": covered_revenue_paise,
            "covered_revenue_formatted": paise_to_inr_str(covered_revenue_paise),
            "covered_cogs_paise": covered_cogs_paise,
            "covered_cogs_formatted": paise_to_inr_str(covered_cogs_paise),
            "gross_profit_paise": gross_profit_paise,
            "gross_profit_formatted": paise_to_inr_str(gross_profit_paise),
            "margin_pct": margin_pct,
            "coverage_pct": coverage_pct,
            "missing_cost_revenue_paise": missing_cost_revenue_paise,
            "missing_cost_revenue_formatted": paise_to_inr_str(missing_cost_revenue_paise),
            "coverage_label": f"{coverage_pct}% of sales have line item cost records."
        },
        "winback_opportunity": {
            "eligible_customers_count": lapsed_count,
            "suggested_offer_paise": 2000,
            "suggested_offer_formatted": "₹20",
            "max_discount_exposure_paise": lapsed_count * 2000,
            "max_discount_exposure_formatted": paise_to_inr_str(lapsed_count * 2000)
        },
        "low_stock_items": low_stock_items,
        "supplier_bills": {
            "pending_bills": pending_bills_list,
            "count": len(pending_bills_list)
        },
        "top_products": top_products,
        "stockup_scenario": stockup_scenario,
        "recent_transactions": transactions_list,
        "data_sources_status": data_sources_status,
        "insight_headline": insight_text,
        "data_as_of": DEMO_DATE,
        "data_source": "synthetic_database"
    }

def get_lapsed_regulars(db: Session, merchant_id: str) -> List[Dict[str, Any]]:
    opted_customers = db.query(Customer).filter(
        Customer.merchant_id == merchant_id,
        Customer.offer_opt_in == 1
    ).all()
    opted_ids = {c.customer_id: c.display_name for c in opted_customers}

    if not opted_ids:
        return []

    sales = db.query(Sale.customer_id, Sale.sold_at).filter(
        Sale.merchant_id == merchant_id,
        Sale.status == "paid",
        Sale.customer_id.in_(list(opted_ids.keys()))
    ).all()

    cust_visits = {}
    for cid, sold_at in sales:
        v_date = sold_at[:10]
        if cid not in cust_visits:
            cust_visits[cid] = set()
        cust_visits[cid].add(v_date)

    lapsed_list = []
    threshold_date = "2026-10-29"

    for cid, visit_dates in cust_visits.items():
        if len(visit_dates) >= 3:
            last_visit = max(visit_dates)
            if last_visit <= threshold_date:
                lapsed_list.append({
                    "customer_id": cid,
                    "display_name": opted_ids.get(cid, cid),
                    "distinct_visits": len(visit_dates),
                    "last_visit": last_visit
                })

    return sorted(lapsed_list, key=lambda x: x["last_visit"])

def get_stockup_scenario(db: Session, merchant_id: str, budget_inr: int = 5000) -> Dict[str, Any]:
    start_ts = "2026-10-15T00:00:00"
    end_ts = f"{DEMO_DATE}T23:59:59"

    sales = db.query(Sale.sale_id).filter(
        Sale.merchant_id == merchant_id,
        Sale.status == "paid",
        Sale.sold_at >= start_ts,
        Sale.sold_at <= end_ts
    ).all()
    sale_ids = [s.sale_id for s in sales]

    if not sale_ids:
        return {"items": [], "budget_paise": budget_inr * 100, "total_cost_paise": 0}

    items = db.query(SaleItem).filter(
        SaleItem.merchant_id == merchant_id,
        SaleItem.sale_id.in_(sale_ids)
    ).all()

    prod_qty = {}
    for i in items:
        prod_qty[i.product_id] = prod_qty.get(i.product_id, 0) + i.quantity

    products = db.query(Product).filter(
        Product.merchant_id == merchant_id,
        Product.product_id.in_(list(prod_qty.keys()))
    ).all()

    budget_paise = budget_inr * 100
    allocated_paise = 0
    suggestions = []

    sorted_prods = sorted(products, key=lambda p: prod_qty.get(p.product_id, 0), reverse=True)

    for p in sorted_prods:
        unit_cost = p.unit_cost_paise
        if unit_cost <= 0:
            continue
        sold_month = prod_qty.get(p.product_id, 0)
        suggested_units = max(5, int(sold_month / 4))
        cost = suggested_units * unit_cost
        if allocated_paise + cost <= budget_paise:
            allocated_paise += cost
            suggestions.append({
                "product_id": p.product_id,
                "name": p.name,
                "category": p.category,
                "unit_cost_paise": unit_cost,
                "unit_cost_formatted": paise_to_inr_str(unit_cost),
                "suggested_units": suggested_units,
                "total_cost_paise": cost,
                "total_cost_formatted": paise_to_inr_str(cost),
                "monthly_velocity": sold_month
            })

    return {
        "budget_paise": budget_paise,
        "budget_formatted": f"₹{budget_inr:,}",
        "total_cost_paise": allocated_paise,
        "total_cost_formatted": paise_to_inr_str(allocated_paise),
        "items": suggestions,
        "assumptions": "Based on 30-day velocity, 7-day reorder buffer, and known supplier unit costs."
    }
