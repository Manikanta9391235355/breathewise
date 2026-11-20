import React from 'react';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050A15] border-t border-[#223354]/60 text-[#8A99AD] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-[#8A99AD] leading-relaxed max-w-md">
              EstateIQ AI is an intelligent real estate research platform built as a technical
              assignment demonstration for the Junior AI Engineer – Applied AI role at DarGlobal.
              It synthesizes verified public intelligence from DarGlobal PLC and Wasalt into
              grounded, citation-backed answers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#C5A880]">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>100% Ethical Crawling • robots.txt Validated • No Fabricated Data</span>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Indexed Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://darglobal.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#DFCAAB] transition-colors"
                >
                  <span>DarGlobal PLC (Official)</span>
                  <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                </a>
              </li>
              <li>
                <a
                  href="https://wasalt.sa/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#DFCAAB] transition-colors"
                >
                  <span>Wasalt Real Estate (Saudi Arabia)</span>
                  <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                </a>
              </li>
              <li>
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#DFCAAB] transition-colors"
                >
                  <span>OpenRouter AI Engine</span>
                  <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Specifications */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              RAG Architecture
            </h4>
            <ul className="space-y-1.5 text-xs text-[#8A99AD]">
              <li>Vector Store: FAISS (Cosine Similarity)</li>
              <li>Embeddings: all-MiniLM-L6-v2</li>
              <li>Inference: OpenRouter Free Tier</li>
              <li>Backend: FastAPI 0.115 (Python 3.11)</li>
              <li>Frontend: React 18, Vite, Tailwind</li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-[#223354]/40 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <p>
            © {new Date().getFullYear()} EstateIQ AI. Independent Technical Assignment Demonstration for DarGlobal Junior AI Engineer Role.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#8A99AD]">
              Not an official endorsement by DarGlobal PLC or Wasalt Real Estate.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
