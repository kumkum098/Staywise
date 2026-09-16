import React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from './cn';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, min = 1, max = 10, step = 1, className }) => (
  <RadixSlider.Root
    className={cn('relative flex h-5 w-full touch-none select-none items-center', className)}
    value={[value]}
    onValueChange={([v]) => onChange(v)}
    min={min}
    max={max}
    step={step}
  >
    <RadixSlider.Track className="relative h-1.5 grow rounded-full bg-surface-border">
      <RadixSlider.Range className="absolute h-full rounded-full bg-brand-700" />
    </RadixSlider.Track>
    <RadixSlider.Thumb
      className="block h-4 w-4 rounded-full border-2 border-brand-700 bg-white shadow-subtle transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30"
      aria-label="Rating"
    />
  </RadixSlider.Root>
);
