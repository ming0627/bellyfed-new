'use client';

/**
 * Avatar Component
 *
 * An image element with a fallback for representing the user.
 * Based on Radix UI's Avatar primitive.
 */

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '../utils.js';

/**
 * Avatar props interface
 */
interface AvatarProps {
  /**
   * Additional class name for styling
   */
  className?: string;
}

/**
 * Avatar component
 *
 * The root component that wraps the avatar image and fallback
 */
export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & AvatarProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * AvatarImage component
 *
 * The image component of the avatar
 */
export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & AvatarProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * AvatarFallback component
 *
 * The fallback component shown when the avatar image fails to load
 */
export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & AvatarProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * AvatarWithInitials component
 *
 * A convenience component that displays an avatar with initials as fallback
 */
export interface AvatarWithInitialsProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  /**
   * The name to derive initials from
   */
  name?: string;

  /**
   * The image source URL
   */
  src?: string;

  /**
   * Alt text for the image
   */
  alt?: string;

  /**
   * Additional class name for the image
   */
  imageClassName?: string;

  /**
   * Additional class name for the fallback
   */
  fallbackClassName?: string;

  /**
   * Whether to delay showing the fallback to avoid flashing during loading
   */
  delayFallback?: boolean;
}

/**
 * AvatarWithInitials component
 *
 * A convenience component that displays an avatar with initials as fallback
 */
export const AvatarWithInitials = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  AvatarWithInitialsProps
>(({
  name,
  src,
  alt,
  imageClassName,
  fallbackClassName,
  delayFallback = true,
  ...props
}, ref) => {
  // Generate initials from name
  const initials = React.useMemo(() => {
    if (!name) return '';

    const nameParts = name.trim().split(/\s+/).filter(Boolean);

    if (nameParts.length === 0) return '';
    if (nameParts.length === 1 && nameParts[0]) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    if (!firstName || !lastName) return '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }, [name]);

  return (
    <Avatar ref={ref} {...props}>
      {src && (
        <AvatarImage
          src={src}
          alt={alt || name || 'Avatar'}
          className={imageClassName}
          onError={(e) => {
            // Prevent infinite error loop
            e.currentTarget.onerror = null;
            // Set src to empty to trigger fallback
            e.currentTarget.src = '';
          }}
        />
      )}
      <AvatarFallback
        delayMs={delayFallback ? 600 : 0}
        className={fallbackClassName}
      >
        {initials || (name ? name.charAt(0).toUpperCase() : '?')}
      </AvatarFallback>
    </Avatar>
  );
});
AvatarWithInitials.displayName = 'AvatarWithInitials';
