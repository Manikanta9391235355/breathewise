'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Wind, HeartPulse, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { AirQualityData, UserProfile } from '@/lib/types';

interface LandingHeroProps {
  airQuality: AirQualityData;
  profile: UserProfile;
  onExplorePlan: () => void;
  onCheckAir: () => void;
  onOpenOnboarding: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  airQuality,
  profile,
  onExplorePlan,
  onCheckAir,
  onOpenOnboarding
}) => {
  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Massive Editorial Hero Container */}
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-sage rounded-[3rem] sm:rounded-[5rem] p-6 sm:p-12 lg:p-16 border border-forest/15 shadow-forest-lg overflow-hidden">
          
          {/* Decorative Subtle Organic Shapes representing atmospheric transition */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-olive/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-moss/30 blur-3xl pointer-events-none" />

          {/* Top Editorial Utility Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-forest/80 text-xs uppercase font-semibold tracking-utility">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
              <span>ISSUE NO. 06 — URBAN ENVIRONMENTAL INTELLIGENCE</span>
            </div>
            <div className="flex items-center gap-4">
              <span>PRIMARY FOCUS: INDO-GANGETIC & URBAN MONSOONS</span>
              <span className="hidden sm:inline-block">CALIBRATED TO US-EPA & CAMS</span>
            </div>
          </div>

          {/* Massive Anton Headline (15vw - 23vw responsive font sizing) */}
          <div className="my-6 lg:my-10 animate-reveal">
            <h1 className="font-display text-[16vw] sm:text-[14vw] lg:text-[11.5vw] leading-[0.88] text-forest tracking-tight uppercase select-none">
              BREATHE<br />
              BETTER.<br />
              <span className="text-forest/90">LIVE SMARTER.</span>
            </h1>
          </div>

          {/* Editorial Subheadline & Quick Orientation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mt-8 pt-8 border-t border-forest/20 animate-reveal-delay-1">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-lg sm:text-2xl text-forest font-medium leading-relaxed max-w-2xl">
                Air pollution doesn&apos;t have to control your day. Make better decisions with the air around you.
              </p>
              <p className="text-sm sm:text-base text-forest/80 leading-normal max-w-xl">
                BreatheWise translates complex PM2.5 and meteorological data into personalized family routines—protecting developing children, seniors, and daily commuters with actionable, budget-conscious steps.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={onCheckAir}
                  className="bg-forest text-cream hover:bg-forest/90 px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-utility uppercase shadow-forest transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-sage" />
                  <span>CHECK THE AIR AROUND ME</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onExplorePlan}
                  className="bg-cream/90 hover:bg-cream text-forest border border-forest/20 px-6 sm:px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-utility uppercase shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  EXPLORE YOUR DAILY PLAN
                </button>
              </div>
            </div>

            {/* Live Data Style Panel (Hero Data Element) */}
            <div className="lg:col-span-5">
              <div className="bg-cream/95 backdrop-blur-sm p-6 sm:p-7 rounded-[2.5rem] border border-forest/20 shadow-forest space-y-4">
                <div className="flex items-center justify-between text-xs tracking-utility uppercase font-semibold text-forest/70">
                  <span>LIVE AIR MONITOR</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    airQuality.status === 'LIVE DATA' ? 'bg-forest text-cream' : 'bg-aqi-moderate text-cream'
                  }`}>
                    {airQuality.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-b border-forest/10 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-utility text-forest/60 block font-semibold">YOUR CITY</span>
                    <h3 className="font-display text-3xl sm:text-4xl text-forest">{airQuality.locationName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-utility text-forest/60 block font-semibold">CURRENT US AQI</span>
                    <span className="font-display text-4xl sm:text-5xl text-forest">{airQuality.aqi}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <div className="bg-olive/40 p-3 rounded-2xl">
                    <span className="text-[10px] uppercase tracking-utility text-forest/70 block font-bold">PM2.5 DENSITY</span>
                    <span className="font-display text-2xl text-forest">{airQuality.pm2_5} <span className="text-xs font-sans font-normal">µg/m³</span></span>
                  </div>
                  <div className="bg-sage/40 p-3 rounded-2xl">
                    <span className="text-[10px] uppercase tracking-utility text-forest/70 block font-bold">AIR CATEGORY</span>
                    <span className="font-sans font-bold text-sm text-forest leading-tight block mt-1">{airQuality.aqiCategory}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-forest/80 border-t border-forest/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Wind className="w-3.5 h-3.5 text-forest" />
                    <span>Diurnal Smog Window: Early Afternoon Better</span>
                  </div>
                  <span className="text-[10px] text-forest/60">{airQuality.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Atmospheric Transition Visual: Urban Pollution to Clean Greenery */}
          <div className="mt-12 pt-8 border-t border-forest/15">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/40 backdrop-blur-sm p-5 rounded-[2rem] border border-forest/10 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h4 className="font-display text-lg text-forest">Smart Windows</h4>
                  <p className="text-xs text-forest/80 leading-relaxed mt-0.5">
                    Pinpoints the exact midday hours when ground smog dilutes, so you ventilate and exercise safely.
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-sm p-5 rounded-[2rem] border border-forest/10 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h4 className="font-display text-lg text-forest">Family First</h4>
                  <p className="text-xs text-forest/80 leading-relaxed mt-0.5">
                    Tailored protections for developing children, elderly members, and asthma without panic.
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-sm p-5 rounded-[2rem] border border-forest/10 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h4 className="font-display text-lg text-forest">Zero-Budget Wins</h4>
                  <p className="text-xs text-forest/80 leading-relaxed mt-0.5">
                    Practical high-impact indoor fixes (damp mopping, kitchen exhaust) that cost nothing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Onboarding Prompt Ribbon */}
          {!profile.onboardingCompleted && (
            <div className="mt-8 bg-forest text-cream px-6 py-4 rounded-full flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-sage shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  Personalize BreatheWise for your household members, commute, and budget.
                </span>
              </div>
              <button
                onClick={onOpenOnboarding}
                className="bg-sage text-forest hover:bg-cream px-5 py-2 rounded-full text-xs font-semibold tracking-utility uppercase transition-all shadow-sm shrink-0"
              >
                1-MINUTE SETUP
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
