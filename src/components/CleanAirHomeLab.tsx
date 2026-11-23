'use client';

import React, { useState } from 'react';
import {
  Home,
  Wind,
  Flame,
  Sparkles,
  ShieldCheck,
  Bed,
  CheckCircle2,
  Circle,
  HelpCircle,
  ChevronDown,
  Info
} from 'lucide-react';
import { AirQualityData, UserProfile } from '@/lib/types';
import { INDOOR_LAB_CHECKLIST } from '@/lib/constants';

interface CleanAirHomeLabProps {
  airQuality: AirQualityData;
  profile: UserProfile;
  completedItemIds: string[];
  onToggleItem: (id: string) => void;
}

export const CleanAirHomeLab: React.FC<CleanAirHomeLabProps> = ({
  airQuality,
  profile,
  completedItemIds,
  onToggleItem
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Ventilation', 'Cooking', 'Cleaning', 'Filtration', 'Bedroom'];

  const filteredItems = activeCategory === 'All'
    ? INDOOR_LAB_CHECKLIST
    : INDOOR_LAB_CHECKLIST.filter(item => item.category === activeCategory);

  const completedCount = INDOOR_LAB_CHECKLIST.filter(item => completedItemIds.includes(item.id)).length;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Section Header */}
      <div className="bg-sage rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-utility text-forest/70">
          <Home className="w-4 h-4 text-forest" />
          <span>INDOOR ENVIRONMENTAL HYGIENE</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl text-forest">
          CLEAN AIR HOME LAB
        </h2>
        <p className="text-sm sm:text-base text-forest/90 max-w-3xl leading-relaxed">
          We spend over 85% of our day indoors. Outdoor pollution naturally penetrates living spaces through cracks, while indoor cooking and dust resuspension create localized pollution spikes. Here is your evidence-based household defense playbook.
        </p>

        {/* Indoor Checklist Progress Banner */}
        <div className="bg-cream/90 p-4 sm:p-5 rounded-2xl border border-forest/15 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-bold text-xs uppercase tracking-utility text-forest block">
              HOUSEHOLD HABITS ADOPTED: {completedCount} OF {INDOOR_LAB_CHECKLIST.length}
            </span>
            <span className="text-xs text-forest/70">
              Zero-cost habits like damp mopping and exhaust fans can drop indoor particle peaks by more than half.
            </span>
          </div>

          <div className="w-full sm:w-64 bg-forest/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / INDOOR_LAB_CHECKLIST.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5 Deep-Dive Category Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. VENTILATION */}
        <div className="card-earthy p-6 sm:p-7 border border-forest/15 space-y-3">
          <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center">
            <Wind className="w-5 h-5 text-sage" />
          </div>
          <h3 className="font-display text-2xl text-forest">1. VENTILATION</h3>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>When to ventilate:</strong> Only when outdoor AQI is below 100, or during the 1:00 PM – 3:30 PM daytime thermal dispersion window.
          </p>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>When to seal:</strong> Keep all street-facing balconies and bedroom windows firmly closed between 6:30 AM – 10:00 AM and 6:00 PM – 10:00 PM when vehicular emissions and winter inversion trap ground soot.
          </p>
          <div className="bg-olive/40 p-3 rounded-xl text-[11px] text-forest/90 font-medium">
            Current Outdoor AQI: <strong>{airQuality.aqi}</strong> → {airQuality.aqi > 150 ? 'Keep windows latched' : 'Safe to ventilate now'}
          </div>
        </div>

        {/* 2. COOKING */}
        <div className="card-earthy p-6 sm:p-7 border border-forest/15 space-y-3">
          <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center">
            <Flame className="w-5 h-5 text-sage" />
          </div>
          <h3 className="font-display text-2xl text-forest">2. COOKING HYGIENE</h3>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>Exhaust Fan Rule:</strong> Turn kitchen chimney/exhaust on 1 minute before lighting the stove and run it for 5 minutes after cooking finishes.
          </p>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>Tadka & Frying:</strong> High-heat spice tempering produces intense clouds of ultrafine particles (&lt;0.1 µm). Keep kitchen doors closed to prevent soot from settling on bedroom bedding.
          </p>
          <div className="bg-olive/40 p-3 rounded-xl text-[11px] text-forest/90 font-medium">
            Cost: <strong>Free</strong> • Eliminates internal PM2.5 spikes.
          </div>
        </div>

        {/* 3. CLEANING */}
        <div className="card-earthy p-6 sm:p-7 border border-forest/15 space-y-3">
          <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-sage" />
          </div>
          <h3 className="font-display text-2xl text-forest">3. CLEANING PROTOCOLS</h3>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>Damp Dusting:</strong> Never use dry feather dusters or dry rags. A slightly damp microfiber cloth physically captures particles without releasing them.
          </p>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>Wet Mopping:</strong> Stiff dry brooms launch settled coarse dust (PM10) back into your family&apos;s breathing height for 2 hours. Always damp-mop hard floors.
          </p>
          <div className="bg-olive/40 p-3 rounded-xl text-[11px] text-forest/90 font-medium">
            Cost: <strong>Under ₹100</strong> • Prevents secondary dust inhalation.
          </div>
        </div>

        {/* 4. AIR FILTRATION */}
        <div className="card-earthy p-6 sm:p-7 border border-forest/15 space-y-3">
          <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-sage" />
          </div>
          <h3 className="font-display text-2xl text-forest">4. AIR FILTRATION</h3>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>What HEPA Really Means:</strong> True H13 HEPA captures 99.97% of particles down to 0.3 microns using dense fiberglass fibers, not chemicals or ionization.
          </p>
          <p className="text-xs text-forest/80 leading-relaxed">
            <strong>The Plant Myth:</strong> Indoor potted plants beautify rooms, but peer-reviewed physics proves plants cannot filter severe particulate smog. Do not rely on plants as an air cleaner.
          </p>
          <div className="bg-olive/40 p-3 rounded-xl text-[11px] text-forest/90 font-medium">
            DIY Option: Tape a MERV-13 filter to a box fan (₹1,000 total).
          </div>
        </div>

        {/* 5. BEDROOM SANCTUARY */}
        <div className="card-earthy p-6 sm:p-7 border border-forest/15 space-y-3 md:col-span-2 lg:col-span-2">
          <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center">
            <Bed className="w-5 h-5 text-sage" />
          </div>
          <h3 className="font-display text-2xl text-forest">5. BEDROOM RESTORATIVE SANCTUARY</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-forest/80 leading-relaxed">
            <div>
              <strong className="block text-forest text-sm mb-1">Overnight Smog Peak Defense</strong>
              Nocturnal boundary layer collapse creates the day&apos;s most severe particulate spikes between 11 PM and 5 AM. Close bedroom windows before sunset and place a draft-stopper towel at the bottom of bedroom entry doors.
            </div>
            <div>
              <strong className="block text-forest text-sm mb-1">Low-Irritant Sleep Environment</strong>
              Eliminate incense sticks, mosquito repellent vaporizers, and candles in the bedroom. If using a ceiling fan, wipe blades weekly with a damp cloth to remove accumulated soot.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Habit Checklist */}
      <div className="bg-white rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-4">
          <div>
            <h3 className="font-display text-2xl text-forest">HOUSEHOLD CLEAN-AIR CHECKLIST</h3>
            <p className="text-xs text-forest/70 mt-0.5">Toggle habits as you implement them in your home</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-utility uppercase transition-all ${
                  activeCategory === c
                    ? 'bg-forest text-cream'
                    : 'bg-olive/40 text-forest hover:bg-olive'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const isCompleted = completedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-sage/20 border-forest/30 shadow-sm'
                    : 'bg-cream/40 border-forest/15 hover:bg-cream/70'
                }`}
              >
                <button
                  className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isCompleted ? 'bg-forest text-cream border-forest' : 'border-forest/30 bg-white'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-sage" /> : <Circle className="w-4 h-4 text-forest/40" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-utility bg-forest/10 text-forest px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-forest/60 font-semibold">{item.budget}</span>
                  </div>
                  <h4 className={`font-bold text-sm text-forest ${isCompleted ? 'line-through text-forest/60' : ''}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-forest/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
