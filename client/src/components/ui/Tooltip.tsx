import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from './cn';

export const TooltipProvider = RadixTooltip.Provider;

interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<SimpleTooltipProps> = ({ content, children, side = 'top' }) => (
  <RadixTooltip.Root delayDuration={200}>
    <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        side={side}
        sideOffset={6}
        className={cn(
          'z-50 rounded-md bg-ink-primary px-2.5 py-1.5 text-xs font-medium text-white shadow-dropdown',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0'
        )}
      >
        {content}
        <RadixTooltip.Arrow className="fill-ink-primary" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  </RadixTooltip.Root>
);
