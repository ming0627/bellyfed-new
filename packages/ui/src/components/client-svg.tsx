'use client';

/**
 * Client-side SVG Component
 *
 * A component that renders SVG elements only on the client side.
 * This helps prevent hydration errors when SVG elements have dynamic attributes.
 */

import * as React from 'react';

import { ClientOnly } from './client-only.js';

/**
 * ClientSVG props interface
 */
export interface ClientSVGProps extends Omit<React.SVGProps<SVGSVGElement>, 'aria-hidden'> {
  /**
   * SVG viewBox attribute
   */
  viewBox?: string;

  /**
   * SVG child elements (paths, etc.)
   */
  children: React.ReactNode;

  /**
   * Optional fallback content to render during SSR
   */
  fallback?: React.ReactNode;

  /**
   * Optional width of the SVG
   */
  width?: string | number;

  /**
   * Optional height of the SVG
   */
  height?: string | number;

  /**
   * Optional title for accessibility
   */
  title?: string;

  /**
   * Optional description for accessibility
   */
  description?: string;

  /**
   * Optional ARIA label for accessibility
   */
  'aria-label'?: string;

  /**
   * Optional ARIA hidden attribute
   */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * ClientSVG component
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function ClientSVG({
  viewBox = '0 0 24 24',
  children,
  fallback = null,
  width = 24,
  height = 24,
  title,
  description,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...props
}: ClientSVGProps): React.ReactElement {
  // Generate unique IDs for title and description
  const titleId = React.useId();
  const descId = React.useId();

  // Determine if we need to add accessibility attributes
  const needsA11y = title || description || ariaLabel;
  const a11yProps = needsA11y
    ? {
        role: 'img',
        'aria-labelledby': title ? titleId : undefined,
        'aria-describedby': description ? descId : undefined,
        'aria-label': ariaLabel,
        'aria-hidden': ariaHidden,
      }
    : {
        'aria-hidden': ariaHidden ?? true,
      };

  return (
    <ClientOnly fallback={fallback}>
      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        {...a11yProps}
        {...props}
      >
        {title && <title id={titleId}>{title}</title>}
        {description && <desc id={descId}>{description}</desc>}
        {children}
      </svg>
    </ClientOnly>
  );
}

/**
 * withClientSVG higher-order component
 *
 * Wraps an SVG component to make it client-only
 *
 * @param Component - The SVG component to wrap
 * @param fallback - Optional fallback content
 * @returns A new component that only renders on the client
 */
export function withClientSVG<P extends React.SVGProps<SVGSVGElement>>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = null
): React.FC<P> {
  const WithClientSVG: React.FC<P> = (props) => (
    <ClientOnly fallback={fallback}>
      <Component {...props} />
    </ClientOnly>
  );

  WithClientSVG.displayName = `withClientSVG(${Component.displayName || Component.name || 'SVGComponent'})`;

  return WithClientSVG;
}

/**
 * Common SVG icons that can be used throughout the application
 */
export const Icons = {
  /**
   * Star icon (filled)
   */
  Star: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </ClientSVG>
  ),

  /**
   * Star outline icon
   */
  StarOutline: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </ClientSVG>
  ),

  /**
   * Verified icon
   */
  Verified: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Verified"
      {...props}
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </ClientSVG>
  ),

  /**
   * Copy link icon
   */
  CopyLink: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-label="Copy link"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      />
    </ClientSVG>
  ),

  /**
   * Twitter icon
   */
  Twitter: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Twitter"
      {...props}
    >
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </ClientSVG>
  ),

  /**
   * Facebook icon
   */
  Facebook: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Facebook"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </ClientSVG>
  ),

  /**
   * WhatsApp icon
   */
  WhatsApp: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="WhatsApp"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </ClientSVG>
  ),

  /**
   * Menu icon
   */
  Menu: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-label="Menu"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </ClientSVG>
  ),

  /**
   * Close icon
   */
  Close: (props: React.SVGProps<SVGSVGElement>) => (
    <ClientSVG
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-label="Close"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </ClientSVG>
  ),
};
