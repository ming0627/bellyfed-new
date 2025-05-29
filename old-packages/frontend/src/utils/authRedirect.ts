/**
 * Authentication Redirection Utilities
 *
 * This module provides standardized functions for handling authentication-related redirects.
 * It ensures consistent behavior across the application for redirecting users to signin/signup
 * pages and back to their original destination after authentication.
 */

import { NextRouter } from 'next/router';

/**
 * Extracts the country code from a path
 * @param path The path to extract the country code from
 * @returns The country code or 'my' as default
 */
export const extractCountryCode = (path: string): string => {
  const pathSegments = path.split('/').filter(Boolean);
  return pathSegments[0] === 'my' || pathSegments[0] === 'sg'
    ? pathSegments[0]
    : 'my';
};

/**
 * Redirects an unauthenticated user to the signin page
 * @param router Next.js router instance
 * @param options Optional configuration
 */
export const redirectToSignin = (
  router: NextRouter,
  options?: {
    returnUrl?: string;
    message?: string;
    replace?: boolean;
  },
): void => {
  const currentPath = options?.returnUrl || router.asPath;
  const countryCode = extractCountryCode(currentPath);

  // Build query parameters
  const query: Record<string, string> = {
    returnUrl: currentPath,
    country: countryCode,
  };

  // Add optional message if provided
  if (options?.message) {
    query.message = options.message;
  }

  // Use router.replace or router.push based on the replace option
  const routerMethod = options?.replace ? router.replace : router.push;

  // Redirect to signin
  routerMethod({
    pathname: '/signin',
    query,
  });
};

/**
 * Redirects an unauthenticated user to the signup page
 * @param router Next.js router instance
 * @param options Optional configuration
 */
export const redirectToSignup = (
  router: NextRouter,
  options?: {
    returnUrl?: string;
    message?: string;
    replace?: boolean;
  },
): void => {
  const currentPath = options?.returnUrl || router.asPath;
  const countryCode = extractCountryCode(currentPath);

  // Build query parameters
  const query: Record<string, string> = {
    returnUrl: currentPath,
    country: countryCode,
  };

  // Add optional message if provided
  if (options?.message) {
    query.message = options.message;
  }

  // Use router.replace or router.push based on the replace option
  const routerMethod = options?.replace ? router.replace : router.push;

  // Redirect to signup
  routerMethod({
    pathname: '/signup',
    query,
  });
};

/**
 * Redirects an authenticated user to their intended destination
 * @param router Next.js router instance
 * @param options Optional configuration
 */
export const redirectAfterAuth = (
  router: NextRouter,
  options?: {
    defaultPath?: string;
    replace?: boolean;
  },
): void => {
  // Get returnUrl from query parameters
  const returnUrl = router.query.returnUrl as string;
  const country = (router.query.country as string) || 'my';

  // Determine the destination path
  let destinationPath = returnUrl;

  // If no returnUrl is provided, use the default path or country home page
  if (!destinationPath) {
    destinationPath = options?.defaultPath || `/${country}`;
  }

  // Use router.replace or router.push based on the replace option
  const routerMethod = options?.replace ? router.replace : router.push;

  // Redirect to the destination
  routerMethod(destinationPath);
};

/**
 * Checks if a path should be protected (requires authentication)
 * @param path The path to check
 * @returns True if the path should be protected, false otherwise
 */
export const shouldProtectPath = (path: string): boolean => {
  // Extract the path without query parameters
  const pathWithoutQuery = path.split('?')[0];

  // List of public paths that don't require authentication
  const publicPaths = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/terms',
    '/privacy',
    '/about',
    '/contact',
    '/help',
    '/faq',
  ];

  // Check if the path is a country home page (e.g., /my, /sg)
  const pathSegments = pathWithoutQuery.split('/').filter(Boolean);
  const isCountryHomePage =
    pathSegments.length === 1 &&
    (pathSegments[0] === 'my' || pathSegments[0] === 'sg');

  // Path is public if it's in the publicPaths list or it's a country home page
  return (
    !publicPaths.some((publicPath) =>
      pathWithoutQuery.startsWith(publicPath),
    ) && !isCountryHomePage
  );
};
