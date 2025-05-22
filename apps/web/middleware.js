import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/settings',
  '/restaurants/[id]/review',
  '/collections/create',
  '/collections/edit',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/signin',
  '/signup',
  '/explore',
  '/search',
  '/restaurants',
  '/dishes',
  '/social',
  '/competitions',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/api',
  '/_next',
  '/favicon.ico',
];

/**
 * Middleware function to handle authentication protection
 *
 * @param {Object} request - Next.js request object
 * @returns {NextResponse} - Next.js response object
 */
export function middleware(request) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Extract country code from the pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const countryCode = pathSegments[0];

  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(`/${countryCode}${route}`))) {
    return NextResponse.next();
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => {
    // Handle dynamic routes by replacing [param] with a regex pattern
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^/${countryCode}${routePattern}($|/)`);
    return regex.test(pathname);
  });

  if (isProtectedRoute) {
    // Check if the user is authenticated
    // In a real app, this would check for a valid session token
    // For now, we'll use a mock authentication check
    const isAuthenticated = checkAuthentication(request);

    if (!isAuthenticated) {
      // Redirect to the sign-in page with a callback URL
      const signInUrl = new URL(`/${countryCode}/signin`, request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Check if the user is authenticated
 *
 * @param {Object} request - Next.js request object
 * @returns {boolean} - Whether the user is authenticated
 */
function checkAuthentication(request) {
  // Check for Cognito authentication tokens in cookies
  const cookies = request.cookies;
  const accessToken = cookies.get('access_token');
  const idToken = cookies.get('id_token');
  const refreshToken = cookies.get('refresh_token');
  const authEmail = cookies.get('auth_email');

  // User is authenticated if they have any of:
  // 1. Both access and ID tokens, AND an auth_email cookie, OR
  // 2. A valid refresh token AND an auth_email cookie (which allows refresh to work)
  const hasTokens = !!(accessToken && idToken && authEmail);
  const hasRefreshCredentials = !!(refreshToken && authEmail);

  return hasTokens || hasRefreshCredentials;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
