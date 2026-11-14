import React, { useEffect, useState } from 'react';
import { X, Package, AlertTriangle, TrendingUp, IndianRupee, Truck, ShieldAlert } from 'lucide-react';
import { SkuDetail } from '../types';
import { fetchSkuDetails } from '../api';

interface SkuDetailModalProps {
  productId: string;
  merchantId: string;
  onClose: () => void;
}

export const SkuDetailModal: React.FC<SkuDetailModalProps> = ({
  productId,
  merchantId,
  onClose
}) => {
  const [detail, setDetail] = useState<SkuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordered, setReordered] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchSkuDetails(productId, merchantId)
      .then((data) => {
        if (mounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId, merchantId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
          <p className="text-sm font-bold text-slate-700">Loading SKU details...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
          <p className="text-sm font-bold text-red-600 mb-3">Product SKU not found</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-lg text-xs font-bold text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const marginPaise = detail.unit_price_paise - detail.unit_cost_paise;
  const marginPct = detail.unit_price_paise > 0 ? ((marginPaise / detail.unit_price_paise) * 100).toFixed(1) : '0';
  const suggestedOrder = Math.max(1, detail.target_stock - detail.on_hand);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002970] to-[#0052cc] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Package className="w-5 h-5 text-[#00b9f1]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">{detail.name}</h3>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-cyan-200">
                  {detail.product_id}
                </span>
              </div>
              <p className="text-xs text-blue-100">Category: {detail.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Stock Level Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              detail.is_low_stock
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {detail.is_low_stock ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <Package className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="text-xs font-black uppercase tracking-wider">
                  {detail.is_low_stock ? 'Low Stock Warning' : 'Healthy Inventory'}
                </span>
                <p className="text-xs font-semibold">
                  Closing balance: <strong>{detail.on_hand} units</strong> (Reorder point: {detail.reorder_point})
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Target: {detail.target_stock}</span>
              <span className="text-[11px] font-bold text-red-700">Need: +{suggestedOrder}</span>
            </div>
          </div>

          {/* Pricing & Margin Grid */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Unit Cost</span>
              <span className="text-sm font-black text-[#002970]">{detail.unit_cost_formatted}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Selling Price</span>
              <span className="text-sm font-black text-emerald-700">{detail.unit_price_formatted}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Gross Margin</span>
              <span className="text-sm font-black text-[#008db8]">₹{(marginPaise / 100).toFixed(0)} ({marginPct}%)</span>
            </div>
          </div>

          {/* Velocity & Range Stats */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Authoritative Ledger As-Of:</span>
              <span className="font-bold text-slate-800">{detail.last_stock_date}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Units Sold in Period:</span>
              <span className="font-bold text-[#002970]">{detail.units_sold_in_range} units</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-semibold">Revenue in Period:</span>
              <span className="font-bold text-[#002970]">{detail.revenue_formatted_in_range}</span>
            </div>
          </div>

          {/* Supplier Reorder Action */}
          <div className="pt-2">
            {reordered ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                Purchase Order for {suggestedOrder} units queued to supplier!
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setReordered(true)}
                className="w-full py-2.5 bg-[#002970] hover:bg-blue-800 text-[#00b9f1] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Reorder {suggestedOrder} units from Supplier (₹{((suggestedOrder * detail.unit_cost_paise) / 100).toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
