import React from 'react';
import { cn } from './cn';

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand-50 text-brand-800 border-brand-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warn-50 text-warn-700 border-warn-100',
  danger: 'bg-danger-50 text-danger-700 border-danger-100',
  neutral: 'bg-surface-muted text-ink-secondary border-surface-border',
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
