import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '../types';

interface InteractiveMapProps {
  properties: Property[];
  hoveredPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
}

const createPriceIcon = (priceK: string, active: boolean) =>
  L.divIcon({
    className: 'staywise-map-pin',
    html: `<div style="
      display:inline-flex;align-items:center;gap:4px;
      padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:700;
      white-space:nowrap;
      background:${active ? '#C2703C' : '#FFFFFF'};
      color:${active ? '#FFFFFF' : '#201A17'};
      border:1px solid ${active ? '#8A4A24' : '#D1D5DB'};
      box-shadow:0 1px 3px rgba(0,0,0,0.25);
    ">₹${priceK}k</div>`,
    iconSize: [1, 1],
    iconAnchor: [30, 15],
  });

const FitBounds: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;
    if (properties.length === 1) {
      map.setView([properties[0].location.lat, properties[0].location.lng], 15, { animate: false });
      return;
    }
    const bounds = L.latLngBounds(properties.map((p) => [p.location.lat, p.location.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], animate: false });
  }, [properties, map]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  hoveredPropertyId,
  onSelectProperty,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (properties.length === 0) return [26.9124, 75.7873];
    return [properties[0].location.lat, properties[0].location.lng];
  }, [properties]);

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-lg border border-surface-border">
      <div className="absolute left-3 top-3 z-[500] flex items-center space-x-2 rounded-lg border border-surface-border bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-primary shadow-subtle backdrop-blur-sm">
        <Navigation className="h-3.5 w-3.5 text-brand-700" />
        <span>Jaipur Accommodation Map</span>
        <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-ink-muted">
          {properties.length} Listings
        </span>
      </div>

      <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={properties} />
        {properties.map((property) => {
          const isActive = hoveredPropertyId === property._id || selectedProperty?._id === property._id;
          const priceK = (property.pricing.startingRent / 1000).toFixed(1);
          return (
            <Marker
              key={property._id}
              position={[property.location.lat, property.location.lng]}
              icon={createPriceIcon(priceK, isActive)}
              eventHandlers={{
                click: () => {
                  setSelectedProperty(property);
                  onSelectProperty?.(property._id);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] flex items-center space-x-3 rounded-lg border border-surface-border bg-white p-3 shadow-xl">
          <img
            src={selectedProperty.images[0]}
            alt={selectedProperty.name}
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="truncate text-xs font-bold text-ink-primary">{selectedProperty.name}</h4>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-0.5 text-ink-muted hover:text-ink-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="truncate text-[11px] text-ink-secondary">{selectedProperty.location.area}, Jaipur</p>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-xs font-bold text-brand-700">₹{selectedProperty.pricing.startingRent}/mo</span>
              <span className="text-[10px] text-ink-muted">
                (≈ ₹{selectedProperty.totalEstimatedMonthly || selectedProperty.pricing.startingRent + 1500} true cost)
              </span>
            </div>
          </div>
          <Link
            to={`/property/${selectedProperty._id}`}
            className="shrink-0 rounded-md bg-brand-700 p-2 text-white transition-colors hover:bg-brand-800"
            title="View Details"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
