import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

// This endpoint is intentionally NOT protected by withApiAuth
// because it needs to work even when the user's tokens have expired

// Environment variables
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1';
const CLIENT_ID =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ||
  process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ||
  '3qmr0b7s247e2c7ogaopih1kgd';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Set CORS headers to allow the frontend to access this endpoint
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refresh_token;
    const authEmail = req.cookies.auth_email || '';

    // Log available cookies for debugging
    console.log('Refresh endpoint cookies:', {
      availableCookies: Object.keys(req.cookies),
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
      hasAuthEmail: !!authEmail,
    });

    if (!refreshToken) {
      console.error('No refresh token found in cookies');
      res.status(401).json({
        message: 'No refresh token found',
        code: 'NoRefreshToken',
        isAuthenticated: false,
      });
      return;
    }

    // Call Cognito to refresh tokens
    console.log('Attempting to refresh token with Cognito');
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    console.log('Sending refresh token request to Cognito');
    const response = await cognitoClient.send(command);
    console.log('Received response from Cognito:', {
      hasAuthResult: !!response.AuthenticationResult,
      hasAccessToken: !!response.AuthenticationResult?.AccessToken,
      hasIdToken: !!response.AuthenticationResult?.IdToken,
    });

    if (!response.AuthenticationResult) {
      res.status(401).json({
        message: 'Failed to refresh tokens',
        isAuthenticated: false,
      });
      return;
    }

    const { AccessToken, IdToken, ExpiresIn } = response.AuthenticationResult;

    if (!AccessToken || !IdToken) {
      res.status(500).json({
        message: 'Invalid refresh response from Cognito',
        isAuthenticated: false,
      });
      return;
    }

    // Calculate expiration date
    const expiresIn = ExpiresIn || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Set secure cookies via HTTP headers
    const isProduction = process.env.NODE_ENV === 'production';

    // Log minimal info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Refresh endpoint processing token refresh');
    }

    // Base cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('strict' as const) : ('lax' as const),
      path: '/',
      // Don't set domain to ensure cookies work on localhost
    };

    // For refresh token, we need to ensure it's properly set
    const refreshTokenOptions = {
      ...cookieOptions,
      // Set a very long expiration for refresh token (30 days)
      maxAge: 30 * 24 * 60 * 60,
    };

    // Set updated authentication cookies - server-side only with HttpOnly flag
    // Create cookies with explicit values for better debugging
    const accessTokenCookie = serialize('access_token', AccessToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    const idTokenCookie = serialize('id_token', IdToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    const authEmailCookie = serialize('auth_email', authEmail, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    const cookies = [accessTokenCookie, idTokenCookie, authEmailCookie];

    // Keep the refresh token as is, but ensure it has the same expiration as other cookies
    // This helps prevent issues where the refresh token might expire before other cookies
    let refreshTokenCookie = '';
    if (refreshToken) {
      refreshTokenCookie = serialize(
        'refresh_token',
        refreshToken,
        refreshTokenOptions,
      );
      cookies.push(refreshTokenCookie);
    }

    // Log minimal info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Refresh cookies created');
    }

    // Set all cookies
    res.setHeader('Set-Cookie', cookies);

    console.log('Set new cookies after successful refresh');

    // Return success response with user info
    res.status(200).json({
      success: true,
      isAuthenticated: true,
      email: authEmail,
      expiresAt,
    });
    return;
  } catch (error: unknown) {
    console.error('Token refresh error:', error);

    // Handle specific Cognito errors
    if (error instanceof Error) {
      const cognitoError = error as {
        code?: string;
        message?: string;
        name?: string;
      };
      console.error('Cognito error details:', {
        code: cognitoError.code,
        name: cognitoError.name,
        message: cognitoError.message,
      });

      // Clear all cookies on authentication failure
      const cookieOptions = {
        path: '/',
        maxAge: 0,
        sameSite:
          process.env.NODE_ENV === 'production'
            ? ('strict' as const)
            : ('lax' as const),
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      };

      const clearCookies = [
        serialize('access_token', '', cookieOptions),
        serialize('id_token', '', cookieOptions),
        serialize('refresh_token', '', cookieOptions),
        serialize('auth_email', '', cookieOptions),
      ];

      // Handle specific error codes
      if (
        cognitoError.code === 'NotAuthorizedException' ||
        cognitoError.name === 'NotAuthorizedException'
      ) {
        console.log('Clearing cookies due to invalid refresh token');
        res.setHeader('Set-Cookie', clearCookies);

        res.status(401).json({
          code: 'NotAuthorizedException',
          message: 'Refresh token is expired or invalid',
          isAuthenticated: false,
        });
        return;
      }

      if (
        cognitoError.code === 'InvalidParameterException' ||
        cognitoError.name === 'InvalidParameterException'
      ) {
        console.log('Clearing cookies due to invalid refresh token format');
        res.setHeader('Set-Cookie', clearCookies);

        res.status(401).json({
          code: 'InvalidParameterException',
          message: 'Invalid refresh token format',
          isAuthenticated: false,
        });
        return;
      }

      // For any other error, still clear cookies as a precaution
      console.log('Clearing cookies due to unknown error during refresh');
      res.setHeader('Set-Cookie', clearCookies);

      res.status(500).json({
        code: cognitoError.code || cognitoError.name || 'UnknownError',
        message: cognitoError.message || 'An unexpected error occurred',
        isAuthenticated: false,
      });
      return;
    }

    // For non-Error objects, still clear cookies
    const cookieOptions = {
      path: '/',
      maxAge: 0,
      sameSite:
        process.env.NODE_ENV === 'production'
          ? ('strict' as const)
          : ('lax' as const),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    };

    res.setHeader('Set-Cookie', [
      serialize('access_token', '', cookieOptions),
      serialize('id_token', '', cookieOptions),
      serialize('refresh_token', '', cookieOptions),
      serialize('auth_email', '', cookieOptions),
    ]);

    res.status(500).json({
      message: 'An unexpected error occurred during token refresh',
      isAuthenticated: false,
    });
    return;
  }
}
