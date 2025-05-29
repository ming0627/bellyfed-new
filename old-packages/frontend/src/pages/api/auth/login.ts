import {
  CognitoIdentityProviderClient,
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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Call Cognito to authenticate
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const { AccessToken, IdToken, RefreshToken, ExpiresIn } =
      response.AuthenticationResult;

    if (!AccessToken || !IdToken || !RefreshToken) {
      return res
        .status(500)
        .json({ message: 'Invalid authentication result from Cognito' });
    }

    // Calculate expiration date
    const expiresIn = ExpiresIn || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Set secure cookies via HTTP headers - all cookies are HttpOnly for security
    const isProduction = process.env.NODE_ENV === 'production';

    // Log minimal info in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Login endpoint called, setting cookies');
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

    // Set authentication cookies - all server-side with HttpOnly
    console.log('Setting authentication cookies after successful login');

    // Create cookies with explicit values for better debugging
    const accessTokenCookie = serialize('access_token', AccessToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    const idTokenCookie = serialize('id_token', IdToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    const refreshTokenCookie = serialize(
      'refresh_token',
      RefreshToken,
      refreshTokenOptions,
    );

    const authEmailCookie = serialize('auth_email', email, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    const cookies = [
      accessTokenCookie,
      idTokenCookie,
      refreshTokenCookie,
      authEmailCookie,
    ];

    // Log minimal cookie info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Authentication cookies created');
    }

    res.setHeader('Set-Cookie', cookies);

    console.log('Authentication cookies set successfully');

    // Return success response with basic user info
    return res.status(200).json({
      isSignedIn: true,
      isAuthenticated: true,
      username: email,
      email: email,
      expiresAt,
    });
  } catch (error: unknown) {
    console.error('Login error:', error);

    // Handle specific Cognito errors
    if (error instanceof Error) {
      const cognitoError = error as { code?: string; message?: string };

      if (cognitoError.code === 'UserNotConfirmedException') {
        return res.status(400).json({
          code: 'UserNotConfirmedException',
          message: 'Please confirm your email address before signing in.',
        });
      }

      if (cognitoError.code === 'NotAuthorizedException') {
        return res.status(401).json({
          code: 'NotAuthorizedException',
          message: 'Incorrect email or password.',
        });
      }

      return res.status(500).json({
        code: cognitoError.code || 'UnknownError',
        message: cognitoError.message || 'An unexpected error occurred',
      });
    }

    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
