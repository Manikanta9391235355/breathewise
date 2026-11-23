'use client';

import React from 'react';
import { ShieldCheck, Train, Car, Zap, RefreshCw, Leaf, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AirQualityData, UserProfile } from '@/lib/types';

interface LowEmissionRoutineProps {
  airQuality: AirQualityData;
  profile: UserProfile;
}

export const LowEmissionRoutine: React.FC<LowEmissionRoutineProps> = ({ airQuality, profile }) => {
  const isSevere = airQuality.aqi > 200;

  const routines = [
    {
      id: 'routine-1',
      title: 'Shift from Open 3-Wheeler to Air-Conditioned Metro/Rail',
      category: 'Transit',
      action: 'Use the metro or an enclosed commuter bus for your daily arterial transit rather than open autos or motorbikes.',
      whyItMatters: 'Traffic intersections and underpasses accumulate toxic diesel particulate soot and carbon monoxide 3-4x above background ambient air.',
      pollutionBenefit: 'Electric metro reduces per-passenger vehicular emissions to near zero on city streets.',
      personalBenefit: 'Enclosed cabins with recirculated filters reduce direct tailpipe soot inhalation during gridlock.',
      effort: 'Low',
      cost: 'Low (Often cheaper than auto fares)'
    },
    {
      id: 'routine-2',
      title: 'Batch Daily Errands into Single Mid-Afternoon Trips',
      category: 'Commute',
      action: 'Combine grocery shopping, pharmacy runs, and parcel pickups into a single trip between 2:00 PM and 4:00 PM.',
      whyItMatters: 'Cold vehicle engine starts produce the highest emissions in the first 5 minutes. Multiple short trips multiply localized neighborhood emissions.',
      pollutionBenefit: 'Halves weekly local engine start cycles and neighborhood street idling.',
      personalBenefit: 'Avoids spending peak morning and evening rush hour sitting in stagnant exhaust plumes.',
      effort: 'Medium',
      cost: 'Free'
    },
    {
      id: 'routine-3',
      title: 'Strict Engine-Off at Red Signals (>20 Seconds)',
      category: 'Driving',
      action: 'Turn off your vehicle ignition when waiting at major traffic junctions or school pickup zones.',
      whyItMatters: 'Idling vehicles emit high pulses of unburnt hydrocarbons and carbon monoxide at pedestrian eye height.',
      pollutionBenefit: 'Reduces neighborhood emissions in densely packed school and residential gate areas.',
      personalBenefit: 'Saves fuel and prevents exhaust fumes from seeping directly into your own cabin.',
      effort: 'Low',
      cost: 'Free (Saves money)'
    },
    {
      id: 'routine-4',
      title: 'Safety-First Non-Motorized Transport Rule',
      category: 'Safety',
      action: isSevere
        ? 'Pause outdoor road cycling and jogging along major traffic avenues during severe winter smog episodes.'
        : 'Cycle or walk only on dedicated interior green paths or colonies, avoiding major arterial ring roads.',
      whyItMatters: 'BreatheWise strictly prioritizes biological safety over generic green idealism: deep aerobic breathing on diesel corridors delivers millions of soot particles directly into alveoli.',
      pollutionBenefit: 'Maintains zero emissions without sacrificing personal health.',
      personalBenefit: 'Prevents acute bronchospasm and cardiovascular strain.',
      effort: 'Low',
      cost: 'Free'
    },
    {
      id: 'routine-5',
      title: 'Clean Electric Cooking & Lid Efficiency',
      category: 'Household',
      action: 'Use electric kettles and induction cooktops where available; keep pots tightly lidded while simmering dishes.',
      whyItMatters: 'Lidded cookware cooks food 30% faster and prevents heavy moisture and cooking oils from becoming airborne indoor aerosols.',
      pollutionBenefit: 'Lowers LPG combustion emissions inside living quarters.',
      personalBenefit: 'Keeps kitchen cooler and prevents indoor PM2.5 spikes from lingering in adjacent bedrooms.',
      effort: 'Low',
      cost: 'Free'
    }
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Header */}
      <div className="bg-sage rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-utility text-forest/70">
          <Leaf className="w-4 h-4 text-forest" />
          <span>SUSTAINABILITY WITHOUT SACRIFICING HEALTH</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl text-forest">
          LOW-EMISSION DAILY ROUTINE
        </h2>
        <p className="text-sm sm:text-base text-forest/90 max-w-3xl leading-relaxed">
          Sustainable living should never compromise your lungs. We tailor realistic, non-judgmental habits that reduce your household emissions while shielding your family from harmful roadway exhaust.
        </p>

        {/* Responsible Safety Warning */}
        <div className="bg-cream/90 p-4 sm:p-5 rounded-2xl border border-forest/15 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div className="text-xs text-forest/90 space-y-1">
            <span className="font-bold block uppercase tracking-utility text-[11px]">OUR COMMITMENT: NO SHAME, SAFETY FIRST</span>
            <p>
              We will never shame you for taking a car or public transit during severe winter smog. Pushing people to bicycle on congested diesel corridors during an air pollution emergency is harmful. Your personal exposure avoidance takes precedence.
            </p>
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map((r) => (
          <div
            key={r.id}
            className="card-earthy p-6 sm:p-8 border border-forest/15 bg-white space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-utility bg-forest text-cream">
                {r.category}
              </span>
              <div className="flex items-center gap-3 text-xs text-forest/70 font-semibold">
                <span>Effort: <strong className="text-forest">{r.effort}</strong></span>
                <span>Cost: <strong className="text-forest">{r.cost}</strong></span>
              </div>
            </div>

            <h3 className="font-display text-2xl text-forest">{r.title}</h3>
            <p className="text-sm font-medium text-forest/90 leading-relaxed">{r.action}</p>

            <div className="space-y-2.5 pt-3 border-t border-forest/10 text-xs text-forest/80">
              <div>
                <strong className="text-[10px] uppercase font-bold tracking-utility text-forest/60 block">WHY IT MATTERS</strong>
                <p className="mt-0.5 leading-normal">{r.whyItMatters}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-olive/30 p-3 rounded-xl">
                  <strong className="text-[10px] uppercase font-bold tracking-utility text-forest/70 block">COMMUNITY BENEFIT</strong>
                  <p className="mt-0.5 text-forest/90">{r.pollutionBenefit}</p>
                </div>
                <div className="bg-sage/30 p-3 rounded-xl">
                  <strong className="text-[10px] uppercase font-bold tracking-utility text-forest/70 block">PERSONAL BENEFIT</strong>
                  <p className="mt-0.5 text-forest/90">{r.personalBenefit}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
