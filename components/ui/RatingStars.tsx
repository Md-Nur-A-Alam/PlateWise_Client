import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({ rating, max = 5, readOnly = true, onChange, className }: RatingStarsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  
  return (
    <div className={cn('flex items-center space-x-1', className)} onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: max }).map((_, i) => {
        const val = i + 1;
        const active = hovered !== null ? val <= hovered : val <= Math.round(rating);
        return (
          <button
            key={i}
            type='button'
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(val)}
            onMouseEnter={() => !readOnly && setHovered(val)}
            className={cn('focus:outline-none', readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform')}
          >
            <Star className={cn('w-5 h-5', active ? 'fill-accent text-accent' : 'text-neutral-foreground opacity-30')} />
          </button>
        );
      })}
    </div>
  );
}
