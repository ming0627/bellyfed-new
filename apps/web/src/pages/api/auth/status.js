import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// Environment variables
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

/**
 * Auth status API handler
 * 
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get access token from cookies
    const accessToken = req.cookies.access_token;
    const authEmail = req.cookies.auth_email;

    // If no access token, user is not authenticated
    if (!accessToken) {
      return res.status(200).json({ isAuthenticated: false });
    }

    // Call Cognito to get user info
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    try {
      const response = await cognitoClient.send(command);

      // Extract user attributes
      const userAttributes = response.UserAttributes || [];
      const user = {
        id: '',
        username: response.Username || authEmail || '',
        email: '',
        name: '',
        nickname: '',
      };

      // Map Cognito attributes to user object
      userAttributes.forEach((attr) => {
        if (attr.Name === 'sub') user.id = attr.Value || '';
        if (attr.Name === 'email') user.email = attr.Value || '';
        if (attr.Name === 'name') user.name = attr.Value || '';
        if (attr.Name === 'nickname') user.nickname = attr.Value || '';
      });

      // Return authenticated user
      return res.status(200).json({
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      console.error('Error getting user info:', error);

      // If token is expired or invalid, return not authenticated
      return res.status(200).json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Auth status error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
