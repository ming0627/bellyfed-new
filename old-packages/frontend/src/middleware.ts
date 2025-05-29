import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Function to add security headers to a response
  const addSecurityHeaders = (response: NextResponse): NextResponse => {
    // Add Content Security Policy headers
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: https://* blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com; connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://*.execute-api.*.amazonaws.com https://*.bellyfed.com; font-src 'self' data: https://stackpath.bootstrapcdn.com https://fonts.gstatic.com; frame-ancestors 'none'; object-src 'none';",
    );

    // Add other security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  };

  // Skip middleware for api routes, _next routes, admin routes, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') || // Skip middleware for admin routes
    pathname.includes('.') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/confirm-account') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/press') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/cookies') ||
    pathname.startsWith('/accessibility')
  ) {
    // Log for debugging API routes
    if (pathname.startsWith('/api')) {
      console.log(
        `[Middleware] Skipping middleware for API route: ${pathname}`,
      );
    }

    // Add security headers even for these routes
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Check if the path already has a valid country code
  const pathSegments = pathname.split('/').filter(Boolean);
  const hasCountryCode = pathSegments[0] === 'my' || pathSegments[0] === 'sg';

  if (hasCountryCode) {
    // Check if this path should be protected
    // List of public paths that don't require authentication
    const publicPaths = [
      '/signin',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/confirm-account',
      '/terms',
      '/privacy',
      '/about',
      '/contact',
      '/help',
      '/faq',
      '/blog',
      '/news',
      '/press',
      '/careers',
      '/legal',
      '/cookies',
      '/accessibility',
    ];

    // Check if the path is a country home page (e.g., /my, /sg)
    const isCountryHomePage = pathSegments.length === 1;

    // Path is protected if it's not in the publicPaths list and it's not a country home page
    const shouldProtect =
      !publicPaths.some((publicPath: string) =>
        pathname.startsWith(`/${pathSegments[0]}${publicPath}`),
      ) && !isCountryHomePage;

    // Check if user is authenticated by looking for auth tokens in cookies
    // Check for the specific auth cookies (all HttpOnly)
    const accessToken = request.cookies.get('access_token');
    const idToken = request.cookies.get('id_token');
    // Check for refresh token which indicates a previously authenticated session
    const refreshToken = request.cookies.get('refresh_token');

    // Also check for auth_email cookie which is set during login
    const authEmail = request.cookies.get('auth_email');

    // Log cookie information for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Auth check for ${pathname}:`, {
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken,
        hasRefreshToken: !!refreshToken,
        hasAuthEmail: !!authEmail,
        cookies: [...request.cookies.getAll().map((c) => c.name)],
        shouldProtect,
        country: pathSegments[0],
      });
    }

    // User is authenticated if they have any of:
    // 1. Both access and ID tokens, AND an auth_email cookie, OR
    // 2. A valid refresh token AND an auth_email cookie (which allows refresh to work)
    // 3. Just a refresh token (more lenient to allow refresh to work)
    //
    // This allows the refresh mechanism to work even if access/ID tokens have expired
    const hasTokens = !!(accessToken && idToken && authEmail);
    const hasRefreshCredentials = !!(refreshToken && authEmail);
    const hasOnlyRefreshToken = !!refreshToken;

    // Log minimal authentication details in development
    if (process.env.NODE_ENV === 'development' && shouldProtect) {
      console.log(`[Middleware] Auth check for protected path: ${pathname}`);
    }

    const isAuthenticated =
      hasTokens || hasRefreshCredentials || hasOnlyRefreshToken;

    // If the path should be protected and user is not authenticated, redirect to signin
    if (shouldProtect && !isAuthenticated) {
      // Create the signin URL with return URL as a query parameter
      const signinUrl = new URL('/signin', request.url);
      signinUrl.searchParams.set('returnUrl', pathname);
      signinUrl.searchParams.set('country', pathSegments[0]);

      // Redirect to signin
      const response = NextResponse.redirect(signinUrl);
      return addSecurityHeaders(response);
    }

    // For home page or authenticated users, continue normally
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Default to Malaysia if no country code is present
  const url = request.nextUrl.clone();

  // If it's the root path (/), just add the country code
  if (pathname === '/') {
    url.pathname = '/my';
  } else {
    // For other paths, add the country code as the first segment
    url.pathname = `/my${pathname}`;
  }

  // Create redirect response with security headers
  const response = NextResponse.redirect(url);
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin routes)
     * - Public pages (auth, legal, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|signin|signup|forgot-password|reset-password|verify-email|confirm-account|terms|privacy|about|contact|help|faq|blog|news|press|careers|legal|cookies|accessibility).*)',
  ],
};
