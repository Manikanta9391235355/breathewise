import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  ExternalLink,
  X,
  Building,
  Tag,
  Bed,
  Maximize2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PaginatedProperties, PropertyItem } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { api } from '../services/api';

interface ExplorerPageProps {
  availableCountries: string[];
  availableTypes: string[];
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
  availableCountries,
  availableTypes,
}) => {
  const [propertiesData, setPropertiesData] = useState<PaginatedProperties | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProperties({
        source: sourceFilter,
        location: locationFilter,
        property_type: typeFilter,
        q: searchQuery,
        page: currentPage,
        page_size: 9,
      });
      setPropertiesData(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [sourceFilter, locationFilter, typeFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProperties();
  };

  const handleResetFilters = () => {
    setSourceFilter('all');
    setLocationFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          Property & Project Explorer
        </h1>
        <p className="text-sm text-[#8A99AD] max-w-3xl">
          Browse authentic real estate records indexed from <strong>DarGlobal PLC</strong> (international luxury
          developments) and <strong>Wasalt</strong> (REGA-verified Saudi properties). Filter by country, city,
          or property category with direct access to official source webpages.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-5 shadow-lg space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#8A99AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project name, district, developer, or amenities (e.g., Astera, AIDA, Ar-Rimal, Aston Martin)..."
            className="w-full bg-[#080E1E] rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-[#8A99AD] border border-[#223354] focus:outline-none focus:border-[#C5A880]/60"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[#C5A880] text-[#080E1E] text-xs font-semibold hover:bg-[#DFCAAB] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Source Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8A99AD] uppercase tracking-wider mb-1">
              Source Portal
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080E1E] border border-[#223354] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Sources (DarGlobal & Wasalt)</option>
              <option value="DarGlobal">DarGlobal (International Luxury)</option>
              <option value="Wasalt">Wasalt (Saudi REGA Verified)</option>
            </select>
          </div>

          {/* Location / Country Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8A99AD] uppercase tracking-wider mb-1">
              Country / Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080E1E] border border-[#223354] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Locations</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8A99AD] uppercase tracking-wider mb-1">
              Property Classification
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080E1E] border border-[#223354] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Property Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full bg-[#152238] hover:bg-[#1C2844] text-[#8A99AD] hover:text-white border border-[#223354] rounded-xl py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#8A99AD]">
        <span>
          Showing{' '}
          <strong className="text-white">
            {propertiesData ? propertiesData.items.length : 0}
          </strong>{' '}
          of{' '}
          <strong className="text-white">
            {propertiesData ? propertiesData.total : 0}
          </strong>{' '}
          genuine indexed properties
        </span>

        {isLoading && (
          <span className="flex items-center gap-1.5 text-[#C5A880]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Loading properties...</span>
          </span>
        )}
      </div>

      {/* Property Cards Grid */}
      {propertiesData && propertiesData.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertiesData.items.map((property: PropertyItem) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={(p) => setSelectedProperty(p)}
            />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-12 text-center space-y-4">
          <Building className="w-12 h-12 text-[#8A99AD] mx-auto opacity-50" />
          <h3 className="text-lg font-serif font-semibold text-white">
            No properties match your active filters
          </h3>
          <p className="text-xs text-[#8A99AD] max-w-md mx-auto">
            Try adjusting your location or property type filters, or reset filters to view all 175
            scraped records from DarGlobal and Wasalt.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-[#C5A880] text-[#080E1E] text-xs font-semibold hover:bg-[#DFCAAB] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : null}

      {/* Pagination Controls */}
      {propertiesData && propertiesData.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#223354]/60">
          <button
            disabled={currentPage <= 1 || isLoading}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0F1A30] border border-[#223354] text-xs font-medium text-white hover:border-[#C5A880] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-[#8A99AD] font-medium px-2">
            Page <strong className="text-white">{currentPage}</strong> of{' '}
            <strong className="text-white">{propertiesData.total_pages}</strong>
          </span>

          <button
            disabled={currentPage >= propertiesData.total_pages || isLoading}
            onClick={() => setCurrentPage((prev) => Math.min(propertiesData.total_pages, prev + 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0F1A30] border border-[#223354] text-xs font-medium text-white hover:border-[#C5A880] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0F1A30] border border-[#C5A880]/50 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    selectedProperty.source === 'DarGlobal'
                      ? 'bg-[#C5A880]/15 text-[#DFCAAB] border border-[#C5A880]/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {selectedProperty.source} Verified Record
                </span>
                <h3 className="text-xl font-serif font-bold text-white">
                  {selectedProperty.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#8A99AD] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{selectedProperty.location}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedProperty(null)}
                className="p-2 rounded-xl bg-[#152238] border border-[#223354] text-[#8A99AD] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-[#080E1E] border border-[#223354] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Published Price</div>
                <div className="text-lg font-bold text-[#DFCAAB]">{selectedProperty.price}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#8A99AD] uppercase tracking-wider">Developer / Agency</div>
                <div className="text-xs font-semibold text-white">{selectedProperty.developer}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A99AD] mb-2">
                Overview & Description
              </h4>
              <p className="text-xs text-[#F9F8F6] leading-relaxed bg-[#152238]/60 p-4 rounded-xl border border-[#223354]/60">
                {selectedProperty.description}
              </p>
            </div>

            {/* Amenities */}
            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A99AD] mb-2">
                  Amenities & Facilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((a: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#080E1E] border border-[#223354] text-xs text-[#DFCAAB]"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {selectedProperty.specifications && Object.keys(selectedProperty.specifications).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A99AD] mb-2">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedProperty.specifications).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-[#080E1E] border border-[#223354]/60">
                      <span className="text-[#8A99AD] block capitalize">{k.replace('_', ' ')}</span>
                      <span className="text-white font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with external link */}
            <div className="pt-4 border-t border-[#223354] flex items-center justify-between">
              <span className="text-[11px] text-[#8A99AD]">
                Scraped at: {new Date(selectedProperty.scraped_at).toLocaleDateString()}
              </span>

              <a
                href={selectedProperty.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFCAAB] text-[#080E1E] font-semibold text-xs hover:from-[#DFCAAB] hover:to-[#C5A880] transition-all shadow-md"
              >
                <span>Visit Original Webpage</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
