'use client';

import React, { useState } from 'react';
import { X, Check, MapPin, Users, Activity, Wallet, ArrowRight, ArrowLeft, Sparkles, Navigation } from 'lucide-react';
import { UserProfile, BudgetTier, CommuteMethod, HousingType, OutdoorFrequency, PrimaryConcern, WorkStyle } from '@/lib/types';
import { POPULAR_CITIES } from '@/lib/constants';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onSelectCity: (cityName: string, lat: number, lon: number) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onSelectCity,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const finalProfile = { ...formData, onboardingCompleted: true };
      onSaveProfile(finalProfile);
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
          city: 'My Location',
          isLiveLocation: true
        }));
        onSelectCity('My Location', latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        setLocationError('Location permission denied or unavailable. Please choose your city below.');
      },
      { timeout: 8000 }
    );
  };

  const handleCityPick = (c: typeof POPULAR_CITIES[0]) => {
    setFormData(prev => ({
      ...prev,
      city: c.name,
      latitude: c.latitude,
      longitude: c.longitude,
      isLiveLocation: false
    }));
    onSelectCity(c.name, c.latitude, c.longitude);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-forest/60 backdrop-blur-sm animate-reveal">
      <div className="relative w-full max-w-2xl bg-cream rounded-[2.5rem] sm:rounded-[3.5rem] border border-forest/20 shadow-forest-lg p-6 sm:p-10 text-forest overflow-hidden">
        {/* Header with step pill and close button */}
        <div className="flex items-center justify-between pb-4 border-b border-forest/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span className="text-xs uppercase font-semibold tracking-utility text-forest/70">
              STEP {step} OF 4 — {step === 1 ? 'LOCATION' : step === 2 ? 'HOUSEHOLD' : step === 3 ? 'LIFESTYLE' : 'BUDGET'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-forest/10 text-forest/80 transition-colors"
            title="Skip or close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-forest/10 h-1.5 rounded-full my-4 overflow-hidden">
          <div
            className="bg-forest h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: LOCATION */}
        {step === 1 && (
          <div className="space-y-6 py-2">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-forest">WHERE DO YOU LIVE?</h2>
              <p className="text-sm text-forest/80 mt-1">
                We calibrate real-time particulate indices and morning temperature inversions to your specific micro-climate.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full py-3.5 px-5 rounded-2xl bg-forest text-cream font-semibold text-xs tracking-utility uppercase flex items-center justify-center gap-2 hover:bg-forest/90 transition-all shadow-sm disabled:opacity-50"
              >
                <Navigation className="w-4 h-4 text-sage" />
                <span>{isLocating ? 'DETECTING SENSORS...' : 'USE MY CURRENT LOCATION'}</span>
              </button>

              {locationError && (
                <p className="text-xs text-aqi-severe font-medium px-2">{locationError}</p>
              )}

              <div className="pt-2">
                <span className="text-[11px] font-semibold tracking-utility text-forest/70 uppercase block mb-2">
                  OR SELECT A MAJOR URBAN CENTER
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_CITIES.slice(0, 9).map((city) => {
                    const isSelected = formData.city === city.name;
                    return (
                      <button
                        key={city.name}
                        onClick={() => handleCityPick(city)}
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-sage border-forest text-forest shadow-sm'
                            : 'bg-white/60 hover:bg-white border-forest/15 text-forest/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{city.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-forest" />}
                        </div>
                        <span className="text-[10px] text-forest/60 block font-normal mt-0.5">{city.state || city.country}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HOUSEHOLD */}
        {step === 2 && (
          <div className="space-y-5 py-2">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-forest">HOUSEHOLD COMPOSITION</h2>
              <p className="text-sm text-forest/80 mt-1">
                Lungs of children and older adults absorb particulate matter differently. We customize exposure thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setFormData(p => ({ ...p, hasChildren: !p.hasChildren }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.hasChildren ? 'bg-sage border-forest' : 'bg-white/60 border-forest/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Children in Home?</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.hasChildren ? 'bg-forest text-cream' : 'border-forest/30'}`}>
                    {formData.hasChildren && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-xs text-forest/70">Under 14 years old. Higher respiratory rate per kg.</p>
              </div>

              <div
                onClick={() => setFormData(p => ({ ...p, hasElderly: !p.hasElderly }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.hasElderly ? 'bg-sage border-forest' : 'bg-white/60 border-forest/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Elderly Family Members?</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.hasElderly ? 'bg-forest text-cream' : 'border-forest/30'}`}>
                    {formData.hasElderly && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-xs text-forest/70">Seniors (60+) sensitive to vascular and lung inflammation.</p>
              </div>

              <div
                onClick={() => setFormData(p => ({ ...p, hasRespiratorySensitivities: !p.hasRespiratorySensitivities }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.hasRespiratorySensitivities ? 'bg-sage border-forest' : 'bg-white/60 border-forest/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Respiratory Sensitivity?</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.hasRespiratorySensitivities ? 'bg-forest text-cream' : 'border-forest/30'}`}>
                    {formData.hasRespiratorySensitivities && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-xs text-forest/70">Asthma, bronchitis, allergic rhinitis, or chronic cough.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 border border-forest/15">
                <span className="font-bold text-sm block mb-1">Housing Structure</span>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {(['apartment', 'independent_house', 'shared_accommodation'] as HousingType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormData(p => ({ ...p, housingType: t }))}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold uppercase tracking-utility ${
                        formData.housingType === t ? 'bg-forest text-cream' : 'bg-olive/40 hover:bg-olive text-forest'
                      }`}
                    >
                      {t === 'independent_house' ? 'House' : t === 'shared_accommodation' ? 'Shared' : 'Apartment'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LIFESTYLE */}
        {step === 3 && (
          <div className="space-y-5 py-2">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-forest">DAILY ROUTINE & COMMUTE</h2>
              <p className="text-sm text-forest/80 mt-1">
                Roadside particulate concentrations are often double ambient background levels.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold tracking-utility text-forest/70 uppercase block mb-1.5">
                  PRIMARY COMMUTE METHOD
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'metro', label: 'Metro / Rail' },
                    { id: 'public_transit', label: 'Bus' },
                    { id: 'private_vehicle', label: 'Car (Closed AC)' },
                    { id: 'carpooling', label: 'Carpool / Cab' },
                    { id: 'walking_cycling', label: 'Two-Wheeler / Bike' },
                    { id: 'remote', label: 'Remote / Work From Home' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setFormData(p => ({ ...p, commuteMethod: m.id as CommuteMethod }))}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                        formData.commuteMethod === m.id
                          ? 'bg-sage border-forest text-forest shadow-sm'
                          : 'bg-white/60 hover:bg-white border-forest/15 text-forest/80'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold tracking-utility text-forest/70 uppercase block mb-1.5">
                  WHAT IS YOUR MAIN PRIORITY?
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'children', label: 'Protecting Children' },
                    { id: 'indoor_air', label: 'Cleaner Indoor Air' },
                    { id: 'commute', label: 'Safer Commute' },
                    { id: 'exercise', label: 'Exercise Timing' },
                    { id: 'overall_health', label: 'Long-term Health' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFormData(p => ({ ...p, primaryConcern: c.id as PrimaryConcern }))}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                        formData.primaryConcern === c.id
                          ? 'bg-sage border-forest text-forest shadow-sm'
                          : 'bg-white/60 hover:bg-white border-forest/15 text-forest/80'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BUDGET */}
        {step === 4 && (
          <div className="space-y-5 py-2">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-forest">HOUSEHOLD BUDGET FOR CLEAN AIR</h2>
              <p className="text-sm text-forest/80 mt-1">
                BreatheWise always prioritizes free behavioral changes. We tailor gear recommendations to what you actually want to spend.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'free',
                  title: '₹0 — Free Only',
                  desc: 'Behavioral routines only: wet mopping, exhaust timing, window latches, avoiding burning.'
                },
                {
                  id: 'under_500',
                  title: 'Under ₹500',
                  desc: 'Low-cost basics: Microfiber damp cloths, quality N95 masks for family, door draft stoppers.'
                },
                {
                  id: '500_2000',
                  title: '₹500 – ₹2,000',
                  desc: 'Mid-tier: DIY Box-fan with MERV-13 filter, multi-pack particulate respirators, exhaust boosters.'
                },
                {
                  id: 'above_2000',
                  title: '₹2,000+',
                  desc: 'Advanced: True HEPA air purifiers (CADR certified), VOC carbon filters, bedroom sealing.'
                }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setFormData(p => ({ ...p, budgetTier: b.id as BudgetTier }))}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    formData.budgetTier === b.id
                      ? 'bg-sage border-forest text-forest shadow-sm ring-2 ring-forest'
                      : 'bg-white/60 hover:bg-white border-forest/15 text-forest/80'
                  }`}
                >
                  <span className="font-bold text-sm block mb-1">{b.title}</span>
                  <p className="text-xs text-forest/70">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-forest/15">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-full border border-forest/20 text-xs font-semibold tracking-utility uppercase text-forest hover:bg-forest/5 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-semibold tracking-utility uppercase text-forest/60 hover:text-forest transition-colors"
            >
              SKIP FOR NOW
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-full bg-forest text-cream font-semibold text-xs tracking-utility uppercase hover:bg-forest/90 transition-all flex items-center gap-2 shadow-sm"
          >
            <span>{step === 4 ? 'SAVE & SEE MY PLAN' : 'CONTINUE'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
