/**
 * Country helpers for static generation
 */

// Supported countries
const SUPPORTED_COUNTRIES = ['us', 'my', 'sg', 'jp'];

/**
 * Generate static paths for all supported countries
 * @returns {Object} Static paths configuration
 */
export function getCountryStaticPaths() {
  const paths = SUPPORTED_COUNTRIES.map((country) => ({
    params: { country },
  }));

  return {
    paths,
    fallback: false,
  };
}

/**
 * Get static props with country information
 * @param {Object} params - Route parameters
 * @returns {Object} Static props configuration
 */
export function getCountryStaticProps({ params }) {
  const { country } = params;

  // Validate country
  if (!SUPPORTED_COUNTRIES.includes(country)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      country,
    },
  };
}
