import React from 'react';
import { cn } from './cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, padded = true, children, ...props }) => (
  <div
    className={cn(
      'rounded-xl border border-surface-border bg-white shadow-subtle',
      padded && 'p-5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
