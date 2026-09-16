import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Building, Banknote, Calendar, ShieldCheck, ArrowRight, Calculator, Award, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/SkeletonLoader';
import { ROUTES } from '../routes';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [area, setArea] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [budget, setBudget] = useState<string>('15000');

  const { data, isLoading } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: () => api.getProperties({ limit: 6 }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area !== 'all') params.append('area', area);
    if (propertyType !== 'all') params.append('propertyType', propertyType);
    if (budget) params.append('maxRent', budget);
    navigate(`${ROUTES.explore}?${params.toString()}`);
  };

  const jaipurAreas = [
    { name: 'Malviya Nagar', tag: 'Near MNIT & WTP', count: '4 Places' },
    { name: 'Jagatpura', tag: 'Near JECRC & SKIT', count: '5 Places' },
    { name: 'Mansarovar', tag: 'Metro & Tech Hub', count: '3 Places' },
    { name: 'Vaishali Nagar', tag: 'Boutique Hostels', count: '3 Places' },
    { name: 'Raja Park', tag: 'Foodie & Coaching Hub', count: '2 Places' },
    { name: 'C-Scheme', tag: 'Executive Residences', count: '2 Places' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-surface-border bg-gradient-to-b from-brand-50/60 via-white to-white py-14 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-40 h-56 w-56 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-brand-200 rounded-full text-brand-700 text-xs font-semibold shadow-subtle">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span>Jaipur Accommodation Discovery Platform</span>
            </div>
            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl text-ink-primary">
              Know the place <span className="text-brand-700">before</span> you move in.
            </h1>
            <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
              Compare PGs, hostels, co-living spaces, and rental rooms by real monthly cost, actual living conditions, and college distance.
            </p>
          </div>

          {/* Primary Search Module */}
          <div className="relative mt-8 bg-white rounded-xl border border-surface-border shadow-card p-4 sm:p-5">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Location Area */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-700" />
                  <span>Area / Location</span>
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-muted border border-surface-border rounded-lg text-xs font-medium text-ink-primary focus:ring-1 focus:ring-brand-700 outline-none"
                >
                  <option value="all">All Jaipur Areas</option>
                  <option value="Malviya Nagar">Malviya Nagar (MNIT)</option>
                  <option value="Jagatpura">Jagatpura (JECRC/SKIT)</option>
                  <option value="Mansarovar">Mansarovar</option>
                  <option value="Vaishali Nagar">Vaishali Nagar</option>
                  <option value="Raja Park">Raja Park</option>
                  <option value="C-Scheme">C-Scheme</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-brand-700" />
                  <span>Property Type</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-muted border border-surface-border rounded-lg text-xs font-medium text-ink-primary focus:ring-1 focus:ring-brand-700 outline-none"
                >
                  <option value="all">All Stay Types</option>
                  <option value="pg">PG (Paying Guest)</option>
                  <option value="hostel">Hostel</option>
                  <option value="coliving">Co-Living Space</option>
                  <option value="apartment">Rental Room / Studio</option>
                </select>
              </div>

              {/* Max Monthly Budget */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1.5 flex items-center space-x-1">
                  <Banknote className="w-3.5 h-3.5 text-brand-700" />
                  <span>Max Monthly Rent</span>
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-muted border border-surface-border rounded-lg text-xs font-medium text-ink-primary focus:ring-1 focus:ring-brand-700 outline-none"
                >
                  <option value="8000">Under ₹8,000 / mo</option>
                  <option value="10000">Under ₹10,000 / mo</option>
                  <option value="12000">Under ₹12,000 / mo</option>
                  <option value="15000">Under ₹15,000 / mo</option>
                  <option value="20000">Under ₹20,000 / mo</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-lg transition-colors shadow-subtle flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find a Place</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-primary">Discover Accommodations in Jaipur</h2>
            <p className="text-xs text-ink-secondary mt-1">Verified properties with estimated total monthly cost breakdowns</p>
          </div>
          <Link
            to={ROUTES.explore}
            className="flex items-center space-x-1 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            <span>View all listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.properties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Why Staywise Value Propositions */}
      <section className="bg-white border-y border-surface-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-ink-primary">Built to help you make a better move</h2>
            <p className="text-xs text-ink-secondary mt-1.5">No generic listings. Everything structured for decision making.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-surface-bg rounded-lg border border-surface-border space-y-2">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-primary">See Real Monthly Cost</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Know advertised rent vs actual out-of-pocket expenses including mess, electricity sub-meters, and wifi.
              </p>
            </div>

            <div className="p-5 bg-surface-bg rounded-lg border border-surface-border space-y-2">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-primary">Structured Living Score</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Multi-dimensional scores for cleanliness, internet reliability, food, quietness, privacy, and safety.
              </p>
            </div>

            <div className="p-5 bg-surface-bg rounded-lg border border-surface-border space-y-2">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-primary">Side-by-Side Compare</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Compare up to 3 places on rent, true cost, house rules, distance to campus, and cleanliness side-by-side.
              </p>
            </div>

            <div className="p-5 bg-surface-bg rounded-lg border border-surface-border space-y-2">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink-primary">Transparent Restrictions</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Curfew policies, visitor rules, notice period, and hidden charge clarity before you schedule a visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Location */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-ink-primary">Explore Student Hubs in Jaipur</h2>
          <p className="text-xs text-ink-secondary mt-1">Navigate places near top colleges and tech parks</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {jaipurAreas.map((area) => (
            <Link
              key={area.name}
              to={`${ROUTES.explore}?area=${area.name}`}
              className="p-4 bg-white rounded-lg border border-surface-border hover:border-brand-700 transition-colors shadow-subtle flex flex-col justify-between space-y-3 group"
            >
              <div>
                <span className="text-sm font-bold text-ink-primary group-hover:text-brand-700 transition-colors block">
                  {area.name}
                </span>
                <span className="text-[10px] text-ink-muted block mt-0.5">{area.tag}</span>
              </div>
              <span className="text-[11px] font-medium text-brand-700">{area.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-ink-primary to-brand-950 text-white rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl font-bold">Are you a property manager or PG owner in Jaipur?</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              List your property on Staywise with transparent pricing structures, manage room occupancies, and connect directly with verified tenant inquiries.
            </p>
          </div>
          <Link
            to={`${ROUTES.register}?role=owner`}
            className="px-6 py-3 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors shadow-subtle shrink-0"
          >
            List your property
          </Link>
        </div>
      </section>
    </div>
  );
};
