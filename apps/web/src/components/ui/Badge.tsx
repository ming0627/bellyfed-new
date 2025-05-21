import React, { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

/**
 * Badge component variants using class-variance-authority
 * Modern, minimalist design with refined aesthetics
 */
const badgeVariants = cva(
  // Base styles applied to all badges
  'inline-flex items-center justify-center font-medium transition-all duration-250',
  {
    variants: {
      // Badge variants with modern, minimalist aesthetics
      variant: {
        // Solid badges with improved contrast
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',

        // Soft badges with improved contrast
        soft: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
        'soft-secondary': 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
        'soft-gold': 'bg-accent-gold-100 text-accent-gold-800 hover:bg-accent-gold-200',
        'soft-plum': 'bg-accent-plum-100 text-accent-plum-800 hover:bg-accent-plum-200',
        'soft-teal': 'bg-accent-teal-100 text-accent-teal-800 hover:bg-accent-teal-200',

        // Outline badges with improved contrast
        outline: 'bg-transparent border border-neutral-400 text-neutral-800 hover:bg-neutral-50',
        'outline-primary': 'bg-transparent border border-primary-500 text-primary-700 hover:bg-primary-50',
        'outline-secondary': 'bg-transparent border border-secondary-500 text-secondary-700 hover:bg-secondary-50',

        // Semantic badges with improved contrast
        success: 'bg-success text-white hover:bg-success/90',
        warning: 'bg-warning text-neutral-900 hover:bg-warning/90',
        error: 'bg-error text-white hover:bg-error/90',
        info: 'bg-info text-white hover:bg-info/90',

        // Soft semantic badges with improved contrast
        'soft-success': 'bg-success/20 text-success hover:bg-success/30',
        'soft-warning': 'bg-warning/20 text-amber-800 hover:bg-warning/30',
        'soft-error': 'bg-error/20 text-error hover:bg-error/30',
        'soft-info': 'bg-info/20 text-info hover:bg-info/30',

        // Special badges
        premium: 'bg-accent-gold-500 text-neutral-900 hover:bg-accent-gold-600',
        verified: 'bg-success/10 text-success border border-success/20 hover:bg-success/15',
        new: 'bg-info/10 text-info border border-info/20 hover:bg-info/15',
        popular: 'bg-secondary-500/10 text-secondary-700 border border-secondary-500/20 hover:bg-secondary-500/15',
        ghost: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
      },

      // Badge sizes with refined proportions
      size: {
        xs: 'text-xs px-1.5 py-0.5 h-5',
        sm: 'text-xs px-2 py-0.5 h-6',
        md: 'text-sm px-2.5 py-0.5 h-7',
        lg: 'text-base px-3 py-1 h-8',
        xl: 'text-base px-4 py-1.5 h-9',
      },

      // Badge shapes
      shape: {
        rounded: 'rounded-md',
        pill: 'rounded-full',
        square: 'rounded-none',
      },

      // Badge hover effects
      hover: {
        none: '',
        grow: 'hover:scale-105 transition-transform',
        highlight: 'hover:brightness-105',
        darken: 'hover:brightness-95',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'pill',
      hover: 'none',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Optional icon to display before the badge text
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon to display after the badge text
   */
  rightIcon?: React.ReactNode;
  /**
   * Optional dot indicator
   */
  withDot?: boolean;
  /**
   * Dot color (only used if withDot is true)
   */
  dotColor?: string;
  /**
   * Whether the badge is removable
   */
  removable?: boolean;
  /**
   * Callback when remove button is clicked
   */
  onRemove?: () => void;
  /**
   * Whether the badge is interactive (adds cursor-pointer)
   */
  interactive?: boolean;
}

/**
 * Badge component for displaying status indicators and tags
 * Modern, minimalist design with refined aesthetics
 */
const Badge = ({
  className,
  variant,
  size,
  shape,
  hover,
  leftIcon,
  rightIcon,
  withDot = false,
  dotColor,
  removable = false,
  onRemove,
  interactive = false,
  children,
  ...props
}: BadgeProps) => {
  // Handle remove click
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <span
      className={cn(
        badgeVariants({ variant, size, shape, hover }),
        interactive && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Dot indicator */}
      {withDot && (
        <span
          className="mr-1.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}

      {/* Left icon */}
      {leftIcon && <span className="mr-1.5 flex-shrink-0">{leftIcon}</span>}

      {/* Content */}
      <span className="truncate">{children}</span>

      {/* Right icon */}
      {rightIcon && <span className="ml-1.5 flex-shrink-0">{rightIcon}</span>}

      {/* Remove button */}
      {removable && (
        <button
          type="button"
          className="ml-1.5 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          onClick={handleRemoveClick}
          aria-label="Remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </span>
  );
};

export { Badge, badgeVariants };
