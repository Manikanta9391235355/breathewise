'use client';

import React from 'react';
import { X, Download, Play, Film, ExternalLink } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-forest/70 backdrop-blur-md animate-reveal">
      <div className="relative w-full max-w-4xl bg-cream rounded-[2.5rem] sm:rounded-[3.5rem] border border-forest/20 shadow-forest-lg p-5 sm:p-8 text-forest overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-forest/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center">
              <Film className="w-4 h-4 text-sage" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-forest">BREATHEWISE PRODUCT DEMO</h3>
              <span className="text-[10px] font-semibold uppercase tracking-utility text-forest/70 block">
                720P HD • FULL END-TO-END FEATURE WALKTHROUGH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/breathewise-demo.webm"
              download="breathewise-demo.webm"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest text-cream text-xs font-semibold tracking-utility uppercase shadow-xs hover:bg-forest/90 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sage" />
              <span>DOWNLOAD VIDEO</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-forest/10 text-forest/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="my-4 rounded-3xl overflow-hidden bg-forest/90 border border-forest/20 shadow-forest aspect-video relative flex items-center justify-center">
          <video
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            src="/breathewise-demo.webm"
          >
            Your browser does not support the video tag. You can download the video below.
          </video>
        </div>

        {/* Video Chapters & Evaluator Guide */}
        <div className="pt-2 border-t border-forest/15 flex flex-wrap items-center justify-between gap-3 text-xs text-forest/80">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-forest uppercase tracking-utility">CHAPTERS:</span>
            <span>0:00 Hero & Live AQI</span>
            <span>•</span>
            <span>0:10 Onboarding Wizard</span>
            <span>•</span>
            <span>0:25 Diurnal 24h Chart</span>
            <span>•</span>
            <span>0:45 AI Routine</span>
            <span>•</span>
            <span>1:05 Smart Outdoor Window</span>
            <span>•</span>
            <span>1:25 Home Lab</span>
            <span>•</span>
            <span>1:45 Gemini AI Chat</span>
          </div>

          <a
            href="/breathewise-demo.webm"
            download="breathewise-demo.webm"
            className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-forest underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .webm (13.3 MB)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
