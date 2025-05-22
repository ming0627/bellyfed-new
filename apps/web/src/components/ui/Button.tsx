import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

/**
 * Button component variants using class-variance-authority
 * Modern, minimalist design with subtle animations and refined aesthetics
 */
const buttonVariants = cva(
  // Base styles applied to all buttons
  'relative inline-flex items-center justify-center font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none overflow-hidden',
  {
    variants: {
      // Button variants with modern, minimalist aesthetics
      variant: {
        // Primary button - Orange with improved contrast
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm after:absolute after:inset-0 after:bg-white after:opacity-0 hover:after:opacity-10 after:transition-opacity',

        // Secondary button - Deeper peach-coral with improved contrast
        secondary:
          'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-sm after:absolute after:inset-0 after:bg-white after:opacity-0 hover:after:opacity-10 after:transition-opacity',

        // Outline button - Clean border with hover effect and improved contrast
        outline:
          'border border-neutral-400 bg-white hover:border-primary-500 hover:text-primary-700 active:bg-neutral-100 text-neutral-800 after:absolute after:inset-0 after:bg-primary-50 after:opacity-0 hover:after:opacity-30 after:transition-opacity',

        // Ghost button - Transparent with subtle hover and improved contrast
        ghost:
          'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 hover:text-primary-700',

        // Link button - Clean text link with improved contrast
        link: 'bg-transparent p-0 h-auto text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline',

        // Soft button - Improved contrast, gentle appearance
        soft: 'bg-primary-100 text-primary-800 hover:bg-primary-200 active:bg-primary-300 shadow-none',

        // Accent buttons - For special actions with improved contrast
        accent: {
          cream:
            'bg-accent-gold-600 text-white hover:bg-accent-gold-700 active:bg-accent-gold-800 shadow-sm after:absolute after:inset-0 after:bg-white after:opacity-0 hover:after:opacity-10 after:transition-opacity',
          plum: 'bg-accent-plum-600 text-white hover:bg-accent-plum-700 active:bg-accent-plum-800 shadow-sm after:absolute after:inset-0 after:bg-white after:opacity-0 hover:after:opacity-10 after:transition-opacity',
          azure:
            'bg-accent-teal-600 text-white hover:bg-accent-teal-700 active:bg-accent-teal-800 shadow-sm after:absolute after:inset-0 after:bg-white after:opacity-0 hover:after:opacity-10 after:transition-opacity',
        },

        // Gradient button - Sophisticated gradient background with improved contrast
        gradient:
          'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-md active:shadow-sm transition-shadow',

        // Semantic buttons with improved contrast
        success:
          'bg-success text-white hover:bg-success/90 active:bg-success/100 shadow-sm',
        warning:
          'bg-warning text-neutral-900 hover:bg-warning/90 active:bg-warning/100 shadow-sm',
        error:
          'bg-error text-white hover:bg-error/90 active:bg-error/100 shadow-sm',
        info: 'bg-info text-white hover:bg-info/90 active:bg-info/100 shadow-sm',
      },

      // Button sizes with refined proportions
      size: {
        xs: 'h-7 px-2.5 py-1 text-xs rounded',
        sm: 'h-9 px-3.5 py-1.5 text-sm rounded-md',
        md: 'h-10 px-4 py-2 text-sm rounded-md',
        lg: 'h-12 px-5 py-2.5 text-base rounded-lg',
        xl: 'h-14 px-6 py-3 text-lg rounded-lg',
        icon: {
          xs: 'h-7 w-7 p-1.5 rounded-full',
          sm: 'h-9 w-9 p-2 rounded-full',
          md: 'h-10 w-10 p-2.5 rounded-full',
          lg: 'h-12 w-12 p-3 rounded-full',
        },
      },

      // Button width options
      width: {
        default: '',
        full: 'w-full',
      },

      // Button shape options
      shape: {
        default: '',
        rounded: 'rounded-full',
        square: 'rounded-none',
      },

      // Button elevation options
      elevation: {
        none: 'shadow-none',
        low: 'shadow-sm',
        medium: 'shadow',
        high: 'shadow-md',
      },
    },

    // Compound variants for special combinations
    compoundVariants: [
      // Special styling for icon buttons
      {
        size: ['icon.xs', 'icon.sm', 'icon.md', 'icon.lg'],
        className: 'flex items-center justify-center p-0',
      },
    ],

    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'default',
      shape: 'default',
      elevation: 'low',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Optional icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  /**
   * Text to display when loading
   */
  loadingText?: string;
  /**
   * Optional ripple effect on click
   */
  withRipple?: boolean;
}

/**
 * Button component for user interactions
 * Modern, minimalist design with subtle animations and refined aesthetics
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      width,
      shape,
      elevation,
      leftIcon,
      rightIcon,
      isLoading = false,
      loadingText,
      withRipple = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Handle ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.className =
          'absolute rounded-full bg-white bg-opacity-30 pointer-events-none';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 600ms ease-out forwards';

        button.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 700);
      }

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, width, shape, elevation }),
          withRipple && 'overflow-hidden',
          className,
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        onClick={handleClick}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {leftIcon && !isLoading && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        <span className="relative">
          {isLoading && loadingText ? loadingText : children}
        </span>
        {rightIcon && !isLoading && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

// Add ripple animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export { Button, buttonVariants };
