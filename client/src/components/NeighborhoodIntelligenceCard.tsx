import React from 'react';
import { GraduationCap, TrainFront, ShoppingCart, Dumbbell, Cross, UtensilsCrossed, MapPinned } from 'lucide-react';
import { NearbyPlace } from '../types';
import { groupNearbyByCategory, buildNeighborhoodBlurb, CATEGORY_LABELS } from '../lib/realityCheck';

interface NeighborhoodIntelligenceCardProps {
  nearby: NearbyPlace[];
  area: string;
  city: string;
  areaHighlights?: string[];
  nearbyByCategory?: Record<string, NearbyPlace[]>;
}

const CATEGORY_ICONS: Record<NearbyPlace['category'], React.ElementType> = {
  college: GraduationCap,
  metro: TrainFront,
  grocery: ShoppingCart,
  gym: Dumbbell,
  hospital: Cross,
  restaurant: UtensilsCrossed,
};

export const NeighborhoodIntelligenceCard: React.FC<NeighborhoodIntelligenceCardProps> = ({
  nearby,
  area,
  city,
  areaHighlights,
  nearbyByCategory,
}) => {
  const grouped = nearbyByCategory && Object.keys(nearbyByCategory).length ? nearbyByCategory : groupNearbyByCategory(nearby);
  const highlights = areaHighlights?.length ? areaHighlights : undefined;
  const blurb = buildNeighborhoodBlurb(nearby);

  return (
    <div className="space-y-4 rounded-lg border border-surface-border bg-white p-5 shadow-subtle">
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <div className="rounded bg-brand-50 p-2 text-brand-700">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-ink-primary">Neighborhood Intelligence</h3>
          <p className="text-xs text-ink-secondary">
            {area}, {city}
          </p>
        </div>
      </div>

      <p className="text-sm text-ink-secondary">{blurb}</p>

      {highlights && (
        <div className="flex flex-wrap gap-2">
          {highlights.map((highlight, idx) => (
            <span
              key={idx}
              className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}

      {Object.keys(grouped).length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(grouped).map(([category, places]) => {
            const Icon = CATEGORY_ICONS[category as NearbyPlace['category']] || MapPinned;
            return (
              <div key={category} className="rounded-lg border border-surface-border p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <Icon className="h-3.5 w-3.5 text-brand-700" />
                  {CATEGORY_LABELS[category as NearbyPlace['category']] || category}
                </p>
                <ul className="space-y-1">
                  {places.map((place) => (
                    <li key={place.name} className="flex justify-between text-xs text-ink-secondary">
                      <span>{place.name}</span>
                      <span className="font-medium text-ink-primary">
                        {place.distanceKm} km · {place.travelTimeMins} min
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-ink-muted">No nearby places have been added for this listing yet.</p>
      )}
    </div>
  );
};

export default NeighborhoodIntelligenceCard;
