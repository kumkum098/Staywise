import React from 'react';
import { cn } from './cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-surface-border bg-white px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted transition-subtle',
            'focus:outline-none focus:ring-2 focus:ring-brand-700/30 focus:border-brand-700',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
