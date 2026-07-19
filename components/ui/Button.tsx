import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-5 py-2.5 shadow-sm';
    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-md hover:shadow-primary/20 hover:from-primary/90 hover:to-primary/70',
      secondary: 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-md hover:shadow-secondary/20 hover:from-secondary/90 hover:to-secondary/70',
      ghost: 'hover:bg-neutral hover:text-neutral-foreground text-foreground shadow-none',
      danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-md hover:shadow-red-500/20 hover:from-red-700 hover:to-red-600',
      outline: 'border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted hover:border-border text-foreground',
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
