import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none px-4 py-2';
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      ghost: 'hover:bg-neutral hover:text-neutral-foreground text-foreground',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], className)} disabled={isLoading || props.disabled} {...props}>
        {isLoading ? <span className='mr-2 animate-spin'>⌛</span> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
