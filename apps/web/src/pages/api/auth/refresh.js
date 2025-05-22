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
 * Token refresh API handler
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
    // Get refresh token from cookies
    const refreshToken = req.cookies.refresh_token;
    const authEmail = req.cookies.auth_email;

    // If no refresh token, user is not authenticated
    if (!refreshToken) {
      return res.status(401).json({
        isAuthenticated: false,
        message: 'No refresh token found',
      });
    }

    // Call Cognito to refresh tokens
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return res.status(401).json({
        isAuthenticated: false,
        message: 'Failed to refresh tokens',
      });
    }

    const { AccessToken, IdToken, ExpiresIn } = response.AuthenticationResult;

    if (!AccessToken || !IdToken) {
      return res.status(500).json({
        isAuthenticated: false,
        message: 'Invalid authentication result from Cognito',
      });
    }

    // Calculate expiration date
    const expiresIn = ExpiresIn || 3600;

    // Set secure cookies via HTTP headers - all cookies are HttpOnly for security
    const isProduction = process.env.NODE_ENV === 'production';

    // Base cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
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
    ];

    // Only update the auth_email cookie if it exists
    if (authEmail) {
      cookies.push(
        serialize('auth_email', authEmail, {
          ...cookieOptions,
          maxAge: expiresIn,
        }),
      );
    }

    res.setHeader('Set-Cookie', cookies);

    // Return success response
    return res.status(200).json({
      isAuthenticated: true,
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    // Handle specific Cognito errors
    if (error instanceof Error) {
      const cognitoError = error;

      return res.status(401).json({
        isAuthenticated: false,
        code: cognitoError.name || 'UnknownError',
        message: cognitoError.message || 'An unexpected error occurred',
      });
    }

    return res.status(500).json({
      isAuthenticated: false,
      message: 'An unexpected error occurred',
    });
  }
}
