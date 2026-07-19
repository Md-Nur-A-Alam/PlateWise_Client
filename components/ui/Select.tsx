import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className='flex flex-col gap-1.5 w-full'>
        {label && <label className='text-sm font-semibold text-foreground'>{label}</label>}
        <select 
          ref={ref} 
          className={cn(
            'flex h-11 w-full rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm px-4 py-2 text-sm ring-offset-background placeholder:text-neutral-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm appearance-none', 
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )} 
          {...props}
        >
          {children}
        </select>
        {error && <span className='text-xs text-red-500'>{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
