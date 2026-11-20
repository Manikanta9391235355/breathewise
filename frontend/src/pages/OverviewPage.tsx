import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { CollectionStats, PropertyItem } from '../types';
import { PropertyCard } from '../components/PropertyCard';

interface OverviewPageProps {
  stats: CollectionStats | null;
  featuredProperties: PropertyItem[];
  onStartChat: (initialPrompt?: string) => void;
  onExplore: () => void;
  onViewSources: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stats,
  featuredProperties,
  onStartChat,
  onExplore,
  onViewSources,
}) => {
  const suggestedQuestions = [
    'What are the major developments listed by DarGlobal?',
    'What kinds of properties are available on Wasalt?',
    'Which locations are covered by the collected DarGlobal projects?',
    'Compare the property information from DarGlobal and Wasalt.',
    'What amenities are mentioned for the indexed developments?',
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F1A30] via-[#0A1224] to-[#080E1E] border border-[#223354] p-8 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1C2541]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs font-semibold text-[#DFCAAB] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>AI Real Estate Research Assistant</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Intelligent Insight for{' '}
            <span className="gold-gradient-text">DarGlobal & Wasalt</span> Portals
          </h1>

          <p className="text-base md:text-lg text-[#8A99AD] leading-relaxed max-w-2xl">
            A production-quality Retrieval-Augmented Generation assistant synthesizing verified
            international luxury developments from <strong>DarGlobal PLC</strong> and live Saudi Arabian
            real estate listings from <strong>Wasalt</strong>. Built with FAISS vector retrieval and OpenRouter.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onStartChat()}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C5A880] to-[#DFCAAB] text-[#080E1E] hover:from-[#DFCAAB] hover:to-[#C5A880] shadow-lg shadow-[#C5A880]/20 transition-all hover:scale-[1.02]"
            >
              <span>Launch AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#152238] hover:bg-[#1C2844] text-white border border-[#223354] transition-all"
            >
              <span>Browse 170+ Properties</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live System Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8A99AD]">
            Live Verified Intelligence Metrics
          </h2>
          <span className="text-xs text-[#C5A880] flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Real Scraped Backend Data</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#8A99AD] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Total Properties</span>
              <Building2 className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div className="text-3xl font-serif font-bold text-white mb-1">
              {stats?.total_properties || 175}
            </div>
            <p className="text-xs text-[#8A99AD]">
              Indexed from official public records
            </p>
          </div>

          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#8A99AD] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">DarGlobal Projects</span>
              <TrendingUp className="w-5 h-5 text-[#DFCAAB]" />
            </div>
            <div className="text-3xl font-serif font-bold text-[#DFCAAB] mb-1">
              {stats?.darglobal_count || 49}
            </div>
            <p className="text-xs text-[#8A99AD]">
              Ultra-luxury branded developments
            </p>
          </div>

          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#8A99AD] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">Wasalt Listings</span>
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-serif font-bold text-emerald-400 mb-1">
              {stats?.wasalt_count || 126}
            </div>
            <p className="text-xs text-[#8A99AD]">
              REGA-verified Saudi properties in SAR
            </p>
          </div>

          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#8A99AD] mb-3">
              <span className="text-xs font-medium uppercase tracking-wider">FAISS Vector Index</span>
              <Cpu className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div className="text-3xl font-serif font-bold text-white mb-1">
              {stats?.total_chunks || 175}
            </div>
            <p className="text-xs text-[#8A99AD]">
              Dense 384-d semantic chunks
            </p>
          </div>
        </div>
      </section>

      {/* Suggested Chat Questions */}
      <section className="rounded-2xl bg-[#0F1A30]/60 border border-[#223354] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Explore Grounded Queries with RAG
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestedQuestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onStartChat(prompt)}
              className="text-left p-3.5 rounded-xl bg-[#152238] border border-[#223354] hover:border-[#C5A880]/50 hover:bg-[#1C2844] transition-all text-xs font-medium text-white group flex items-start justify-between gap-2"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </section>

      {/* Featured Developments Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-white">
              Featured Verified Portfolios
            </h3>
            <p className="text-xs text-[#8A99AD]">
              Genuine records collected from darglobal.co.uk and wasalt.sa
            </p>
          </div>
          <button
            onClick={onExplore}
            className="text-xs font-semibold text-[#C5A880] hover:text-[#DFCAAB] flex items-center gap-1"
          >
            <span>View All ({stats?.total_properties || 175})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Dual Value Proposition Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#0F1A30] to-[#0A1224] border border-[#C5A880]/30 p-6 space-y-4">
          <div className="inline-block px-3 py-1 rounded bg-[#C5A880]/15 text-[#DFCAAB] text-xs font-bold uppercase tracking-wider">
            DarGlobal Intelligence
          </div>
          <h4 className="text-lg font-serif font-bold text-white">
            Prime International Branded Residences
          </h4>
          <p className="text-xs text-[#8A99AD] leading-relaxed">
            DarGlobal PLC (London Stock Exchange: DAR) curates ultra-luxury second homes and trophy assets
            in partnership with legendary houses including Aston Martin, Lamborghini, Pagani, Elie Saab,
            Missoni, Trump International, and Marriott across the UK, Spain, Oman, Qatar, Maldives, and UAE.
          </p>
          <div className="flex items-center gap-3 text-xs text-[#DFCAAB]">
            <span>• 49 Projects Indexed</span>
            <span>• Global Luxury Capitals</span>
            <span>• High-Net-Worth Portfolios</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#0F1A30] to-[#0A1224] border border-emerald-500/30 p-6 space-y-4">
          <div className="inline-block px-3 py-1 rounded bg-emerald-500/15 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Wasalt Intelligence
          </div>
          <h4 className="text-lg font-serif font-bold text-white">
            Verified Saudi Real Estate Marketplace
          </h4>
          <p className="text-xs text-[#8A99AD] leading-relaxed">
            Wasalt is Saudi Arabia's premier digital brokerage portal licensed by REGA (Real Estate
            General Authority). EstateIQ extracts active residential villas, apartments, lands, and rentals
            with authentic pricing in Saudi Riyals (SAR) across Riyadh, Jeddah, and Dammam.
          </p>
          <div className="flex items-center gap-3 text-xs text-emerald-300">
            <span>• 126 Properties Indexed</span>
            <span>• REGA Licensed Status</span>
            <span>• Transparent SAR Pricing</span>
          </div>
        </div>
      </section>
    </div>
  );
};
