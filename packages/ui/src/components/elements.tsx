'use client';

/**
 * Elements Component
 *
 * A collection of basic UI elements with consistent styling.
 */

import * as React from 'react';

import { cn } from '../utils.js';

/**
 * ElementButton props interface
 */
export interface ElementButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';

  /**
   * The size of the button
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the button is loading
   */
  isLoading?: boolean;

  /**
   * The icon to display before the button text
   */
  leftIcon?: React.ReactNode;

  /**
   * The icon to display after the button text
   */
  rightIcon?: React.ReactNode;

  /**
   * Whether the button is full width
   */
  fullWidth?: boolean;
}

/**
 * ElementButton component
 *
 * A styled button component with various variants and sizes
 */
export const ElementButton = React.forwardRef<HTMLButtonElement, ElementButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    ...props
  }, ref) => {
    // Determine the base classes based on the variant
    const variantClasses = {
      primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'bg-transparent border border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
      ghost: 'bg-transparent text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
      link: 'bg-transparent text-orange-500 hover:underline focus:ring-orange-500 p-0',
      destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    // Determine the size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Combine all classes
    const buttonClasses = cn(
      'rounded font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      (isLoading || disabled) ? 'opacity-70 cursor-not-allowed' : '',
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block animate-spin">⟳</span>
        )}
        {leftIcon && !isLoading && (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);
ElementButton.displayName = 'ElementButton';

/**
 * ElementInput props interface
 */
export interface ElementInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Whether the input has an error
   */
  hasError?: boolean;

  /**
   * The size of the input
   */
  size?: 'sm' | 'md' | 'lg';

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
}

/**
 * ElementInput component
 *
 * A styled input component with various sizes and states
 */
export const ElementInput = React.forwardRef<HTMLInputElement, ElementInputProps>(
  ({
    className,
    hasError = false,
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth = true,
    ...props
  }, ref) => {
    // Determine the size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    // Combine all classes
    const inputClasses = cn(
      'border rounded-md focus:outline-none focus:ring-2 transition-colors',
      hasError
        ? 'border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500',
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      (leftIcon || rightIcon) ? 'pl-10' : '',
      className
    );

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
ElementInput.displayName = 'ElementInput';

/**
 * ElementLabel props interface
 */
export interface ElementLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Whether the label is required
   */
  required?: boolean;

  /**
   * The size of the label
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ElementLabel component
 *
 * A styled label component with various sizes
 */
export const ElementLabel = React.forwardRef<HTMLLabelElement, ElementLabelProps>(
  ({
    children,
    className,
    required = false,
    size = 'md',
    ...props
  }, ref) => {
    // Determine the size classes
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    // Combine all classes
    const labelClasses = cn(
      'block font-medium text-gray-700 mb-1',
      sizeClasses[size],
      className
    );

    return (
      <label
        ref={ref}
        className={labelClasses}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
    );
  }
);
ElementLabel.displayName = 'ElementLabel';

/**
 * ElementTextarea props interface
 */
export interface ElementTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Whether the textarea has an error
   */
  hasError?: boolean;

  /**
   * The size of the textarea
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the textarea is full width
   */
  fullWidth?: boolean;
}

/**
 * ElementTextarea component
 *
 * A styled textarea component with various sizes and states
 */
export const ElementTextarea = React.forwardRef<HTMLTextAreaElement, ElementTextareaProps>(
  ({
    className,
    hasError = false,
    size = 'md',
    fullWidth = true,
    ...props
  }, ref) => {
    // Determine the size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    // Combine all classes
    const textareaClasses = cn(
      'border rounded-md focus:outline-none focus:ring-2 transition-colors',
      hasError
        ? 'border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500',
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    );

    return (
      <textarea
        ref={ref}
        className={textareaClasses}
        {...props}
      />
    );
  }
);
ElementTextarea.displayName = 'ElementTextarea';

/**
 * ElementSelect props interface
 */
export interface ElementSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Whether the select has an error
   */
  hasError?: boolean;

  /**
   * The size of the select
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the select is full width
   */
  fullWidth?: boolean;
}

/**
 * ElementSelect component
 *
 * A styled select component with various sizes and states
 */
export const ElementSelect = React.forwardRef<HTMLSelectElement, ElementSelectProps>(
  ({
    className,
    hasError = false,
    size = 'md',
    fullWidth = true,
    children,
    ...props
  }, ref) => {
    // Determine the size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    // Combine all classes
    const selectClasses = cn(
      'border rounded-md focus:outline-none focus:ring-2 transition-colors appearance-none bg-white',
      hasError
        ? 'border-red-500 focus:ring-red-500 text-red-900'
        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500',
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    );

    return (
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }
);
ElementSelect.displayName = 'ElementSelect';
