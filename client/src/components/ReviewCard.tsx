import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { Review } from '../types';
import { Badge } from './ui/Badge';

interface ReviewCardProps {
  review: Review;
}

const DIMENSIONS: Array<{ key: keyof Review; label: string }> = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'internet', label: 'Wi-Fi' },
  { key: 'food', label: 'Food' },
  { key: 'safety', label: 'Safety' },
  { key: 'noise', label: 'Noise' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'ownerResponsiveness', label: 'Owner responsiveness' },
  { key: 'valueForMoney', label: 'Value for money' },
];

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <article className="py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink-primary">{review.user?.name || review.userName || 'Resident'}</p>
            {review.isVerifiedDetails && (
              <Badge variant="success">
                <ShieldCheck className="h-3 w-3" /> Verified stay details
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {new Date(review.createdAt).toLocaleDateString()}
            {review.isVerifiedDetails && review.stayDurationMonths && review.roomType && (
              <> · Stayed {review.stayDurationMonths} month{review.stayDurationMonths === 1 ? '' : 's'} · {review.roomType} sharing</>
            )}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-primary">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {review.overall.toFixed(1)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-secondary">{review.comment}</p>

      {review.whatIWishIKnew && (
        <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs italic text-ink-secondary">
          "What I wish I knew before moving in": {review.whatIWishIKnew}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-ink-muted sm:grid-cols-4">
        {DIMENSIONS.map((dim) => {
          const value = review[dim.key];
          if (typeof value !== 'number') return null;
          return (
            <span key={dim.key}>
              {dim.label} {value.toFixed(1)}
            </span>
          );
        })}
      </div>
    </article>
  );
};

export default ReviewCard;
