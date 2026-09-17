import React from 'react';
import * as RadixProgress from '@radix-ui/react-progress';
import { cn } from './cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 10, className, indicatorClassName }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <RadixProgress.Root
      value={percentage}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-muted', className)}
    >
      <RadixProgress.Indicator
        className={cn('h-full rounded-full bg-brand-700 transition-transform duration-500 ease-out', indicatorClassName)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </RadixProgress.Root>
  );
};
