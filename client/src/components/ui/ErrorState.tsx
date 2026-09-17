import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-danger-100 bg-danger-50/60 px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-subtle">
      <AlertTriangle className="h-6 w-6 text-danger-600" />
    </div>
    <h3 className="text-base font-semibold text-ink-primary">{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{description}</p>
    {onRetry && (
      <Button size="sm" variant="secondary" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
