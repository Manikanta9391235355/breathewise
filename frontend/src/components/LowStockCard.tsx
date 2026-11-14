import React, { useState } from 'react';
import { AlertTriangle, Package, ChevronRight, Truck } from 'lucide-react';
import { SkuDetailModal } from './SkuDetailModal';

interface LowStockItem {
  product_id: string;
  name: string;
  on_hand: number;
  reorder_point: number;
  suggested_reorder: number;
  unit_cost_paise: number;
  unit_cost_formatted: string;
  last_update: string;
}

interface LowStockCardProps {
  items?: LowStockItem[];
  merchantId: string;
  onSelectSku?: (productId: string) => void;
}

export const LowStockCard: React.FC<LowStockCardProps> = ({
  items = [],
  merchantId,
  onSelectSku
}) => {
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);

  const handleOpenSku = (id: string) => {
    setSelectedSkuId(id);
    if (onSelectSku) onSelectSku(id);
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#002970]">
            Inventory Stock Levels
          </h3>
        </div>
        <p className="text-xs text-slate-500">All SKUs are currently above reorder points.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-4 sm:p-5 shadow-xs mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#002970] flex items-center gap-1.5">
              <span>Low-Stock Alerts</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                {items.length} SKUs Low
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Authoritative stock ledger balances fell below minimum reorder points.
            </p>
          </div>
        </div>
      </div>

      {/* Low stock SKU list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {items.map((sku) => (
          <div
            key={sku.product_id}
            onClick={() => handleOpenSku(sku.product_id)}
            className="p-3 bg-red-50/60 hover:bg-red-50 border border-red-200/80 hover:border-red-300 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#002970] group-hover:text-blue-800">
                  {sku.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {sku.product_id}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Closing Stock:{' '}
                <strong className="text-red-700 font-black">{sku.on_hand}</strong> / Reorder point: {sku.reorder_point}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-1 rounded-lg border border-red-200 shadow-2xs">
                Order +{sku.suggested_reorder}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal on click */}
      {selectedSkuId && (
        <SkuDetailModal
          productId={selectedSkuId}
          merchantId={merchantId}
          onClose={() => setSelectedSkuId(null)}
        />
      )}
    </div>
  );
};
