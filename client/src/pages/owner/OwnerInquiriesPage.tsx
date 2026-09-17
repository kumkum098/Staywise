import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Inquiry, Visit } from '../../types';

const inquiryStatuses = ['new', 'contacted', 'scheduled', 'closed'] as const;
const visitStatuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

const statusVariant = (status: string): 'success' | 'warning' | 'neutral' => {
  if (status === 'new' || status === 'pending') return 'warning';
  if (status === 'closed' || status === 'cancelled') return 'neutral';
  return 'success';
};

export const OwnerInquiriesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const inquiriesQuery = useQuery({ queryKey: ['ownerInquiries'], queryFn: api.getInquiries });
  const visitsQuery = useQuery({ queryKey: ['ownerVisits'], queryFn: api.getVisits });

  const handleInquiryStatus = async (id: string, status: string) => {
    try {
      await api.updateInquiryStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['ownerInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['ownerStats'] });
      toast.success('Inquiry status updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update inquiry status.');
    }
  };

  const handleVisitStatus = async (id: string, status: string) => {
    try {
      await api.updateVisitStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['ownerVisits'] });
      queryClient.invalidateQueries({ queryKey: ['ownerStats'] });
      toast.success('Visit status updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update visit status.');
    }
  };

  return (
    <Tabs defaultValue="inquiries">
      <TabsList>
        <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        <TabsTrigger value="visits">Visit requests</TabsTrigger>
      </TabsList>

      <TabsContent value="inquiries">
        {inquiriesQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
        {inquiriesQuery.isError && (
          <ErrorState description="Could not load inquiries." onRetry={() => inquiriesQuery.refetch()} />
        )}
        {inquiriesQuery.data && inquiriesQuery.data.inquiries.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No inquiries yet"
            description="Inquiries from prospective tenants will show up here."
          />
        )}
        {inquiriesQuery.data && inquiriesQuery.data.inquiries.length > 0 && (
          <div className="space-y-3">
            {inquiriesQuery.data.inquiries.map((inquiry: Inquiry) => (
              <Card key={inquiry._id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-primary">{inquiry.user?.name}</p>
                    <Badge variant={statusVariant(inquiry.status)}>{inquiry.status}</Badge>
                  </div>
                  <p className="text-xs text-ink-secondary">{inquiry.property?.name}</p>
                  <p className="mt-1 text-sm text-ink-secondary">{inquiry.message}</p>
                  {inquiry.phone && <p className="mt-1 text-xs text-ink-muted">Contact: {inquiry.phone}</p>}
                </div>
                <Select
                  value={inquiry.status}
                  onChange={(e) => handleInquiryStatus(inquiry._id, e.target.value)}
                  className="w-40 shrink-0"
                >
                  {inquiryStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="visits">
        {visitsQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
        {visitsQuery.isError && (
          <ErrorState description="Could not load visit requests." onRetry={() => visitsQuery.refetch()} />
        )}
        {visitsQuery.data && visitsQuery.data.visits.length === 0 && (
          <EmptyState
            icon={CalendarCheck}
            title="No visit requests yet"
            description="Scheduled visit requests will show up here."
          />
        )}
        {visitsQuery.data && visitsQuery.data.visits.length > 0 && (
          <div className="space-y-3">
            {visitsQuery.data.visits.map((visit: Visit) => (
              <Card key={visit._id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-primary">{visit.user?.name}</p>
                    <Badge variant={statusVariant(visit.status)}>{visit.status}</Badge>
                  </div>
                  <p className="text-xs text-ink-secondary">{visit.property?.name}</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {visit.date} at {visit.time}
                  </p>
                  {visit.notes && <p className="mt-1 text-xs text-ink-muted">{visit.notes}</p>}
                </div>
                <Select
                  value={visit.status}
                  onChange={(e) => handleVisitStatus(visit._id, e.target.value)}
                  className="w-40 shrink-0"
                >
                  {visitStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default OwnerInquiriesPage;
