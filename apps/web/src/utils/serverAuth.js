/**
 * Server-Side Authentication Utilities
 *
 * This module provides utilities for server-side authentication verification,
 * including JWT token validation and server-side route protection.
 */

import { getEnvironmentName } from './environment.js'

/**
 * Default server authentication configuration
 */
const defaultConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  userPoolId: process.env.COGNITO_USER_POOL_ID || '',
  clientId: process.env.COGNITO_CLIENT_ID || '',
  cookieNames: {
    accessToken: 'bellyfed-access-token',
    idToken: 'bellyfed-id-token',
    refreshToken: 'bellyfed-refresh-token'
  },
  jwtVerificationEnabled: getEnvironmentName() === 'production'
}

/**
 * Extract tokens from cookies
 * @param {object} cookies Request cookies
 * @param {object} config Server authentication configuration
 * @returns {object} Extracted tokens
 */
export const extractTokensFromCookies = (cookies, config = defaultConfig) => {
  return {
    accessToken: cookies[config.cookieNames.accessToken] || null,
    idToken: cookies[config.cookieNames.idToken] || null,
    refreshToken: cookies[config.cookieNames.refreshToken] || null
  }
}

/**
 * Decode JWT payload without verification (for development)
 * @param {string} token The JWT token
 * @returns {object|null} The decoded payload or null if invalid
 */
const decodeJwtPayload = (token) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4)
    const decoded = Buffer.from(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT payload:', error)
    return null
  }
}

/**
 * Verify a JWT token (simplified version for development)
 * @param {string} token The JWT token to verify
 * @param {string} tokenType The type of token ('id' or 'access')
 * @param {object} config Server authentication configuration
 * @returns {object|null} The decoded token payload if valid, null otherwise
 */
export const verifyToken = async (token, tokenType = 'id', config = defaultConfig) => {
  try {
    if (!token) {
      return null
    }

    // In development, just decode without verification
    if (!config.jwtVerificationEnabled) {
      const payload = decodeJwtPayload(token)
      if (!payload) {
        return null
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        return null
      }

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload['cognito:username'],
        'cognito:username': payload['cognito:username'],
        ...payload
      }
    }

    // In production, you would use AWS Cognito JWT verification
    // For now, return null to indicate verification is not implemented
    console.warn('JWT verification not implemented for production')
    return null
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Get user from server-side request
 * @param {object} req Next.js API request
 * @param {object} config Server authentication configuration
 * @returns {object|null} User object or null if not authenticated
 */
export const getUserFromRequest = async (req, config = defaultConfig) => {
  try {
    const cookies = req.cookies || {}
    const { idToken } = extractTokensFromCookies(cookies, config)

    if (!idToken) {
      return null
    }

    const payload = await verifyToken(idToken, 'id', config)
    if (!payload) {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      username: payload['cognito:username'],
      roles: payload['cognito:groups'] || [],
      permissions: payload.permissions || []
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Higher-order function to protect pages with server-side authentication
 * @param {function} getServerSidePropsFunc The original getServerSideProps function (optional)
 * @param {object} options Options for the protection (redirectUrl, etc.)
 * @param {object} config Server authentication configuration
 * @returns {function} A new getServerSideProps function that includes authentication checks
 */
export const withServerAuth = (
  getServerSidePropsFunc,
  options = {},
  config = defaultConfig
) => {
  return async (context) => {
    try {
      const { req, res, resolvedUrl } = context
      const user = await getUserFromRequest(req, config)

      // If user is not authenticated, redirect to signin
      if (!user) {
        const redirectUrl = options.redirectUrl || '/signin'
        const returnTo = options.returnTo !== false
        
        let destination = redirectUrl
        if (returnTo) {
          const returnUrl = encodeURIComponent(resolvedUrl)
          destination += `?returnUrl=${returnUrl}`
        }

        return {
          redirect: {
            destination,
            permanent: false,
          },
        }
      }

      // Add user to context
      context.user = user

      // Call the original getServerSideProps if provided
      if (getServerSidePropsFunc) {
        const result = await getServerSidePropsFunc(context)
        
        // Add user to props if result has props
        if (result && 'props' in result) {
          return {
            ...result,
            props: {
              ...result.props,
              user,
            },
          }
        }
        
        return result
      }

      // Return user as props
      return {
        props: {
          user,
        },
      }
    } catch (error) {
      console.error('Server auth error:', error)
      
      // Redirect to error page or signin on error
      return {
        redirect: {
          destination: options.redirectUrl || '/signin',
          permanent: false,
        },
      }
    }
  }
}

/**
 * Protect an API route with server-side authentication
 * @param {function} handler The API route handler
 * @param {object} config Server authentication configuration
 * @returns {function} A new handler that includes authentication checks
 */
export const withApiAuth = (handler, config = defaultConfig) => {
  return async (req, res) => {
    try {
      const user = await getUserFromRequest(req, config)

      // If no user, return unauthorized
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      }

      // Add user to request object
      req.user = user
      req.session = { user }

      // Call the original handler
      return await handler(req, res)
    } catch (error) {
      console.error('API auth error:', error)
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Authentication error'
      })
    }
  }
}

/**
 * Protect an API route with role-based authentication
 * @param {function} handler The API route handler
 * @param {string|string[]} requiredRoles Required roles for access
 * @param {object} config Server authentication configuration
 * @returns {function} A new handler that includes authentication and authorization checks
 */
export const withApiRoleAuth = (handler, requiredRoles, config = defaultConfig) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  
  return withApiAuth(async (req, res) => {
    try {
      const userRoles = req.user?.roles || []
      const hasRequiredRole = roles.some(role => userRoles.includes(role))
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions'
        })
      }

      return await handler(req, res)
    } catch (error) {
      console.error('API role auth error:', error)
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Authorization error'
      })
    }
  }, config)
}

/**
 * Check if user has specific permission
 * @param {object} user User object
 * @param {string} permission Permission to check
 * @returns {boolean} Whether user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !permission) {
    return false
  }
  
  const permissions = user.permissions || []
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified roles
 * @param {object} user User object
 * @param {string|string[]} roles Roles to check
 * @returns {boolean} Whether user has any of the roles
 */
export const hasRole = (user, roles) => {
  if (!user || !roles) {
    return false
  }
  
  const userRoles = user.roles || []
  const rolesToCheck = Array.isArray(roles) ? roles : [roles]
  
  return rolesToCheck.some(role => userRoles.includes(role))
}

/**
 * Get server-side authentication status
 * @param {object} req Next.js API request
 * @param {object} config Server authentication configuration
 * @returns {object} Authentication status
 */
export const getServerAuthStatus = async (req, config = defaultConfig) => {
  try {
    const user = await getUserFromRequest(req, config)
    
    return {
      isAuthenticated: !!user,
      user: user || null,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting server auth status:', error)
    return {
      isAuthenticated: false,
      user: null,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Validate authentication configuration
 * @param {object} config Configuration to validate
 * @returns {object} Validation result
 */
export const validateAuthConfig = (config = defaultConfig) => {
  const errors = []
  
  if (!config.region) {
    errors.push('AWS region is required')
  }
  
  if (!config.userPoolId) {
    errors.push('Cognito User Pool ID is required')
  }
  
  if (!config.clientId) {
    errors.push('Cognito Client ID is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Create authentication middleware for Express-like frameworks
 * @param {object} config Server authentication configuration
 * @returns {function} Authentication middleware
 */
export const createAuthMiddleware = (config = defaultConfig) => {
  return async (req, res, next) => {
    try {
      const user = await getUserFromRequest(req, config)
      req.user = user
      req.isAuthenticated = !!user
      
      if (next) {
        next()
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      req.user = null
      req.isAuthenticated = false
      
      if (next) {
        next(error)
      }
    }
  }
}
