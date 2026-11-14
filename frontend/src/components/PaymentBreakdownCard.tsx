import React from 'react';
import { CreditCard, QrCode, Banknote, ShieldCheck, CheckCircle, Info } from 'lucide-react';

interface ChannelItem {
  channel: string;
  count: number;
  amount_paise: number;
  amount_inr: number;
  amount_formatted: string;
  share_pct: number;
}

interface PaymentBreakdownProps {
  breakdown?: {
    period: string;
    total_collected_paise: number;
    total_collected_formatted: string;
    total_tenders: number;
    channels: ChannelItem[];
  };
  posRevenueFormatted?: string;
  periodLabel?: string;
}

export const PaymentBreakdownCard: React.FC<PaymentBreakdownProps> = ({
  breakdown,
  posRevenueFormatted,
  periodLabel
}) => {
  if (!breakdown || !breakdown.channels || breakdown.channels.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-[#00b9f1]" />
          <h3 className="font-bold text-sm text-[#002970]">Payment Tender Collections</h3>
        </div>
        <p className="text-xs text-slate-500">No payment tender records found for this period.</p>
      </div>
    );
  }

  const getChannelIcon = (ch: string) => {
    switch (ch.toUpperCase()) {
      case 'UPI':
        return <QrCode className="w-4 h-4 text-[#00b9f1]" />;
      case 'CASH':
        return <Banknote className="w-4 h-4 text-emerald-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#002970] flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#00b9f1]" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#002970]">
              Payment Channel Breakdown (చెల్లింపు మార్గాలు)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total tender receipts: <span className="font-bold text-[#002970]">{breakdown.total_collected_formatted}</span> across {breakdown.total_tenders} transactions
          </p>
        </div>

        {/* Linked Tenders Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tenders Verified Linked to POS</span>
        </div>
      </div>

      {/* Progress Bars for Channels */}
      <div className="space-y-3 mb-4">
        {breakdown.channels.map((ch) => (
          <div key={ch.channel} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-white border border-slate-200 shadow-2xs">
                  {getChannelIcon(ch.channel)}
                </span>
                <span className="text-[#002970]">{ch.channel} Collection</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {ch.count} tenders
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#002970] mr-2">{ch.amount_formatted}</span>
                <span className="text-[11px] text-[#008db8] font-bold">{ch.share_pct}%</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  ch.channel.toUpperCase() === 'UPI' ? 'bg-[#00b9f1]' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(ch.share_pct, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation Callout: POS Revenue vs Payment Collections */}
      <div className="flex items-start gap-2 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#002970] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#002970]">Tenant Isolation & Non-Double Counting:</span>{' '}
          Payment tenders are joined only through merchant-verified sale links. Pure POS revenue is computed from order line items and tender collections represent payment methods, preventing double-counting.
        </div>
      </div>
    </div>
  );
};
