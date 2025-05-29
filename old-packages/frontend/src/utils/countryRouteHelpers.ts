/**
 * Country Route Helpers
 *
 * A collection of utility functions to help with country-based routing.
 * These helpers streamline common operations like validation, redirection,
 * and URL generation for the dynamic country routing system.
 */

// NOTE: This import will work in the actual codebase where @/config/countries is available
// Remove this comment when using in production
import { COUNTRIES } from '@/config/countries';

// Uncomment this mock implementation if you need to test this file in isolation
// and comment out the actual import above
/*
const COUNTRIES: Record<string, { name: string; code: string }> = {
  my: { name: 'Malaysia', code: 'my' },
  sg: { name: 'Singapore', code: 'sg' }
};
*/

/**
 * Validates if a country code is valid according to the COUNTRIES config
 */
export function isValidCountry(
  countryCode: string | undefined | null,
): boolean {
  if (!countryCode) return false;
  return !!COUNTRIES[countryCode];
}

/**
 * Gets a valid country code, falling back to default if invalid
 */
export function getValidCountryCode(
  countryCode: string | undefined | null,
): string {
  if (!countryCode || !COUNTRIES[countryCode]) return 'my'; // Default to 'my'
  return countryCode;
}

/**
 * Generates a country-specific URL for a given page
 */
export function getCountryUrl(countryCode: string, pagePath: string): string {
  const validCountry = getValidCountryCode(countryCode);
  // Ensure pagePath doesn't start with a slash
  const cleanPath = pagePath.startsWith('/') ? pagePath.substring(1) : pagePath;
  return `/${validCountry}/${cleanPath}`;
}

/**
 * Returns paths configuration for getStaticPaths in Next.js pages
 */
export function getCountryStaticPaths(
  fallbackMode: boolean | 'blocking' = 'blocking',
): {
  paths: { params: { country: string } }[];
  fallback: boolean | 'blocking';
} {
  return {
    paths: Object.keys(COUNTRIES).map((countryCode) => ({
      params: { country: countryCode },
    })),
    fallback: fallbackMode,
  };
}

/**
 * Returns props including validated country for getStaticProps in Next.js pages
 */
export function getCountryStaticProps(
  params: { country: string },
  additionalProps = {},
): {
  props: { country: string } & Record<string, unknown>;
  revalidate: number;
} {
  const countryCode = getValidCountryCode(params.country);

  return {
    props: {
      country: countryCode,
      ...additionalProps,
    },
    revalidate: 3600, // Cache for 1 hour
  };
}
