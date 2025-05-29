/**
 * CSRF Protection Utilities
 *
 * This module provides functions for generating and validating CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */

/**
 * Generates a random CSRF token
 * @returns A random string to be used as a CSRF token
 */
export const generateCsrfToken = (): string => {
  // Generate a random string with high entropy
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to base64 string
  // Create an array from the Uint8Array to avoid TypeScript iteration error
  const bytesArray = Array.from(randomBytes);
  return btoa(String.fromCharCode.apply(null, bytesArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Sets a CSRF token via server API
 * @param token The CSRF token to store
 */
export const setCsrfTokenCookie = async (token: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      // Set the CSRF token via server API
      await fetch('/api/csrf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });
    } catch (error: unknown) {
      console.error('Failed to set CSRF token:', error);
    }
  }
};

/**
 * Gets the CSRF token from server
 * @returns The CSRF token or null if not found
 */
export const getCsrfTokenFromCookie = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }

    return null;
  } catch (error: unknown) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
};

/**
 * Generates a new CSRF token and stores it via server API
 * @returns The generated CSRF token
 */
export const initCsrfProtection = async (): Promise<string> => {
  const token = generateCsrfToken();
  await setCsrfTokenCookie(token);
  return token;
};

/**
 * Validates a CSRF token against the one stored in server
 * @param token The token to validate
 * @returns True if the token is valid, false otherwise
 */
export const validateCsrfToken = async (token: string): Promise<boolean> => {
  const storedToken = await getCsrfTokenFromCookie();
  return !!storedToken && token === storedToken;
};
