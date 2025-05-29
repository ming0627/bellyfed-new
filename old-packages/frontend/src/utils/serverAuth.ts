/**
 * Server-side authentication utilities
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
import { User, TokenPayload, Tokens, AuthenticatedRequest } from './types';

// Environment variables should be set during build
const USER_POOL_ID =
  process.env.NEXT_PUBLIC_USER_POOL_ID || 'ap-southeast-1_xlU9zwY43';
const CLIENT_ID =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ||
  process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ||
  '3qmr0b7s247e2c7ogaopih1kgd';

// Create a verifier for ID tokens
const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'id',
  clientId: CLIENT_ID,
});

// Create a verifier for access tokens
const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'access',
  clientId: CLIENT_ID,
});

/**
 * Verify a JWT token
 * @param token The JWT token to verify
 * @param tokenType The type of token ('id' or 'access')
 * @returns The decoded token payload if valid, null otherwise
 */
export const verifyToken = async (
  token: string,
  tokenType: 'id' | 'access' = 'id',
): Promise<TokenPayload | null> => {
  try {
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
        sub: accessPayload.sub,
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
 * @returns An object containing the access token, ID token, and refresh token
 */
export const extractTokensFromCookies = (
  cookies: Partial<{ [key: string]: string }>,
): Tokens => {
  return {
    accessToken: cookies?.access_token || null,
    idToken: cookies?.id_token || null,
    refreshToken: cookies?.refresh_token || null,
  };
};

/**
 * Check if a user is authenticated on the server side
 * @param context The GetServerSideProps context
 * @returns An object containing the authentication status and user info
 */
export const checkServerAuth = async (
  context: GetServerSidePropsContext,
): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  const { req } = context;
  const cookies = req.cookies || {};

  // Extract tokens from cookies
  const { accessToken, idToken } = extractTokensFromCookies(
    cookies as { [key: string]: string },
  );

  // If no tokens, user is not authenticated
  if (!accessToken || !idToken) {
    return { isAuthenticated: false, user: null };
  }

  // Verify ID token
  const payload = await verifyToken(idToken, 'id');
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
) => {
  return async (
    context: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<P & { user: User }>> => {
    const { isAuthenticated, user } = await checkServerAuth(context);

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
 * @returns A new handler that includes authentication checks
 */
export const withApiAuth = <T = any>(
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse<T>,
  ) => Promise<void> | void,
) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<T | { error: string }>,
  ) => {
    const cookies = req.cookies || {};

    // Extract tokens from cookies
    const { accessToken, idToken } = extractTokensFromCookies(cookies);

    // If no tokens, user is not authenticated
    if (!accessToken || !idToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ID token
    const payload = await verifyToken(idToken, 'id');
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
