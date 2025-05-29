/**
 * API Configuration Utilities
 *
 * This file provides utility functions for API configuration and URL generation.
 * It centralizes the API URL configuration logic used across the application.
 */

/**
 * Determines which environment to use for API calls
 * Available environments: dev, test, qa, prod
 */
const getApiEnvironment = (): string => {
  return process.env.API_ENV || 'dev';
};

/**
 * Determines whether to use AWS API or local API
 * - true: Use AWS API endpoints (api-dev.bellyfed.com, etc.)
 * - false: Use local API endpoints (localhost:3001)
 */
const useAwsApi = (): boolean => {
  return (
    process.env.USE_AWS_API === 'true' || process.env.NODE_ENV !== 'development'
  );
};

/**
 * Gets the base API URL based on current configuration
 * @returns The base API URL
 */
export const getApiUrl = (): string => {
  const apiEnv = getApiEnvironment();
  const useAws = useAwsApi();

  if (useAws) {
    // Use AWS API endpoints
    return `https://api${apiEnv === 'prod' ? '' : '-' + apiEnv}.bellyfed.com/v1`;
  } else {
    // Use local API endpoints
    return 'http://localhost:3001/api';
  }
};

/**
 * Gets the database API URL based on current configuration
 * @returns The database API URL
 */
export const getDbApiUrl = (): string => {
  const apiEnv = getApiEnvironment();
  const useAws = useAwsApi();

  if (useAws) {
    // Use AWS API endpoints
    return `https://api${apiEnv === 'prod' ? '' : '-' + apiEnv}.bellyfed.com/v1/db`;
  } else {
    // Use local API endpoints
    return 'http://localhost:3001/api/database';
  }
};

/**
 * Gets the rankings API URL based on current configuration
 * @returns The rankings API URL
 */
export const getRankingsApiUrl = (): string => {
  const apiEnv = getApiEnvironment();
  const useAws = useAwsApi();

  if (useAws) {
    // Use AWS API endpoints
    return `https://api${apiEnv === 'prod' ? '' : '-' + apiEnv}.bellyfed.com/v1/rankings`;
  } else {
    // Use local API endpoints
    return 'http://localhost:3001/api/rankings';
  }
};

/**
 * Gets the API key from environment variables
 * @returns The API key or an empty string if not found
 */
export const getApiKey = (): string => {
  return process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || '';
};

/**
 * Determines the appropriate API URL based on the path
 * @param path The API path
 * @returns The full API URL
 */
export const getApiUrlForPath = (path: string): string => {
  // Database operations
  if (path.startsWith('db/') || path.startsWith('database/')) {
    return getDbApiUrl();
  }
  // Rankings operations
  else if (path.startsWith('rankings/')) {
    return getRankingsApiUrl();
  }
  // Default API operations
  return getApiUrl();
};
