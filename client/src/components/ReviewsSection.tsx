import React from 'react';
import { Star, PenLine } from 'lucide-react';
import { Review } from '../types';
import { ReviewCard } from './ReviewCard';
import { Button } from './ui/Button';

interface ReviewsSectionProps {
  reviews: Review[];
  loading: boolean;
  error: boolean;
  rating: number;
  count: number;
  onWriteReview: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, loading, error, rating, count, onWriteReview }) => {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Resident reviews</p>
          <h2 className="mt-1 text-xl font-bold text-ink-primary">Experiences from the community</h2>
        </div>
        <Button size="sm" variant="secondary" onClick={onWriteReview}>
          <PenLine className="h-3.5 w-3.5" /> Write a review
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3 border-y border-surface-border py-4">
        <span className="text-3xl font-bold text-ink-primary">{rating?.toFixed(1) || '—'}</span>
        <span className="text-sm text-ink-secondary">
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-amber-400" /> Overall rating
          </span>
          {count} review{count === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <p className="py-5 text-sm text-ink-secondary">Loading reviews...</p>
      ) : error ? (
        <p className="py-5 text-sm text-ink-secondary">Reviews are temporarily unavailable.</p>
      ) : reviews.length === 0 ? (
        <p className="py-5 text-sm text-ink-secondary">No reviews yet. Be the first resident to share your experience.</p>
      ) : (
        <div className="divide-y divide-surface-border">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
