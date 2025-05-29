/**
 * AWS utility functions
 */

import axios from 'axios';

// Cache for SSM parameters and secrets
const ssmCache = new Map<string, { value: string; timestamp: number }>();
const secretsCache = new Map<string, { value: string; timestamp: number }>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Get a parameter from AWS SSM Parameter Store
 *
 * @param name Parameter name
 * @param skipCache Whether to skip the cache and fetch fresh data
 * @returns Parameter value or null if not found
 */
export async function getSSMParameter(
  name: string,
  skipCache = false,
): Promise<string | null> {
  try {
    // Check cache first if not skipping cache
    if (!skipCache) {
      const cached = ssmCache.get(name);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
        return cached.value;
      }
    }

    // Fetch from API
    const response = await axios.get(
      `/api/aws/ssm?name=${encodeURIComponent(name)}`,
    );

    // Cache the result
    if (response.data.value) {
      ssmCache.set(name, {
        value: response.data.value,
        timestamp: Date.now(),
      });
    }

    return response.data.value;
  } catch (error: unknown) {
    console.error(`Error getting SSM parameter ${name}:`, error);
    return null;
  }
}

/**
 * Get a secret from AWS Secrets Manager
 *
 * @param name Secret name
 * @param skipCache Whether to skip the cache and fetch fresh data
 * @returns Secret value or null if not found
 */
export async function getSecret(
  name: string,
  skipCache = false,
): Promise<string | null> {
  try {
    // Check cache first if not skipping cache
    if (!skipCache) {
      const cached = secretsCache.get(name);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
        return cached.value;
      }
    }

    // Fetch from API
    const response = await axios.get(
      `/api/aws/secrets?name=${encodeURIComponent(name)}`,
    );

    // Cache the result
    if (response.data.value) {
      secretsCache.set(name, {
        value: response.data.value,
        timestamp: Date.now(),
      });
    }

    return response.data.value;
  } catch (error: unknown) {
    console.error(`Error getting secret ${name}:`, error);
    return null;
  }
}

/**
 * Parse a JSON secret from AWS Secrets Manager
 *
 * @param name Secret name
 * @param skipCache Whether to skip the cache and fetch fresh data
 * @returns Parsed secret object or null if not found or invalid JSON
 */
export async function getJSONSecret<T>(
  name: string,
  skipCache = false,
): Promise<T | null> {
  try {
    const secretValue = await getSecret(name, skipCache);

    if (!secretValue) {
      return null;
    }

    return JSON.parse(secretValue) as T;
  } catch (error: unknown) {
    console.error(`Error parsing JSON secret ${name}:`, error);
    return null;
  }
}
