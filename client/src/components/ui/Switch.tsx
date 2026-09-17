import React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from './cn';

interface SwitchProps extends React.ComponentProps<typeof RadixSwitch.Root> {
  label?: string;
  description?: string;
}

export const Switch: React.FC<SwitchProps> = ({ className, label, description, id, ...props }) => {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const switchEl = (
    <RadixSwitch.Root
      id={switchId}
      className={cn(
        'relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-surface-border transition-colors data-[state=checked]:bg-brand-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30',
        className
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-subtle transition-transform will-change-transform data-[state=checked]:translate-x-[22px]" />
    </RadixSwitch.Root>
  );

  if (!label) return switchEl;

  return (
    <label htmlFor={switchId} className="flex cursor-pointer items-center justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-medium text-ink-primary">{label}</span>
        {description && <span className="block text-xs text-ink-secondary">{description}</span>}
      </span>
      {switchEl}
    </label>
  );
};
