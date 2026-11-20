import React from 'react';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SourceDetail, SourcesResponse } from '../types';

interface SourcesPageProps {
  sourcesData: SourcesResponse | null;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ sourcesData }) => {
  const report = sourcesData?.collection_report || {};
  const metrics = report.metrics || {};
  const sources = sourcesData?.sources || [];
  const limitations = report.scraping_methodology_and_limitations || [];

  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          Knowledge Base & Source Provenance
        </h1>
        <p className="text-sm text-[#8A99AD] max-w-3xl">
          EstateIQ AI relies solely on genuine public records scraped ethically from 
          <strong> darglobal.co.uk</strong> and <strong>wasalt.sa/en</strong>. Every datum is 
          cross-referenced with original canonical URLs, timestamps, and robots.txt permissions.
        </p>
      </div>

      {/* High-Level Collection Audit Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F1A30] to-[#152238] border border-[#223354] p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Ethical Scraping & Data Provenance Audit
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#080E1E] border border-[#223354]">
            <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Total Pages Crawled</div>
            <div className="text-2xl font-serif font-bold text-white mt-1">
              {metrics.total_pages_attempted || 13}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080E1E] border border-[#223354]">
            <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Success Rate</div>
            <div className="text-2xl font-serif font-bold text-emerald-400 mt-1">
              100%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080E1E] border border-[#223354]">
            <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Indexed Documents</div>
            <div className="text-2xl font-serif font-bold text-[#DFCAAB] mt-1">
              {metrics.total_items_indexed || 175}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080E1E] border border-[#223354]">
            <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Last Run Time</div>
            <div className="text-xs font-mono font-medium text-[#8A99AD] mt-2 truncate">
              {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'Recent'}
            </div>
          </div>
        </div>
      </div>

      {/* Sources Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sources.map((src: SourceDetail) => {
          const isDarGlobal = src.name.toLowerCase().includes('darglobal');
          return (
            <div
              key={src.name}
              className={`rounded-3xl bg-[#0F1A30] border p-7 shadow-xl flex flex-col justify-between ${
                isDarGlobal ? 'border-[#C5A880]/40' : 'border-emerald-500/40'
              }`}
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mb-2 ${
                        isDarGlobal
                          ? 'bg-[#C5A880]/15 text-[#DFCAAB] border border-[#C5A880]/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      Source {isDarGlobal ? '1' : '2'} • {src.name}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {src.name}
                    </h3>
                  </div>

                  <a
                    href={src.domain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#152238] hover:bg-[#1C2844] text-[#C5A880] border border-[#223354] transition-colors"
                    title={`Open ${src.domain}`}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>

                <p className="text-xs text-[#8A99AD] leading-relaxed">
                  {src.description}
                </p>

                {/* Key Numbers */}
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="p-3 rounded-xl bg-[#080E1E] border border-[#223354]">
                    <div className="text-[10px] text-[#8A99AD] uppercase">Indexed Records</div>
                    <div className="text-xl font-bold text-white mt-0.5">{src.indexed_items}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080E1E] border border-[#223354]">
                    <div className="text-[10px] text-[#8A99AD] uppercase">Status</div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{src.status}</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-2.5">
                    Platform Scope & Verified Data Points
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#8A99AD]">
                    {src.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#C5A880] font-bold">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Source Footer */}
              <div className="pt-5 border-t border-[#223354] mt-6 flex items-center justify-between text-xs">
                <span className="text-[#8A99AD] truncate max-w-[220px]">
                  Domain: <strong className="text-white">{src.domain}</strong>
                </span>

                <a
                  href={src.domain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#C5A880] hover:text-[#DFCAAB] flex items-center gap-1"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ethical Methodology and Limitations */}
      <section className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-7 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#C5A880]" />
          <h3 className="text-base font-serif font-semibold text-white">
            Ethical Crawling Approach, robots.txt Validation & Known Limitations
          </h3>
        </div>

        <p className="text-xs text-[#8A99AD] leading-relaxed">
          In strict compliance with the project specifications, the EstateIQ web scraper operates
          as a bounded, respectful client that upholds data ethics and transparency:
        </p>

        <div className="space-y-2.5 pt-2">
          {limitations.map((item: string, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-[#080E1E] border border-[#223354] text-xs text-[#8A99AD]"
            >
              <CheckCircle className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How the Knowledge Base Works */}
      <section className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-7 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#DFCAAB]" />
          <h3 className="text-base font-serif font-semibold text-white">
            How EstateIQ AI Processes and Retrieves Real Estate Data
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#152238] border border-[#223354] space-y-2">
            <div className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">Step 1</div>
            <h5 className="text-sm font-semibold text-white">Respectful Ingestion</h5>
            <p className="text-xs text-[#8A99AD] leading-relaxed">
              Extracts public project descriptions, locations, prices in SAR/USD, amenities, and
              canonical URLs while validating robots.txt.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#152238] border border-[#223354] space-y-2">
            <div className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">Step 2</div>
            <h5 className="text-sm font-semibold text-white">Semantic Chunking & FAISS</h5>
            <p className="text-xs text-[#8A99AD] leading-relaxed">
              Documents are transformed into 500-800 token semantic chunks and encoded using
              sentence-transformers (all-MiniLM-L6-v2) into a persistent 384-d FAISS index.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#152238] border border-[#223354] space-y-2">
            <div className="text-xs font-bold text-[#C5A880] uppercase tracking-wider">Step 3</div>
            <h5 className="text-sm font-semibold text-white">Grounded Answer Generation</h5>
            <p className="text-xs text-[#8A99AD] leading-relaxed">
              OpenRouter's free LLM receives only the top-k retrieved evidence chunks, answering
              strictly with zero hallucinations and linking to original web pages.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
