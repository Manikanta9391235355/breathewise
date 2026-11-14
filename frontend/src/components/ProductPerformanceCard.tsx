import React from 'react';
import { Package, TrendingUp, Layers } from 'lucide-react';
import { TopProduct } from '../types';

interface ProductPerformanceCardProps {
  products: TopProduct[];
  coverageLabel: string;
}

export const ProductPerformanceCard: React.FC<ProductPerformanceCardProps> = ({ products, coverageLabel }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#002970]" />
          <h3 className="font-bold text-base text-[#002970]">
            Product Performance & Margins (వస్తువుల అమ్మకాలు)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:block">{coverageLabel}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.product_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-[#002970]">{p.name}</span>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {p.category}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Units Sold: <strong>{p.quantity}</strong></span>
              <span className="text-emerald-700 font-semibold">Profit: {p.profit_formatted}</span>
            </div>
            <div className="text-xs font-bold text-[#002970] text-right">
              Revenue: {p.revenue_formatted}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
