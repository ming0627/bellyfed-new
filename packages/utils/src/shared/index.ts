/**
 * Shared Utilities
 *
 * This module provides common utility functions that are shared between
 * frontend and backend components of the application.
 */

/**
 * Format date to a human-readable string
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions for customizing the format
 * @param locale Locale string for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale = 'en-US',
): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    
    return d.toLocaleDateString(locale, options);
  } catch (error: unknown) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Currency configuration interface
 * Represents the configuration for a currency
 */
export interface CurrencyConfig {
  /**
   * Currency code (e.g., 'MYR', 'USD')
   */
  code: string;
  
  /**
   * Currency symbol (e.g., 'RM', '$')
   */
  symbol: string;
  
  /**
   * Number of decimal places
   */
  decimals: number;
  
  /**
   * Locale to use for formatting
   */
  locale: string;
}

/**
 * Currency configuration map
 * Maps country codes to currency configurations
 */
export const currencyConfigs: Record<string, CurrencyConfig> = {
  my: { code: 'MYR', symbol: 'RM', decimals: 2, locale: 'en-MY' },
  sg: { code: 'SGD', symbol: 'S$', decimals: 2, locale: 'en-SG' },
  th: { code: 'THB', symbol: '฿', decimals: 2, locale: 'th-TH' },
  id: { code: 'IDR', symbol: 'Rp', decimals: 0, locale: 'id-ID' },
  vn: { code: 'VND', symbol: '₫', decimals: 0, locale: 'vi-VN' },
  ph: { code: 'PHP', symbol: '₱', decimals: 2, locale: 'en-PH' },
  us: { code: 'USD', symbol: '$', decimals: 2, locale: 'en-US' },
};

/**
 * Format currency based on country code
 * @param amount Amount to format
 * @param countryCode Country code (e.g., 'my' for Malaysia)
 * @param options Intl.NumberFormatOptions for customizing the format
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  countryCode = 'my',
  options?: Intl.NumberFormatOptions,
): string {
  try {
    const config = currencyConfigs[countryCode] || currencyConfigs.us;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
      ...options,
    }).format(amount);
  } catch (error: unknown) {
    console.error('Error formatting currency:', error);
    return `${amount}`;
  }
}

/**
 * Format currency with symbol only (no currency code)
 * @param amount Amount to format
 * @param countryCode Country code (e.g., 'my' for Malaysia)
 * @returns Formatted currency string with symbol only
 */
export function formatCurrencyWithSymbol(
  amount: number,
  countryCode = 'my',
): string {
  try {
    const config = currencyConfigs[countryCode] || currencyConfigs.us;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch (error: unknown) {
    console.error('Error formatting currency with symbol:', error);
    return `${amount}`;
  }
}

/**
 * Get currency symbol for a country
 * @param countryCode Country code (e.g., 'my' for Malaysia)
 * @returns Currency symbol
 */
export function getCurrencySymbol(countryCode = 'my'): string {
  const config = currencyConfigs[countryCode] || currencyConfigs.us;
  return config.symbol;
}

/**
 * Truncate text to a specified length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add to truncated text (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix = '...',
): string {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  // Truncate at the last space before maxLength if possible
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // If there's a space in the last 30% of the text, truncate there
    return `${text.substring(0, lastSpace)}${suffix}`;
  }
  
  return `${truncated}${suffix}`;
}

/**
 * Generate a random ID
 * @param length Length of the ID (default: 8)
 * @param includeSpecialChars Whether to include special characters (default: false)
 * @returns Random ID
 */
export function generateId(length = 8, includeSpecialChars = false): string {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  if (includeSpecialChars) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  let result = '';
  const randomValues = new Uint8Array(length);
  
  // Use crypto.getRandomValues if available for better randomness
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // More comprehensive email regex that handles most valid email formats
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email.toLowerCase());
}

/**
 * Validate phone number format
 * @param phoneNumber Phone number to validate
 * @param countryCode Country code for validation rules (default: 'my')
 * @returns Whether the phone number is valid
 */
export function isValidPhoneNumber(
  phoneNumber: string,
  countryCode = 'my',
): boolean {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters except +
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Basic validation: 8-15 digits, may start with +
  const basicRegex = /^\+?[0-9]{8,15}$/;
  
  // Country-specific validation
  const countryRegexes: Record<string, RegExp> = {
    my: /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, // Malaysia
    sg: /^(\+?65)?[689][0-9]{7}$/, // Singapore
    th: /^(\+?66)?[0-9]{9}$/, // Thailand
    id: /^(\+?62|0)[0-9]{9,12}$/, // Indonesia
    vn: /^(\+?84|0)[3-9][0-9]{8}$/, // Vietnam
    ph: /^(\+?63|0)[0-9]{10}$/, // Philippines
  };
  
  // Use country-specific regex if available, otherwise use basic regex
  const regex = countryRegexes[countryCode] || basicRegex;
  return regex.test(cleanedNumber);
}

/**
 * Delay execution for a specified time
 * @param ms Milliseconds to delay (default: 1000)
 * @returns Promise that resolves after the delay
 */
export function delay(ms = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format a number with commas as thousands separators
 * @param number Number to format
 * @param decimals Number of decimal places (default: 0)
 * @param locale Locale string for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(
  number: number,
  decimals = 0,
  locale = 'en-US',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  } catch (error: unknown) {
    console.error('Error formatting number:', error);
    return `${number}`;
  }
}

/**
 * Format a percentage
 * @param value Value to format as percentage
 * @param decimals Number of decimal places (default: 0)
 * @param locale Locale string for formatting (default: 'en-US')
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals = 0,
  locale = 'en-US',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error: unknown) {
    console.error('Error formatting percentage:', error);
    return `${value * 100}%`;
  }
}

/**
 * Capitalize the first letter of a string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to title case
 * @param text Text to convert
 * @returns Title case text
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
