'use client';

/**
 * Card Component
 *
 * A versatile card component with header, content, and footer sections.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils.js';

/**
 * Card variants using class-variance-authority
 */
export const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow',
  {
    variants: {
      variant: {
        default: 'shadow',
        outline: 'border border-input shadow-sm',
        ghost: 'border-none shadow-none',
        elevated: 'shadow-lg',
        interactive: 'hover:shadow-lg transition-shadow duration-200',
      },
      padding: {
        default: '',
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  },
);

/**
 * Card props interface
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Whether the card is interactive (clickable)
   */
  interactive?: boolean;

  /**
   * The URL to navigate to when the card is clicked
   */
  href?: string;

  /**
   * Whether to open the link in a new tab
   */
  openInNewTab?: boolean;
}

/**
 * Card component
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    padding,
    interactive = false,
    href,
    openInNewTab,
    ...props
  }, ref) => {
    const interactiveVariant = interactive && !variant ? 'interactive' : variant;

    if (href) {
      // Extract anchor-specific props and filter out div-specific props
      const { onCopy, onCut, onPaste, onCompositionStart, onCompositionEnd, onCompositionUpdate, ...anchorProps } = props;

      return (
        <a
          className={cn(
            cardVariants({ variant: interactiveVariant, padding, className }),
            'cursor-pointer',
          )}
          href={href}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          {...anchorProps as React.AnchorHTMLAttributes<HTMLAnchorElement>}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant: interactiveVariant, padding, className }),
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

/**
 * CardHeader props interface
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to center the header content
   */
  centered?: boolean;
}

/**
 * CardHeader component
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, centered = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6',
        centered && 'items-center text-center',
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

/**
 * CardTitle props interface
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The HTML tag to use for the title
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * CardTitle component
 */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Comp = 'h3', ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

/**
 * CardDescription component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * CardContent props interface
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to remove padding from the content
   */
  noPadding?: boolean;
}

/**
 * CardContent component
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        noPadding ? 'px-0' : 'p-6 pt-0',
        className
      )}
      {...props}
    />
  ),
);
CardContent.displayName = 'CardContent';

/**
 * CardFooter props interface
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to center the footer content
   */
  centered?: boolean;

  /**
   * Whether to align the footer content to the right
   */
  alignRight?: boolean;
}

/**
 * CardFooter component
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, centered = false, alignRight = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0',
        centered && 'justify-center',
        alignRight && 'justify-end',
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

/**
 * LinkCard component
 *
 * A convenience component for creating a card that links to another page
 */
export interface LinkCardProps {
  /**
   * The title of the card
   */
  title: React.ReactNode;

  /**
   * The description of the card
   */
  description?: React.ReactNode;

  /**
   * The icon to display in the card
   */
  icon?: React.ReactNode;

  /**
   * The URL to navigate to when the card is clicked
   */
  href: string;

  /**
   * Whether to open the link in a new tab
   */
  openInNewTab?: boolean;

  /**
   * The footer content
   */
  footer?: React.ReactNode;

  /**
   * Additional class name
   */
  className?: string;

  /**
   * Card variant
   */
  variant?: VariantProps<typeof cardVariants>['variant'];

  /**
   * Card padding
   */
  padding?: VariantProps<typeof cardVariants>['padding'];

  /**
   * Additional props
   */
  [key: string]: any;
}

/**
 * LinkCard component
 */
export function LinkCard({
  title,
  description,
  icon,
  href,
  openInNewTab = false,
  footer,
  className,
  variant = 'interactive',
  ...props
}: LinkCardProps): React.ReactElement {
  return (
    <Card
      href={href}
      openInNewTab={openInNewTab}
      variant={variant}
      className={className}
      {...props}
    >
      <CardHeader>
        {icon && <div className="mb-2">{icon}</div>}
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
