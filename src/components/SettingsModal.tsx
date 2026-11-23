'use client';

import React, { useState } from 'react';
import { X, Check, Sliders, MapPin, Users, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile, BudgetTier, CommuteMethod, HousingType } from '@/lib/types';
import { POPULAR_CITIES } from '@/lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetData
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-forest/60 backdrop-blur-sm animate-reveal">
      <div className="relative w-full max-w-xl bg-cream rounded-[2.5rem] sm:rounded-[3.5rem] border border-forest/20 shadow-forest-lg p-6 sm:p-9 text-forest overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-forest/15">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-forest" />
            <h3 className="font-display text-2xl text-forest">FAMILY SETTINGS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-forest/10 text-forest/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 py-5">
          {/* Location Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-utility text-forest/70 block">
              ACTIVE LOCATION
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_CITIES.slice(0, 6).map((city) => (
                <button
                  key={city.name}
                  onClick={() => setFormData(p => ({
                    ...p,
                    city: city.name,
                    latitude: city.latitude,
                    longitude: city.longitude,
                    isLiveLocation: false
                  }))}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    formData.city === city.name
                      ? 'bg-sage border-forest text-forest font-bold'
                      : 'bg-white/60 hover:bg-white border-forest/15 text-forest/80'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Household Size & Vulnerabilities */}
          <div className="space-y-3 pt-2 border-t border-forest/10">
            <label className="text-xs font-semibold uppercase tracking-utility text-forest/70 block">
              HOUSEHOLD COMPOSITION
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormData(p => ({ ...p, hasChildren: !p.hasChildren }))}
                className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  formData.hasChildren ? 'bg-sage border-forest' : 'bg-white/60 border-forest/15'
                }`}
              >
                <span className="block font-bold">Children</span>
                <span className="text-[10px] text-forest/60">{formData.hasChildren ? 'Included' : 'None'}</span>
              </button>

              <button
                onClick={() => setFormData(p => ({ ...p, hasElderly: !p.hasElderly }))}
                className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  formData.hasElderly ? 'bg-sage border-forest' : 'bg-white/60 border-forest/15'
                }`}
              >
                <span className="block font-bold">Seniors (60+)</span>
                <span className="text-[10px] text-forest/60">{formData.hasElderly ? 'Included' : 'None'}</span>
              </button>

              <button
                onClick={() => setFormData(p => ({ ...p, hasRespiratorySensitivities: !p.hasRespiratorySensitivities }))}
                className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  formData.hasRespiratorySensitivities ? 'bg-sage border-forest' : 'bg-white/60 border-forest/15'
                }`}
              >
                <span className="block font-bold">Asthma / Allergy</span>
                <span className="text-[10px] text-forest/60">{formData.hasRespiratorySensitivities ? 'Yes' : 'No'}</span>
              </button>
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-2 pt-2 border-t border-forest/10">
            <label className="text-xs font-semibold uppercase tracking-utility text-forest/70 block">
              CLEAN-AIR BUDGET TIER
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'free', label: '₹0 — Free Only' },
                { id: 'under_500', label: 'Under ₹500' },
                { id: '500_2000', label: '₹500 – ₹2,000' },
                { id: 'above_2000', label: '₹2,000+' }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setFormData(p => ({ ...p, budgetTier: b.id as BudgetTier }))}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    formData.budgetTier === b.id
                      ? 'bg-sage border-forest font-bold text-forest'
                      : 'bg-white/60 hover:bg-white border-forest/15 text-forest/80'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset / Demo Data Section */}
          <div className="pt-4 border-t border-forest/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-forest block">Demo State & Local Storage</span>
              <span className="text-[11px] text-forest/60">Reset checklists, metrics, and chat history</span>
            </div>
            {isResetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetData();
                    setIsResetConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-full bg-aqi-severe text-white text-xs font-bold"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setIsResetConfirm(false)}
                  className="text-xs text-forest/60"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirm(true)}
                className="px-3 py-1.5 rounded-full border border-forest/20 text-xs font-semibold text-forest/70 hover:text-forest hover:bg-forest/5"
              >
                Reset Data
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest/15">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold tracking-utility uppercase text-forest/60 hover:text-forest"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-forest text-cream font-semibold text-xs tracking-utility uppercase hover:bg-forest/90 transition-all shadow-sm"
          >
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};
