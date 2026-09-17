import React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from './cn';

interface AvatarProps {
  name: string;
  className?: string;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const Avatar: React.FC<AvatarProps> = ({ name, className }) => (
  <RadixAvatar.Root
    className={cn(
      'flex h-9 w-9 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand-700 text-sm font-semibold text-white',
      className
    )}
  >
    <RadixAvatar.Fallback delayMs={0}>{getInitials(name) || '?'}</RadixAvatar.Fallback>
  </RadixAvatar.Root>
);
