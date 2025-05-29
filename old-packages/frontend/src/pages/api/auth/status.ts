import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // This endpoint only supports GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Check for access token in cookies
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    const authEmail = req.cookies.auth_email || '';

    // Log minimal info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Status endpoint checking authentication');
    }

    // If no access token, check if we have a refresh token
    if (!accessToken) {
      if (refreshToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Attempting to refresh token');
        }
        await tryRefreshToken(req, res, refreshToken, authEmail);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('No authentication tokens found');
      }
      res.status(200).json({
        isAuthenticated: false,
        message: 'No authentication token found',
      });
      return;
    }

    try {
      // Verify the token by calling Cognito's GetUser API
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const userResponse = await cognitoClient.send(command);

      // Extract user attributes
      const attributes: Record<string, string> = {};
      userResponse.UserAttributes?.forEach((attr) => {
        if (attr.Name && attr.Value) {
          attributes[attr.Name] = attr.Value;
        }
      });

      // Return authenticated status and user info
      res.status(200).json({
        isAuthenticated: true,
        user: {
          id: attributes.sub || 'unknown',
          username: userResponse.Username || authEmail,
          email: attributes.email || authEmail,
          name: attributes.name,
          nickname: attributes.nickname,
        },
      });
      return;
    } catch (error: unknown) {
      console.error('Error verifying access token:', error);

      // If access token is invalid but we have a refresh token, try to refresh
      if (refreshToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Access token invalid, attempting refresh');
        }
        await tryRefreshToken(req, res, refreshToken, authEmail);
        return;
      }

      // Token is invalid or expired and no refresh token
      res.status(200).json({
        isAuthenticated: false,
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error: unknown) {
    console.error('Error checking authentication status:', error);
    res.status(500).json({
      isAuthenticated: false,
      message: 'An error occurred while checking authentication status',
    });
    return;
  }
}

// Helper function to try refreshing tokens
async function tryRefreshToken(
  _req: NextApiRequest,
  res: NextApiResponse,
  refreshToken: string,
  authEmail: string,
): Promise<any> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Refreshing token with Cognito');
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await cognitoClient.send(command);

    if (process.env.NODE_ENV === 'development') {
      console.log('Received response from Cognito');
    }

    if (!response.AuthenticationResult) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No authentication result from Cognito');
      }
      res.status(200).json({
        isAuthenticated: false,
        message: 'Failed to refresh tokens',
      });
      return;
    }

    const { AccessToken, IdToken, ExpiresIn } = response.AuthenticationResult;

    if (!AccessToken || !IdToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Missing tokens in authentication result');
      }
      res.status(200).json({
        isAuthenticated: false,
        message: 'Invalid refresh response from Cognito',
      });
      return;
    }

    // Calculate expiration date
    const expiresIn = ExpiresIn || 3600;

    // Set secure cookies via HTTP headers
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('strict' as const) : ('lax' as const),
      path: '/',
    };

    // Set updated authentication cookies - server-side only with HttpOnly flag
    const cookies = [
      // Update HttpOnly cookies for tokens
      serialize('access_token', AccessToken, {
        ...cookieOptions,
        maxAge: expiresIn,
      }),

      serialize('id_token', IdToken, {
        ...cookieOptions,
        maxAge: expiresIn,
      }),

      // Store user email in an HttpOnly cookie
      serialize('auth_email', authEmail, {
        ...cookieOptions,
        maxAge: expiresIn,
      }),

      // Keep the refresh token as is
      serialize('refresh_token', refreshToken, {
        ...cookieOptions,
        // Set a very long expiration for refresh token (30 days)
        maxAge: 30 * 24 * 60 * 60,
      }),
    ];

    // Set all cookies
    res.setHeader('Set-Cookie', cookies);

    if (process.env.NODE_ENV === 'development') {
      console.log('Set new cookies after successful refresh');
    }

    // Try to get user info from the new access token
    try {
      const getUserCommand = new GetUserCommand({
        AccessToken: AccessToken,
      });

      const userResponse = await cognitoClient.send(getUserCommand);

      // Extract user attributes
      const attributes: Record<string, string> = {};
      userResponse.UserAttributes?.forEach((attr) => {
        if (attr.Name && attr.Value) {
          attributes[attr.Name] = attr.Value;
        }
      });

      // Return authenticated status and user info
      res.status(200).json({
        isAuthenticated: true,
        user: {
          id: attributes.sub || 'unknown',
          username: userResponse.Username || authEmail,
          email: attributes.email || authEmail,
          name: attributes.name,
          nickname: attributes.nickname,
        },
      });
      return;
    } catch (userError) {
      console.error('Error getting user info after refresh:', userError);

      // Even if we can't get user info, we're still authenticated
      res.status(200).json({
        isAuthenticated: true,
        user: {
          id: 'unknown',
          username: authEmail,
          email: authEmail,
          nickname: '',
        },
      });
      return;
    }
  } catch (error: unknown) {
    console.error('Error refreshing token in status endpoint:', error);

    // Clear cookies on refresh failure
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

    res.status(200).json({
      isAuthenticated: false,
      message: 'Failed to refresh authentication',
    });
    return;
  }
}
