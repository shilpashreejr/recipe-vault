import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    className, 
    children, 
    loading = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-accent font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-primary/50 focus:ring-offset-background shadow-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-secondary/50 focus:ring-offset-background shadow-md",
      outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-primary/50 focus:ring-offset-background",
      ghost: "text-foreground/80 hover:text-primary hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] focus:ring-primary/50 focus:ring-offset-background",
      gradient: "bg-gradient-to-r from-accent to-[#d2691e] text-white hover:from-accent/90 hover:to-[#d2691e]/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-accent/50 focus:ring-offset-background shadow-md",
      glass: "glass-gradient text-foreground hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-primary/50 focus:ring-offset-background",
      destructive: "bg-destructive text-white hover:bg-destructive/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:ring-destructive/50 focus:ring-offset-background shadow-md"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm gap-2",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-3",
      xl: "px-10 py-5 text-xl gap-3"
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5", 
      lg: "w-6 h-6",
      xl: "w-7 h-7"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Icon on the left */}
        {icon && iconPosition === 'left' && !loading && (
          <span className={cn("transition-transform group-hover:scale-110", iconSizes[size])}>
            {icon}
          </span>
        )}
        
        {/* Button text */}
        <span className={loading ? 'opacity-0' : 'transition-opacity'}>
          {children}
        </span>
        
        {/* Icon on the right */}
        {icon && iconPosition === 'right' && !loading && (
          <span className={cn("transition-transform group-hover:scale-110", iconSizes[size])}>
            {icon}
          </span>
        )}
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 