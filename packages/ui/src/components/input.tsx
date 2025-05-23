'use client';

/**
 * Input Component
 * 
 * A styled input component with various variants and sizes.
 */

import * as React from 'react';

import { cn } from '../utils.js';

/**
 * Input props interface
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * The variant of the input
   */
  variant?: 'default' | 'filled' | 'outline' | 'underlined' | 'unstyled';
  
  /**
   * The size of the input
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the input has an error
   */
  hasError?: boolean;
  
  /**
   * The icon to display before the input
   */
  leftIcon?: React.ReactNode;
  
  /**
   * The icon to display after the input
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Whether the input is full width
   */
  fullWidth?: boolean;
  
  /**
   * The container class name
   */
  containerClassName?: string;
  
  /**
   * Whether to show a clear button
   */
  isClearable?: boolean;
  
  /**
   * Callback when the clear button is clicked
   */
  onClear?: () => void;
}

/**
 * Input component
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    variant = 'default',
    size = 'md',
    hasError = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    containerClassName,
    isClearable = false,
    onClear,
    disabled,
    readOnly,
    value,
    onChange,
    ...props 
  }, ref) => {
    // Handle controlled input for clearable functionality
    const [inputValue, setInputValue] = React.useState<string | number | readonly string[] | undefined>(value);
    
    // Update internal state when value prop changes
    React.useEffect(() => {
      setInputValue(value);
    }, [value]);
    
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };
    
    // Handle clear button click
    const handleClear = () => {
      setInputValue('');
      onClear?.();
      
      // Create a synthetic event to trigger onChange
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange?.(syntheticEvent);
    };
    
    // Determine the variant classes
    const variantClasses = {
      default: 'border border-input bg-transparent focus-visible:ring-1 focus-visible:ring-ring',
      filled: 'border border-transparent bg-muted focus-visible:ring-1 focus-visible:ring-ring',
      outline: 'border-2 border-input bg-transparent focus-visible:ring-1 focus-visible:ring-ring',
      underlined: 'border-b border-input bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-b-2',
      unstyled: 'border-0 bg-transparent shadow-none focus-visible:ring-0',
    };
    
    // Determine the size classes
    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
    };
    
    // Determine the padding based on icons
    const paddingClasses = {
      left: leftIcon ? 'pl-9' : '',
      right: rightIcon || (isClearable && inputValue) ? 'pr-9' : '',
    };
    
    // Combine all classes
    const inputClasses = cn(
      'flex w-full rounded-md shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      paddingClasses.left,
      paddingClasses.right,
      hasError && 'border-destructive focus-visible:ring-destructive',
      fullWidth ? 'w-full' : 'w-auto',
      className
    );
    
    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />
        
        {rightIcon && !isClearable && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            {rightIcon}
          </div>
        )}
        
        {isClearable && inputValue && !disabled && !readOnly && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear input"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/**
 * InputGroup props interface
 */
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The children of the input group
   */
  children: React.ReactNode;
}

/**
 * InputGroup component
 * 
 * A component for grouping inputs with addons
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex w-full rounded-md', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroup.displayName = 'InputGroup';

/**
 * InputAddon props interface
 */
export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The position of the addon
   */
  position?: 'left' | 'right';
}

/**
 * InputAddon component
 * 
 * A component for adding addons to inputs
 */
export const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, position = 'left', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center px-3 bg-muted border border-input',
          position === 'left' ? 'rounded-l-md border-r-0' : 'rounded-r-md border-l-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputAddon.displayName = 'InputAddon';
