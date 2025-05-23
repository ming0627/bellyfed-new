/**
 * Utility functions for handling country-specific routing
 */

/**
 * Generate a country-specific link
 * 
 * @param {string} path - The path to navigate to (e.g., '/explore')
 * @param {string} countryCode - The country code (e.g., 'my', 'sg')
 * @returns {string} The country-specific path (e.g., '/my/explore')
 */
export const getCountryLink = (path, countryCode) => {
  if (!countryCode) return path;
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If path is just '/', don't add another slash
  if (normalizedPath === '/') {
    return `/${countryCode}`;
  }
  
  return `/${countryCode}${normalizedPath}`;
};

/**
 * Check if a route is active, accounting for country prefixes
 * 
 * @param {string} path - The path to check (e.g., '/explore')
 * @param {string} pathname - The current pathname from router (e.g., '/[country]/explore')
 * @returns {boolean} Whether the route is active
 */
export const isRouteActive = (path, pathname) => {
  if (path === '/') {
    return pathname === '/' || pathname === '/[country]';
  }
  
  // Remove country prefix from pathname for comparison
  const routeWithoutCountry = pathname.replace(/^\/\[country\]/, '');
  
  // Check if the current route matches the path, ignoring the country prefix
  return routeWithoutCountry === path || routeWithoutCountry.startsWith(path);
};
