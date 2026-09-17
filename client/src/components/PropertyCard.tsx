import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Heart, GitCompare, Check } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { ROUTES } from '../routes';
import { computeTotalMonthlyCost } from '../lib/pricing';

interface PropertyCardProps {
  property: Property;
  onHover?: (id: string | null) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onHover }) => {
  const { isPropertySaved, toggleSaveProperty } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const saved = isPropertySaved(property._id);
  const compared = isInCompare(property._id);

  // Compute estimated total monthly cost if not precomputed
  const estimatedTotal = property.totalEstimatedMonthly || computeTotalMonthlyCost(property.pricing);

  // Pick top distance landmark
  const landmark = property.location.nearby && property.location.nearby.length > 0 ? property.location.nearby[0] : null;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (compared) {
      removeFromCompare(property._id);
    } else {
      addToCompare(property);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveProperty(property._id);
  };

  return (
    <div
      onMouseEnter={() => onHover && onHover(property._id)}
      onMouseLeave={() => onHover && onHover(null)}
      className="group bg-white rounded-lg border border-surface-border overflow-hidden hover:border-gray-300 transition-subtle flex flex-col justify-between shadow-subtle hover:shadow-card relative"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-white/90 backdrop-blur-sm text-ink-primary rounded">
              {property.propertyType}
            </span>
            {property.gender && (
              <span className="px-2 py-0.5 text-[11px] font-semibold capitalize bg-black/75 text-white backdrop-blur-sm rounded">
                {property.gender}
              </span>
            )}
          </div>

          {/* Save Heart Button */}
          <button
            onClick={handleSaveClick}
            className={`p-1.5 rounded-full transition-colors ${
              saved ? 'bg-white text-red-500 shadow-sm' : 'bg-white/80 hover:bg-white text-gray-600'
            }`}
            title={saved ? 'Unsave property' : 'Save property'}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Verified Badge Overlay at bottom left of image */}
        {property.verification?.isVerified && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1 px-2 py-0.5 bg-brand-700/90 backdrop-blur-sm text-white text-[10px] font-medium rounded">
            <ShieldCheck className="w-3 h-3 text-success-300" />
            <span>Verified Property</span>
          </div>
        )}
      </div>

      {/* Property Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Title & Rating */}
          <div className="flex items-start justify-between">
            <h3 className="text-base font-bold text-ink-primary group-hover:text-brand-700 transition-colors line-clamp-1">
              <Link to={ROUTES.propertyDetail(property._id)}>{property.name}</Link>
            </h3>
            <div className="flex items-center space-x-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 text-xs font-semibold shrink-0 ml-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{property.rating ? property.rating.toFixed(1) : '4.5'}</span>
            </div>
          </div>

          {/* Area Location */}
          <div className="flex items-center space-x-1 text-xs text-ink-secondary mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
            <span className="truncate">{property.location.area}, Jaipur</span>
          </div>

          {/* Nearby Landmark Distance */}
          {landmark && (
            <p className="text-[11px] text-ink-muted mt-1.5">
              {landmark.distanceKm} km from {landmark.name} ({landmark.travelTimeMins} min)
            </p>
          )}

          {/* Key Amenities Pills */}
          <div className="flex flex-wrap gap-1 mt-3">
            {property.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 text-[11px] font-medium bg-surface-muted text-ink-secondary rounded border border-surface-border"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                +{property.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing Section (Advertised Rent vs Estimated True Cost) */}
        <div className="mt-4 pt-3 border-t border-surface-border flex items-end justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold text-ink-primary">
                ₹{property.pricing.startingRent.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-ink-secondary">/month</span>
            </div>
            <p className="text-[11px] font-medium text-brand-700 mt-0.5">
              ≈ ₹{estimatedTotal.toLocaleString('en-IN')} est. total monthly cost
            </p>
          </div>

          {/* Compare Toggle Button */}
          <button
            onClick={handleCompareClick}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
              compared
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-surface-border text-ink-secondary hover:text-ink-primary hover:border-gray-300'
            }`}
          >
            {compared ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
