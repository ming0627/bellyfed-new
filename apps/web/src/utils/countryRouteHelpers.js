/**
 * Utility functions for handling country-specific routing in Next.js
 */

import { getSupportedCountryCodes, isValidCountryCode, getDefaultCountryCode } from './country.js'

// Supported countries (dynamically imported from country config)
const SUPPORTED_COUNTRIES = getSupportedCountryCodes()

/**
 * Generate a country-specific URL
 * 
 * @param {string} country - The country code (e.g., 'my', 'sg')
 * @param {string} path - The path to navigate to (e.g., '/explore')
 * @returns {string} The country-specific URL (e.g., '/my/explore')
 */
export const getCountryUrl = (country, path) => {
  try {
    // Ensure country is valid
    const validCountry = isValidCountryCode(country) ? country : getDefaultCountryCode()
    
    // Handle empty path
    if (!path) return `/${validCountry}`
    
    // Ensure path doesn't start with a slash for concatenation
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path
    
    // Return the country-specific URL
    return `/${validCountry}/${normalizedPath}`
  } catch (error) {
    console.error('Error generating country URL:', error)
    return `/${getDefaultCountryCode()}`
  }
}

/**
 * Generate static paths for all supported countries
 * Used in getStaticPaths for country-based dynamic routes
 * 
 * @returns {object} Object with paths and fallback setting for Next.js getStaticPaths
 */
export const getCountryStaticPaths = () => {
  try {
    return {
      paths: SUPPORTED_COUNTRIES.map(country => ({
        params: { country }
      })),
      fallback: false // Do not generate pages for countries not in the list
    }
  } catch (error) {
    console.error('Error generating country static paths:', error)
    return {
      paths: [{ params: { country: getDefaultCountryCode() } }],
      fallback: false
    }
  }
}

/**
 * Generate static props with country information
 * Used in getStaticProps for country-based dynamic routes
 * 
 * @param {object} params - The params object from getStaticProps
 * @returns {object} Object with props containing country information
 */
export const getCountryStaticProps = (params) => {
  try {
    // Validate country code
    const country = params?.country
    
    // If country is not supported, redirect to default country
    if (!country || !isValidCountryCode(country)) {
      return {
        redirect: {
          destination: `/${getDefaultCountryCode()}`,
          permanent: false
        }
      }
    }
    
    // Return country as props
    return {
      props: {
        country
      }
    }
  } catch (error) {
    console.error('Error generating country static props:', error)
    return {
      redirect: {
        destination: `/${getDefaultCountryCode()}`,
        permanent: false
      }
    }
  }
}

/**
 * Generate a country-specific link with proper validation
 * 
 * @param {string} path - The path to navigate to (e.g., '/explore')
 * @param {string} countryCode - The country code (e.g., 'my', 'sg')
 * @returns {string} The country-specific path (e.g., '/my/explore')
 */
export const getCountryLink = (path, countryCode) => {
  try {
    if (!countryCode) return path
    
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    
    // Validate country code
    const validCountry = isValidCountryCode(countryCode) ? countryCode : getDefaultCountryCode()
    
    // If path already includes a country code, replace it
    const pathSegments = normalizedPath.split('/').filter(Boolean)
    if (pathSegments.length > 0 && isValidCountryCode(pathSegments[0])) {
      pathSegments[0] = validCountry
      return `/${pathSegments.join('/')}`
    }
    
    // Otherwise, prepend the country code
    return `/${validCountry}${normalizedPath}`
  } catch (error) {
    console.error('Error generating country link:', error)
    return path
  }
}

/**
 * Extract country code from a URL path
 * 
 * @param {string} path - The URL path
 * @returns {string|null} The country code or null if not found
 */
export const extractCountryFromPath = (path) => {
  try {
    if (!path || typeof path !== 'string') {
      return null
    }

    const pathSegments = path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    
    return isValidCountryCode(firstSegment) ? firstSegment : null
  } catch (error) {
    console.error('Error extracting country from path:', error)
    return null
  }
}

/**
 * Remove country code from a path
 * 
 * @param {string} path - The URL path
 * @returns {string} The path without country code
 */
export const removeCountryFromPath = (path) => {
  try {
    if (!path || typeof path !== 'string') {
      return '/'
    }

    const pathSegments = path.split('/').filter(Boolean)
    
    // If first segment is a country code, remove it
    if (pathSegments.length > 0 && isValidCountryCode(pathSegments[0])) {
      pathSegments.shift()
    }
    
    return pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/'
  } catch (error) {
    console.error('Error removing country from path:', error)
    return '/'
  }
}

/**
 * Check if a path contains a valid country code
 * 
 * @param {string} path - The URL path
 * @returns {boolean} Whether the path contains a valid country code
 */
export const pathHasCountryCode = (path) => {
  return extractCountryFromPath(path) !== null
}

/**
 * Normalize a path to include a country code
 * 
 * @param {string} path - The URL path
 * @param {string} defaultCountry - The default country code to use
 * @returns {string} The normalized path with country code
 */
export const normalizePathWithCountry = (path, defaultCountry) => {
  try {
    const country = defaultCountry || getDefaultCountryCode()
    
    if (pathHasCountryCode(path)) {
      return path
    }
    
    return getCountryLink(path, country)
  } catch (error) {
    console.error('Error normalizing path with country:', error)
    return `/${getDefaultCountryCode()}`
  }
}

/**
 * Generate server-side redirect for country-based routing
 * 
 * @param {object} context - Next.js context object
 * @param {string} targetPath - The target path to redirect to
 * @returns {object|null} Redirect object or null if no redirect needed
 */
export const getCountryRedirect = (context, targetPath) => {
  try {
    const { params, req } = context
    const country = params?.country
    
    // If no country in params, redirect to default country
    if (!country) {
      const defaultCountry = getDefaultCountryCode()
      const destination = getCountryUrl(defaultCountry, targetPath || '')
      
      return {
        redirect: {
          destination,
          permanent: false
        }
      }
    }
    
    // If invalid country, redirect to default country
    if (!isValidCountryCode(country)) {
      const defaultCountry = getDefaultCountryCode()
      const destination = getCountryUrl(defaultCountry, targetPath || '')
      
      return {
        redirect: {
          destination,
          permanent: false
        }
      }
    }
    
    return null // No redirect needed
  } catch (error) {
    console.error('Error generating country redirect:', error)
    return {
      redirect: {
        destination: `/${getDefaultCountryCode()}`,
        permanent: false
      }
    }
  }
}

/**
 * Create a country-aware router helper
 * 
 * @param {object} router - Next.js router instance
 * @returns {object} Country-aware router helper functions
 */
export const createCountryRouter = (router) => {
  const currentCountry = extractCountryFromPath(router.asPath) || getDefaultCountryCode()
  
  return {
    /**
     * Navigate to a path within the current country
     */
    push: (path, options = {}) => {
      const countryPath = getCountryUrl(currentCountry, path)
      return router.push(countryPath, undefined, options)
    },
    
    /**
     * Replace current path with a new path within the current country
     */
    replace: (path, options = {}) => {
      const countryPath = getCountryUrl(currentCountry, path)
      return router.replace(countryPath, undefined, options)
    },
    
    /**
     * Navigate to a path in a specific country
     */
    pushToCountry: (path, country, options = {}) => {
      const countryPath = getCountryUrl(country, path)
      return router.push(countryPath, undefined, options)
    },
    
    /**
     * Get the current country code
     */
    getCurrentCountry: () => currentCountry,
    
    /**
     * Check if currently in a specific country
     */
    isInCountry: (country) => currentCountry === country,
    
    /**
     * Get the current path without country code
     */
    getPathWithoutCountry: () => removeCountryFromPath(router.asPath)
  }
}

/**
 * Generate breadcrumb data for country-based routing
 * 
 * @param {string} path - The current path
 * @param {string} country - The country code
 * @returns {Array} Breadcrumb data array
 */
export const generateCountryBreadcrumbs = (path, country) => {
  try {
    const breadcrumbs = []
    const pathWithoutCountry = removeCountryFromPath(path)
    const segments = pathWithoutCountry.split('/').filter(Boolean)
    
    // Add country home as first breadcrumb
    breadcrumbs.push({
      label: country.toUpperCase(),
      href: `/${country}`,
      isCountry: true
    })
    
    // Add path segments as breadcrumbs
    let currentPath = `/${country}`
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        isLast: index === segments.length - 1
      })
    })
    
    return breadcrumbs
  } catch (error) {
    console.error('Error generating country breadcrumbs:', error)
    return []
  }
}
