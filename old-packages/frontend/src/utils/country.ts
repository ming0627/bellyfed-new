import { COUNTRIES } from '@/config/countries';

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
