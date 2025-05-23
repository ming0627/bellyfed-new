/**
 * Utility functions for handling country-specific routing in Next.js
 */

// Supported countries
const SUPPORTED_COUNTRIES = ['my', 'sg'];

/**
 * Generate a country-specific URL
 * 
 * @param country - The country code (e.g., 'my', 'sg')
 * @param path - The path to navigate to (e.g., '/explore')
 * @returns The country-specific URL (e.g., '/my/explore')
 */
export const getCountryUrl = (country: string, path: string): string => {
  // Ensure country is valid
  const validCountry = SUPPORTED_COUNTRIES.includes(country) ? country : 'my';
  
  // Handle empty path
  if (!path) return `/${validCountry}`;
  
  // Ensure path doesn't start with a slash for concatenation
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Return the country-specific URL
  return `/${validCountry}/${normalizedPath}`;
};

/**
 * Generate static paths for all supported countries
 * Used in getStaticPaths for country-based dynamic routes
 * 
 * @returns Object with paths and fallback setting for Next.js getStaticPaths
 */
export const getCountryStaticPaths = () => {
  return {
    paths: SUPPORTED_COUNTRIES.map(country => ({
      params: { country }
    })),
    fallback: false // Do not generate pages for countries not in the list
  };
};

/**
 * Generate static props with country information
 * Used in getStaticProps for country-based dynamic routes
 * 
 * @param params - The params object from getStaticProps
 * @returns Object with props containing country information
 */
export const getCountryStaticProps = (params: { country: string }) => {
  // Validate country code
  const country = params.country;
  
  // If country is not supported, redirect to default country
  if (!SUPPORTED_COUNTRIES.includes(country)) {
    return {
      redirect: {
        destination: '/my',
        permanent: false
      }
    };
  }
  
  // Return country as props
  return {
    props: {
      country
    }
  };
};
