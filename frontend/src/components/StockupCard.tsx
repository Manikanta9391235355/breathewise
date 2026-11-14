import React from 'react';
import { Boxes, Sparkles, HelpCircle } from 'lucide-react';
import { StockupItem } from '../types';

interface StockupCardProps {
  stockup: {
    budget_formatted: string;
    total_cost_formatted: string;
    items: StockupItem[];
    assumptions: string;
  };
}

export const StockupCard: React.FC<StockupCardProps> = ({ stockup }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-[#002970]" />
          <h3 className="font-bold text-base text-[#002970]">
            Smart Stock-Up Scenario (సరుకు రీ-ఆర్డర్ ప్లాన్)
          </h3>
        </div>
        <span className="text-xs font-bold text-[#002970] bg-[#e6f8fd] px-2.5 py-1 rounded-full border border-[#00b9f1]/30">
          Budget: {stockup.budget_formatted} &bull; Suggested: {stockup.total_cost_formatted}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{stockup.assumptions}</span>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-2 px-3">Product</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">30-Day Velocity</th>
              <th className="py-2 px-3">Suggested Reorder</th>
              <th className="py-2 px-3 text-right">Unit Cost</th>
              <th className="py-2 px-3 text-right">Estimated Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stockup.items.slice(0, 5).map((item) => (
              <tr key={item.product_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#002970]">{item.name}</td>
                <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                <td className="py-2.5 px-3 text-slate-600 font-mono">{item.monthly_velocity} units</td>
                <td className="py-2.5 px-3 font-bold text-blue-800">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                    +{item.suggested_units} units
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">{item.unit_cost_formatted}</td>
                <td className="py-2.5 px-3 text-right font-bold text-[#002970]">{item.total_cost_formatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
