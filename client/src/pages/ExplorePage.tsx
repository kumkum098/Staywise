import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal, Map, List } from 'lucide-react';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { PropertyCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { FilterState } from '../types';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  // Initialize filter state from URL search params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    area: searchParams.get('area') || 'all',
    propertyType: searchParams.get('propertyType') || 'all',
    roomType: searchParams.get('roomType') || 'all',
    gender: searchParams.get('gender') || 'all',
    minRent: Number(searchParams.get('minRent')) || 0,
    maxRent: Number(searchParams.get('maxRent')) || 25000,
    wifi: searchParams.get('wifi') === 'true',
    ac: searchParams.get('ac') === 'true',
    food: searchParams.get('food') === 'true',
    laundry: searchParams.get('laundry') === 'true',
    parking: searchParams.get('parking') === 'true',
    isVerified: searchParams.get('isVerified') === 'true',
    sort: searchParams.get('sort') || 'recommended',
  });

  // Sync state to URL params
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 'all' && val !== false && val !== 0) {
        params.set(key, String(val));
      }
    });
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const reset: FilterState = {
      search: '',
      area: 'all',
      propertyType: 'all',
      roomType: 'all',
      gender: 'all',
      minRent: 0,
      maxRent: 25000,
      wifi: false,
      ac: false,
      food: false,
      laundry: false,
      parking: false,
      isVerified: false,
      sort: 'recommended',
    };
    setFilters(reset);
    setSearchParams({});
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.getProperties(filters),
  });

  const properties = data?.properties || [];
  const totalCount = data?.pagination?.total || properties.length;

  // Active filter tags count
  const activeFilterCount = [
    filters.area !== 'all',
    filters.propertyType !== 'all',
    filters.roomType !== 'all',
    filters.gender !== 'all',
    filters.maxRent < 25000,
    filters.wifi,
    filters.ac,
    filters.food,
    filters.laundry,
    filters.parking,
    filters.isVerified,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Filter & Search Controls Bar */}
      <div className="bg-white rounded-xl border border-surface-border p-4 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Text Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Search by area (e.g. Malviya Nagar), landmark or property name..."
              className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-surface-border rounded-lg text-xs text-ink-primary focus:ring-1 focus:ring-brand-700 outline-none"
            />
            {filters.search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Area */}
            <select
              value={filters.area}
              onChange={(e) => updateFilters({ area: e.target.value })}
              className="px-3 py-2 bg-surface-muted border border-surface-border rounded-lg font-medium text-ink-primary outline-none"
            >
              <option value="all">All Areas</option>
              <option value="Malviya Nagar">Malviya Nagar</option>
              <option value="Jagatpura">Jagatpura</option>
              <option value="Mansarovar">Mansarovar</option>
              <option value="Vaishali Nagar">Vaishali Nagar</option>
              <option value="Raja Park">Raja Park</option>
              <option value="C-Scheme">C-Scheme</option>
            </select>

            {/* Property Type */}
            <select
              value={filters.propertyType}
              onChange={(e) => updateFilters({ propertyType: e.target.value })}
              className="px-3 py-2 bg-surface-muted border border-surface-border rounded-lg font-medium text-ink-primary outline-none"
            >
              <option value="all">All Types</option>
              <option value="pg">PG</option>
              <option value="hostel">Hostel</option>
              <option value="coliving">Co-Living</option>
              <option value="apartment">Rental Room</option>
            </select>

            {/* Gender */}
            <select
              value={filters.gender}
              onChange={(e) => updateFilters({ gender: e.target.value })}
              className="px-3 py-2 bg-surface-muted border border-surface-border rounded-lg font-medium text-ink-primary outline-none"
            >
              <option value="all">All Occupants</option>
              <option value="male">Boys Only</option>
              <option value="female">Girls Only</option>
              <option value="unisex">Unisex / Co-Ed</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="px-3 py-2 bg-surface-muted border border-surface-border rounded-lg font-medium text-ink-primary outline-none"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Filter Drawer Trigger */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-2 bg-white border border-surface-border hover:border-gray-300 rounded-lg font-semibold text-ink-primary flex items-center space-x-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-700" />
              <span>More Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-brand-700 text-white rounded-full text-[10px]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-surface-border text-xs">
            <span className="text-ink-muted font-medium mr-1">Active:</span>

            {filters.area !== 'all' && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-800 border border-brand-200 rounded flex items-center space-x-1">
                <span>{filters.area}</span>
                <button onClick={() => updateFilters({ area: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.propertyType !== 'all' && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-800 border border-brand-200 rounded flex items-center space-x-1 uppercase">
                <span>{filters.propertyType}</span>
                <button onClick={() => updateFilters({ propertyType: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.gender !== 'all' && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-800 border border-brand-200 rounded flex items-center space-x-1 capitalize">
                <span>{filters.gender}</span>
                <button onClick={() => updateFilters({ gender: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.wifi && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-800 border border-brand-200 rounded flex items-center space-x-1">
                <span>Wi-Fi</span>
                <button onClick={() => updateFilters({ wifi: false })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.ac && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-800 border border-brand-200 rounded flex items-center space-x-1">
                <span>AC</span>
                <button onClick={() => updateFilters({ ac: false })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.food && (
              <span className="px-2 py-0.5 bg-brand-50 text-brand-800 border border-brand-200 rounded flex items-center space-x-1">
                <span>Food</span>
                <button onClick={() => updateFilters({ food: false })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-red-600 hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Extended Filters Collapsible / Modal Drawer */}
      {showMobileFilters && (
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-lg space-y-4 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="font-bold text-sm text-ink-primary">Detailed Filters</h3>
            <button onClick={() => setShowMobileFilters(false)} className="text-ink-muted hover:text-ink-primary">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Rent Budget Slider */}
            <div>
              <label className="block font-semibold text-ink-primary mb-2">
                Max Monthly Rent: ₹{filters.maxRent.toLocaleString('en-IN')}
              </label>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={filters.maxRent}
                onChange={(e) => updateFilters({ maxRent: Number(e.target.value) })}
                className="w-full accent-brand-700"
              />
              <div className="flex justify-between text-[10px] text-ink-muted mt-1">
                <span>₹5,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block font-semibold text-ink-primary mb-2">Room Sharing Type</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'single', 'double', 'triple'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateFilters({ roomType: type })}
                    className={`px-3 py-1.5 rounded border capitalize font-medium ${
                      filters.roomType === type
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-surface-border bg-surface-muted text-ink-secondary'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block font-semibold text-ink-primary mb-2">Key Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.wifi}
                    onChange={(e) => updateFilters({ wifi: e.target.checked })}
                    className="accent-brand-700"
                  />
                  <span>Wi-Fi Fiber</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.ac}
                    onChange={(e) => updateFilters({ ac: e.target.checked })}
                    className="accent-brand-700"
                  />
                  <span>Air Conditioning</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.food}
                    onChange={(e) => updateFilters({ food: e.target.checked })}
                    className="accent-brand-700"
                  />
                  <span>Food / Mess</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.laundry}
                    onChange={(e) => updateFilters({ laundry: e.target.checked })}
                    className="accent-brand-700"
                  />
                  <span>Laundry</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-secondary">
          Showing <span className="text-ink-primary font-bold">{totalCount}</span> properties in Jaipur
        </p>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center bg-white border border-surface-border rounded-lg p-0.5">
          <button
            onClick={() => setMobileView('list')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center space-x-1 ${
              mobileView === 'list' ? 'bg-brand-700 text-white' : 'text-ink-secondary'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center space-x-1 ${
              mobileView === 'map' ? 'bg-brand-700 text-white' : 'text-ink-secondary'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Split View Layout (Left: Property Cards Grid, Right: Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Properties List */}
        <div className={`lg:col-span-7 space-y-6 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : isError ? (
            <ErrorState description="Could not load properties right now." onRetry={() => refetch()} />
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop._id}
                  property={prop}
                  onHover={(id) => setHoveredPropertyId(id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No properties match these filters"
              description="Try expanding your search area, increasing your maximum budget, or clearing amenity filters."
              action={{ label: 'Clear all filters', onClick: clearAllFilters }}
            />
          )}
        </div>

        {/* Right Column: Sticky Interactive Map */}
        <div className={`lg:col-span-5 lg:sticky lg:top-20 h-[600px] ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          <InteractiveMap
            properties={properties}
            hoveredPropertyId={hoveredPropertyId}
          />
        </div>
      </div>
    </div>
  );
};
