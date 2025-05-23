/**
 * Authentication Redirection Utilities
 *
 * This module provides standardized functions for handling authentication-related redirects.
 * It ensures consistent behavior across the application for redirecting users to signin/signup
 * pages and back to their original destination after authentication.
 */

/**
 * Extracts the country code from a path
 * @param {string} path The path to extract the country code from
 * @returns {string} The country code or 'my' as default
 */
export const extractCountryCode = (path) => {
  const pathSegments = path.split('/').filter(Boolean)
  return pathSegments[0] === 'my' || pathSegments[0] === 'sg'
    ? pathSegments[0]
    : 'my'
}

/**
 * Builds a return URL with proper encoding
 * @param {string} path The path to encode as return URL
 * @returns {string} The encoded return URL
 */
export const buildReturnUrl = (path) => {
  // Remove any existing returnUrl parameter to avoid nested redirects
  const url = new URL(path, 'http://localhost')
  url.searchParams.delete('returnUrl')
  return url.pathname + url.search
}

/**
 * Redirects an unauthenticated user to the signin page
 * @param {object} router Next.js router instance
 * @param {object} options Optional configuration
 */
export const redirectToSignin = (router, options = {}) => {
  const currentPath = options?.returnUrl || router.asPath
  const countryCode = extractCountryCode(currentPath)

  // Build query parameters
  const query = {
    returnUrl: buildReturnUrl(currentPath),
    country: countryCode,
  }

  // Add optional message if provided
  if (options?.message) {
    query.message = options.message
  }

  // Use router.replace or router.push based on the replace option
  const routerMethod = options?.replace ? router.replace : router.push

  // Redirect to signin
  routerMethod({
    pathname: '/signin',
    query,
  })
}

/**
 * Redirects an unauthenticated user to the signup page
 * @param {object} router Next.js router instance
 * @param {object} options Optional configuration
 */
export const redirectToSignup = (router, options = {}) => {
  const currentPath = options?.returnUrl || router.asPath
  const countryCode = extractCountryCode(currentPath)

  // Build query parameters
  const query = {
    returnUrl: buildReturnUrl(currentPath),
    country: countryCode,
  }

  // Add optional message if provided
  if (options?.message) {
    query.message = options.message
  }

  // Use router.replace or router.push based on the replace option
  const routerMethod = options?.replace ? router.replace : router.push

  // Redirect to signup
  routerMethod({
    pathname: '/signup',
    query,
  })
}

/**
 * Redirects after successful authentication
 * @param {object} router Next.js router instance
 * @param {object} options Optional configuration
 */
export const redirectAfterAuth = (router, options = {}) => {
  // Get the return URL from query parameters
  const returnUrl = router.query.returnUrl || options?.returnUrl
  const countryCode = extractCountryCode(router.asPath)

  // Determine the destination path
  let destinationPath = `/${countryCode}`

  if (returnUrl && typeof returnUrl === 'string') {
    // Validate that the return URL is safe (same origin)
    if (isValidReturnUrl(returnUrl)) {
      destinationPath = returnUrl
    }
  }

  // Use router.replace or router.push based on the replace option
  const routerMethod = options?.replace ? router.replace : router.push

  // Redirect to the destination
  routerMethod(destinationPath)
}

/**
 * Validates that a return URL is safe to redirect to
 * @param {string} url The URL to validate
 * @returns {boolean} Whether the URL is safe
 */
export const isValidReturnUrl = (url) => {
  try {
    // Must be a relative URL (starts with /)
    if (!url.startsWith('/')) {
      return false
    }

    // Must not be a protocol-relative URL (starts with //)
    if (url.startsWith('//')) {
      return false
    }

    // Must not contain dangerous characters
    if (url.includes('<') || url.includes('>') || url.includes('"')) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating return URL:', error)
    return false
  }
}

/**
 * Checks if a path should be protected (requires authentication)
 * @param {string} path The path to check
 * @returns {boolean} True if the path should be protected, false otherwise
 */
export const shouldProtectPath = (path) => {
  // Extract the path without query parameters
  const pathWithoutQuery = path.split('?')[0]

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
  ]

  // Check if the path (without country prefix) is in the public paths
  const pathSegments = pathWithoutQuery.split('/').filter(Boolean)
  const pathWithoutCountry = pathSegments.length > 1 ? `/${pathSegments.slice(1).join('/')}` : pathWithoutQuery

  return !publicPaths.includes(pathWithoutCountry) && !publicPaths.includes(pathWithoutQuery)
}

/**
 * Redirects to the appropriate page based on authentication status
 * @param {object} router Next.js router instance
 * @param {boolean} isAuthenticated Whether the user is authenticated
 * @param {object} options Optional configuration
 */
export const handleAuthRedirect = (router, isAuthenticated, options = {}) => {
  const path = router.asPath

  // If the path should be protected and the user is not authenticated, redirect to signin
  if (shouldProtectPath(path) && !isAuthenticated) {
    redirectToSignin(router, options)
    return
  }

  // If the user is authenticated and trying to access an auth page, redirect to home
  if (isAuthenticated && (path.startsWith('/signin') || path.startsWith('/signup'))) {
    redirectAfterAuth(router, options)
    return
  }
}

/**
 * Gets the appropriate redirect URL for the current context
 * @param {object} router Next.js router instance
 * @param {boolean} isAuthenticated Whether the user is authenticated
 * @returns {string|null} The redirect URL or null if no redirect needed
 */
export const getRedirectUrl = (router, isAuthenticated) => {
  const path = router.asPath

  // If the path should be protected and the user is not authenticated
  if (shouldProtectPath(path) && !isAuthenticated) {
    const countryCode = extractCountryCode(path)
    const query = new URLSearchParams({
      returnUrl: buildReturnUrl(path),
      country: countryCode,
    })
    return `/signin?${query.toString()}`
  }

  // If the user is authenticated and trying to access an auth page
  if (isAuthenticated && (path.startsWith('/signin') || path.startsWith('/signup'))) {
    const returnUrl = router.query.returnUrl
    const countryCode = extractCountryCode(path)
    
    if (returnUrl && typeof returnUrl === 'string' && isValidReturnUrl(returnUrl)) {
      return returnUrl
    }
    
    return `/${countryCode}`
  }

  return null
}

/**
 * Creates a protected route wrapper that handles authentication redirects
 * @param {function} Component The component to protect
 * @param {object} options Protection options
 * @returns {function} A wrapped component with authentication protection
 */
export const withAuthRedirect = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    const router = typeof window !== 'undefined' ? require('next/router').useRouter() : null
    const { isAuthenticated, isLoading } = props.auth || {}

    // Don't redirect during SSR or while loading
    if (typeof window === 'undefined' || isLoading) {
      return <Component {...props} />
    }

    // Handle authentication redirects
    if (router) {
      const redirectUrl = getRedirectUrl(router, isAuthenticated)
      if (redirectUrl) {
        router.replace(redirectUrl)
        return null // Don't render anything while redirecting
      }
    }

    return <Component {...props} />
  }
}

/**
 * Builds authentication URLs with proper country and return URL handling
 * @param {string} type The type of auth URL ('signin' or 'signup')
 * @param {object} options URL building options
 * @returns {string} The complete authentication URL
 */
export const buildAuthUrl = (type, options = {}) => {
  const { returnUrl, country = 'my', message } = options
  const query = new URLSearchParams()

  if (returnUrl) {
    query.set('returnUrl', buildReturnUrl(returnUrl))
  }
  
  if (country) {
    query.set('country', country)
  }
  
  if (message) {
    query.set('message', message)
  }

  const queryString = query.toString()
  return `/${type}${queryString ? `?${queryString}` : ''}`
}

/**
 * Parses authentication redirect parameters from URL
 * @param {object} router Next.js router instance
 * @returns {object} Parsed redirect parameters
 */
export const parseAuthRedirectParams = (router) => {
  const { returnUrl, country, message } = router.query

  return {
    returnUrl: typeof returnUrl === 'string' ? returnUrl : null,
    country: typeof country === 'string' ? country : 'my',
    message: typeof message === 'string' ? message : null,
  }
}

/**
 * Checks if the current route is an authentication route
 * @param {string} path The path to check
 * @returns {boolean} Whether the path is an authentication route
 */
export const isAuthRoute = (path) => {
  const authRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email']
  const pathWithoutQuery = path.split('?')[0]
  
  return authRoutes.some(route => 
    pathWithoutQuery === route || 
    pathWithoutQuery.endsWith(route)
  )
}

/**
 * Gets the default redirect path for a country
 * @param {string} country The country code
 * @returns {string} The default redirect path
 */
export const getDefaultRedirectPath = (country = 'my') => {
  return `/${country}`
}
