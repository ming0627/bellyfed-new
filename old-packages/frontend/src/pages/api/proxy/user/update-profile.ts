import { postgresService } from '@/services/postgresService';
import { withApiAuth } from '@/utils/serverAuth';
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, User } from '@/utils/types';

/**
 * API endpoint to update the current user's profile
 * This endpoint updates user data in PostgreSQL
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
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

    // Get the updated user data from the request body
    const updatedUserData = req.body;

    // Validate required fields
    if (!updatedUserData) {
      res.status(400).json({ error: 'Bad request - Missing user data' });
      return;
    }

    // Get user data from PostgreSQL using the Cognito sub as cognito_id
    let dbUser: Partial<User> | null = null;
    try {
      // Try to get user from PostgreSQL
      dbUser = (await postgresService.getUserByCognitoId(
        cognitoUser.id,
      )) as Partial<User>;
    } catch (dbError) {
      console.error('Error fetching user from PostgreSQL:', dbError);

      // If user doesn't exist in PostgreSQL, create it
      if (!dbUser) {
        try {
          // Create user in PostgreSQL with the updated data
          const userData: Partial<User> = {
            id: cognitoUser.id,
            cognito_id: cognitoUser.id,
            email: cognitoUser.email || '',
            name:
              updatedUserData.name ||
              cognitoUser.name ||
              cognitoUser.email ||
              'User',
            phone: updatedUserData.phone || '',
            email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          dbUser = (await postgresService.createUser(
            userData,
          )) as Partial<User>;
        } catch (createError) {
          console.error('Error creating user in PostgreSQL:', createError);
          res.status(500).json({ error: 'Failed to create user profile' });
          return;
        }
      }
    }

    // Update user in PostgreSQL
    try {
      const updateData: Partial<User> = {
        name: updatedUserData.name,
        nickname: updatedUserData.nickname,
        phone: updatedUserData.phone,
        updated_at: new Date().toISOString(),
      };

      const updatedUser = (await postgresService.updateUser(
        cognitoUser.id,
        updateData,
      )) as Partial<User>;

      // Return the updated user profile
      res.status(200).json({
        id: cognitoUser.id,
        email: cognitoUser.email,
        username: cognitoUser.username || cognitoUser.email,
        name: updatedUser.name || updatedUserData.name,
        nickname:
          updatedUser.nickname ||
          updatedUserData.nickname ||
          cognitoUser.username ||
          cognitoUser.email.split('@')[0],
        phone: updatedUser.phone || updatedUserData.phone,
        email_verified: true,
        created_at: dbUser?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: dbUser?.stats || {
          reviews: 0,
          followers: 0,
          following: 0,
          cities: 0,
        },
      });
      return;
    } catch (updateError) {
      console.error('Error updating user in PostgreSQL:', updateError);

      // In development mode, return a mock success response
      if (process.env.NODE_ENV === 'development') {
        res.status(200).json({
          id: cognitoUser.id,
          email: cognitoUser.email,
          username: cognitoUser.username || cognitoUser.email,
          name:
            updatedUserData.name ||
            cognitoUser.name ||
            cognitoUser.email ||
            'User',
          nickname:
            updatedUserData.nickname ||
            cognitoUser.username ||
            cognitoUser.email.split('@')[0],
          phone: updatedUserData.phone || '',
          email_verified: true,
          created_at: dbUser?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stats: dbUser?.stats || {
            reviews: 0,
            followers: 0,
            following: 0,
            cities: 0,
          },
        });
        return;
      }

      res.status(500).json({ error: 'Failed to update user profile' });
      return;
    }
  } catch (error: unknown) {
    console.error('Error in update user profile API:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

// Protect this API route with server-side authentication
export default withApiAuth(handler);
