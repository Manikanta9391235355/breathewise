import React, { useState } from 'react';
import { BarChart3, Clock, Sparkles } from 'lucide-react';

interface HourlyData {
  hour: string;
  count: number;
  amount_paise: number;
  amount_inr: number;
}

interface HourlySalesChartProps {
  hourlyData: HourlyData[];
  peakPeriod: string;
  peakOrders: number;
  peakSalesFormatted: string;
}

export const HourlySalesChart: React.FC<HourlySalesChartProps> = ({
  hourlyData,
  peakPeriod,
  peakOrders,
  peakSalesFormatted
}) => {
  const [activeSlot, setActiveSlot] = useState<HourlyData | null>(null);

  const maxAmount = Math.max(...hourlyData.map((d) => d.amount_inr), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#002970]" />
          <div>
            <h3 className="font-bold text-base text-[#002970]">
              Hourly Sales Pattern (గంటల వారీ అమ్మకాలు)
            </h3>
            <p className="text-xs text-slate-500">
              Peak trading hours highlighted &bull; Tap any bar to view details
            </p>
          </div>
        </div>

        {/* Peak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#e6f8fd] border border-[#00b9f1]/40 rounded-full text-xs font-bold text-[#002970]">
          <Sparkles className="w-3.5 h-3.5 text-[#00b9f1]" />
          <span>Peak: {peakPeriod} ({peakOrders} orders &bull; {peakSalesFormatted})</span>
        </div>
      </div>

      {/* SVG / CSS Bar Chart */}
      <div className="relative pt-6 pb-2">
        {/* Active Tooltip */}
        {activeSlot && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#002970] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 z-10">
            <span>{activeSlot.hour}:</span>
            <span className="text-[#00b9f1] font-bold">₹{activeSlot.amount_inr.toLocaleString()}</span>
            <span className="text-slate-300">({activeSlot.count} orders)</span>
          </div>
        )}

        <div className="h-32 sm:h-36 flex items-end gap-1 sm:gap-1.5 pt-4">
          {hourlyData.map((slot) => {
            const heightPct = Math.max(8, Math.round((slot.amount_inr / maxAmount) * 100));
            const isPeak = slot.hour >= '18:00' && slot.hour <= '20:00';
            const isSelected = activeSlot?.hour === slot.hour;

            return (
              <div
                key={slot.hour}
                onMouseEnter={() => setActiveSlot(slot)}
                onMouseLeave={() => setActiveSlot(null)}
                onTouchStart={() => setActiveSlot(slot)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#002970] ring-2 ring-[#00b9f1]'
                      : isPeak
                      ? 'bg-gradient-to-t from-[#00b9f1] to-[#38bdf8] hover:brightness-110'
                      : slot.amount_inr > 0
                      ? 'bg-slate-300 hover:bg-slate-400'
                      : 'bg-slate-100'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
          <span>06:00</span>
          <span className="hidden sm:inline">09:00</span>
          <span>12:00</span>
          <span className="hidden sm:inline">15:00</span>
          <span className="text-[#002970] font-bold">18:00 (Peak)</span>
          <span>21:00</span>
        </div>
      </div>
    </div>
  );
};
