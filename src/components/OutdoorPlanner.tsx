'use client';

import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Dumbbell, Sun, Wind, Droplets, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { AirQualityData, UserProfile } from '@/lib/types';

interface OutdoorPlannerProps {
  airQuality: AirQualityData;
  profile: UserProfile;
}

export const OutdoorPlanner: React.FC<OutdoorPlannerProps> = ({ airQuality, profile }) => {
  const [selectedHour, setSelectedHour] = useState<number>(14); // Default to midday 2 PM

  const hourly = airQuality.hourly;
  const isHighPollutionAllDay = Math.min(...hourly.pm2_5) > 60;

  // Classify each hour
  const windows = hourly.time.map((time, idx) => {
    const pm25 = hourly.pm2_5[idx] ?? airQuality.pm2_5;
    const aqi = hourly.us_aqi[idx] ?? airQuality.aqi;
    const temp = hourly.temperature_2m?.[idx] ?? 24;
    const wind = hourly.wind_speed_10m?.[idx] ?? 5;

    let status: 'BETTER OPTION' | 'USE CAUTION' | 'LIMIT OUTDOOR ACTIVITY';
    let statusClass = '';
    let badgeColor = '';

    if (aqi <= 100 || pm25 <= 35) {
      status = 'BETTER OPTION';
      statusClass = 'bg-olive/40 border-forest/30 text-forest';
      badgeColor = '#2d6a4f';
    } else if (aqi <= 160 || pm25 <= 75) {
      status = 'BETTER OPTION'; // Relative daytime lull
      statusClass = 'bg-sage/40 border-forest/20 text-forest';
      badgeColor = '#606c38';
    } else if (aqi <= 220 || pm25 <= 120) {
      status = 'USE CAUTION';
      statusClass = 'bg-amber-50 border-amber-300 text-amber-900';
      badgeColor = '#d97706';
    } else {
      status = 'LIMIT OUTDOOR ACTIVITY';
      statusClass = 'bg-red-50 border-red-300 text-red-900';
      badgeColor = '#9b2226';
    }

    return {
      index: idx,
      time,
      pm25,
      aqi,
      temp,
      wind,
      status,
      statusClass,
      badgeColor
    };
  });

  const selectedData = windows[selectedHour] || windows[0];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Editorial Header */}
      <div className="bg-sage rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-utility text-forest/70">
          <Clock className="w-4 h-4 text-forest" />
          <span>ATMOSPHERIC DISPERSION PLANNER</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl text-forest">
          SMART OUTDOOR ACTIVITY WINDOW
        </h2>
        <p className="text-sm sm:text-base text-forest/90 max-w-3xl leading-relaxed">
          Ground-level pollution fluctuates dramatically throughout a 24-hour cycle due to atmospheric boundary layer height, solar heating, and vehicular peaks. We identify relative daytime lulls so you can schedule necessary errands or indoor alternatives.
        </p>

        {/* Responsible Safety Banner */}
        <div className="bg-cream/90 p-4 sm:p-5 rounded-2xl border border-forest/15 flex items-start gap-3">
          <Info className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div className="text-xs text-forest/90 space-y-1">
            <span className="font-bold block uppercase tracking-utility text-[11px]">SCIENTIFIC REALITY CHECK</span>
            <p>
              {isHighPollutionAllDay
                ? `Note: Particulate matter remains elevated across all 24 hours today in ${airQuality.locationName}. A "BETTER OPTION" window indicates a period of relative atmospheric dispersion, but NOT guaranteed clean air. Intense endurance exercise should still be moved indoors.`
                : `Conditions show noticeable diurnal improvement during midday sunshine when thermal updrafts disperse ground emissions. Avoid early morning and late evening rush hours.`}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Visualizer */}
      <div className="bg-white rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-4">
          <div>
            <h3 className="font-display text-2xl text-forest">24-HOUR ACTIVITY TIMELINE</h3>
            <p className="text-xs text-forest/70 mt-0.5">Click any hour to inspect micro-climate metrics and specific advice</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive/50 text-forest text-[11px]">
              <span className="w-2 h-2 rounded-full bg-aqi-good" /> Better Option
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-aqi-poor" /> Caution
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-900 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-aqi-severe" /> Limit
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Hour Pills */}
        <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin">
          <div className="flex gap-2 min-w-max">
            {windows.map((w) => {
              const isSelected = selectedHour === w.index;
              return (
                <button
                  key={w.index}
                  onClick={() => setSelectedHour(w.index)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all min-w-[76px] ${
                    isSelected
                      ? 'bg-forest text-cream border-forest ring-2 ring-forest scale-105 shadow-md'
                      : `${w.statusClass} hover:opacity-90`
                  }`}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-utility ${isSelected ? 'text-cream/80' : 'text-forest/60'}`}>
                    {w.time}
                  </span>
                  <span className={`font-display text-lg my-1 ${isSelected ? 'text-cream' : 'text-forest'}`}>
                    {w.aqi}
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-cream/20 text-cream' : 'bg-white/80 text-forest'
                  }`}>
                    {w.status === 'BETTER OPTION' ? 'BETTER' : w.status === 'USE CAUTION' ? 'CAUTION' : 'LIMIT'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Card for the Selected Hour */}
        {selectedData && (
          <div className="bg-cream/60 rounded-[2.5rem] p-6 sm:p-8 border border-forest/15 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold tracking-utility text-forest/70">
                  SELECTED HOUR DETAIL
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase"
                  style={{ backgroundColor: selectedData.badgeColor }}
                >
                  {selectedData.status}
                </span>
              </div>
              <h4 className="font-display text-4xl text-forest">{selectedData.time}</h4>
              <p className="text-xs text-forest/80 leading-relaxed">
                {selectedData.status === 'BETTER OPTION'
                  ? `Relative lull in particulate density. Thermal updrafts from sunlight reduce ground trapping. Suitable for necessary outdoor walks or grocery errands.`
                  : selectedData.status === 'USE CAUTION'
                  ? `Pollutants accumulating. Keep outdoor excursions under 30 minutes, avoid strenuous running, and have sensitive family members stay indoors.`
                  : `Severe nocturnal or morning boundary inversion trapping vehicle soot. Avoid all outdoor recreation. Keep home windows shut.`}
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/90 p-4 rounded-2xl border border-forest/10 text-center">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">US AQI</span>
                <span className="font-display text-2xl text-forest mt-0.5 block">{selectedData.aqi}</span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-forest/10 text-center">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">PM2.5</span>
                <span className="font-display text-2xl text-forest mt-0.5 block">{selectedData.pm25} <span className="text-[9px] font-sans">µg</span></span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-forest/10 text-center">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">TEMP</span>
                <span className="font-display text-2xl text-forest mt-0.5 block">{selectedData.temp}°C</span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-forest/10 text-center">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">WIND</span>
                <span className="font-display text-2xl text-forest mt-0.5 block">{selectedData.wind} <span className="text-[9px] font-sans">km/h</span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indoor Exercise Alternatives */}
      <div className="bg-white rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-6">
        <div className="flex items-center gap-3 border-b border-forest/10 pb-4">
          <div className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-sage" />
          </div>
          <div>
            <h3 className="font-display text-2xl text-forest">INDOOR EXERCISE ALTERNATIVES</h3>
            <p className="text-xs text-forest/70 mt-0.5">Maintain cardiovascular health without inhaling elevated fine particles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-cream/50 p-5 rounded-2xl border border-forest/10 space-y-2">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">ROUTINE 1 • LOW AEROBIC</span>
            <h4 className="font-display text-lg text-forest">Vinyasa Yoga & Mat Mobility</h4>
            <p className="text-xs text-forest/80 leading-relaxed">
              Focuses on deep diaphragmatic breathing in a clean, dust-mopped indoor room. Stretches thoracic spine without rapid hyperventilation.
            </p>
            <div className="text-[11px] font-semibold text-forest flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Zero outdoor particulate load</span>
            </div>
          </div>

          <div className="bg-cream/50 p-5 rounded-2xl border border-forest/10 space-y-2">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">ROUTINE 2 • STRENGTH</span>
            <h4 className="font-display text-lg text-forest">Bodyweight Circuit & Core</h4>
            <p className="text-xs text-forest/80 leading-relaxed">
              3 rounds of push-ups, bodyweight squats, lunges, and planks. Keeps metabolic rate high without the 3x-5x respiratory volume of outdoor sprints.
            </p>
            <div className="text-[11px] font-semibold text-forest flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Full muscle stimulus indoors</span>
            </div>
          </div>

          <div className="bg-cream/50 p-5 rounded-2xl border border-forest/10 space-y-2">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">ROUTINE 3 • FAMILY / CHILDREN</span>
            <h4 className="font-display text-lg text-forest">Living Room Obstacle Course</h4>
            <p className="text-xs text-forest/80 leading-relaxed">
              Pillow jumps, balloon volleys, and freeze-dance. Allows children to expend energetic play indoors while outdoor playgrounds exceed safety thresholds.
            </p>
            <div className="text-[11px] font-semibold text-forest flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Protects young airways</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
