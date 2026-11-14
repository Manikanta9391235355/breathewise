import React from 'react';
import { History, Smartphone, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#002970]" />
          <h3 className="font-bold text-base text-[#002970]">
            Recent Transactions (ఇటీవలి లావాదేవీలు)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Demo Business Date: 2026-11-13</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Order / Txn ID</th>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3">Channel</th>
              <th className="py-2 px-3">Source</th>
              <th className="py-2 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.slice(0, 10).map((t) => (
              <tr key={t.sale_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-mono text-slate-600">{t.time || t.sold_at.slice(11, 16)}</td>
                <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{t.sale_id}</td>
                <td className="py-2.5 px-3 font-medium text-[#002970]">
                  {t.customer_name}
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                    <Smartphone className="w-3 h-3 text-[#00b9f1]" />
                    {t.channel}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.source === 'simulated_live'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.source === 'simulated_live' ? '⚡ Simulated Live' : 'Synthetic'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-black text-emerald-700 text-sm">
                  +{t.amount_formatted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
