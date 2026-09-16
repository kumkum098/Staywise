import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ROUTES } from '../routes';

export const SavedPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-display text-ink-primary">Saved properties</h1>
      <p className="mt-1 text-sm text-ink-secondary">Quickly return to the places you're considering.</p>

      <div className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && <ErrorState description="Could not load your saved properties." onRetry={() => refetch()} />}

        {!isLoading && !isError && data && data.favorites.length === 0 && (
          <EmptyState
            icon={Bookmark}
            title="No saved properties yet"
            description="Tap the heart icon on any listing to save it here for later."
            action={{ label: 'Browse properties', to: ROUTES.explore }}
          />
        )}

        {!isLoading && !isError && data && data.favorites.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.favorites.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
