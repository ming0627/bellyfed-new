'use client';

/**
 * Badge Component
 *
 * A small visual indicator used to highlight an item, indicate status, or emphasize information.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../utils.js';

/**
 * Badge variants using class-variance-authority
 */
export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-500 text-white shadow hover:bg-green-600',
        warning:
          'border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600',
        info:
          'border-transparent bg-blue-500 text-white shadow hover:bg-blue-600',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[0.625rem]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * Badge props interface
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Whether the badge is interactive
   */
  interactive?: boolean;
}

/**
 * Badge component
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function Badge({
  className,
  variant,
  size,
  interactive = false,
  ...props
}: BadgeProps): JSX.Element {
  if (interactive) {
    return (
      <button
        type="button"
        className={cn(
          badgeVariants({ variant, size }),
          'cursor-pointer focus:ring-2',
          className
        )}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }

  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * CountBadge component
 *
 * A specialized badge for displaying counts
 */
export interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  /**
   * The count to display
   */
  count: number;

  /**
   * The maximum count to display before showing a + symbol
   */
  max?: number;

  /**
   * Whether to hide the badge when count is 0
   */
  hideZero?: boolean;
}

/**
 * CountBadge component
 *
 * @param props - Component props
 * @returns JSX.Element or null
 */
export function CountBadge({
  count,
  max = 99,
  hideZero = false,
  ...props
}: CountBadgeProps): JSX.Element | null {
  // Hide badge if count is 0 and hideZero is true
  if (count === 0 && hideZero) {
    return null;
  }

  // Format the display text
  const displayText = count > max ? `${max}+` : count.toString();

  return <Badge {...props}>{displayText}</Badge>;
}

/**
 * StatusBadge component
 *
 * A specialized badge for displaying status
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  /**
   * The status to display
   */
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
}

/**
 * StatusBadge component
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function StatusBadge({
  status,
  ...props
}: StatusBadgeProps): JSX.Element {
  // Map status to variant
  const variantMap: Record<StatusBadgeProps['status'], BadgeProps['variant']> = {
    success: 'success',
    warning: 'warning',
    error: 'destructive',
    info: 'info',
    default: 'default',
  };

  return <Badge variant={variantMap[status]} {...props} />;
}
