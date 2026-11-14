import React from 'react';
import { Store, Languages, RotateCcw, Activity } from 'lucide-react';
import { Merchant, LocaleCode } from '../types';

interface HeaderProps {
  merchants: Merchant[];
  selectedMerchantId: string;
  onSelectMerchant: (id: string) => void;
  locale: LocaleCode;
  onSelectLocale: (loc: LocaleCode) => void;
  onResetDemo: () => void;
  resetting: boolean;
  health: any;
}

export const Header: React.FC<HeaderProps> = ({
  merchants,
  selectedMerchantId,
  onSelectMerchant,
  locale,
  onSelectLocale,
  onResetDemo,
  resetting,
  health
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <img
              src="/munim-logo.jpg"
              alt="Munim AI Business Assistant"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-sm border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl text-[#002970] tracking-tight">MUNIM</span>
                <span className="bg-[#e6f8fd] text-[#008db8] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#00b9f1]/30">
                  Merchant AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Paytm Build for India &bull; Voice-First Business Assistant
              </p>
            </div>
          </div>

          {/* Controls: Merchant Switcher, Language, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Merchant Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 shadow-2xs">
              <Store className="w-4 h-4 text-[#002970] mr-1.5 hidden xs:block" />
              <select
                value={selectedMerchantId}
                onChange={(e) => onSelectMerchant(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-[#002970] focus:outline-none cursor-pointer"
                aria-label="Select Demo Merchant"
              >
                {merchants.map((m) => (
                  <option key={m.merchant_id} value={m.merchant_id}>
                    {m.name} ({m.merchant_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectLocale('te-IN')}
                className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  locale === 'te-IN'
                    ? 'bg-[#002970] text-[#00b9f1] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Telugu (తెలుగు)"
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => onSelectLocale('hi-IN')}
                className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  locale === 'hi-IN'
                    ? 'bg-[#002970] text-[#00b9f1] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hindi (हिन्दी)"
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => onSelectLocale('en-IN')}
                className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  locale === 'en-IN'
                    ? 'bg-[#002970] text-[#00b9f1] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English (India)"
              >
                EN
              </button>
            </div>

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={onResetDemo}
              disabled={resetting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Reset synthetic dataset back to pristine demo state"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Live Health Indicator */}
            {health && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active ({health.sarvam_ai?.configured ? 'Sarvam AI' : 'Local'})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
