export type LocaleCode = 'te-IN' | 'hi-IN' | 'en-IN';

export interface Merchant {
  merchant_id: string;
  name: string;
  business_type: string;
  timezone: string;
  currency: string;
  source: string;
}

export interface Transaction {
  sale_id: string;
  sold_at: string;
  time: string;
  customer_id: string | null;
  customer_name: string;
  amount_paise: number;
  amount_inr: number;
  amount_formatted: string;
  channel: string;
  status: string;
  source: string;
}

export interface SettlementItem {
  settlement_id: string;
  sales_date: string;
  expected_at: string;
  paid_at: string | null;
  status: 'settled' | 'pending' | 'overdue';
  gross_paise: number;
  fee_paise: number;
  net_paise: number;
  net_formatted: string;
}

export interface TopProduct {
  product_id: string;
  name: string;
  category: string;
  quantity: number;
  revenue_paise: number;
  revenue_formatted: string;
  profit_paise: number;
  profit_formatted: string;
}

export interface StockupItem {
  product_id: string;
  name: string;
  category: string;
  unit_cost_paise: number;
  unit_cost_formatted: string;
  suggested_units: number;
  total_cost_paise: number;
  total_cost_formatted: string;
  monthly_velocity: number;
}

export interface DashboardMetrics {
  merchant_id: string;
  merchant_name: string;
  business_type: string;
  currency: string;
  date_range: {
    from: string;
    to: string;
    demo_date: string;
    preset?: string;
    label?: string;
  };
  sales_summary: {
    paid_sales_paise: number;
    paid_sales_inr: number;
    paid_sales_formatted: string;
    paid_order_count: number;
    avg_order_paise: number;
    avg_order_formatted: string;
    hourly_chart: Array<{ hour: string; count: number; amount_paise: number; amount_inr: number }>;
    peak_period: string;
    peak_orders: number;
    peak_sales_paise: number;
    peak_sales_formatted: string;
  };
  payments_breakdown?: {
    period: string;
    total_collected_paise: number;
    total_collected_formatted: string;
    total_tenders: number;
    channels: Array<{
      channel: string;
      count: number;
      amount_paise: number;
      amount_inr: number;
      amount_formatted: string;
      share_pct: number;
    }>;
  };
  comparable_weekday: {
    historical_dates: string[];
    avg_hist_paise: number;
    avg_hist_formatted: string;
    avg_hist_orders: number;
    sales_delta_paise: number;
    sales_delta_formatted: string;
    sales_delta_pct: number;
    observed_pattern: string;
  };
  settlements: {
    overdue_paise: number;
    overdue_formatted: string;
    overdue_count: number;
    pending_paise: number;
    pending_formatted: string;
    settled_today_paise: number;
    settled_today_formatted: string;
    recent_settlements: SettlementItem[];
  };
  profitability: {
    covered_revenue_paise: number;
    covered_revenue_formatted: string;
    covered_cogs_paise: number;
    covered_cogs_formatted: string;
    gross_profit_paise: number;
    gross_profit_formatted: string;
    margin_pct: number;
    coverage_pct: number;
    missing_cost_revenue_paise: number;
    missing_cost_revenue_formatted: string;
    recorded_expenses_paise?: number;
    recorded_expenses_formatted?: string;
    coverage_label: string;
  };
  winback_opportunity: {
    eligible_customers_count: number;
    suggested_offer_paise: number;
    suggested_offer_formatted: string;
    max_discount_exposure_paise: number;
    max_discount_exposure_formatted: string;
  };
  low_stock_items?: Array<{
    product_id: string;
    name: string;
    on_hand: number;
    reorder_point: number;
    suggested_reorder: number;
    unit_cost_paise: number;
    unit_cost_formatted: string;
    last_update: string;
  }>;
  data_sources_status?: {
    pos: {
      source: string;
      last_sync: string;
      total_records: number;
      status: string;
    };
    inventory: {
      source: string;
      last_sync: string;
      skus_covered: number;
      status: string;
    };
    payments: {
      source: string;
      last_sync: string;
      total_records: number;
      status: string;
    };
  };
  supplier_bills: {
    pending_bills: Array<{
      bill_id: string;
      supplier_id: string;
      billed_at: string;
      due_at: string;
      total_paise: number;
      total_formatted: string;
      status: string;
    }>;
    count: number;
  };
  top_products: TopProduct[];
  stockup_scenario: {
    budget_paise: number;
    budget_formatted: string;
    total_cost_paise: number;
    total_cost_formatted: string;
    items: StockupItem[];
    assumptions: string;
  };
  recent_transactions: Transaction[];
  insight_headline: string;
  data_as_of: string;
  data_source: string;
}

export interface SkuDetail {
  product_id: string;
  name: string;
  category: string;
  unit_price_paise: number;
  unit_price_formatted: string;
  unit_cost_paise: number;
  unit_cost_formatted: string;
  on_hand: number;
  reorder_point: number;
  target_stock: number;
  is_low_stock: boolean;
  last_stock_date: string;
  units_sold_in_range: number;
  revenue_paise_in_range: number;
  revenue_formatted_in_range: string;
  period: string;
}

export interface ActionPreviewData {
  preview_id: string;
  id?: string;
  action_type: string;
  status: string;
  recipient_count: number;
  offer_formatted: string;
  offer_inr?: number;
  max_discount_exposure: string;
  sample_message: string;
  requires_approval: boolean;
  created_at?: string;
}

export interface OutboxReceipt {
  dispatch_id: string;
  action_id: string;
  merchant_id: string;
  channel: string;
  status: string;
  recipients_delivered: number;
  dispatched_at: string;
  sample_delivered_text: string;
  audit_record: {
    actor: string;
    action: string;
    timestamp: string;
    verified_atomic: boolean;
  };
}

export interface AskResponse {
  intent: string;
  locale: LocaleCode;
  question: string;
  answer_text: string;
  audio_base64: string | null;
  numeric_facts: Record<string, any>;
  period: string;
  data_as_of: string;
  data_source: string;
  action_preview: ActionPreviewData | null;
  provider_calls: number;
}
