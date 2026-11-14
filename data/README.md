# Munim synthetic merchant data

90 days, 16 August through 13 November 2026 inclusive, in Asia/Kolkata. Everything is synthetic. Customer IDs are pseudonymous fixtures. Settlement dates are a simplified UPI demo policy and do not describe Paytm settlement schedules.

| CSV | Grain | Key |
| --- | --- | --- |
| merchants | One demo merchant | merchant_id |
| customers | One customer at a merchant | merchant_id, customer_id |
| suppliers | One supplier at a merchant | merchant_id, supplier_id |
| products | One SKU at a merchant | merchant_id, product_id |
| sales | One order attempt | merchant_id, sale_id |
| sale_items | One order line | merchant_id, sale_id, line_no |
| expenses | One recorded operating expense | merchant_id, expense_id |
| supplier_bills | One supplier bill | merchant_id, bill_id |
| settlements | One daily paid UPI batch | merchant_id, settlement_id |

Import in the listed order and read CSV IDs as text. Amounts use integer paise. Paid figures include only paid rows. Failed and fully refunded attempts still have item lines, which must be filtered through the sales status. Each line preserves sale-time price and unit cost. Supplier bills have no SKU/quantity detail and can be used for due-date views, so use sale lines for COGS. Expense coverage is illustrative and deliberately limited.

Check expected_demo.json for exact baseline values. Use simulated_event.json as a separate demo event, with sale_id as its idempotency key. It is a payment-only event and has no linked item lines. The dataset includes a November demand spike, a 10 November sales dip and delayed settlement for Ramesh Kirana, and a group of opted-in regulars whose visits lapse. For an Excel upload test, open a copy of a CSV in Excel and save it as .xlsx while preserving the headers and ID values.
