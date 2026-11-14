import pandas as pd
import json

sales = pd.read_csv('data/sales.csv')
items = pd.read_csv('data/sale_items.csv')
prods = pd.read_csv('data/products.csv')

# 1. Create payment_tenders.csv
tenders = []
for idx, s in sales.iterrows():
    tenders.append({
        'tender_id': f"{s['merchant_id']}-TND-{idx+1:06d}",
        'merchant_id': s['merchant_id'],
        'sale_id': s['sale_id'],
        'tender_type': s['channel'],
        'amount_paise': s['amount_paise'],
        'status': s['status'],
        'paid_at': s['sold_at'],
        'source': 'payment_pos'
    })
df_tenders = pd.DataFrame(tenders)
df_tenders.to_csv('data/payment_tenders.csv', index=False)
print('Generated payment_tenders.csv with', len(df_tenders), 'rows')

# Verify October UPI tenders for M01
m01_tenders = df_tenders[(df_tenders['merchant_id'] == 'M01') & (df_tenders['status'] == 'paid')]
oct_upi = m01_tenders[(m01_tenders['paid_at'].str.startswith('2026-10')) & (m01_tenders['tender_type'] == 'upi')]
print('October M01 UPI total paise:', oct_upi['amount_paise'].sum())

# 2. Create stock_policies.csv
# For M01-P01 (Milk): reorder point is 12!
policies = [
    {'policy_id': 'M01-POL-P01', 'merchant_id': 'M01', 'product_id': 'M01-P01', 'reorder_point': 12, 'target_stock': 40, 'reorder_qty': 20, 'lead_time_days': 1},
    {'policy_id': 'M01-POL-P02', 'merchant_id': 'M01', 'product_id': 'M01-P02', 'reorder_point': 10, 'target_stock': 30, 'reorder_qty': 15, 'lead_time_days': 2},
    {'policy_id': 'M01-POL-P03', 'merchant_id': 'M01', 'product_id': 'M01-P03', 'reorder_point': 15, 'target_stock': 50, 'reorder_qty': 25, 'lead_time_days': 3},
    {'policy_id': 'M01-POL-P04', 'merchant_id': 'M01', 'product_id': 'M01-P04', 'reorder_point': 8, 'target_stock': 25, 'reorder_qty': 10, 'lead_time_days': 3},
    {'policy_id': 'M01-POL-P05', 'merchant_id': 'M01', 'product_id': 'M01-P05', 'reorder_point': 6, 'target_stock': 20, 'reorder_qty': 10, 'lead_time_days': 4},
    {'policy_id': 'M01-POL-P06', 'merchant_id': 'M01', 'product_id': 'M01-P06', 'reorder_point': 5, 'target_stock': 15, 'reorder_qty': 10, 'lead_time_days': 5},
    {'policy_id': 'M01-POL-P07', 'merchant_id': 'M01', 'product_id': 'M01-P07', 'reorder_point': 12, 'target_stock': 40, 'reorder_qty': 20, 'lead_time_days': 2},
    {'policy_id': 'M01-POL-P08', 'merchant_id': 'M01', 'product_id': 'M01-P08', 'reorder_point': 10, 'target_stock': 35, 'reorder_qty': 20, 'lead_time_days': 3},
]
df_pol = pd.DataFrame(policies)
df_pol.to_csv('data/stock_policies.csv', index=False)
print('Generated stock_policies.csv')

# 3. Create stock_movements.csv
# Daily closing inventory ledger as of 2026-11-13
# Milk (M01-P01) closing stock as of 13 November is 4!
movements = [
    {'movement_id': 'M01-STK-20261113-01', 'merchant_id': 'M01', 'product_id': 'M01-P01', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 4, 'unit_cost_paise': 2354, 'notes': 'Daily closing ledger'},
    {'movement_id': 'M01-STK-20261113-02', 'merchant_id': 'M01', 'product_id': 'M01-P02', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 18, 'unit_cost_paise': 6139, 'notes': 'Daily closing ledger'},
    {'movement_id': 'M01-STK-20261113-03', 'merchant_id': 'M01', 'product_id': 'M01-P03', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 9, 'unit_cost_paise': 2048, 'notes': 'Daily closing ledger (Low Stock)'},
    {'movement_id': 'M01-STK-20261113-04', 'merchant_id': 'M01', 'product_id': 'M01-P04', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 15, 'unit_cost_paise': 17852, 'notes': 'Daily closing ledger'},
    {'movement_id': 'M01-STK-20261113-05', 'merchant_id': 'M01', 'product_id': 'M01-P05', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 12, 'unit_cost_paise': 11216, 'notes': 'Daily closing ledger'},
    {'movement_id': 'M01-STK-20261113-06', 'merchant_id': 'M01', 'product_id': 'M01-P06', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 8, 'unit_cost_paise': 18884, 'notes': 'Daily closing ledger'},
    {'movement_id': 'M01-STK-20261113-07', 'merchant_id': 'M01', 'product_id': 'M01-P07', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 22, 'unit_cost_paise': 2660, 'notes': 'Daily closing ledger'},
    {'movement_id': 'M01-STK-20261113-08', 'merchant_id': 'M01', 'product_id': 'M01-P08', 'movement_date': '2026-11-13', 'movement_type': 'daily_closing', 'quantity': 14, 'unit_cost_paise': 3824, 'notes': 'Daily closing ledger'},
]
df_mov = pd.DataFrame(movements)
df_mov.to_csv('data/stock_movements.csv', index=False)
print('Generated stock_movements.csv')

# 4. Create expected_upgrade.json
expected_upgrade = {
    'as_of_date': '2026-11-13',
    'M01_october_paid_pos_revenue_paise': 21280000,
    'M01_october_paid_orders': 888,
    'M01_october_paid_upi_paise': 16874000,
    'M01_october_milk_units': 352,
    'M01_milk_closing_stock_2026_11_13': 4,
    'M01_milk_reorder_point': 12
}
with open('data/expected_upgrade.json', 'w') as f:
    json.dump(expected_upgrade, f, indent=2)
print('Generated expected_upgrade.json')
