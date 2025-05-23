/**
 * Date Utilities
 *
 * This module provides utility functions for formatting and manipulating dates and times.
 * It includes functions for formatting dates in various formats, calculating date differences,
 * and working with time strings.
 */

/**
 * Format a time string (HH:MM) to a 12-hour format with AM/PM
 * @param {string} time Time string in 24-hour format (HH:MM)
 * @returns {string} Formatted time string in 12-hour format (h:MM AM/PM)
 */
export function formatTime(time) {
  try {
    if (!time || typeof time !== 'string') {
      return time || ''
    }

    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      throw new Error('Invalid hour value')
    }
    
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  } catch (error) {
    console.error('Error formatting time:', error)
    return time // Return the original time string if there's an error
  }
}

/**
 * Format a date object to a string in YYYY-MM-DD format
 * @param {Date} date Date object to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export function formatDate(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return ''
    }

    const parts = date.toISOString().split('T')
    return parts[0] || ''
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Format a date object to a human-readable string
 * @param {Date} date Date object to format
 * @returns {string} Formatted date string (e.g., "January 15, 2023")
 */
export function formatDateHuman(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return ''
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting human date:', error)
    return ''
  }
}

/**
 * Format a date object to a short human-readable string
 * @param {Date} date Date object to format
 * @returns {string} Formatted date string (e.g., "Jan 15, 2023")
 */
export function formatDateShort(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return ''
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting short date:', error)
    return ''
  }
}

/**
 * Check if a date is today
 * @param {Date} date Date object to check
 * @returns {boolean} Whether the date is today
 */
export function isToday(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return false
    }

    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  } catch (error) {
    console.error('Error checking if date is today:', error)
    return false
  }
}

/**
 * Check if a date is yesterday
 * @param {Date} date Date object to check
 * @returns {boolean} Whether the date is yesterday
 */
export function isYesterday(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return false
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  } catch (error) {
    console.error('Error checking if date is yesterday:', error)
    return false
  }
}

/**
 * Parse a date string to a Date object
 * @param {string} dateString Date string to parse
 * @returns {Date|null} Date object or null if the string is invalid
 */
export function parseDate(dateString) {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return null
    }

    const date = new Date(dateString)
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null
    }
    return date
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

/**
 * Get the relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {Date} date Date object to get relative time for
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return ''
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
    }
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
    }
    
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
  } catch (error) {
    console.error('Error getting relative time:', error)
    return ''
  }
}

/**
 * Format a date for display in a review or comment
 * @param {Date} date Date object to format
 * @returns {string} Formatted date string
 */
export function formatReviewDate(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return ''
    }

    if (isToday(date)) {
      return `Today at ${formatTime(
        `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      )}`
    }

    if (isYesterday(date)) {
      return `Yesterday at ${formatTime(
        `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      )}`
    }

    // For dates older than yesterday, show the date
    const diffInDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    if (diffInDays < 7) {
      return `${diffInDays} days ago`
    }

    return formatDateShort(date)
  } catch (error) {
    console.error('Error formatting review date:', error)
    return ''
  }
}

/**
 * Add days to a date
 * @param {Date} date Date object to add days to
 * @param {number} days Number of days to add
 * @returns {Date} New date object with days added
 */
export function addDays(date, days) {
  try {
    if (!date || !(date instanceof Date) || typeof days !== 'number') {
      return new Date()
    }

    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  } catch (error) {
    console.error('Error adding days to date:', error)
    return new Date()
  }
}

/**
 * Subtract days from a date
 * @param {Date} date Date object to subtract days from
 * @param {number} days Number of days to subtract
 * @returns {Date} New date object with days subtracted
 */
export function subtractDays(date, days) {
  return addDays(date, -days)
}

/**
 * Get the start of the day for a date
 * @param {Date} date Date object
 * @returns {Date} New date object set to start of day (00:00:00)
 */
export function startOfDay(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return new Date()
    }

    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  } catch (error) {
    console.error('Error getting start of day:', error)
    return new Date()
  }
}

/**
 * Get the end of the day for a date
 * @param {Date} date Date object
 * @returns {Date} New date object set to end of day (23:59:59.999)
 */
export function endOfDay(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return new Date()
    }

    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  } catch (error) {
    console.error('Error getting end of day:', error)
    return new Date()
  }
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 First date
 * @param {Date} date2 Second date
 * @returns {boolean} Whether the dates are the same day
 */
export function isSameDay(date1, date2) {
  try {
    if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
      return false
    }

    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  } catch (error) {
    console.error('Error checking if same day:', error)
    return false
  }
}

/**
 * Get the number of days between two dates
 * @param {Date} date1 First date
 * @param {Date} date2 Second date
 * @returns {number} Number of days between the dates
 */
export function daysBetween(date1, date2) {
  try {
    if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
      return 0
    }

    const diffInTime = Math.abs(date2 - date1)
    return Math.ceil(diffInTime / (1000 * 60 * 60 * 24))
  } catch (error) {
    console.error('Error calculating days between dates:', error)
    return 0
  }
}

/**
 * Format a date for API requests (ISO string)
 * @param {Date} date Date object to format
 * @returns {string} ISO formatted date string
 */
export function formatDateForApi(date) {
  try {
    if (!date || !(date instanceof Date)) {
      return ''
    }

    return date.toISOString()
  } catch (error) {
    console.error('Error formatting date for API:', error)
    return ''
  }
}

/**
 * Get current timestamp in milliseconds
 * @returns {number} Current timestamp
 */
export function getCurrentTimestamp() {
  return Date.now()
}

/**
 * Get current date as ISO string
 * @returns {string} Current date as ISO string
 */
export function getCurrentISOString() {
  return new Date().toISOString()
}
