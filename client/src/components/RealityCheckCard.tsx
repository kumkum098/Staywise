import React from 'react';
import { Eye, ThumbsUp, Info } from 'lucide-react';
import { Property } from '../types';
import { deriveRealityCheck } from '../lib/realityCheck';

interface RealityCheckCardProps {
  property: Property;
}

export const RealityCheckCard: React.FC<RealityCheckCardProps> = ({ property }) => {
  const fallback = deriveRealityCheck(property);
  const goodFor = property.goodFor?.length ? property.goodFor : fallback.goodFor;
  const thingsToKnow = property.thingsToKnow?.length ? property.thingsToKnow : fallback.thingsToKnow;

  return (
    <div className="space-y-4 rounded-lg border border-surface-border bg-white p-5 shadow-subtle">
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <div className="rounded bg-brand-50 p-2 text-brand-700">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-ink-primary">Reality Check</h3>
          <p className="text-xs text-ink-secondary">What living here may actually be like</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <ThumbsUp className="h-3.5 w-3.5" /> Good for
          </p>
          <ul className="space-y-1.5">
            {goodFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-ink-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warn-700">
            <Info className="h-3.5 w-3.5" /> Things to know
          </p>
          <ul className="space-y-1.5">
            {thingsToKnow.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-ink-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RealityCheckCard;
