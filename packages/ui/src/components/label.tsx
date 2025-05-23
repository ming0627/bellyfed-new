'use client';

/**
 * Label Component
 * 
 * A styled label component with various variants and sizes.
 * Based on Radix UI's Label primitive.
 */

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../utils.js';

/**
 * Label variants using class-variance-authority
 */
export const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: '',
        required: 'after:content-["*"] after:ml-0.5 after:text-destructive',
        optional: 'after:content-["(optional)"] after:ml-1 after:text-muted-foreground after:text-xs',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Label props interface
 */
export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /**
   * Whether the label is for a required field
   */
  isRequired?: boolean;
  
  /**
   * Whether the label is for an optional field
   */
  isOptional?: boolean;
  
  /**
   * The text to display after the label
   */
  helperText?: string;
  
  /**
   * The icon to display before the label
   */
  icon?: React.ReactNode;
}

/**
 * Label component
 */
export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ 
  className, 
  variant, 
  size, 
  isRequired, 
  isOptional, 
  helperText, 
  icon,
  children,
  ...props 
}, ref) => {
  // Determine the variant based on isRequired and isOptional
  let variantToUse = variant;
  if (isRequired && !variant) {
    variantToUse = 'required';
  } else if (isOptional && !variant) {
    variantToUse = 'optional';
  }
  
  return (
    <div className="flex flex-col space-y-1">
      <LabelPrimitive.Root
        ref={ref}
        className={cn(
          labelVariants({ variant: variantToUse, size }),
          icon && 'flex items-center gap-2',
          className
        )}
        {...props}
      >
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
      </LabelPrimitive.Root>
      
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

/**
 * FormLabel props interface
 */
export interface FormLabelProps extends LabelProps {
  /**
   * The ID of the form element this label is for
   */
  htmlFor: string;
  
  /**
   * The error message to display
   */
  error?: string;
  
  /**
   * Whether to hide the label visually but keep it accessible to screen readers
   */
  srOnly?: boolean;
}

/**
 * FormLabel component
 * 
 * A label component specifically designed for forms
 */
export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ 
  className, 
  htmlFor, 
  error, 
  srOnly,
  helperText,
  children,
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col space-y-1">
      <Label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          srOnly && 'sr-only',
          error && 'text-destructive',
          className
        )}
        {...props}
      >
        {children}
      </Label>
      
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
});
FormLabel.displayName = 'FormLabel';

/**
 * FieldLabel props interface
 */
export interface FieldLabelProps extends Omit<FormLabelProps, 'htmlFor'> {
  /**
   * The ID of the form element this label is for
   */
  id: string;
  
  /**
   * The label text
   */
  label: React.ReactNode;
  
  /**
   * The form element
   */
  children: React.ReactNode;
}

/**
 * FieldLabel component
 * 
 * A component that combines a label with a form element
 */
export const FieldLabel: React.FC<FieldLabelProps> = ({
  id,
  label,
  error,
  helperText,
  isRequired,
  isOptional,
  srOnly,
  children,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <FormLabel
        htmlFor={id}
        error={error}
        helperText={helperText}
        isRequired={isRequired}
        isOptional={isOptional}
        srOnly={srOnly}
        className={className}
        {...props}
      >
        {label}
      </FormLabel>
      
      {children}
    </div>
  );
};
FieldLabel.displayName = 'FieldLabel';
