import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, BedDouble, MessageSquare, CalendarCheck, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ROUTES } from '../../routes';

export const OwnerDashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ownerStats'],
    queryFn: api.getOwnerStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState description="Could not load your dashboard stats." onRetry={() => refetch()} />;
  }

  const stats = [
    { label: 'Properties', value: data.totalProperties, icon: Building2 },
    { label: 'Available rooms', value: data.availableRooms, icon: BedDouble },
    { label: 'New inquiries', value: data.newInquiries, icon: MessageSquare },
    { label: 'Pending visits', value: data.pendingVisits, icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <stat.icon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-ink-primary">{stat.value}</span>
            <span className="text-xs text-ink-secondary">{stat.label}</span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Your properties</h2>
          <Link
            to={ROUTES.ownerProperties}
            className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {data.propertiesList.slice(0, 5).map((property) => (
            <Link
              key={property._id}
              to={ROUTES.ownerProperty(property._id)}
              className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2.5 text-sm hover:border-gray-300"
            >
              <span className="font-medium text-ink-primary">{property.name}</span>
              <span className="text-xs text-ink-secondary">
                {property.availableRoomsCount ?? 0}/{property.totalRoomsCount ?? 0} rooms available
              </span>
            </Link>
          ))}
          {data.propertiesList.length === 0 && (
            <p className="text-sm text-ink-secondary">
              You haven't listed any properties yet.{' '}
              <Link to={ROUTES.ownerPropertyNew} className="font-semibold text-brand-700 hover:underline">
                List your first property
              </Link>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OwnerDashboardPage;
