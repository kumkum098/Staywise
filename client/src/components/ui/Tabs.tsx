import React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from './cn';

export const Tabs = RadixTabs.Root;

export const TabsList: React.FC<React.ComponentProps<typeof RadixTabs.List>> = ({ className, ...props }) => (
  <RadixTabs.List
    className={cn('inline-flex items-center gap-1 rounded-lg bg-surface-muted p-1', className)}
    {...props}
  />
);

export const TabsTrigger: React.FC<React.ComponentProps<typeof RadixTabs.Trigger>> = ({ className, ...props }) => (
  <RadixTabs.Trigger
    className={cn(
      'rounded-md px-3.5 py-1.5 text-sm font-medium text-ink-secondary transition-subtle',
      'data-[state=active]:bg-white data-[state=active]:text-ink-primary data-[state=active]:shadow-subtle',
      className
    )}
    {...props}
  />
);

export const TabsContent: React.FC<React.ComponentProps<typeof RadixTabs.Content>> = ({ className, ...props }) => (
  <RadixTabs.Content className={cn('mt-4 focus:outline-none', className)} {...props} />
);
