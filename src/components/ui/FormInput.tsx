import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    error, 
    success, 
    icon, 
    helperText, 
    variant = 'default',
    size = 'md',
    className,
    type = 'text',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const baseStyles = "w-full font-sans transition-all duration-300 ease-out focus:outline-none";
    
    const variants = {
      default: "border-2 border-input bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
      filled: "border-2 border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20",
      outlined: "border-2 border-input bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
    };

    const sizes = {
      sm: "px-3 py-2 text-sm rounded-lg",
      md: "px-4 py-3 text-base rounded-xl",
      lg: "px-5 py-4 text-lg rounded-xl"
    };

    const labelSizes = {
      sm: "text-xs",
      md: "text-sm", 
      lg: "text-base"
    };

    const isActive = isFocused || hasValue;

    return (
      <div className="relative">
        <div className="relative">
          {/* Input field */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[size],
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              success && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
              icon && "pl-12",
              type === 'password' && "pr-12",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Left icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          {/* Password toggle */}
          {type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}

          {/* Status icons */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}

          {/* Floating label */}
          <label
            className={cn(
              "absolute left-0 transition-all duration-300 ease-out pointer-events-none",
              labelSizes[size],
              icon && "left-12",
              isActive 
                ? "top-0 -translate-y-1/2 bg-background px-2 text-primary font-medium" 
                : "top-1/2 -translate-y-1/2 text-muted-foreground",
              error && isActive && "text-destructive",
              success && isActive && !error && "text-green-500",
              sizes[size].includes('px-4') ? "left-4" : sizes[size].includes('px-3') ? "left-3" : "left-5",
              icon && (sizes[size].includes('px-4') ? "left-12" : sizes[size].includes('px-3') ? "left-11" : "left-13")
            )}
          >
            {label}
          </label>
        </div>

        {/* Helper text */}
        {(helperText || error) && (
          <div className={cn(
            "mt-2 text-sm",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput; 