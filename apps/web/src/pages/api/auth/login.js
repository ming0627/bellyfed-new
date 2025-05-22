import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { serialize } from 'cookie';

// Environment variables
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1';
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '3qmr0b7s247e2c7ogaopih1kgd';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

/**
 * Login API handler
 * 
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 */
export default async function handler(req, res) {
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

    // Base cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    };

    // For refresh token, we need to ensure it's properly set
    const refreshTokenOptions = {
      ...cookieOptions,
      // Set a very long expiration for refresh token (30 days)
      maxAge: 30 * 24 * 60 * 60,
    };

    // Set authentication cookies - all server-side with HttpOnly
    const cookies = [
      serialize('access_token', AccessToken, {
        ...cookieOptions,
        maxAge: expiresIn,
      }),
      serialize('id_token', IdToken, {
        ...cookieOptions,
        maxAge: expiresIn,
      }),
      serialize('refresh_token', RefreshToken, refreshTokenOptions),
      serialize('auth_email', email, {
        ...cookieOptions,
        maxAge: expiresIn,
      }),
    ];

    res.setHeader('Set-Cookie', cookies);

    // Return success response with basic user info
    return res.status(200).json({
      isSignedIn: true,
      isAuthenticated: true,
      username: email,
      email: email,
      expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error);

    // Handle specific Cognito errors
    if (error instanceof Error) {
      const cognitoError = error;

      if (cognitoError.name === 'UserNotConfirmedException') {
        return res.status(400).json({
          code: 'UserNotConfirmedException',
          message: 'Please confirm your email address before signing in.',
        });
      }

      if (cognitoError.name === 'NotAuthorizedException') {
        return res.status(401).json({
          code: 'NotAuthorizedException',
          message: 'Incorrect email or password.',
        });
      }

      return res.status(500).json({
        code: cognitoError.name || 'UnknownError',
        message: cognitoError.message || 'An unexpected error occurred',
      });
    }

    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
