/**
 * CSRF Protection Utilities
 *
 * This module provides Cross-Site Request Forgery (CSRF) protection utilities
 * for securing forms and API requests in the Bellyfed application.
 */

import { getEnvironmentName } from './environment.js'

/**
 * CSRF configuration
 */
export const csrfConfig = {
  cookieName: 'bellyfed-csrf-token',
  headerName: 'X-CSRF-Token',
  tokenLength: 32,
  cookieOptions: {
    httpOnly: false, // Must be false so client can read it
    secure: getEnvironmentName() === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  }
}

/**
 * Generates a random CSRF token
 * @returns {string} A random string to be used as a CSRF token
 */
export const generateCsrfToken = () => {
  // Generate a random string with high entropy
  const randomBytes = new Uint8Array(csrfConfig.tokenLength)
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes)
  } else if (typeof crypto !== 'undefined' && crypto.randomBytes) {
    // Node.js environment
    const nodeRandomBytes = crypto.randomBytes(csrfConfig.tokenLength)
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = nodeRandomBytes[i]
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Convert to base64 string and make URL-safe
  const bytesArray = Array.from(randomBytes)
  return btoa(String.fromCharCode.apply(null, bytesArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Sets the CSRF token as a cookie via server API
 * @param {string} token The CSRF token to set
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const setCsrfTokenCookie = async (token) => {
  if (typeof window === 'undefined') return false

  try {
    const response = await fetch('/api/csrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to set CSRF token:', error)
    return false
  }
}

/**
 * Gets the CSRF token from cookie
 * @returns {string|null} The CSRF token or null if not found
 */
export const getCsrfTokenFromCookie = () => {
  if (typeof window === 'undefined') return null

  try {
    const cookies = document.cookie.split(';')
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${csrfConfig.cookieName}=`)
    )
    
    if (csrfCookie) {
      return csrfCookie.split('=')[1].trim()
    }
    
    return null
  } catch (error) {
    console.error('Failed to get CSRF token from cookie:', error)
    return null
  }
}

/**
 * Gets the CSRF token from server API
 * @returns {Promise<string|null>} The CSRF token or null if not found
 */
export const getCsrfTokenFromServer = async () => {
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      return data.token || null
    }

    return null
  } catch (error) {
    console.error('Failed to get CSRF token from server:', error)
    return null
  }
}

/**
 * Gets the CSRF token, trying cookie first, then server
 * @returns {Promise<string|null>} The CSRF token or null if not found
 */
export const getCsrfToken = async () => {
  // Try to get from cookie first
  let token = getCsrfTokenFromCookie()
  
  if (token) {
    return token
  }
  
  // If not in cookie, try to get from server
  token = await getCsrfTokenFromServer()
  
  return token
}

/**
 * Generates a new CSRF token and stores it via server API
 * @returns {Promise<string>} The generated CSRF token
 */
export const initCsrfProtection = async () => {
  const token = generateCsrfToken()
  await setCsrfTokenCookie(token)
  return token
}

/**
 * Validates a CSRF token on the server side
 * @param {object} req Next.js API request
 * @param {string} providedToken The token provided by the client
 * @returns {boolean} Whether the token is valid
 */
export const validateCsrfToken = (req, providedToken) => {
  try {
    if (!providedToken) {
      return false
    }

    // Get the token from cookie
    const cookies = req.cookies || {}
    const cookieToken = cookies[csrfConfig.cookieName]
    
    if (!cookieToken) {
      return false
    }

    // Compare tokens (constant-time comparison would be better for production)
    return cookieToken === providedToken
  } catch (error) {
    console.error('CSRF token validation error:', error)
    return false
  }
}

/**
 * Adds a CSRF token to a fetch request
 * @param {string} url The URL to fetch
 * @param {object} options The fetch options
 * @returns {Promise<Response>} The response from the fetch request
 */
export const fetchWithCsrf = async (url, options = {}) => {
  // Get the CSRF token
  const token = await getCsrfToken()
  
  if (!token) {
    throw new Error('CSRF token not found')
  }
  
  // Add the CSRF token to the headers
  const headers = new Headers(options.headers || {})
  headers.set(csrfConfig.headerName, token)
  
  // Make the request with the CSRF token
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

/**
 * Creates a CSRF-protected form submission handler
 * @param {function} onSubmit The function to call when the form is submitted
 * @returns {function} A function that handles form submission with CSRF protection
 */
export const createCsrfProtectedSubmitHandler = (onSubmit) => {
  return async (event) => {
    event.preventDefault()
    
    try {
      // Get the CSRF token
      const token = await getCsrfToken()
      
      if (!token) {
        throw new Error('CSRF token not found')
      }
      
      // Call the original submit handler with the token
      await onSubmit(event, token)
    } catch (error) {
      console.error('CSRF protection error:', error)
      // You might want to show an error message to the user here
      throw error
    }
  }
}

/**
 * Higher-order function to protect API routes with CSRF validation
 * @param {function} handler The API route handler
 * @param {object} options Protection options
 * @returns {function} A new handler that includes CSRF validation
 */
export const withCsrfProtection = (handler, options = {}) => {
  return async (req, res) => {
    try {
      // Only check CSRF for state-changing methods
      const methodsToProtect = options.methods || ['POST', 'PUT', 'PATCH', 'DELETE']
      
      if (methodsToProtect.includes(req.method)) {
        // Get token from header
        const providedToken = req.headers[csrfConfig.headerName.toLowerCase()]
        
        // Validate CSRF token
        if (!validateCsrfToken(req, providedToken)) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'Invalid CSRF token'
          })
        }
      }

      // Call the original handler
      return await handler(req, res)
    } catch (error) {
      console.error('CSRF protection error:', error)
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'CSRF protection error'
      })
    }
  }
}

/**
 * Middleware to set CSRF token cookie
 * @param {object} req Next.js API request
 * @param {object} res Next.js API response
 * @returns {string} The generated CSRF token
 */
export const setCsrfCookie = (req, res) => {
  const token = generateCsrfToken()
  
  // Format cookie options
  const cookieOptions = []
  if (csrfConfig.cookieOptions.httpOnly) cookieOptions.push('HttpOnly')
  if (csrfConfig.cookieOptions.secure) cookieOptions.push('Secure')
  if (csrfConfig.cookieOptions.sameSite) cookieOptions.push(`SameSite=${csrfConfig.cookieOptions.sameSite}`)
  if (csrfConfig.cookieOptions.path) cookieOptions.push(`Path=${csrfConfig.cookieOptions.path}`)
  if (csrfConfig.cookieOptions.maxAge) cookieOptions.push(`Max-Age=${csrfConfig.cookieOptions.maxAge}`)
  
  const cookieValue = `${csrfConfig.cookieName}=${token}; ${cookieOptions.join('; ')}`
  
  res.setHeader('Set-Cookie', cookieValue)
  
  return token
}

/**
 * Clear CSRF token cookie
 * @param {object} res Next.js API response
 */
export const clearCsrfCookie = (res) => {
  const expiredCookieOptions = [
    'HttpOnly',
    `Path=${csrfConfig.cookieOptions.path}`,
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ]
  
  if (csrfConfig.cookieOptions.secure) {
    expiredCookieOptions.push('Secure')
  }
  
  const cookieValue = `${csrfConfig.cookieName}=; ${expiredCookieOptions.join('; ')}`
  res.setHeader('Set-Cookie', cookieValue)
}

/**
 * Create a CSRF token input field for forms
 * @returns {Promise<string>} HTML string for the CSRF token input field
 */
export const createCsrfTokenInput = async () => {
  const token = await getCsrfToken()
  
  if (!token) {
    console.warn('CSRF token not available')
    return ''
  }
  
  return `<input type="hidden" name="csrf_token" value="${token}" />`
}

/**
 * Validate CSRF token from form data
 * @param {object} req Next.js API request
 * @param {object} formData Form data containing the CSRF token
 * @returns {boolean} Whether the token is valid
 */
export const validateCsrfFromForm = (req, formData) => {
  const providedToken = formData.csrf_token || formData.get?.('csrf_token')
  return validateCsrfToken(req, providedToken)
}

/**
 * Get CSRF protection status
 * @returns {object} CSRF protection status
 */
export const getCsrfStatus = () => {
  return {
    isEnabled: true,
    cookieName: csrfConfig.cookieName,
    headerName: csrfConfig.headerName,
    environment: getEnvironmentName(),
    timestamp: new Date().toISOString()
  }
}
