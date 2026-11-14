from sqlalchemy import Column, String, Integer, Text, PrimaryKeyConstraint, Index
from backend.app.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    merchant_id = Column(String(32), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    business_type = Column(String(64), nullable=False)
    timezone = Column(String(64), default="Asia/Kolkata")
    currency = Column(String(8), default="INR")
    source = Column(String(32), default="synthetic")

class Customer(Base):
    __tablename__ = "customers"

    merchant_id = Column(String(32), primary_key=True)
    customer_id = Column(String(64), primary_key=True)
    display_name = Column(String(128), nullable=False)
    offer_opt_in = Column(Integer, default=0)

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "customer_id"),
        Index("idx_cust_merchant_optin", "merchant_id", "offer_opt_in"),
    )

class Supplier(Base):
    __tablename__ = "suppliers"

    merchant_id = Column(String(32), primary_key=True)
    supplier_id = Column(String(64), primary_key=True)
    display_name = Column(String(128), nullable=False)
    payment_terms_days = Column(Integer, default=14)

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "supplier_id"),
    )

class Product(Base):
    __tablename__ = "products"

    merchant_id = Column(String(32), primary_key=True)
    product_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    supplier_id = Column(String(64), nullable=True)
    unit_price_paise = Column(Integer, nullable=False)
    unit_cost_paise = Column(Integer, nullable=False)
    aliases_json = Column(String(256), nullable=True)  # JSON list of aliases

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "product_id"),
    )

class Sale(Base):
    __tablename__ = "sales"

    merchant_id = Column(String(32), primary_key=True)
    sale_id = Column(String(64), primary_key=True)
    sold_at = Column(String(32), nullable=False, index=True)
    customer_id = Column(String(64), nullable=True)
    channel = Column(String(32), default="upi")
    status = Column(String(32), default="paid", index=True)
    amount_paise = Column(Integer, nullable=False)
    source = Column(String(32), default="synthetic")

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "sale_id"),
        Index("idx_sales_merchant_status_date", "merchant_id", "status", "sold_at"),
        Index("idx_sales_merchant_customer", "merchant_id", "customer_id"),
    )

class SaleItem(Base):
    __tablename__ = "sale_items"

    merchant_id = Column(String(32), primary_key=True)
    sale_id = Column(String(64), primary_key=True)
    line_no = Column(Integer, primary_key=True)
    product_id = Column(String(64), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price_paise = Column(Integer, nullable=False)
    unit_cost_paise = Column(Integer, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "sale_id", "line_no"),
        Index("idx_items_merchant_product", "merchant_id", "product_id"),
    )

class PaymentTender(Base):
    __tablename__ = "payment_tenders"

    merchant_id = Column(String(32), primary_key=True)
    tender_id = Column(String(64), primary_key=True)
    sale_id = Column(String(64), nullable=True, index=True)
    tender_type = Column(String(32), default="upi")  # upi, cash, card
    amount_paise = Column(Integer, nullable=False)
    status = Column(String(32), default="paid", index=True)
    paid_at = Column(String(32), nullable=False, index=True)
    source = Column(String(32), default="payment_pos")

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "tender_id"),
        Index("idx_tenders_merchant_status_date", "merchant_id", "status", "paid_at"),
    )

class StockPolicy(Base):
    __tablename__ = "stock_policies"

    merchant_id = Column(String(32), primary_key=True)
    policy_id = Column(String(64), primary_key=True)
    product_id = Column(String(64), nullable=False, index=True)
    reorder_point = Column(Integer, default=10)
    target_stock = Column(Integer, default=30)
    reorder_qty = Column(Integer, default=15)
    lead_time_days = Column(Integer, default=2)

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "policy_id"),
        Index("idx_policy_merchant_product", "merchant_id", "product_id"),
    )

class StockMovement(Base):
    __tablename__ = "stock_movements"

    merchant_id = Column(String(32), primary_key=True)
    movement_id = Column(String(64), primary_key=True)
    product_id = Column(String(64), nullable=False, index=True)
    movement_date = Column(String(16), nullable=False, index=True)
    movement_type = Column(String(32), default="daily_closing")  # daily_closing, receipt, adjustment
    quantity = Column(Integer, nullable=False)
    unit_cost_paise = Column(Integer, default=0)
    notes = Column(String(128), nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "movement_id"),
        Index("idx_stk_merchant_prod_date", "merchant_id", "product_id", "movement_date"),
    )

class Expense(Base):
    __tablename__ = "expenses"

    merchant_id = Column(String(32), primary_key=True)
    expense_id = Column(String(64), primary_key=True)
    expense_date = Column(String(16), nullable=False)
    category = Column(String(64), nullable=False)
    amount_paise = Column(Integer, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "expense_id"),
        Index("idx_expenses_merchant_date", "merchant_id", "expense_date"),
    )

class SupplierBill(Base):
    __tablename__ = "supplier_bills"

    merchant_id = Column(String(32), primary_key=True)
    bill_id = Column(String(64), primary_key=True)
    supplier_id = Column(String(64), nullable=False)
    billed_at = Column(String(16), nullable=False)
    due_at = Column(String(16), nullable=False)
    total_paise = Column(Integer, nullable=False)
    status = Column(String(32), default="pending")

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "bill_id"),
        Index("idx_bills_merchant_status", "merchant_id", "status"),
    )

class Settlement(Base):
    __tablename__ = "settlements"

    merchant_id = Column(String(32), primary_key=True)
    settlement_id = Column(String(64), primary_key=True)
    sales_date = Column(String(16), nullable=False)
    expected_at = Column(String(16), nullable=False)
    paid_at = Column(String(16), nullable=True)
    status = Column(String(32), default="settled")
    gross_paise = Column(Integer, nullable=False)
    fee_paise = Column(Integer, default=0)
    net_paise = Column(Integer, nullable=False)
    source = Column(String(32), default="synthetic")

    __table_args__ = (
        PrimaryKeyConstraint("merchant_id", "settlement_id"),
        Index("idx_settle_merchant_status", "merchant_id", "status", "expected_at"),
    )

class ActionPreview(Base):
    __tablename__ = "action_previews"

    id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(32), nullable=False, index=True)
    action_type = Column(String(64), nullable=False)
    status = Column(String(32), default="previewed")  # previewed, approved, executed
    created_at = Column(String(32), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    payload_json = Column(Text, nullable=False)
    approved_at = Column(String(32), nullable=True)
    outbox_receipt_json = Column(Text, nullable=True)
