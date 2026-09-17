import React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn';

export const Accordion = RadixAccordion.Root;

export const AccordionItem: React.FC<React.ComponentProps<typeof RadixAccordion.Item>> = ({
  className,
  ...props
}) => (
  <RadixAccordion.Item
    className={cn('rounded-xl border border-surface-border bg-white shadow-subtle', className)}
    {...props}
  />
);

export const AccordionTrigger: React.FC<React.ComponentProps<typeof RadixAccordion.Trigger>> = ({
  className,
  children,
  ...props
}) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      className={cn(
        'group flex flex-1 items-center justify-between px-5 py-4 text-sm font-semibold uppercase tracking-wide text-ink-muted transition-subtle hover:text-ink-primary',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
);

export const AccordionContent: React.FC<React.ComponentProps<typeof RadixAccordion.Content>> = ({
  className,
  children,
  ...props
}) => (
  <RadixAccordion.Content
    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('px-5 pb-5', className)}>{children}</div>
  </RadixAccordion.Content>
);
