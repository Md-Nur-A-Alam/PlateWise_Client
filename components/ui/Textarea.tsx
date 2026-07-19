import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className='flex flex-col gap-1.5 w-full'>
        {label && <label className='text-sm font-semibold text-foreground'>{label}</label>}
        <textarea 
          ref={ref} 
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-neutral-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm', 
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )} 
          {...props} 
        />
        {error && <span className='text-xs text-red-500 mt-1 animate-fade-in-up'>{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
