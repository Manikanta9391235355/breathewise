import { DashboardMetrics, Merchant, AskResponse, ActionPreviewData, OutboxReceipt, LocaleCode, SkuDetail } from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchMerchants(): Promise<Merchant[]> {
  const res = await fetch(`${API_BASE}/merchants`);
  if (!res.ok) throw new Error(`Failed to fetch merchants: ${res.statusText}`);
  return res.json();
}

export async function fetchDashboard(
  merchantId: string = 'M01',
  fromDate?: string,
  toDate?: string,
  preset?: string
): Promise<DashboardMetrics> {
  let url = `${API_BASE}/dashboard?merchant_id=${merchantId}`;
  if (preset) url += `&preset=${preset}`;
  if (fromDate) url += `&from=${fromDate}`;
  if (toDate) url += `&to=${toDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
  return res.json();
}

export async function fetchSkuDetails(productId: string, merchantId: string = 'M01'): Promise<SkuDetail> {
  const res = await fetch(`${API_BASE}/inventory/skus/${productId}?merchant_id=${merchantId}`);
  if (!res.ok) throw new Error(`Failed to fetch SKU details: ${res.statusText}`);
  return res.json();
}

export async function fetchLowStock(merchantId: string = 'M01'): Promise<{ merchant_id: string; low_stock_count: number; items: any[] }> {
  const res = await fetch(`${API_BASE}/inventory/low-stock?merchant_id=${merchantId}`);
  if (!res.ok) throw new Error(`Failed to fetch low stock: ${res.statusText}`);
  return res.json();
}

export async function fetchPaymentBreakdown(merchantId: string = 'M01', fromDate?: string, toDate?: string, preset?: string): Promise<any> {
  let url = `${API_BASE}/payments/breakdown?merchant_id=${merchantId}`;
  if (preset) url += `&preset=${preset}`;
  if (fromDate) url += `&from=${fromDate}`;
  if (toDate) url += `&to=${toDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch payment breakdown: ${res.statusText}`);
  return res.json();
}

export async function postAsk(payload: {
  merchant_id: string;
  locale: LocaleCode;
  question?: string;
  audio_base64?: string;
  from?: string;
  to?: string;
}): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Ask failed: ${res.statusText}`);
  return res.json();
}

export async function createActionPreview(merchantId: string = 'M01', offerInr: number = 20): Promise<ActionPreviewData> {
  const res = await fetch(`${API_BASE}/actions/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_id: merchantId, action_type: 'winback_offer', offer_inr: offerInr })
  });
  if (!res.ok) throw new Error(`Failed to create action preview: ${res.statusText}`);
  return res.json();
}

export async function approveAction(actionId: string, merchantId: string = 'M01'): Promise<{ status: string; action_id: string; outbox_receipt: OutboxReceipt }> {
  const res = await fetch(`${API_BASE}/actions/${actionId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_id: merchantId })
  });
  if (!res.ok) throw new Error(`Failed to approve action: ${res.statusText}`);
  return res.json();
}

export async function simulateLivePayment(eventPayload?: any): Promise<any> {
  const payload = eventPayload || {
    sale_id: 'M01-LIVE-001',
    merchant_id: 'M01',
    sold_at: '2026-11-13T21:15:00+05:30',
    amount_paise: 12500,
    channel: 'upi',
    status: 'paid',
    source: 'simulated_live'
  };

  const res = await fetch(`${API_BASE}/demo/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Simulate event failed: ${res.statusText}`);
  return res.json();
}

export async function resetDemo(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Reset demo failed: ${res.statusText}`);
  return res.json();
}

export async function previewImport(file: File, merchantId: string = 'M01'): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('merchant_id', merchantId);

  const res = await fetch(`${API_BASE}/import/preview`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to preview import');
  }
  return res.json();
}

export async function commitImport(merchantId: string, rows: any[]): Promise<any> {
  const res = await fetch(`${API_BASE}/import/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_id: merchantId, rows })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to commit import');
  }
  return res.json();
}
