import React, { useEffect, useState } from 'react';
import { Activity, Clock3, Database, RefreshCw, Server } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

type MonitoringData = Awaited<ReturnType<typeof api.getMonitoringStatus>>;
type StatusVariant = 'success' | 'warning' | 'danger';

const statusVariant = (status: MonitoringData['status']): StatusVariant => {
  if (status === 'UP') return 'success';
  if (status === 'DEGRADED') return 'warning';
  return 'danger';
};

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString() : 'Not checked yet');

export const AdminMonitoringPage: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      setError(null);
      setData(await api.getMonitoringStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load monitoring status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
    const refresh = window.setInterval(() => void loadStatus(), 30_000);
    return () => window.clearInterval(refresh);
  }, []);

  const currentStatus = data?.configured ? data.status : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Admin</p>
          <h1 className="mt-2 text-display text-ink-primary">Staywise System Status</h1>
          <p className="mt-1 text-sm text-ink-secondary">Lightweight API availability and response monitoring.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadStatus()}
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && <p className="mb-5 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}
      {loading && !data ? (
        <Card><p className="text-sm text-ink-secondary">Loading monitoring status...</p></Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-secondary">API Status</span><Server className="h-4 w-4 text-brand-700" /></div>
              <div className="mt-3">{currentStatus ? <Badge variant={statusVariant(currentStatus)}>{currentStatus}</Badge> : <Badge>Not configured</Badge>}</div>
            </Card>
            <Card>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-secondary">Uptime</span><Activity className="h-4 w-4 text-brand-700" /></div>
              <p className="mt-3 text-2xl font-semibold text-ink-primary">{data?.uptimePercentage == null ? '—' : `${data.uptimePercentage}%`}</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-secondary">Response Time</span><Clock3 className="h-4 w-4 text-brand-700" /></div>
              <p className="mt-3 text-2xl font-semibold text-ink-primary">{data?.averageResponseTime == null ? '—' : `${data.averageResponseTime} ms`}</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-secondary">Database</span><Database className="h-4 w-4 text-brand-700" /></div>
              <p className="mt-3 text-2xl font-semibold text-ink-primary">{data?.database === 'connected' ? 'Connected' : 'Unavailable'}</p>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-ink-primary">Recent Checks</h2><span className="text-xs text-ink-secondary">Last checked {formatDate(data?.lastCheckedAt ?? null)}</span></div>
              <div className="mt-4 divide-y divide-surface-border">
                {data?.recentChecks.length ? data.recentChecks.map((check) => (
                  <div key={check._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div className="flex items-center gap-3"><Badge variant={statusVariant(check.status)}>{check.status}</Badge><span className="text-ink-secondary">{formatDate(check.timestamp)}</span></div>
                    <span className="text-ink-secondary">{check.responseTime == null ? 'No response' : `${check.responseTime} ms`}</span>
                  </div>
                )) : <p className="py-3 text-sm text-ink-secondary">No checks recorded yet.</p>}
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold text-ink-primary">Recent Incidents</h2>
              <p className="mt-1 text-sm text-ink-secondary">{data?.recentIncidents.length ?? 0} incident{data?.recentIncidents.length === 1 ? '' : 's'}</p>
              <div className="mt-4 space-y-3">
                {data?.recentIncidents.length ? data.recentIncidents.map((incident) => (
                  <div key={incident._id} className="rounded-lg border border-surface-border p-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="font-medium text-ink-primary">{formatDate(incident.incidentStartedAt)}</span><Badge variant={incident.recoveredAt ? 'success' : 'danger'}>{incident.recoveredAt ? 'Recovered' : 'Active'}</Badge></div>
                    <p className="mt-1 text-ink-secondary">{incident.recoveredAt ? `Duration ${Math.round((incident.duration ?? 0) / 1000)} seconds` : incident.reason || 'Health endpoint unavailable'}</p>
                  </div>
                )) : <p className="text-sm text-ink-secondary">No incidents recorded.</p>}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMonitoringPage;