'use client';

import React from 'react';
import { Wind, Heart, Shield, Globe, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-forest/15 bg-olive/20 pt-16 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center">
                <Wind className="w-4 h-4 text-sage" />
              </div>
              <span className="font-display text-2xl text-forest tracking-tight">
                BREATHE<span className="text-moss-dark">WISE</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-forest/80 leading-relaxed max-w-sm">
              Empowering urban families to navigate severe winter smog and industrial particulate episodes with evidence-based behavioral routines and budget-aware clean living.
            </p>
            <div className="text-[11px] font-semibold uppercase tracking-utility text-forest/60">
              PROMPTWARS VIRTUAL CHALLENGE 06 • URBAN AIR QUALITY ASSISTANT
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-utility text-forest/70 block">
                INTELLIGENCE
              </span>
              <ul className="space-y-1.5 text-forest/80">
                <li>US EPA Breakpoints</li>
                <li>Copernicus CAMS Ensemble</li>
                <li>Open-Meteo Atmospheric Models</li>
                <li>Diurnal Boundary Inversions</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase tracking-utility text-forest/70 block">
                FAMILY PROTOCOLS
              </span>
              <ul className="space-y-1.5 text-forest/80">
                <li>Pediatric Airway Defense</li>
                <li>Senior Cardiovascular Care</li>
                <li>Zero-Budget Indoor Lab</li>
                <li>Non-Judgmental Commute</li>
              </ul>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <span className="font-bold uppercase tracking-utility text-forest/70 block">
                SAFETY & HONESTY
              </span>
              <p className="text-forest/70 text-[11px] leading-relaxed">
                BreatheWise provides environmental risk reduction guidance, not medical diagnosis. Never ignore local public health advisories.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-forest/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-forest/60">
          <span>© {new Date().getFullYear()} BreatheWise Intelligence. Built for PromptWars Challenge 06.</span>
          <div className="flex items-center gap-4 font-semibold tracking-utility uppercase">
            <span>FOREST & SAGE SYSTEM</span>
            <span>•</span>
            <span>GEMINI GENERATIVE AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
