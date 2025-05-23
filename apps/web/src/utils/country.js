/**
 * Country Utilities
 *
 * This file provides utility functions for working with country codes and contexts.
 * It helps with extracting and validating country codes from various sources.
 */

/**
 * Country Configuration interface
 * Defines the structure of country configuration
 */
export const CountryConfig = {
  code: '',
  urlCode: '',
  name: '',
  currency: '',
  flagUrl: '',
  reviewers: [],
  dishes: [],
  locations: []
}

/**
 * Countries configuration
 * Mapping of country codes to country configurations
 */
export const COUNTRIES = {
  my: {
    code: 'my',
    urlCode: 'my',
    name: 'Malaysia',
    currency: 'MYR',
    flagUrl: '/flags/malaysia.png',
    reviewers: [
      { name: 'Sarah Chen', reviews: 128, badge: '🏆 Elite' },
      { name: 'Mike Wong', reviews: 96, badge: '⭐ Pro' },
      { name: 'Lisa Tan', reviews: 84, badge: '🌟 Rising' },
      { name: 'David Lim', reviews: 76, badge: '💫 Active' },
      { name: 'Jenny Koh', reviews: 72, badge: '✨ Explorer' },
    ],
    dishes: [
      { name: 'Nasi Lemak', votes: 256, trend: '↑ 15%' },
      { name: 'Char Kuey Teow', votes: 198, trend: '↑ 12%' },
      { name: 'Satay', votes: 167, trend: '↑ 8%' },
      { name: 'Roti Canai', votes: 145, trend: '↑ 10%' },
      { name: 'Laksa', votes: 134, trend: '↑ 7%' },
    ],
    locations: [
      { name: 'Kuala Lumpur', restaurants: 1247, newCount: '+23' },
      { name: 'Penang', restaurants: 892, newCount: '+15' },
      { name: 'Johor Bahru', restaurants: 634, newCount: '+12' },
      { name: 'Ipoh', restaurants: 456, newCount: '+8' },
      { name: 'Malacca', restaurants: 389, newCount: '+6' },
    ],
  },
  sg: {
    code: 'sg',
    urlCode: 'sg',
    name: 'Singapore',
    currency: 'SGD',
    flagUrl: '/flags/singapore.png',
    reviewers: [
      { name: 'Alex Tan', reviews: 142, badge: '🏆 Elite' },
      { name: 'Priya Sharma', reviews: 118, badge: '⭐ Pro' },
      { name: 'James Lim', reviews: 95, badge: '🌟 Rising' },
      { name: 'Rachel Wong', reviews: 87, badge: '💫 Active' },
      { name: 'Kevin Ng', reviews: 79, badge: '✨ Explorer' },
    ],
    dishes: [
      { name: 'Hainanese Chicken Rice', votes: 312, trend: '↑ 18%' },
      { name: 'Laksa', votes: 287, trend: '↑ 14%' },
      { name: 'Char Kway Teow', votes: 234, trend: '↑ 11%' },
      { name: 'Bak Kut Teh', votes: 198, trend: '↑ 9%' },
      { name: 'Satay', votes: 176, trend: '↑ 13%' },
    ],
    locations: [
      { name: 'Central Business District', restaurants: 567, newCount: '+18' },
      { name: 'Orchard Road', restaurants: 423, newCount: '+12' },
      { name: 'Chinatown', restaurants: 389, newCount: '+15' },
      { name: 'Little India', restaurants: 298, newCount: '+9' },
      { name: 'Bugis', restaurants: 267, newCount: '+7' },
    ],
  },
}

/**
 * Helper function to get country from context
 * @param {object} context The Next.js context object
 * @returns {string|null} The country code or null if invalid
 */
export function getCountryFromContext(context) {
  try {
    if (!context || typeof context !== 'object') {
      return null
    }

    const { params } = context
    const countryCode = params?.country

    if (!countryCode) return null

    // Check if it's a valid country code
    if (COUNTRIES[countryCode]) {
      return countryCode
    }

    return null
  } catch (error) {
    console.error('Error getting country from context:', error)
    return null
  }
}

/**
 * Extracts the country code from a path
 * @param {string} path The path to extract the country code from
 * @returns {string} The country code or 'my' as default
 */
export const extractCountryCode = (path) => {
  try {
    if (!path || typeof path !== 'string') {
      return 'my'
    }

    const pathSegments = path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    
    return (firstSegment === 'my' || firstSegment === 'sg') ? firstSegment : 'my'
  } catch (error) {
    console.error('Error extracting country code:', error)
    return 'my'
  }
}

/**
 * Gets the country configuration for a country code
 * @param {string} countryCode The country code
 * @returns {object|null} The country configuration or null if invalid
 */
export const getCountryConfig = (countryCode) => {
  try {
    if (!countryCode || typeof countryCode !== 'string') {
      return null
    }

    return COUNTRIES[countryCode] || null
  } catch (error) {
    console.error('Error getting country config:', error)
    return null
  }
}

/**
 * Gets the default country code
 * @returns {string} The default country code
 */
export const getDefaultCountryCode = () => {
  return 'my'
}

/**
 * Gets all supported country codes
 * @returns {string[]} Array of supported country codes
 */
export const getSupportedCountryCodes = () => {
  return Object.keys(COUNTRIES)
}

/**
 * Checks if a country code is valid
 * @param {string} countryCode The country code to check
 * @returns {boolean} Whether the country code is valid
 */
export const isValidCountryCode = (countryCode) => {
  try {
    if (!countryCode || typeof countryCode !== 'string') {
      return false
    }

    return !!COUNTRIES[countryCode]
  } catch (error) {
    console.error('Error validating country code:', error)
    return false
  }
}

/**
 * Gets the country name for a country code
 * @param {string} countryCode The country code
 * @returns {string|null} The country name or null if invalid
 */
export const getCountryName = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    return config?.name || null
  } catch (error) {
    console.error('Error getting country name:', error)
    return null
  }
}

/**
 * Gets the country currency for a country code
 * @param {string} countryCode The country code
 * @returns {string|null} The country currency or null if invalid
 */
export const getCountryCurrency = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    return config?.currency || null
  } catch (error) {
    console.error('Error getting country currency:', error)
    return null
  }
}

/**
 * Gets the country flag URL for a country code
 * @param {string} countryCode The country code
 * @returns {string|null} The country flag URL or null if invalid
 */
export const getCountryFlagUrl = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    return config?.flagUrl || null
  } catch (error) {
    console.error('Error getting country flag URL:', error)
    return null
  }
}

/**
 * Gets the top reviewers for a country
 * @param {string} countryCode The country code
 * @returns {Array} Array of top reviewers or empty array if invalid
 */
export const getCountryTopReviewers = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    return config?.reviewers || []
  } catch (error) {
    console.error('Error getting country top reviewers:', error)
    return []
  }
}

/**
 * Gets the top dishes for a country
 * @param {string} countryCode The country code
 * @returns {Array} Array of top dishes or empty array if invalid
 */
export const getCountryTopDishes = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    return config?.dishes || []
  } catch (error) {
    console.error('Error getting country top dishes:', error)
    return []
  }
}

/**
 * Gets the top locations for a country
 * @param {string} countryCode The country code
 * @returns {Array} Array of top locations or empty array if invalid
 */
export const getCountryTopLocations = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    return config?.locations || []
  } catch (error) {
    console.error('Error getting country top locations:', error)
    return []
  }
}

/**
 * Gets country information summary
 * @param {string} countryCode The country code
 * @returns {object|null} Country information summary or null if invalid
 */
export const getCountryInfo = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    if (!config) return null

    return {
      code: config.code,
      urlCode: config.urlCode,
      name: config.name,
      currency: config.currency,
      flagUrl: config.flagUrl,
      totalReviewers: config.reviewers.length,
      totalDishes: config.dishes.length,
      totalLocations: config.locations.length,
      topReviewer: config.reviewers[0] || null,
      topDish: config.dishes[0] || null,
      topLocation: config.locations[0] || null
    }
  } catch (error) {
    console.error('Error getting country info:', error)
    return null
  }
}

/**
 * Validates country data structure
 * @param {object} countryData The country data to validate
 * @returns {object} Validation result
 */
export const validateCountryData = (countryData) => {
  const errors = []
  
  try {
    if (!countryData || typeof countryData !== 'object') {
      errors.push('Country data must be an object')
      return { isValid: false, errors }
    }

    const requiredFields = ['code', 'urlCode', 'name', 'currency', 'flagUrl']
    requiredFields.forEach(field => {
      if (!countryData[field] || typeof countryData[field] !== 'string') {
        errors.push(`Missing or invalid ${field}`)
      }
    })

    const arrayFields = ['reviewers', 'dishes', 'locations']
    arrayFields.forEach(field => {
      if (!Array.isArray(countryData[field])) {
        errors.push(`${field} must be an array`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  } catch (error) {
    console.error('Error validating country data:', error)
    return {
      isValid: false,
      errors: ['Validation error occurred']
    }
  }
}

/**
 * Gets country statistics
 * @param {string} countryCode The country code
 * @returns {object|null} Country statistics or null if invalid
 */
export const getCountryStats = (countryCode) => {
  try {
    const config = getCountryConfig(countryCode)
    if (!config) return null

    const totalReviews = config.reviewers.reduce((sum, reviewer) => sum + reviewer.reviews, 0)
    const totalVotes = config.dishes.reduce((sum, dish) => sum + dish.votes, 0)
    const totalRestaurants = config.locations.reduce((sum, location) => sum + location.restaurants, 0)

    return {
      totalReviewers: config.reviewers.length,
      totalReviews,
      totalDishes: config.dishes.length,
      totalVotes,
      totalLocations: config.locations.length,
      totalRestaurants,
      averageReviewsPerReviewer: Math.round(totalReviews / config.reviewers.length),
      averageVotesPerDish: Math.round(totalVotes / config.dishes.length),
      averageRestaurantsPerLocation: Math.round(totalRestaurants / config.locations.length)
    }
  } catch (error) {
    console.error('Error getting country stats:', error)
    return null
  }
}
