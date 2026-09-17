import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { Tooltip } from '../../components/ui/Tooltip';
import { ROUTES } from '../../routes';

export const OwnerPropertiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ownerProperties'],
    queryFn: () => api.getProperties({ owner: 'me', limit: 100 }),
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    try {
      await api.deleteProperty(id);
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerStats'] });
      toast.success('Property deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete property.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Your properties</h2>
        <Link to={ROUTES.ownerPropertyNew}>
          <Button size="sm">
            <Plus className="h-4 w-4" /> List a property
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {isError && <ErrorState description="Could not load your properties." onRetry={() => refetch()} />}

      {!isLoading && !isError && data?.properties.length === 0 && (
        <EmptyState
          icon={Building2}
          title="You haven't listed any properties yet"
          description="List your first property to start receiving inquiries and visit requests."
          action={{ label: 'List a property', to: ROUTES.ownerPropertyNew }}
        />
      )}

      {!isLoading && !isError && data && data.properties.length > 0 && (
        <div className="space-y-3">
          {data.properties.map((property) => (
            <Card key={property._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="h-14 w-20 shrink-0 rounded-lg bg-surface-muted object-cover"
                />
                <div>
                  <p className="font-semibold text-ink-primary">{property.name}</p>
                  <p className="text-xs text-ink-secondary">
                    {property.location.area}, {property.location.city}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="neutral">{property.propertyType}</Badge>
                    {property.verification?.isVerified && <Badge variant="success">Verified</Badge>}
                    <Badge variant="neutral">
                      {property.availableRoomsCount ?? 0}/{property.totalRoomsCount ?? property.roomOptions?.length ?? 0}{' '}
                      rooms available
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link to={ROUTES.ownerProperty(property._id)}>
                  <Button size="sm" variant="secondary">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
                <Tooltip content="Delete property">
                  <Button size="sm" variant="danger" onClick={() => handleDelete(property._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerPropertiesPage;
