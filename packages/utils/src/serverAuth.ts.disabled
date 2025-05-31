/**
 * Server-side Authentication Utilities
 *
 * This module provides functions for server-side authentication checks
 * to protect pages and API routes.
 */

import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { User, TokenPayload, Tokens, AuthenticatedRequest } from './types/auth.js';

/**
 * Server authentication configuration interface
 * Represents the configuration for server-side authentication
 */
export interface ServerAuthConfig {
  /**
   * Cognito User Pool ID
   */
  userPoolId: string;

  /**
   * Cognito Client ID
   */
  clientId: string;

  /**
   * Cookie names for tokens
   */
  cookieNames: {
    /**
     * Cookie name for access token
     */
    accessToken: string;

    /**
     * Cookie name for ID token
     */
    idToken: string;

    /**
     * Cookie name for refresh token
     */
    refreshToken: string;
  };
}

// Default configuration
const defaultConfig: ServerAuthConfig = {
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || 'ap-southeast-1_xlU9zwY43',
  clientId:
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ||
    '3qmr0b7s247e2c7ogaopih1kgd',
  cookieNames: {
    accessToken: 'access_token',
    idToken: 'id_token',
    refreshToken: 'refresh_token',
  },
};

// Create verifiers for tokens
let idTokenVerifier: any = null;
let accessTokenVerifier: any = null;

/**
 * Initialize the token verifiers
 * @param config Server authentication configuration
 */
export const initializeVerifiers = (config: ServerAuthConfig = defaultConfig): void => {
  // Create a verifier for ID tokens
  idTokenVerifier = CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    tokenUse: 'id',
    clientId: config.clientId,
  });

  // Create a verifier for access tokens
  accessTokenVerifier = CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    tokenUse: 'access',
    clientId: config.clientId,
  });
};

/**
 * Get the token verifiers
 * @param config Server authentication configuration
 * @returns An object containing the ID token verifier and access token verifier
 */
export const getVerifiers = (config: ServerAuthConfig = defaultConfig): {
  idTokenVerifier: any;
  accessTokenVerifier: any;
} => {
  if (!idTokenVerifier || !accessTokenVerifier) {
    initializeVerifiers(config);
  }

  return { idTokenVerifier, accessTokenVerifier };
};

/**
 * Verify a JWT token
 * @param token The JWT token to verify
 * @param tokenType The type of token ('id' or 'access')
 * @param config Server authentication configuration
 * @returns The decoded token payload if valid, null otherwise
 */
export const verifyToken = async (
  token: string,
  tokenType: 'id' | 'access' = 'id',
  config: ServerAuthConfig = defaultConfig,
): Promise<TokenPayload | null> => {
  try {
    const { idTokenVerifier, accessTokenVerifier } = getVerifiers(config);
    const verifier = tokenType === 'id' ? idTokenVerifier : accessTokenVerifier;
    
    // Use unknown as intermediate type to safely cast to TokenPayload
    // Access tokens don't have email, but we only use ID tokens for user info
    const rawPayload = await verifier.verify(token);

    // For ID tokens, we can safely cast to TokenPayload
    // For access tokens, we need to ensure they have the required fields
    if (tokenType === 'id') {
      // Use type assertion with unknown as intermediate step for type safety
      return rawPayload as unknown as TokenPayload;
    } else {
      // For access tokens, we only need the sub field which is always present
      // Other fields used in the app (email, etc.) are only accessed from ID tokens
      const accessPayload = rawPayload as unknown as Record<string, unknown>;
      return {
        sub: accessPayload.sub as string,
        email: '', // Placeholder for type compatibility
        ...accessPayload,
      } as TokenPayload;
    }
  } catch (error: unknown) {
    console.error(`Error verifying ${tokenType} token:`, error);
    return null;
  }
};

/**
 * Extract tokens from cookies
 * @param cookies The cookies object from the request
 * @param config Server authentication configuration
 * @returns An object containing the access token, ID token, and refresh token
 */
export const extractTokensFromCookies = (
  cookies: Partial<{ [key: string]: string }>,
  config: ServerAuthConfig = defaultConfig,
): Tokens => {
  return {
    accessToken: cookies?.[config.cookieNames.accessToken] || null,
    idToken: cookies?.[config.cookieNames.idToken] || null,
    refreshToken: cookies?.[config.cookieNames.refreshToken] || null,
  };
};

/**
 * Check if a user is authenticated on the server side
 * @param context The GetServerSideProps context
 * @param config Server authentication configuration
 * @returns An object containing the authentication status and user info
 */
export const checkServerAuth = async (
  context: GetServerSidePropsContext,
  config: ServerAuthConfig = defaultConfig,
): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  const { req } = context;
  const cookies = req.cookies || {};

  // Extract tokens from cookies
  const { accessToken, idToken } = extractTokensFromCookies(
    cookies as { [key: string]: string },
    config,
  );

  // If no tokens, user is not authenticated
  if (!accessToken || !idToken) {
    return { isAuthenticated: false, user: null };
  }

  // Verify ID token
  const payload = await verifyToken(idToken, 'id', config);
  if (!payload) {
    return { isAuthenticated: false, user: null };
  }

  // Extract user info from token payload
  const user: User = {
    id: payload.sub,
    username: payload['cognito:username'] || payload.email,
    email: payload.email,
    name: payload.name,
  };

  return { isAuthenticated: true, user };
};

/**
 * Higher-order function to protect pages with server-side authentication
 * @param getServerSidePropsFunc The original getServerSideProps function (optional)
 * @param options Options for the protection (redirectUrl, etc.)
 * @param config Server authentication configuration
 * @returns A new getServerSideProps function that includes authentication checks
 */
export const withServerAuth = <
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext,
  ) => Promise<GetServerSidePropsResult<P>>,
  options: {
    redirectUrl?: string;
    returnTo?: boolean;
  } = {},
  config: ServerAuthConfig = defaultConfig,
) => {
  return async (
    context: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<P & { user: User }>> => {
    const { isAuthenticated, user } = await checkServerAuth(context, config);

    // If not authenticated, redirect to sign-in page
    if (!isAuthenticated) {
      const redirectUrl = options.redirectUrl || '/signin';

      // If returnTo is enabled, add the current path as a query parameter
      let finalRedirectUrl = redirectUrl;
      if (options.returnTo) {
        const returnUrl = encodeURIComponent(context.resolvedUrl);
        finalRedirectUrl = `${redirectUrl}?returnUrl=${returnUrl}`;
      }

      return {
        redirect: {
          destination: finalRedirectUrl,
          permanent: false,
        },
      };
    }

    // If authenticated and there's an original getServerSideProps function, call it
    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(context);

      // If the result has props, add the user to the props
      if ('props' in result) {
        return {
          props: {
            ...result.props,
            user: user as User,
          },
        } as GetServerSidePropsResult<P & { user: User }>;
      }

      return result as GetServerSidePropsResult<P & { user: User }>;
    }

    // If authenticated and there's no original getServerSideProps function, return the user
    return {
      props: {
        user: user as User,
      } as P & { user: User },
    };
  };
};

/**
 * Protect an API route with server-side authentication
 * @param handler The API route handler
 * @param config Server authentication configuration
 * @returns A new handler that includes authentication checks
 */
export const withApiAuth = <T = any>(
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse<T>,
  ) => Promise<void> | void,
  config: ServerAuthConfig = defaultConfig,
) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<T | { error: string }>,
  ) => {
    const cookies = req.cookies || {};

    // Extract tokens from cookies
    const { accessToken, idToken } = extractTokensFromCookies(cookies, config);

    // If no tokens, user is not authenticated
    if (!accessToken || !idToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ID token
    const payload = await verifyToken(idToken, 'id', config);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to the request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: payload.sub,
      username: payload['cognito:username'] || payload.email,
      email: payload.email,
      name: payload.name,
    };

    // Call the original handler
    return handler(authenticatedReq, res);
  };
};
