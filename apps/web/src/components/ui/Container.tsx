import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width constraint for the container
   * @default 'max-w-7xl'
   */
  maxWidth?: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  /**
   * Whether to add padding to the container
   * @default true
   */
  withPadding?: boolean;
  /**
   * Padding size for the container
   * @default 'default'
   */
  padding?: 'none' | 'small' | 'default' | 'large';
  /**
   * Whether to center the container
   * @default true
   */
  centered?: boolean;
}

/**
 * Container component for layout consistency
 * Provides a responsive container with configurable max-width and padding
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      maxWidth = 'max-w-7xl',
      withPadding = true,
      padding = 'default',
      centered = true,
      children,
      ...props
    },
    ref
  ) => {
    // Get padding classes based on padding size
    const getPaddingClasses = () => {
      if (!withPadding) return '';

      switch (padding) {
        case 'none':
          return '';
        case 'small':
          return 'px-4 py-4 sm:px-6 sm:py-6';
        case 'default':
          return 'px-4 py-8 sm:px-6 sm:py-10';
        case 'large':
          return 'px-4 py-12 sm:px-6 sm:py-16';
        default:
          return 'px-4 py-8 sm:px-6 sm:py-10';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          maxWidth,
          centered && 'mx-auto',
          getPaddingClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
