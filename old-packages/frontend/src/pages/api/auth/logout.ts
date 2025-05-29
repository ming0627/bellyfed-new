import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

// Environment variables
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1';

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
    // Try to sign out from Cognito using the access token if available
    const accessToken = req.cookies.access_token;

    if (accessToken) {
      try {
        const command = new GlobalSignOutCommand({
          AccessToken: accessToken,
        });

        await cognitoClient.send(command);
      } catch (error: unknown) {
        // Log but continue anyway - we still want to clear cookies even if
        // the Cognito signout fails
        console.error('Error signing out from Cognito:', error);
      }
    }

    // Clear all authentication cookies
    const cookieOptions = {
      path: '/',
      maxAge: 0, // Expire immediately
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    };

    // Set all cookies with maxAge 0 to clear them - all HttpOnly for security
    res.setHeader('Set-Cookie', [
      serialize('access_token', '', cookieOptions),
      serialize('id_token', '', cookieOptions),
      serialize('refresh_token', '', cookieOptions),
      serialize('auth_email', '', cookieOptions),
    ]);

    // Return success
    return res.status(200).json({
      success: true,
      isAuthenticated: false,
    });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    return res.status(500).json({
      message: 'An error occurred during logout',
      isAuthenticated: false,
    });
  }
}
