/**
 * Next.js Type Definitions
 *
 * This file contains type definitions for Next.js components and utilities
 * that are used across the application.
 */

/**
 * NextRouter interface
 * Represents the Next.js router object
 */
export interface NextRouter {
  /**
   * Current route path
   */
  pathname: string;
  
  /**
   * Current route with query parameters
   */
  asPath: string;
  
  /**
   * Query parameters
   */
  query: Record<string, string | string[] | undefined>;
  
  /**
   * Push a new route to the history stack
   */
  push: (
    url: string | { pathname: string; query?: Record<string, any> },
    as?: string,
    options?: any
  ) => Promise<boolean>;
  
  /**
   * Replace the current route in the history stack
   */
  replace: (
    url: string | { pathname: string; query?: Record<string, any> },
    as?: string,
    options?: any
  ) => Promise<boolean>;
  
  /**
   * Reload the current page
   */
  reload: () => void;
  
  /**
   * Go back to the previous route
   */
  back: () => void;
  
  /**
   * Prefetch a page for faster client-side transitions
   */
  prefetch: (url: string) => Promise<void>;
  
  /**
   * Events for route changes
   */
  events: {
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
    emit: (event: string, ...args: any[]) => void;
  };
  
  /**
   * Whether the router is ready
   */
  isReady: boolean;
  
  /**
   * Whether the router is currently in the process of a route change
   */
  isFallback: boolean;
  
  /**
   * Base path
   */
  basePath: string;
  
  /**
   * Locale
   */
  locale?: string;
  
  /**
   * All available locales
   */
  locales?: string[];
  
  /**
   * Default locale
   */
  defaultLocale?: string;
  
  /**
   * Domain locale
   */
  domainLocales?: any[];
  
  /**
   * Whether the router is in preview mode
   */
  isPreview: boolean;
};
