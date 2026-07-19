import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className='flex flex-col space-y-1.5 w-full'>
        {label && <label className='text-sm font-medium'>{label}</label>}
        <select ref={ref} className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)} {...props}>
          {children}
        </select>
        {error && <span className='text-xs text-red-500'>{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
