import { postgresService } from '@/services/postgresService';
import { withApiAuth } from '@/utils/serverAuth';
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/utils/types';

/**
 * API endpoint to get the current user's profile
 * This endpoint combines Cognito user data with PostgreSQL user data
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // User is already authenticated by withApiAuth middleware
    // req.user contains the authenticated user information
    const cognitoUser = req.user;

    if (!cognitoUser || !cognitoUser.id) {
      res.status(401).json({ error: 'Unauthorized - Invalid user' });
      return;
    }

    // Get user data from PostgreSQL using the Cognito sub as cognito_id
    // Define a type for the database user
    interface DbUser {
      name?: string;
      nickname?: string;
      phone?: string;
      created_at?: string;
      updated_at?: string;
      location?: string;
      bio?: string;
      preferences?: Record<string, unknown>;
      stats?: {
        reviews?: number;
        followers?: number;
        following?: number;
        cities?: number;
      };
    }

    let dbUser: DbUser | null = null;
    try {
      // Try to get user from PostgreSQL
      dbUser = (await postgresService.getUserByCognitoId(
        cognitoUser.id,
      )) as DbUser;
    } catch (dbError) {
      console.error('Error fetching user from PostgreSQL:', dbError);

      // If user doesn't exist in PostgreSQL, create it
      if (!dbUser) {
        try {
          // Create user in PostgreSQL
          dbUser = (await postgresService.createUser({
            id: cognitoUser.id,
            cognito_id: cognitoUser.id,
            email: cognitoUser.email || '',
            name: cognitoUser.name || cognitoUser.email || 'User',
            phone: '',
            email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })) as DbUser;
        } catch (createError) {
          console.error('Error creating user in PostgreSQL:', createError);
        }
      }
    }

    // Combine Cognito and PostgreSQL data
    const userProfile = {
      id: cognitoUser.id,
      email: cognitoUser.email,
      username: cognitoUser.username || cognitoUser.email,
      name: dbUser?.name || cognitoUser.name || cognitoUser.email || 'User',
      nickname:
        dbUser?.nickname ||
        cognitoUser.username ||
        cognitoUser.email.split('@')[0],
      phone: dbUser?.phone || '',
      email_verified: true,
      created_at: dbUser?.created_at || new Date().toISOString(),
      updated_at: dbUser?.updated_at || new Date().toISOString(),
      // Add additional profile fields from the database
      location: dbUser?.location || 'Unknown Location',
      bio: dbUser?.bio || '',
      preferences: dbUser?.preferences || {},
      // Add placeholder stats
      stats: {
        reviews: dbUser?.stats?.reviews || 0,
        followers: dbUser?.stats?.followers || 0,
        following: dbUser?.stats?.following || 0,
        cities: dbUser?.stats?.cities || 0,
      },
    };

    res.status(200).json(userProfile);
    return;
  } catch (error: unknown) {
    console.error('Error in user profile API:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

// Protect this API route with server-side authentication
export default withApiAuth(handler);
