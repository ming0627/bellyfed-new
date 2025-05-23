/**
 * AWS Utility Functions
 *
 * This file provides utility functions for interacting with AWS services
 * through the application's API endpoints. It includes functions for
 * retrieving parameters from SSM Parameter Store and secrets from Secrets Manager.
 */

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
    const response = await fetch(
      `/api/aws/ssm?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch SSM parameter: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    if (data.value) {
      ssmCache.set(name, {
        value: data.value,
        timestamp: Date.now(),
      });
    }

    return data.value;
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
    const response = await fetch(
      `/api/aws/secrets?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch secret: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    if (data.value) {
      secretsCache.set(name, {
        value: data.value,
        timestamp: Date.now(),
      });
    }

    return data.value;
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

/**
 * Clear the SSM parameter cache
 * @param name Optional parameter name to clear. If not provided, clears the entire cache.
 */
export function clearSSMCache(name?: string): void {
  if (name) {
    ssmCache.delete(name);
  } else {
    ssmCache.clear();
  }
}

/**
 * Clear the Secrets Manager cache
 * @param name Optional secret name to clear. If not provided, clears the entire cache.
 */
export function clearSecretsCache(name?: string): void {
  if (name) {
    secretsCache.delete(name);
  } else {
    secretsCache.clear();
  }
}

/**
 * Get multiple parameters from AWS SSM Parameter Store
 *
 * @param names Array of parameter names
 * @param skipCache Whether to skip the cache and fetch fresh data
 * @returns Object mapping parameter names to their values
 */
export async function getMultipleSSMParameters(
  names: string[],
  skipCache = false,
): Promise<Record<string, string | null>> {
  try {
    const result: Record<string, string | null> = {};
    
    // Use Promise.all to fetch all parameters in parallel
    const values = await Promise.all(
      names.map((name) => getSSMParameter(name, skipCache))
    );
    
    // Map the results to the parameter names
    names.forEach((name, index) => {
      result[name] = values[index];
    });
    
    return result;
  } catch (error: unknown) {
    console.error('Error getting multiple SSM parameters:', error);
    return {};
  }
}

/**
 * Get multiple secrets from AWS Secrets Manager
 *
 * @param names Array of secret names
 * @param skipCache Whether to skip the cache and fetch fresh data
 * @returns Object mapping secret names to their values
 */
export async function getMultipleSecrets(
  names: string[],
  skipCache = false,
): Promise<Record<string, string | null>> {
  try {
    const result: Record<string, string | null> = {};
    
    // Use Promise.all to fetch all secrets in parallel
    const values = await Promise.all(
      names.map((name) => getSecret(name, skipCache))
    );
    
    // Map the results to the secret names
    names.forEach((name, index) => {
      result[name] = values[index];
    });
    
    return result;
  } catch (error: unknown) {
    console.error('Error getting multiple secrets:', error);
    return {};
  }
}
