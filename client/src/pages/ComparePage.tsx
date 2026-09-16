import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { computeTotalMonthlyCost } from '../lib/pricing';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Tooltip } from '../components/ui/Tooltip';
import { ROUTES } from '../routes';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export const ComparePage: React.FC = () => {
  const { compareProperties, removeFromCompare, clearCompare } = useCompare();

  if (compareProperties.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={GitCompare}
          title="Nothing to compare yet"
          description="Add up to 3 properties from Explore to see a detailed side-by-side comparison."
          action={{ label: 'Browse properties', to: ROUTES.explore }}
        />
      </div>
    );
  }

  const rows: Array<{
    label: string;
    render: (p: (typeof compareProperties)[number]) => React.ReactNode;
  }> = [
    { label: 'Advertised rent', render: (p) => money(p.pricing.startingRent) },
    { label: 'True monthly cost', render: (p) => money(p.totalEstimatedMonthly || computeTotalMonthlyCost(p.pricing)) },
    { label: 'Security deposit', render: (p) => money(p.pricing.deposit) },
    { label: 'Living score', render: (p) => `${p.livingScore.overall.toFixed(1)} / 10` },
    { label: 'Wi-Fi / Internet', render: (p) => `${p.livingScore.internet.toFixed(1)} / 10` },
    { label: 'Food', render: (p) => `${p.livingScore.food.toFixed(1)} / 10` },
    { label: 'Safety', render: (p) => `${p.livingScore.safety.toFixed(1)} / 10` },
    { label: 'Privacy', render: (p) => `${p.livingScore.privacy.toFixed(1)} / 10` },
    { label: 'Value for money', render: (p) => `${p.livingScore.valueForMoney.toFixed(1)} / 10` },
    { label: 'Curfew', render: (p) => p.houseRules.curfew },
    { label: 'Notice period', render: (p) => `${p.houseRules.noticePeriodDays} days` },
    {
      label: 'Nearest landmark',
      render: (p) =>
        p.location.nearby[0] ? `${p.location.nearby[0].name} (${p.location.nearby[0].distanceKm} km)` : 'Not specified',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-display text-ink-primary">Compare properties</h1>
          <p className="mt-1 text-sm text-ink-secondary">A side-by-side look at living experience, not just rent.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={clearCompare}>
          <Trash2 className="h-3.5 w-3.5" /> Clear all
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-border bg-white shadow-subtle">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 border-b border-surface-border p-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Feature
              </th>
              {compareProperties.map((property) => (
                <th key={property._id} className="border-b border-surface-border p-4 text-left align-top">
                  <div className="space-y-2">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="h-24 w-full rounded-lg bg-surface-muted object-cover"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={ROUTES.propertyDetail(property._id)}
                        className="text-sm font-bold text-ink-primary hover:text-brand-700"
                      >
                        {property.name}
                      </Link>
                      <Tooltip content="Remove from comparison">
                        <button
                          onClick={() => removeFromCompare(property._id)}
                          className="shrink-0 text-ink-muted hover:text-danger-600"
                          aria-label={`Remove ${property.name} from comparison`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      {property.location.area}, {property.location.city}
                    </p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="odd:bg-surface-muted/40">
                <td className="border-b border-surface-border p-4 text-xs font-semibold text-ink-muted">{row.label}</td>
                {compareProperties.map((property) => (
                  <td key={property._id} className="border-b border-surface-border p-4 text-ink-primary">
                    {row.render(property)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
