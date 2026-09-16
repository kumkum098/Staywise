import React from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './cn';

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

export const DropdownMenuContent: React.FC<React.ComponentProps<typeof RadixDropdownMenu.Content>> = ({
  className,
  sideOffset = 8,
  align = 'end',
  ...props
}) => (
  <RadixDropdownMenu.Portal>
    <RadixDropdownMenu.Content
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-lg border border-surface-border bg-white p-1.5 shadow-dropdown',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    />
  </RadixDropdownMenu.Portal>
);

export const DropdownMenuItem: React.FC<React.ComponentProps<typeof RadixDropdownMenu.Item> & { destructive?: boolean }> = ({
  className,
  destructive,
  ...props
}) => (
  <RadixDropdownMenu.Item
    className={cn(
      'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-secondary outline-none transition-subtle',
      'hover:bg-surface-muted hover:text-ink-primary focus:bg-surface-muted focus:text-ink-primary',
      destructive && 'text-danger-600 hover:bg-danger-50 hover:text-danger-700 focus:bg-danger-50 focus:text-danger-700',
      className
    )}
    {...props}
  />
);

export const DropdownMenuLabel: React.FC<React.ComponentProps<typeof RadixDropdownMenu.Label>> = ({
  className,
  ...props
}) => (
  <RadixDropdownMenu.Label
    className={cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted', className)}
    {...props}
  />
);

export const DropdownMenuSeparator: React.FC<React.ComponentProps<typeof RadixDropdownMenu.Separator>> = ({
  className,
  ...props
}) => <RadixDropdownMenu.Separator className={cn('my-1.5 h-px bg-surface-border', className)} {...props} />;
