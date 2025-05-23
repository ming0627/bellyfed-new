/**
 * Authentication Utilities
 *
 * This module provides functions for authentication and authorization
 * in both client-side and server-side contexts.
 */

import { getEnvironmentName } from './environment.js'

/**
 * Authentication configuration
 */
export const authConfig = {
  cookieNames: {
    accessToken: 'bellyfed-access-token',
    idToken: 'bellyfed-id-token',
    refreshToken: 'bellyfed-refresh-token'
  },
  cookieOptions: {
    httpOnly: true,
    secure: getEnvironmentName() === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  },
  tokenExpiration: {
    access: 60 * 60, // 1 hour
    id: 60 * 60, // 1 hour
    refresh: 60 * 60 * 24 * 30 // 30 days
  }
}

/**
 * Get the user ID from the session
 * @param {object} req - The Next.js API request
 * @returns {string|null} The user ID or null if not authenticated
 */
export function getUserId(req) {
  try {
    const session = getSession(req)
    return session?.user?.id || null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}

/**
 * Check if the user is authenticated
 * @param {object} req - The Next.js API request
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated(req) {
  try {
    const session = getSession(req)
    return !!session?.user?.id
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Get the current user's session from cookies
 * @param {object} req - The Next.js API request
 * @returns {object|null} The user session or null if not authenticated
 */
export function getSession(req) {
  try {
    const cookies = req.cookies || {}
    const idToken = cookies[authConfig.cookieNames.idToken]
    
    if (!idToken) {
      return null
    }

    // In a real implementation, you would verify the JWT token here
    // For now, we'll decode it without verification (not secure for production)
    const payload = decodeJwtPayload(idToken)
    
    if (!payload) {
      return null
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload['cognito:username'],
        username: payload['cognito:username']
      },
      tokens: {
        accessToken: cookies[authConfig.cookieNames.accessToken],
        idToken: idToken,
        refreshToken: cookies[authConfig.cookieNames.refreshToken]
      }
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Decode JWT payload without verification (for development only)
 * @param {string} token - The JWT token
 * @returns {object|null} The decoded payload or null if invalid
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT payload:', error)
    return null
  }
}

/**
 * Higher-order function to protect API routes
 * @param {function} handler - The API route handler
 * @param {object} options - Protection options
 * @returns {function} A new handler that checks authentication
 */
export function withApiAuthRequired(handler, options = {}) {
  return async (req, res) => {
    try {
      // Check if the user is authenticated
      if (!isAuthenticated(req)) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required to access this resource'
        })
      }

      // Add user session to request object
      req.session = getSession(req)
      req.user = req.session?.user

      // Call the original handler
      return await handler(req, res)
    } catch (error) {
      console.error('Authentication error:', error)
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'An error occurred during authentication'
      })
    }
  }
}

/**
 * Higher-order function to protect API routes with role-based access
 * @param {function} handler - The API route handler
 * @param {string|string[]} requiredRoles - Required roles for access
 * @param {object} options - Protection options
 * @returns {function} A new handler that checks authentication and authorization
 */
export function withApiRoleRequired(handler, requiredRoles, options = {}) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  
  return withApiAuthRequired(async (req, res) => {
    try {
      const userRoles = req.user?.roles || []
      const hasRequiredRole = roles.some(role => userRoles.includes(role))
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions to access this resource'
        })
      }

      return await handler(req, res)
    } catch (error) {
      console.error('Authorization error:', error)
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'An error occurred during authorization'
      })
    }
  }, options)
}

/**
 * Get authentication tokens from cookies
 * @param {object} cookies - Request cookies
 * @returns {object} Authentication tokens
 */
export function getTokensFromCookies(cookies) {
  return {
    accessToken: cookies[authConfig.cookieNames.accessToken] || null,
    idToken: cookies[authConfig.cookieNames.idToken] || null,
    refreshToken: cookies[authConfig.cookieNames.refreshToken] || null
  }
}

/**
 * Set authentication cookies
 * @param {object} res - Response object
 * @param {object} tokens - Authentication tokens
 */
export function setAuthCookies(res, tokens) {
  const { cookieNames, cookieOptions } = authConfig
  
  if (tokens.accessToken) {
    res.setHeader('Set-Cookie', [
      `${cookieNames.accessToken}=${tokens.accessToken}; ${formatCookieOptions(cookieOptions)}`,
      `${cookieNames.idToken}=${tokens.idToken}; ${formatCookieOptions(cookieOptions)}`,
      `${cookieNames.refreshToken}=${tokens.refreshToken}; ${formatCookieOptions({
        ...cookieOptions,
        maxAge: authConfig.tokenExpiration.refresh
      })}`
    ])
  }
}

/**
 * Clear authentication cookies
 * @param {object} res - Response object
 */
export function clearAuthCookies(res) {
  const { cookieNames } = authConfig
  const expiredCookieOptions = {
    httpOnly: true,
    secure: getEnvironmentName() === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  }
  
  res.setHeader('Set-Cookie', [
    `${cookieNames.accessToken}=; ${formatCookieOptions(expiredCookieOptions)}`,
    `${cookieNames.idToken}=; ${formatCookieOptions(expiredCookieOptions)}`,
    `${cookieNames.refreshToken}=; ${formatCookieOptions(expiredCookieOptions)}`
  ])
}

/**
 * Format cookie options for Set-Cookie header
 * @param {object} options - Cookie options
 * @returns {string} Formatted cookie options string
 */
function formatCookieOptions(options) {
  const parts = []
  
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`)
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`)
  
  return parts.join('; ')
}

/**
 * Validate authentication token format
 * @param {string} token - Token to validate
 * @returns {boolean} Whether the token format is valid
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} Whether the token is expired
 */
export function isTokenExpired(token) {
  try {
    const payload = decodeJwtPayload(token)
    if (!payload || !payload.exp) {
      return true
    }
    
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

/**
 * Get user permissions from session
 * @param {object} req - The Next.js API request
 * @returns {string[]} Array of user permissions
 */
export function getUserPermissions(req) {
  try {
    const session = getSession(req)
    return session?.user?.permissions || []
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Check if user has specific permission
 * @param {object} req - The Next.js API request
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has the permission
 */
export function hasPermission(req, permission) {
  const permissions = getUserPermissions(req)
  return permissions.includes(permission)
}

/**
 * Get authentication status for client-side use
 * @returns {object} Authentication status
 */
export function getClientAuthStatus() {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, isLoading: true }
  }
  
  // This would typically check localStorage or make an API call
  // For now, return a basic status
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null
  }
}
