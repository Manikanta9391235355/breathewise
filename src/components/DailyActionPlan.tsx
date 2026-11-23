'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Tag,
  DollarSign,
  Shield,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Check
} from 'lucide-react';
import { DailyRecommendation, AirQualityData, UserProfile } from '@/lib/types';

interface DailyActionPlanProps {
  recommendations: DailyRecommendation[];
  onToggleComplete: (id: string) => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
  airQuality: AirQualityData;
  profile: UserProfile;
}

export const DailyActionPlan: React.FC<DailyActionPlanProps> = ({
  recommendations,
  onToggleComplete,
  onRegenerate,
  isGenerating = false,
  airQuality,
  profile
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MORNING' | 'MIDDAY' | 'EVENING' | 'NIGHT'>('ALL');

  const filtered = activeTab === 'ALL'
    ? recommendations
    : recommendations.filter(r => r.time === activeTab);

  const completedCount = recommendations.filter(r => r.completed).length;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Editorial Header */}
      <div className="bg-sage rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-utility text-forest/70">
              <Sparkles className="w-4 h-4 text-forest" />
              <span>AI-GENERATED ADAPTIVE ROUTINE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl text-forest">
              TODAY&apos;S CLEAN-AIR ACTION PLAN
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="bg-forest text-cream hover:bg-forest/90 px-5 py-2.5 rounded-full text-xs font-semibold tracking-utility uppercase shadow-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sage ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'ANALYZING SENSORS...' : 'REGENERATE WITH AI'}</span>
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-base text-forest/90 max-w-3xl leading-relaxed">
          Calibrated specifically for <span className="font-bold">{airQuality.locationName}</span> (AQI {airQuality.aqi}) and your household of <span className="font-bold">{profile.householdMembers} members</span>. Actions prioritize free behavioral modifications and exposure reduction during diurnal pollution peaks.
        </p>

        {/* Action Progress Bar */}
        <div className="bg-cream/90 p-4 sm:p-5 rounded-2xl border border-forest/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center font-display text-base">
              {completedCount}
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-utility text-forest block">ACTIONS COMPLETED TODAY</span>
              <span className="text-xs text-forest/70">{recommendations.length - completedCount} remaining actions available</span>
            </div>
          </div>

          <div className="w-full sm:w-64 bg-forest/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${recommendations.length > 0 ? (completedCount / recommendations.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Time-of-Day Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'ALL DAY', icon: Sparkles },
          { id: 'MORNING', label: 'MORNING', icon: Coffee },
          { id: 'MIDDAY', label: 'MIDDAY', icon: Sun },
          { id: 'EVENING', label: 'EVENING', icon: Sunset },
          { id: 'NIGHT', label: 'NIGHT', icon: Moon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-utility uppercase transition-all ${
                isActive
                  ? 'bg-forest text-cream shadow-sm'
                  : 'bg-white hover:bg-forest/5 text-forest/70 border border-forest/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className={`card-earthy p-6 sm:p-8 border transition-all duration-300 relative ${
              rec.completed
                ? 'bg-sage/10 border-forest/30 opacity-90'
                : 'bg-white border-forest/15 hover:border-forest/30'
            }`}
          >
            {/* Card Header with Badges and Completion Toggle */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-utility bg-forest text-cream">
                  {rec.time}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-utility bg-olive text-forest">
                  {rec.category.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-utility ${
                  rec.cost === 'FREE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rec.cost}
                </span>
              </div>

              {/* Completion Toggle */}
              <button
                onClick={() => onToggleComplete(rec.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-utility transition-all ${
                  rec.completed
                    ? 'bg-forest text-cream shadow-sm'
                    : 'bg-cream text-forest/70 hover:bg-forest/10 border border-forest/20'
                }`}
                title={rec.completed ? 'Mark incomplete' : 'Mark as done'}
              >
                {rec.completed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-sage" />
                    <span>DONE</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5" />
                    <span>DO THIS</span>
                  </>
                )}
              </button>
            </div>

            {/* Title & Action */}
            <h3 className={`font-display text-2xl text-forest mb-2 ${rec.completed ? 'line-through text-forest/60' : ''}`}>
              {rec.title}
            </h3>

            <p className="text-sm font-medium text-forest/90 mb-4 leading-relaxed">
              {rec.action}
            </p>

            {/* Why It Matters */}
            <div className="space-y-3 pt-3 border-t border-forest/10 text-xs">
              <div>
                <span className="font-bold text-[10px] uppercase tracking-utility text-forest/60 block">
                  WHY IT MATTERS
                </span>
                <p className="text-forest/80 leading-normal mt-0.5">{rec.reason}</p>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase tracking-utility text-forest/60 block">
                  EXPECTED BENEFIT
                </span>
                <p className="text-forest/80 leading-normal mt-0.5">{rec.benefit}</p>
              </div>
            </div>

            {/* Footer with Effort and Qualitative Impact */}
            <div className="mt-5 pt-3 border-t border-forest/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-forest/70">
              <div className="flex items-center gap-3">
                <span>Effort: <strong className="text-forest">{rec.effort}</strong></span>
                <span>Cost: <strong className="text-forest">{rec.cost}</strong></span>
              </div>
              <span className="italic text-forest/60 text-[10px]">
                {rec.impact.explanation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
