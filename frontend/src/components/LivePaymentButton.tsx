import React, { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { simulateLivePayment } from '../api';

interface LivePaymentButtonProps {
  onPaymentProcessed: () => void;
}

export const LivePaymentButton: React.FC<LivePaymentButtonProps> = ({ onPaymentProcessed }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await simulateLivePayment();
      setResult(res);
      onPaymentProcessed();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#e6f8fd] text-[#002970]">
              <Zap className="w-4 h-4 text-[#00b9f1]" />
            </span>
            <h3 className="font-bold text-sm sm:text-base text-[#002970]">
              Live Payment Demo (Paytm QR Soundbox Simulation)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Simulates real-time incoming ₹125 UPI payment (<code>M01-LIVE-001</code>). Updates dashboard and voice answer instantly without page reload.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulate}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#002970] to-[#0052cc] hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#00b9f1]" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#00b9f1] fill-current" />
              <span>Simulate ₹125 Payment</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
          result.status === 'already_processed'
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {result.status === 'already_processed' ? (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <div>
            <strong>
              {result.status === 'already_processed'
                ? 'Already Processed (Idempotent):'
                : 'Payment Confirmed:'}
            </strong>{' '}
            {result.sale_id} &bull; ₹125 UPI payment registered &bull; Total Orders: {result.sales_summary?.paid_order_count} &bull; Sales: {result.sales_summary?.paid_sales_formatted}
          </div>
        </div>
      )}
    </div>
  );
};
