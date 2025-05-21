import React, { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

/**
 * Card component variants using class-variance-authority
 * Modern, minimalist design with refined aesthetics
 */
const cardVariants = cva(
  // Base styles applied to all cards
  'relative overflow-hidden transition-all duration-250',
  {
    variants: {
      // Card variants with modern, minimalist aesthetics
      variant: {
        // Default card - Clean white with improved border contrast
        default: 'bg-white border border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700',

        // Outlined card - Transparent with improved border contrast
        outlined: 'bg-transparent border border-neutral-400 dark:border-neutral-600',

        // Elevated card - Enhanced shadow without border
        elevated: 'bg-white shadow-md border-none dark:bg-neutral-800',

        // Flat card - Subtle background color with improved contrast
        flat: 'bg-neutral-100 border-none dark:bg-neutral-800/50',

        // Frosted card - Subtle blur effect for overlays with improved contrast
        frosted: 'bg-white/90 backdrop-blur-md border border-white/30 dark:bg-neutral-800/90 dark:border-neutral-700/30',

        // Gradient card - Subtle gradient background with improved contrast
        gradient: 'bg-gradient-to-r from-primary-50 to-secondary-50 border-none dark:from-primary-900/20 dark:to-secondary-900/20',

        // Accent cards - With color accents and improved contrast
        accent: {
          primary: 'bg-white border-l-4 border border-neutral-300 border-l-primary-600 dark:bg-neutral-800 dark:border-neutral-700 dark:border-l-primary-500',
          secondary: 'bg-white border-l-4 border border-neutral-300 border-l-secondary-600 dark:bg-neutral-800 dark:border-neutral-700 dark:border-l-secondary-500',
          gold: 'bg-white border-l-4 border border-neutral-300 border-l-accent-gold-600 dark:bg-neutral-800 dark:border-neutral-700 dark:border-l-accent-gold-500',
          plum: 'bg-white border-l-4 border border-neutral-300 border-l-accent-plum-600 dark:bg-neutral-800 dark:border-neutral-700 dark:border-l-accent-plum-500',
          teal: 'bg-white border-l-4 border border-neutral-300 border-l-accent-teal-600 dark:bg-neutral-800 dark:border-neutral-700 dark:border-l-accent-teal-500',
        },
      },

      // Card padding with refined spacing
      padding: {
        none: 'p-0',
        xs: 'p-2',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
      },

      // Card hover effects with improved visual feedback
      hover: {
        none: '',
        lift: 'hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 focus:translate-y-[-2px] focus:shadow-sm',
        highlight: 'hover:border-primary-500 hover:shadow-sm transition-all duration-300 focus:border-primary-400',
        grow: 'hover:scale-[1.02] hover:shadow-md transition-all duration-300 focus:scale-[1.01] focus:shadow-sm',
        glow: 'hover:shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300 focus:shadow-md focus:shadow-primary-500/15',
        reveal: 'after:absolute after:inset-0 after:bg-primary-500/10 after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-300',
      },

      // Card radius options
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },

      // Card width options
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },

      // Card height options
      height: {
        auto: 'h-auto',
        full: 'h-full',
      },
    },

    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
      radius: 'lg',
      width: 'auto',
      height: 'auto',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Optional card title
   */
  title?: React.ReactNode;
  /**
   * Optional card subtitle
   */
  subtitle?: React.ReactNode;
  /**
   * Optional card footer
   */
  footer?: React.ReactNode;
  /**
   * Optional card image
   */
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'bottom' | 'background';
    overlay?: boolean;
    aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2' | '2:1';
  };
  /**
   * Optional card actions (buttons, links)
   */
  actions?: React.ReactNode;
  /**
   * Whether to add a divider between content and footer
   */
  withDivider?: boolean;
  /**
   * Whether to make the entire card clickable (requires onClick handler)
   */
  isClickable?: boolean;
}

/**
 * Card component for displaying content in a contained format
 * Modern, minimalist design with refined aesthetics
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hover,
      radius,
      width,
      height,
      title,
      subtitle,
      footer,
      image,
      actions,
      withDivider = false,
      isClickable = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    // Handle aspect ratio for images
    const getAspectRatioClass = () => {
      if (!image?.aspectRatio) return 'aspect-video'; // 16:9 default

      switch (image.aspectRatio) {
        case '1:1': return 'aspect-square';
        case '16:9': return 'aspect-video';
        case '4:3': return 'aspect-[4/3]';
        case '3:2': return 'aspect-[3/2]';
        case '2:1': return 'aspect-[2/1]';
        default: return 'aspect-video';
      }
    };

    return (
      <div
        className={cn(
          cardVariants({ variant, padding, hover, radius, width, height }),
          isClickable && 'cursor-pointer',
          className
        )}
        ref={ref}
        onClick={isClickable ? onClick : undefined}
        {...props}
      >
        {/* Background image */}
        {image && image.position === 'background' && (
          <div className="absolute inset-0 -z-10">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {image.overlay && (
              <div className="absolute inset-0 bg-neutral-900/40"></div>
            )}
          </div>
        )}

        {/* Top image */}
        {image && image.position !== 'bottom' && image.position !== 'background' && (
          <div className={cn("w-full overflow-hidden", getAspectRatioClass(), radius === 'lg' ? 'rounded-t-lg' : radius === 'xl' ? 'rounded-t-xl' : '')}>
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Card content */}
        <div className={padding === 'none' ? 'p-5' : ''}>
          {/* Title and subtitle */}
          {(title || subtitle) && (
            <div className="mb-3">
              {title && (
                <h3 className="font-heading font-semibold text-lg text-neutral-800 dark:text-neutral-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {subtitle}
                </div>
              )}
            </div>
          )}

          {/* Main content */}
          <div className="text-neutral-700 dark:text-neutral-300">
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="mt-4 flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Footer with optional divider */}
        {footer && (
          <div className={cn(
            'mt-auto',
            withDivider && 'border-t border-neutral-200 dark:border-neutral-700',
            padding === 'none' ? 'px-5 py-4' : 'pt-4'
          )}>
            {footer}
          </div>
        )}

        {/* Bottom image */}
        {image && image.position === 'bottom' && (
          <div className={cn("w-full overflow-hidden mt-4", getAspectRatioClass(), radius === 'lg' ? 'rounded-b-lg' : radius === 'xl' ? 'rounded-b-xl' : '')}>
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
