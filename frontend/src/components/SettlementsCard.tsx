import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { SettlementItem } from '../types';

interface SettlementsCardProps {
  settlements: {
    overdue_paise: number;
    overdue_formatted: string;
    pending_paise: number;
    pending_formatted: string;
    recent_settlements: SettlementItem[];
  };
}

export const SettlementsCard: React.FC<SettlementsCardProps> = ({ settlements }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#002970]" />
          <h3 className="font-bold text-base text-[#002970]">
            Settlements & Cash Flow (సెటిల్మెంట్లు)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Daily UPI Batches</span>
      </div>

      {/* Overdue Alert banner if any */}
      {settlements.overdue_paise > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <span className="font-bold text-red-900">Overdue Settlement Alert:</span> {settlements.overdue_formatted} UPI payout expected on 11 Nov 2026 is delayed. Contact Paytm merchant desk or bank to release batch <code>M01-U086</code>.
          </div>
        </div>
      )}

      {/* Settlements Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-2 px-3">Settlement ID</th>
              <th className="py-2 px-3">Sales Date</th>
              <th className="py-2 px-3">Expected Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Net Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {settlements.recent_settlements.slice(0, 5).map((s) => (
              <tr key={s.settlement_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{s.settlement_id}</td>
                <td className="py-2.5 px-3 text-slate-600">{s.sales_date}</td>
                <td className="py-2.5 px-3 text-slate-600">{s.expected_at}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === 'overdue'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : s.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {s.status === 'overdue' && <AlertTriangle className="w-2.5 h-2.5 text-red-600" />}
                    {s.status === 'settled' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                    <span className="uppercase">{s.status}</span>
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-[#002970]">{s.net_formatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
