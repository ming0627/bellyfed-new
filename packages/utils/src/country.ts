/**
 * Country Utilities
 *
 * This file provides utility functions for working with country codes and contexts.
 * It helps with extracting and validating country codes from various sources.
 */

import { COUNTRIES } from './config/countries.js';

/**
 * Helper function to get country from context
 * @param context The Next.js context object
 * @returns The country code or null if invalid
 */
export function getCountryFromContext(
  context: Record<string, any>,
): string | null {
  try {
    const { params } = context;
    const countryCode = params?.country;

    if (!countryCode) return null;

    // Check if it's a valid country code
    if (COUNTRIES[countryCode]) {
      return countryCode;
    }

    return null;
  } catch (error: unknown) {
    console.error('Error getting country from context:', error);
    return null;
  }
}

/**
 * Extracts the country code from a path
 * @param path The path to extract the country code from
 * @returns The country code or 'my' as default
 */
export const extractCountryCode = (path: string): string => {
  const pathSegments = path.split('/').filter(Boolean);
  return pathSegments[0] === 'my' || pathSegments[0] === 'sg'
    ? pathSegments[0]
    : 'my';
};

/**
 * Gets the country configuration for a country code
 * @param countryCode The country code
 * @returns The country configuration or null if invalid
 */
export const getCountryConfig = (countryCode: string) => {
  return COUNTRIES[countryCode] || null;
};

/**
 * Gets the default country code
 * @returns The default country code
 */
export const getDefaultCountryCode = (): string => {
  return 'my';
};

/**
 * Gets all supported country codes
 * @returns Array of supported country codes
 */
export const getSupportedCountryCodes = (): string[] => {
  return Object.keys(COUNTRIES);
};

/**
 * Checks if a country code is valid
 * @param countryCode The country code to check
 * @returns Whether the country code is valid
 */
export const isValidCountryCode = (countryCode: string): boolean => {
  return !!COUNTRIES[countryCode];
};

/**
 * Gets the country name for a country code
 * @param countryCode The country code
 * @returns The country name or null if invalid
 */
export const getCountryName = (countryCode: string): string | null => {
  return COUNTRIES[countryCode]?.name || null;
};

/**
 * Gets the currency code for a country code
 * @param countryCode The country code
 * @returns The currency code or null if invalid
 */
export const getCountryCurrency = (countryCode: string): string | null => {
  return COUNTRIES[countryCode]?.currency || null;
};

/**
 * Gets the flag URL for a country code
 * @param countryCode The country code
 * @returns The flag URL or null if invalid
 */
export const getCountryFlagUrl = (countryCode: string): string | null => {
  return COUNTRIES[countryCode]?.flagUrl || null;
};

/**
 * Gets the top reviewers for a country code
 * @param countryCode The country code
 * @returns The top reviewers or empty array if invalid
 */
export const getCountryTopReviewers = (
  countryCode: string,
): Array<{ name: string; reviews: number; badge: string }> => {
  return COUNTRIES[countryCode]?.reviewers || [];
};

/**
 * Gets the top dishes for a country code
 * @param countryCode The country code
 * @returns The top dishes or empty array if invalid
 */
export const getCountryTopDishes = (
  countryCode: string,
): Array<{ name: string; votes: number; trend: string }> => {
  return COUNTRIES[countryCode]?.dishes || [];
};

/**
 * Gets the top locations for a country code
 * @param countryCode The country code
 * @returns The top locations or empty array if invalid
 */
export const getCountryTopLocations = (
  countryCode: string,
): Array<{ name: string; restaurants: number; newCount: string }> => {
  return COUNTRIES[countryCode]?.locations || [];
};
