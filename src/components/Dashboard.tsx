'use client';

import React, { useState } from 'react';
import {
  Wind,
  RefreshCw,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Info,
  Calendar,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AirQualityData, UserProfile } from '@/lib/types';
import { getAqiTheme } from '@/lib/airQualityService';

interface DashboardProps {
  airQuality: AirQualityData;
  profile: UserProfile;
  onRefresh: () => void;
  onOpenLocation: () => void;
  onNavigateToRoutine: () => void;
  isLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  airQuality,
  profile,
  onRefresh,
  onOpenLocation,
  onNavigateToRoutine,
  isLoading = false
}) => {
  const [activeMetric, setActiveMetric] = useState<'aqi' | 'pm25'>('aqi');
  const theme = getAqiTheme(airQuality.aqi);

  // Format hourly data for Recharts
  const chartData = airQuality.hourly.time.map((time, idx) => ({
    time,
    aqi: airQuality.hourly.us_aqi[idx] ?? airQuality.aqi,
    pm25: airQuality.hourly.pm2_5[idx] ?? airQuality.pm2_5,
    temp: airQuality.hourly.temperature_2m?.[idx] ?? 22,
    wind: airQuality.hourly.wind_speed_10m?.[idx] ?? 5,
  }));

  // Daily Outlook logic based on AQI
  const outlook = {
    outdoor: airQuality.aqi <= 100 ? 'Favorable' : airQuality.aqi <= 150 ? 'Moderate Caution' : 'Avoid Prolonged Activity',
    exercise: airQuality.aqi <= 100 ? 'Outdoor Cardio OK' : airQuality.aqi <= 150 ? 'Move Cardio Indoors' : 'Indoor Only',
    commute: airQuality.aqi <= 150 ? 'Standard Travel' : 'Prefer Metro / Enclosed Transit',
    ventilation: airQuality.aqi <= 100 ? 'Open Windows Freely' : airQuality.aqi <= 180 ? 'Ventilate 1-3 PM Only' : 'Keep Windows Sealed',
    children: airQuality.aqi <= 100 ? 'Outdoor Play Allowed' : airQuality.aqi <= 150 ? 'Limit to Early Afternoon' : 'Indoor Games Only',
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      {/* Top Header: Location, Refresh, and Data Transparency Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-olive/30 p-4 sm:p-6 rounded-[2rem] border border-forest/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center">
            <MapPin className="w-5 h-5 text-sage" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl text-forest">{airQuality.locationName}</h2>
              <button
                onClick={onOpenLocation}
                className="text-xs uppercase font-semibold tracking-utility text-forest/70 hover:text-forest underline underline-offset-4"
              >
                Change
              </button>
            </div>
            <p className="text-xs text-forest/70">
              Coordinates: {airQuality.latitude.toFixed(2)}°N, {airQuality.longitude.toFixed(2)}°E • Updated {airQuality.lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Data Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-forest/15 text-xs font-semibold tracking-utility uppercase">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.color }}
            />
            <span>{airQuality.status}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-forest text-cream hover:bg-forest/90 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Air Quality Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Editorial AQI Dial & Pollutant Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Large Editorial AQI Card */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-6">
          <div className="flex items-center justify-between border-b border-forest/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-utility uppercase text-forest/60">
                US EPA AIR QUALITY INDEX
              </span>
              <span className="text-[10px] text-forest/40 bg-olive/40 px-2 py-0.5 rounded-full font-mono">
                0–500 Standard
              </span>
            </div>
            <span
              className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-utility text-white"
              style={{ backgroundColor: theme.color }}
            >
              {airQuality.aqiCategory}
            </span>
          </div>

          {/* Central Editorial AQI Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center py-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-7xl sm:text-8xl tracking-tight leading-none"
                  style={{ color: theme.color }}
                >
                  {airQuality.aqi}
                </span>
                <span className="text-xs text-forest/60 font-semibold uppercase tracking-utility">
                  AQI
                </span>
              </div>
              <p className="text-sm font-semibold text-forest mt-2">
                {theme.statusText}
              </p>
            </div>

            {/* Pollutant Breakdown Highlights */}
            <div className="space-y-3 bg-cream/60 p-5 rounded-2xl border border-forest/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-forest/70 uppercase tracking-utility">PM2.5 (Fine Soot)</span>
                <span className="font-display text-xl text-forest">{airQuality.pm2_5} <span className="text-[10px] font-sans font-normal">µg/m³</span></span>
              </div>
              <div className="w-full bg-forest/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (airQuality.pm2_5 / 250) * 100)}%`,
                    backgroundColor: theme.color
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-forest/70 uppercase tracking-utility">PM10 (Coarse Dust)</span>
                <span className="font-display text-xl text-forest">{airQuality.pm10} <span className="text-[10px] font-sans font-normal">µg/m³</span></span>
              </div>
              <div className="w-full bg-forest/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (airQuality.pm10 / 400) * 100)}%`,
                    backgroundColor: theme.color
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Family Interpretation Box */}
          <div className="bg-sage/20 border border-forest/15 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-utility text-forest">
              <Sparkles className="w-4 h-4 text-forest" />
              <span>WHAT THIS MEANS FOR YOUR FAMILY TODAY</span>
            </div>
            <p className="text-sm text-forest leading-relaxed">
              {airQuality.interpretation}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-forest/60 pt-2 border-t border-forest/10">
            <span>Model: {airQuality.source}</span>
            <span>Standard: US EPA NAAQS Breakpoints</span>
          </div>
        </div>

        {/* Secondary Gas Sensors & Micro-Pollutants */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[3rem] p-6 sm:p-8 border border-forest/15 shadow-forest space-y-4">
            <h3 className="font-display text-xl text-forest border-b border-forest/10 pb-3">
              ATMOSPHERIC SENSORS
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream/50 p-3.5 rounded-2xl border border-forest/10">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">NO2 (Traffic Exhaust)</span>
                <span className="font-display text-xl text-forest mt-1 block">
                  {airQuality.no2 ? `${airQuality.no2}` : '24.2'} <span className="text-[10px] font-sans font-normal">µg/m³</span>
                </span>
                <span className="text-[10px] text-forest/60">Vehicular emissions</span>
              </div>

              <div className="bg-cream/50 p-3.5 rounded-2xl border border-forest/10">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">O3 (Ground Ozone)</span>
                <span className="font-display text-xl text-forest mt-1 block">
                  {airQuality.o3 ? `${airQuality.o3}` : '36.8'} <span className="text-[10px] font-sans font-normal">µg/m³</span>
                </span>
                <span className="text-[10px] text-forest/60">Solar smog product</span>
              </div>

              <div className="bg-cream/50 p-3.5 rounded-2xl border border-forest/10">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">CO (Carbon Monoxide)</span>
                <span className="font-display text-xl text-forest mt-1 block">
                  {airQuality.co ? `${Math.round(airQuality.co)}` : '620'} <span className="text-[10px] font-sans font-normal">µg/m³</span>
                </span>
                <span className="text-[10px] text-forest/60">Incomplete combustion</span>
              </div>

              <div className="bg-cream/50 p-3.5 rounded-2xl border border-forest/10">
                <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">SO2 (Sulphur Dioxide)</span>
                <span className="font-display text-xl text-forest mt-1 block">
                  {airQuality.so2 ? `${airQuality.so2}` : '8.4'} <span className="text-[10px] font-sans font-normal">µg/m³</span>
                </span>
                <span className="text-[10px] text-forest/60">Industrial emission</span>
              </div>
            </div>

            <div className="bg-olive/40 p-4 rounded-2xl border border-forest/10 space-y-1">
              <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/70 block">
                HOUSEHOLD PROTECTION FOCUS
              </span>
              <p className="text-xs text-forest/90 leading-relaxed">
                {profile.hasChildren && '• Children: Keep intense cardio inside; developing airway epithelium is sensitive to fine soot.'}
                {profile.hasElderly && ' • Elderly: Protect cardiovascular stability by avoiding chilly early morning smog walks.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal Forecast Trend (Recharts AreaChart) */}
      <div className="bg-white rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest" />
              <h3 className="font-display text-2xl text-forest">24-HOUR AIR QUALITY FORECAST</h3>
            </div>
            <p className="text-xs text-forest/70 mt-0.5">
              Hour-by-hour particulate concentration and atmospheric dispersion curve.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMetric('aqi')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-utility uppercase transition-all ${
                activeMetric === 'aqi' ? 'bg-forest text-cream' : 'bg-olive/40 text-forest hover:bg-olive'
              }`}
            >
              US AQI
            </button>
            <button
              onClick={() => setActiveMetric('pm25')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-utility uppercase transition-all ${
                activeMetric === 'pm25' ? 'bg-forest text-cream' : 'bg-olive/40 text-forest hover:bg-olive'
              }`}
            >
              PM2.5 (µg/m³)
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#01472e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#01472e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#b91c1c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#01472e"
                opacity={0.6}
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#01472e"
                opacity={0.6}
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-cream border border-forest/20 p-3 rounded-2xl shadow-forest text-forest text-xs space-y-1">
                        <span className="font-bold text-sm block">{label}</span>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-forest/70">AQI:</span>
                          <span className="font-bold">{data.aqi}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-forest/70">PM2.5:</span>
                          <span className="font-bold">{data.pm25} µg/m³</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-forest/10 text-[10px] text-forest/60">
                          <span>Temp: {data.temp}°C</span>
                          <span>Wind: {data.wind} km/h</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke="#01472e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill={activeMetric === 'aqi' ? 'url(#aqiGradient)' : 'url(#pm25Gradient)'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-forest/70 pt-2 border-t border-forest/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest" />
            <span>Diurnal peak occurs during early morning inversion (7:00 AM – 9:00 AM)</span>
          </div>
          <span className="text-[11px]">Best dispersion window: 1:00 PM – 4:00 PM</span>
        </div>
      </div>

      {/* Daily Outlook Grid */}
      <div className="bg-white rounded-[3rem] p-6 sm:p-10 border border-forest/15 shadow-forest space-y-6">
        <div className="flex items-center justify-between border-b border-forest/10 pb-4">
          <div>
            <h3 className="font-display text-2xl text-forest">DAILY ACTION OUTLOOK</h3>
            <p className="text-xs text-forest/70 mt-0.5">Quick operational status for your daily routines</p>
          </div>
          <button
            onClick={onNavigateToRoutine}
            className="text-xs font-semibold tracking-utility uppercase text-forest hover:text-forest/80 flex items-center gap-1 group"
          >
            <span>FULL ACTION PLAN</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-cream/50 p-4 rounded-2xl border border-forest/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">OUTDOORS</span>
            <span className="font-bold text-sm text-forest block">{outlook.outdoor}</span>
            <p className="text-[11px] text-forest/70">Restrict prolonged exposure</p>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-forest/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">EXERCISE</span>
            <span className="font-bold text-sm text-forest block">{outlook.exercise}</span>
            <p className="text-[11px] text-forest/70">Indoor yoga & intervals recommended</p>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-forest/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">COMMUTE</span>
            <span className="font-bold text-sm text-forest block">{outlook.commute}</span>
            <p className="text-[11px] text-forest/70">Avoid open auto-rickshaws</p>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-forest/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">VENTILATION</span>
            <span className="font-bold text-sm text-forest block">{outlook.ventilation}</span>
            <p className="text-[11px] text-forest/70">Keep morning street windows sealed</p>
          </div>

          <div className="bg-cream/50 p-4 rounded-2xl border border-forest/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-utility text-forest/60 block">CHILDREN</span>
            <span className="font-bold text-sm text-forest block">{outlook.children}</span>
            <p className="text-[11px] text-forest/70">Protect developing lungs</p>
          </div>
        </div>
      </div>
    </section>
  );
};
