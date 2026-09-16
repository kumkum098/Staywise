import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; to?: string };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-muted/40 px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-subtle">
      <Icon className="h-6 w-6 text-brand-700" />
    </div>
    <h3 className="text-base font-semibold text-ink-primary">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{description}</p>}
    {action &&
      (action.to ? (
        <Link to={action.to} className="mt-5">
          <Button size="sm">{action.label}</Button>
        </Link>
      ) : (
        <Button size="sm" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      ))}
  </div>
);
