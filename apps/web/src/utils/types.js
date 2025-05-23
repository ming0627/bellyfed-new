/**
 * Type Definitions and Utilities
 *
 * This module provides type definitions, type checking utilities, and type validation functions
 * for the Bellyfed application. It includes common types used across the application.
 */

/**
 * App environment type
 */
export const AppEnvironment = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production'
}

/**
 * Locale type
 */
export const Locale = {
  EN: 'en',
  MS: 'ms',
  ZH: 'zh',
  TA: 'ta'
}

/**
 * Country code type
 */
export const CountryCode = {
  MY: 'MY',
  SG: 'SG',
  ID: 'ID',
  TH: 'TH',
  VN: 'VN',
  PH: 'PH'
}

/**
 * Currency code type
 */
export const CurrencyCode = {
  MYR: 'MYR',
  SGD: 'SGD',
  IDR: 'IDR',
  THB: 'THB',
  VND: 'VND',
  PHP: 'PHP'
}

/**
 * API Response interface template
 */
export const ApiResponse = {
  data: null,
  success: false,
  message: ''
}

/**
 * Paginated Response interface template
 */
export const PaginatedResponse = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
}

/**
 * User interface template
 */
export const User = {
  id: '',
  username: '',
  email: '',
  name: '',
  nickname: '',
  phone: '',
  location: '',
  bio: '',
  interests: [],
  email_verified: false,
  created_at: '',
  updated_at: '',
  cognito_id: '',
  stats: {
    reviews: 0,
    followers: 0,
    following: 0,
    cities: 0
  }
}

/**
 * Authenticated Request interface template
 */
export const AuthenticatedRequest = {
  user: null,
  // ... other NextApiRequest properties
}

/**
 * Token Payload interface template
 */
export const TokenPayload = {
  sub: '',
  email: '',
  'cognito:username': '',
  name: ''
}

/**
 * Tokens interface template
 */
export const Tokens = {
  accessToken: null,
  idToken: null,
  refreshToken: null
}

/**
 * Authentication State interface template
 */
export const AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  tokens: { ...Tokens },
  error: null
}

/**
 * Restaurant interface template
 */
export const Restaurant = {
  id: '',
  name: '',
  description: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    countryCode: '',
    district: '',
    landmark: '',
    formatted: ''
  },
  location: {
    latitude: 0,
    longitude: 0,
    accuracy: 0
  },
  contact: {
    phone: '',
    email: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      youtube: ''
    }
  },
  rating: 0,
  priceRange: '',
  cuisineTypes: [],
  amenities: [],
  dietaryOptions: [],
  paymentMethods: [],
  certifications: [],
  images: [],
  operatingHours: [],
  isActive: true,
  isVerified: false,
  createdAt: '',
  updatedAt: ''
}

/**
 * Review interface template
 */
export const Review = {
  id: '',
  restaurantId: '',
  userId: '',
  userName: '',
  userProfilePicture: '',
  rating: 0,
  title: '',
  content: '',
  visitDate: '',
  createdAt: '',
  updatedAt: '',
  images: [],
  likes: 0,
  comments: 0,
  isVerifiedVisit: false,
  dishRatings: [],
  categoryRatings: {
    food: 0,
    service: 0,
    ambience: 0,
    value: 0,
    cleanliness: 0
  },
  tags: [],
  helpfulCount: 0,
  reportCount: 0,
  status: 'published'
}

/**
 * Type checking utilities
 */

/**
 * Check if a value is a string
 * @param {any} value Value to check
 * @returns {boolean} True if value is a string
 */
export function isString(value) {
  return typeof value === 'string'
}

/**
 * Check if a value is a number
 * @param {any} value Value to check
 * @returns {boolean} True if value is a number
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Check if a value is a boolean
 * @param {any} value Value to check
 * @returns {boolean} True if value is a boolean
 */
export function isBoolean(value) {
  return typeof value === 'boolean'
}

/**
 * Check if a value is an object
 * @param {any} value Value to check
 * @returns {boolean} True if value is an object
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Check if a value is an array
 * @param {any} value Value to check
 * @returns {boolean} True if value is an array
 */
export function isArray(value) {
  return Array.isArray(value)
}

/**
 * Check if a value is null or undefined
 * @param {any} value Value to check
 * @returns {boolean} True if value is null or undefined
 */
export function isNullOrUndefined(value) {
  return value === null || value === undefined
}

/**
 * Check if a value is a valid email
 * @param {any} value Value to check
 * @returns {boolean} True if value is a valid email
 */
export function isValidEmail(value) {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Check if a value is a valid URL
 * @param {any} value Value to check
 * @returns {boolean} True if value is a valid URL
 */
export function isValidUrl(value) {
  if (!isString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a value is a valid date string
 * @param {any} value Value to check
 * @returns {boolean} True if value is a valid date string
 */
export function isValidDateString(value) {
  if (!isString(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Check if a value is a valid time string (HH:MM format)
 * @param {any} value Value to check
 * @returns {boolean} True if value is a valid time string
 */
export function isValidTimeString(value) {
  if (!isString(value)) return false
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(value)
}

/**
 * Validation utilities
 */

/**
 * Validate user object
 * @param {any} user User object to validate
 * @returns {object} Validation result
 */
export function validateUser(user) {
  const errors = []

  if (!isObject(user)) {
    errors.push('User must be an object')
    return { isValid: false, errors }
  }

  if (!isString(user.id) || user.id.trim() === '') {
    errors.push('User ID is required and must be a non-empty string')
  }

  if (!isString(user.email) || !isValidEmail(user.email)) {
    errors.push('Valid email is required')
  }

  if (user.name && !isString(user.name)) {
    errors.push('Name must be a string')
  }

  if (user.phone && !isString(user.phone)) {
    errors.push('Phone must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate API response object
 * @param {any} response Response object to validate
 * @returns {object} Validation result
 */
export function validateApiResponse(response) {
  const errors = []

  if (!isObject(response)) {
    errors.push('Response must be an object')
    return { isValid: false, errors }
  }

  if (!('success' in response) || !isBoolean(response.success)) {
    errors.push('Response must have a boolean success property')
  }

  if (!('data' in response)) {
    errors.push('Response must have a data property')
  }

  if (response.message && !isString(response.message)) {
    errors.push('Message must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate paginated response object
 * @param {any} response Paginated response object to validate
 * @returns {object} Validation result
 */
export function validatePaginatedResponse(response) {
  const errors = []

  if (!isObject(response)) {
    errors.push('Response must be an object')
    return { isValid: false, errors }
  }

  if (!isArray(response.items)) {
    errors.push('Items must be an array')
  }

  if (!isNumber(response.total) || response.total < 0) {
    errors.push('Total must be a non-negative number')
  }

  if (!isNumber(response.page) || response.page < 1) {
    errors.push('Page must be a positive number')
  }

  if (!isNumber(response.limit) || response.limit < 1) {
    errors.push('Limit must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Type conversion utilities
 */

/**
 * Convert value to string safely
 * @param {any} value Value to convert
 * @param {string} defaultValue Default value if conversion fails
 * @returns {string} Converted string value
 */
export function toString(value, defaultValue = '') {
  if (isString(value)) return value
  if (isNullOrUndefined(value)) return defaultValue
  try {
    return String(value)
  } catch {
    return defaultValue
  }
}

/**
 * Convert value to number safely
 * @param {any} value Value to convert
 * @param {number} defaultValue Default value if conversion fails
 * @returns {number} Converted number value
 */
export function toNumber(value, defaultValue = 0) {
  if (isNumber(value)) return value
  if (isString(value)) {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

/**
 * Convert value to boolean safely
 * @param {any} value Value to convert
 * @param {boolean} defaultValue Default value if conversion fails
 * @returns {boolean} Converted boolean value
 */
export function toBoolean(value, defaultValue = false) {
  if (isBoolean(value)) return value
  if (isString(value)) {
    const lower = value.toLowerCase()
    if (lower === 'true' || lower === '1' || lower === 'yes') return true
    if (lower === 'false' || lower === '0' || lower === 'no') return false
  }
  if (isNumber(value)) {
    return value !== 0
  }
  return defaultValue
}

/**
 * Deep clone an object
 * @param {any} obj Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }

  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * Merge objects deeply
 * @param {object} target Target object
 * @param {object} source Source object
 * @returns {object} Merged object
 */
export function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) {
    return source
  }

  const result = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (isObject(source[key]) && isObject(target[key])) {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
  }

  return result
}
