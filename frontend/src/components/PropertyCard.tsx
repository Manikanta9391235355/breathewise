import React from 'react';
import { ExternalLink, MapPin, Tag, Bed, Maximize2, ShieldCheck, Building } from 'lucide-react';
import { PropertyItem } from '../types';

interface PropertyCardProps {
  property: PropertyItem;
  onSelect?: (property: PropertyItem) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const isDarGlobal = property.source.toLowerCase().includes('darglobal');

  // Extract specs
  const bedrooms = property.specifications?.bedrooms;
  const area = property.specifications?.area;
  const brandCollab = property.specifications?.brand_collaboration;

  return (
    <div className="group relative rounded-2xl bg-[#0F1A30] border border-[#223354] hover:border-[#C5A880]/60 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-[#C5A880]/5 flex flex-col justify-between">
      <div>
        {/* Source Badge & Type */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase ${
              isDarGlobal
                ? 'bg-[#C5A880]/15 text-[#DFCAAB] border border-[#C5A880]/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isDarGlobal ? 'DarGlobal Official' : 'Wasalt REGA Verified'}
          </span>

          <span className="text-xs text-[#8A99AD] font-medium bg-[#152238] px-2.5 py-1 rounded-md border border-[#223354]">
            {property.property_type}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-white group-hover:text-[#DFCAAB] transition-colors line-clamp-1 mb-1">
          {property.name}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#8A99AD] mb-3 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Price Tag */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#152238]/80 border border-[#223354]/60 mb-3">
          <Tag className="w-4 h-4 text-[#C5A880]" />
          <div>
            <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Published Price</div>
            <div className="text-sm font-bold text-[#DFCAAB]">{property.price}</div>
          </div>
        </div>

        {/* Key Features row */}
        {(bedrooms || area || brandCollab) && (
          <div className="grid grid-cols-2 gap-2 text-xs text-[#8A99AD] mb-3">
            {bedrooms && (
              <div className="flex items-center gap-1.5 bg-[#080E1E] px-2 py-1.5 rounded-lg border border-[#223354]/40">
                <Bed className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{bedrooms} Beds</span>
              </div>
            )}
            {area && (
              <div className="flex items-center gap-1.5 bg-[#080E1E] px-2 py-1.5 rounded-lg border border-[#223354]/40">
                <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="truncate">{area}</span>
              </div>
            )}
            {brandCollab && (
              <div className="col-span-2 flex items-center gap-1.5 bg-[#080E1E] px-2 py-1.5 rounded-lg border border-[#223354]/40 text-[#DFCAAB]">
                <Building className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="truncate font-medium">{brandCollab}</span>
              </div>
            )}
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs text-[#8A99AD] line-clamp-3 leading-relaxed mb-4">
          {property.description}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#223354]/60 flex items-center justify-between gap-2">
        {onSelect && (
          <button
            onClick={() => onSelect(property)}
            className="text-xs font-medium text-[#8A99AD] hover:text-white transition-colors"
          >
            Quick Specs
          </button>
        )}

        <a
          href={property.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#C5A880]/15 text-[#DFCAAB] hover:bg-[#C5A880]/30 border border-[#C5A880]/30 transition-all ml-auto"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
        </a>
      </div>
    </div>
  );
};
