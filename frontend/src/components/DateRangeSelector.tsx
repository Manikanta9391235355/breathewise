import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export type DatePreset = 'today' | 'last_7_days' | 'last_month' | 'custom';

interface DateRangeSelectorProps {
  activePreset: DatePreset;
  fromDate: string;
  toDate: string;
  dateLabel?: string;
  onSelectPreset: (preset: DatePreset, from?: string, to?: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  activePreset,
  fromDate,
  toDate,
  dateLabel,
  onSelectPreset
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(fromDate);
  const [customTo, setCustomTo] = useState(toDate);

  const presets: Array<{ id: DatePreset; label: string; sublabel?: string }> = [
    { id: 'today', label: 'Today', sublabel: '13 Nov 2026' },
    { id: 'last_7_days', label: 'Last 7 days', sublabel: '07–13 Nov' },
    { id: 'last_month', label: 'Last month', sublabel: 'Oct 2026' },
    { id: 'custom', label: 'Custom' }
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo) {
      onSelectPreset('custom', customFrom, customTo);
      setShowCustom(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002970] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#00b9f1]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Reporting Period
            </span>
            <div className="text-xs sm:text-sm font-bold text-[#002970]">
              {dateLabel || (activePreset === 'today' ? '13 Nov 2026 (Demo As-of)' : `${fromDate} to ${toDate}`)}
            </div>
          </div>
        </div>

        {/* Compact preset pill buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          {presets.map((p) => {
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id === 'custom') {
                    setShowCustom(!showCustom);
                  } else {
                    setShowCustom(false);
                    onSelectPreset(p.id);
                  }
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#002970] text-[#00b9f1] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{p.label}</span>
                {p.sublabel && (
                  <span className={`text-[10px] font-normal hidden md:inline ${isActive ? 'text-cyan-200' : 'text-slate-400'}`}>
                    ({p.sublabel})
                  </span>
                )}
                {p.id === 'custom' && <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Custom Range Drawer */}
      {showCustom && (
        <form onSubmit={handleApplyCustom} className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">From:</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#00b9f1]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">To:</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#00b9f1]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#002970] hover:bg-blue-800 text-[#00b9f1] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Apply Range
          </button>
        </form>
      )}
    </div>
  );
};
