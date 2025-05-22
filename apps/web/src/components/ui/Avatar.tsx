import React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

/**
 * Avatar component variants using class-variance-authority
 * Modern, minimalist design with refined aesthetics
 */
const avatarVariants = cva(
  // Base styles applied to all avatars
  'relative inline-flex items-center justify-center overflow-hidden bg-neutral-100 transition-all duration-250',
  {
    variants: {
      // Avatar sizes with refined proportions
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
        '3xl': 'h-24 w-24 text-2xl',
      },

      // Avatar shapes
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
        rounded: 'rounded-xl',
      },

      // Avatar status indicators with refined styling
      status: {
        online:
          'after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:bg-success after:ring-2 after:ring-white dark:after:ring-neutral-800',
        offline:
          'after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:bg-neutral-300 after:ring-2 after:ring-white dark:after:ring-neutral-800',
        away: 'after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:bg-warning after:ring-2 after:ring-white dark:after:ring-neutral-800',
        busy: 'after:absolute after:bottom-0 after:right-0 after:h-2.5 after:w-2.5 after:rounded-full after:bg-error after:ring-2 after:ring-white dark:after:ring-neutral-800',
        verified:
          'after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:bg-white after:flex after:items-center after:justify-center after:text-[8px] after:text-success after:content-["✓"] after:ring-2 after:ring-success',
        premium:
          'after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:bg-premium after:ring-2 after:ring-white dark:after:ring-neutral-800',
      },

      // Avatar border styles
      border: {
        none: '',
        thin: 'ring-1 ring-neutral-200 dark:ring-neutral-700',
        thick: 'ring-2 ring-white dark:ring-neutral-800',
        accent: 'ring-2 ring-primary-500',
      },

      // Avatar hover effects
      hover: {
        none: '',
        grow: 'hover:scale-110 transition-transform',
        highlight: 'hover:ring-2 hover:ring-primary-300',
        glow: 'hover:ring-2 hover:ring-primary-300 hover:shadow-primary',
      },

      // Avatar background styles for fallback
      background: {
        default: 'bg-primary-100 text-primary-800',
        gradient: 'bg-gradient-primary text-white',
        neutral: 'bg-neutral-200 text-neutral-700',
        secondary: 'bg-secondary-100 text-secondary-800',
      },
    },

    defaultVariants: {
      size: 'md',
      shape: 'circle',
      border: 'none',
      hover: 'none',
      background: 'default',
    },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /**
   * Image source URL
   */
  src?: string;
  /**
   * Alt text for the avatar image
   */
  alt?: string;
  /**
   * Fallback text to display when image is not available (usually initials)
   */
  fallback?: string;
  /**
   * Optional additional className
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Whether the avatar is interactive (adds cursor-pointer)
   */
  interactive?: boolean;
  /**
   * Optional badge content to display
   */
  badge?: React.ReactNode;
  /**
   * Optional badge position
   */
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Avatar component for displaying user profile images
 * Modern, minimalist design with refined aesthetics
 */
const Avatar = ({
  className,
  size,
  shape,
  status,
  border,
  hover,
  background,
  src,
  alt = 'Avatar',
  fallback,
  onClick,
  interactive = false,
  badge,
  badgePosition = 'top-right',
  ...props
}: AvatarProps) => {
  const [imageError, setImageError] = React.useState(!src);

  const handleImageError = () => {
    setImageError(true);
  };

  // Generate initials from fallback text
  const getInitials = () => {
    if (!fallback) return '';

    const words = fallback.trim().split(' ');
    if (words.length === 1) {
      return fallback.substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Badge position classes
  const getBadgePositionClasses = () => {
    switch (badgePosition) {
      case 'top-right':
        return 'top-0 right-0 -translate-y-1/3 translate-x-1/3';
      case 'top-left':
        return 'top-0 left-0 -translate-y-1/3 -translate-x-1/3';
      case 'bottom-right':
        return 'bottom-0 right-0 translate-y-1/3 translate-x-1/3';
      case 'bottom-left':
        return 'bottom-0 left-0 translate-y-1/3 -translate-x-1/3';
      default:
        return 'top-0 right-0 -translate-y-1/3 translate-x-1/3';
    }
  };

  return (
    <div
      className={cn(
        avatarVariants({ size, shape, status, border, hover, background }),
        interactive && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {!imageError && src ? (
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          onError={handleImageError}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium">
          {getInitials()}
        </span>
      )}

      {/* Custom badge */}
      {badge && (
        <div
          className={cn(
            'absolute z-10 flex items-center justify-center',
            getBadgePositionClasses(),
          )}
        >
          {badge}
        </div>
      )}
    </div>
  );
};

export { Avatar, avatarVariants };
