import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, RotateCcw, Send, ShieldAlert, Sparkles } from 'lucide-react';
import { createActionPreview, approveAction } from '../api';
import { ActionPreviewData, OutboxReceipt, LocaleCode } from '../types';

interface WinbackViewProps {
  merchantId: string;
  locale: LocaleCode;
  onRefreshDashboard?: () => void;
}

export const WinbackView: React.FC<WinbackViewProps> = ({ merchantId, locale, onRefreshDashboard }) => {
  const [preview, setPreview] = useState<ActionPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [receipt, setReceipt] = useState<OutboxReceipt | null>(null);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const p = await createActionPreview(merchantId, 20);
      setPreview(p);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [merchantId]);

  const handleApprove = async () => {
    if (!preview) return;
    setApproving(true);
    try {
      const res = await approveAction(preview.preview_id || preview.id || '', merchantId);
      setReceipt(res.outbox_receipt);
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (e: any) {
      alert(`Approval error: ${e.message}`);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002970] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#00b9f1]" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#002970]">
              Win-Back Lapsed Regulars (రెగ్యులర్ కస్టమర్ల రీకాల్)
            </h3>
            <p className="text-xs text-slate-500">
              Target opted-in customers who visited &ge;3 times but haven't visited in &ge;15 days.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4 animate-spin text-[#00b9f1]" />
          <span>Generating eligible customer preview...</span>
        </div>
      ) : preview ? (
        <div className="space-y-4">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Eligible Customers</span>
              <div className="text-xl font-black text-[#002970] mt-0.5">
                {preview.recipient_count} Customers
              </div>
              <span className="text-[10px] text-slate-400">Opted-in &bull; &ge;3 visits &bull; 15d+ lapsed</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Offer per Customer</span>
              <div className="text-xl font-black text-[#002970] mt-0.5">
                {preview.offer_formatted}
              </div>
              <span className="text-[10px] text-slate-400">Fixed promotional voucher</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Max Exposure</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {preview.max_discount_exposure}
              </div>
              <span className="text-[10px] text-slate-400">If all {preview.recipient_count} redeem</span>
            </div>
          </div>

          {/* Sample Message Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Sample Outreach Message:
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-[#002970] leading-relaxed">
              &ldquo;{preview.sample_message}&rdquo;
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Requires explicit merchant approval. Stored immutable preview ID: <code>{preview.preview_id || preview.id}</code>.
            </p>
          </div>

          {/* Outbox Receipt or Approval Button */}
          {receipt ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Simulated Outbox Receipt (ఆమోదం పూర్తయింది)</span>
              </div>
              <p>
                <strong>Dispatch ID:</strong> <code>{receipt.dispatch_id}</code> &bull; <strong>Recipients:</strong> {receipt.recipients_delivered} customers
              </p>
              <p>
                <strong>Channel:</strong> {receipt.channel} &bull; <strong>Status:</strong> {receipt.status}
              </p>
              <div className="p-2 bg-white/80 rounded border border-emerald-200 font-mono text-[11px] text-emerald-950">
                Audit Record: {JSON.stringify(receipt.audit_record)}
              </div>
              <p className="text-[10px] text-emerald-700">
                Idempotency verified: re-approving returns existing dispatched receipt without double-dispatch.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                No actual SMS sent &bull; Dispatches to simulated merchant outbox.
              </span>
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#002970] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {approving ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Processing Atomic Approval...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#00b9f1]" />
                    <span>Approve & Dispatch ₹20 Offer to {preview.recipient_count} Customers</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
