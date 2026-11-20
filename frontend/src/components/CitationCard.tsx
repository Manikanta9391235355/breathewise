import React from 'react';
import { ExternalLink, MapPin, Tag } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const isDarGlobal = citation.source.toLowerCase().includes('darglobal');

  return (
    <div className="group relative rounded-xl bg-[#0F1A30] border border-[#223354] hover:border-[#C5A880]/50 p-3.5 transition-all duration-200 hover:shadow-lg hover:shadow-[#C5A880]/5 flex flex-col justify-between">
      <div>
        {/* Source badge and similarity */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
              isDarGlobal
                ? 'bg-[#C5A880]/15 text-[#DFCAAB] border border-[#C5A880]/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isDarGlobal ? 'DarGlobal Official' : 'Wasalt REGA Verified'}
          </span>

          {citation.similarity_score > 0 && (
            <span className="text-[10px] text-[#8A99AD] font-mono bg-[#152238] px-1.5 py-0.5 rounded border border-[#223354]">
              Match: {Math.round(citation.similarity_score * 100)}%
            </span>
          )}
        </div>

        {/* Title */}
        <h5 className="font-medium text-sm text-white group-hover:text-[#DFCAAB] transition-colors line-clamp-1">
          {citation.title}
        </h5>

        {/* Location & Price */}
        <div className="mt-1 space-y-0.5 text-xs text-[#8A99AD]">
          {citation.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" />
              <span className="truncate">{citation.location}</span>
            </div>
          )}
          {citation.price && (
            <div className="flex items-center gap-1.5 truncate text-[11px] text-[#DFCAAB] font-medium">
              <Tag className="w-3 h-3 text-[#C5A880] shrink-0" />
              <span className="truncate">{citation.price}</span>
            </div>
          )}
        </div>

        {/* Snippet */}
        {citation.snippet && (
          <p className="mt-2 text-[11px] text-[#8A99AD]/90 line-clamp-2 leading-relaxed italic border-l-2 border-[#223354] pl-2">
            "{citation.snippet}"
          </p>
        )}
      </div>

      {/* Clickable External URL */}
      <div className="mt-3 pt-2.5 border-t border-[#223354]/60">
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] hover:text-white transition-colors"
        >
          <span>View Source Webpage</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
