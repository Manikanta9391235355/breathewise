import React from 'react';
import { IndianRupee, ShoppingBag, Clock, TrendingUp, AlertCircle, Users, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const { sales_summary, comparable_weekday, settlements, profitability, winback_opportunity } = metrics;
  const isPositiveDelta = comparable_weekday.sales_delta_paise >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Paid Sales Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Paid Sales (ఈ రోజు అమ్మకాలు)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002970] flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-[#00b9f1]" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-black text-[#002970] tracking-tight">
            {sales_summary.paid_sales_formatted}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            ({sales_summary.paid_order_count} paid orders)
          </span>
        </div>

        {/* Comparable weekday comparison */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
              isPositiveDelta ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {isPositiveDelta ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {comparable_weekday.sales_delta_pct}%
          </span>
          <span className="text-slate-500 text-[11px] truncate" title={comparable_weekday.observed_pattern}>
            vs 4-Friday avg ({comparable_weekday.avg_hist_formatted})
          </span>
        </div>
      </div>

      {/* 2. Settlement Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            UPI Settlements
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-black text-[#002970] tracking-tight">
            {settlements.pending_formatted}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            pending
          </span>
        </div>

        {settlements.overdue_paise > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-md border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">
              {settlements.overdue_formatted} overdue from Nov 10
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>All historical settlements cleared</span>
          </div>
        )}
      </div>

      {/* 3. Gross Margin & Profitability Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Gross Margin (లాభం)
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-black text-[#002970] tracking-tight">
            {profitability.gross_profit_formatted}
          </span>
          <span className="text-xs font-semibold text-emerald-600">
            ({profitability.margin_pct}% margin)
          </span>
        </div>

        <div className="text-[11px] text-slate-500 truncate" title={profitability.coverage_label}>
          {profitability.coverage_pct}% sales covered by unit cost records
        </div>
      </div>

      {/* 4. Win-Back Opportunity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Win-Back Regulars
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#008db8] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#00b9f1]" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-black text-[#002970] tracking-tight">
            {winback_opportunity.eligible_customers_count}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            lapsed regular buyers
          </span>
        </div>

        <div className="text-[11px] text-slate-600 font-medium">
          ₹20 offer &bull; Max discount {winback_opportunity.max_discount_exposure_formatted}
        </div>
      </div>
    </div>
  );
};
