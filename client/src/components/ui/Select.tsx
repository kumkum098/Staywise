import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-lg border border-surface-border bg-white px-3.5 py-2.5 pr-9 text-sm text-ink-primary transition-subtle',
              'focus:outline-none focus:ring-2 focus:ring-brand-700/30 focus:border-brand-700',
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
