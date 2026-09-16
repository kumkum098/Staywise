import React, { useState } from 'react';
import { Property } from '../types';
import { MapPin, Navigation, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InteractiveMapProps {
  properties: Property[];
  hoveredPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  hoveredPropertyId,
  onSelectProperty,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Jaipur Bounds coordinates simulation for vector pins positioning
  // Min Lat ~26.81, Max Lat ~26.92 | Min Lng ~75.74, Max Lng ~75.86
  const getPinPosition = (lat: number, lng: number) => {
    const minLat = 26.81;
    const maxLat = 26.93;
    const minLng = 75.73;
    const maxLng = 75.87;

    const top = 100 - ((lat - minLat) / (maxLat - minLat)) * 80 - 10;
    const left = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;

    return { top: `${Math.max(10, Math.min(85, top))}%`, left: `${Math.max(10, Math.min(85, left))}%` };
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#EAEFE9] rounded-lg border border-surface-border overflow-hidden select-none">
      {/* Visual Map Background Pattern (Simulating Map Vector Roads & River) */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 100 Q 200 150 400 120 T 800 200" fill="none" stroke="#94A3B8" strokeWidth="6" />
        <path d="M 100 0 Q 250 300 500 600" fill="none" stroke="#CBD5E1" strokeWidth="12" />
        <path d="M 300 0 Q 350 200 400 400" fill="none" stroke="#CBD5E1" strokeWidth="8" />
        <circle cx="450" cy="250" r="40" fill="#CBD5E1" opacity="0.4" />
        <circle cx="200" cy="180" r="25" fill="#CBD5E1" opacity="0.4" />
      </svg>

      {/* Map Header / Location Badge */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-surface-border shadow-subtle flex items-center space-x-2 text-xs font-semibold text-ink-primary">
        <Navigation className="w-3.5 h-3.5 text-brand-700" />
        <span>Jaipur Accommodation Map</span>
        <span className="text-[10px] text-ink-muted bg-surface-muted px-1.5 py-0.5 rounded">
          {properties.length} Listings
        </span>
      </div>

      {/* Pins Layer */}
      <div className="absolute inset-0">
        {properties.map((property) => {
          const isHovered = hoveredPropertyId === property._id;
          const isSelected = selectedProperty?._id === property._id;
          const pos = getPinPosition(property.location.lat, property.location.lng);

          const priceK = (property.pricing.startingRent / 1000).toFixed(1);

          return (
            <div
              key={property._id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onClick={() => {
                setSelectedProperty(property);
                if (onSelectProperty) onSelectProperty(property._id);
              }}
            >
              {/* Dynamic Price Pin Tag */}
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-all duration-200 flex items-center space-x-1 border ${
                  isSelected || isHovered
                    ? 'bg-brand-700 text-white border-brand-800 scale-110 z-30 ring-2 ring-brand-300'
                    : 'bg-white text-ink-primary border-gray-300 hover:bg-gray-50 hover:scale-105'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSelected || isHovered ? 'text-white' : 'text-brand-700'}`} />
                <span>₹{priceK}k</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Popup Card when a pin is selected */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-white rounded-lg border border-surface-border shadow-xl p-3 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2">
          <img
            src={selectedProperty.images[0]}
            alt={selectedProperty.name}
            className="w-16 h-16 rounded-md object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-ink-primary truncate">{selectedProperty.name}</h4>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-ink-muted hover:text-ink-primary p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-ink-secondary truncate">{selectedProperty.location.area}, Jaipur</p>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xs font-bold text-brand-700">₹{selectedProperty.pricing.startingRent}/mo</span>
              <span className="text-[10px] text-ink-muted">
                (≈ ₹{selectedProperty.totalEstimatedMonthly || selectedProperty.pricing.startingRent + 1500} true cost)
              </span>
            </div>
          </div>
          <Link
            to={`/property/${selectedProperty._id}`}
            className="p-2 bg-brand-700 text-white rounded-md hover:bg-brand-800 transition-colors shrink-0"
            title="View Details"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
