import { withApiAuthRequired, getUserId } from '@bellyfed/utils';

/**
 * API route to get the current user's profile
 *
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real implementation, this would fetch the user profile from Cognito or a database
    // For now, we'll return mock data
    const userProfile = {
      id: userId,
      username: 'johndoe',
      email: 'john.doe@example.com',
      name: 'John Doe',
      nickname: 'Johnny',
      location: 'Kuala Lumpur, Malaysia',
      bio: 'Food enthusiast and amateur chef',
      email_verified: true,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-05-15T00:00:00.000Z',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
      interests: ['Italian', 'Japanese', 'Street Food'],
      stats: {
        reviews: 42,
        followers: 120,
        following: 85,
        cities: 5,
      },
    };

    return res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
}

export default withApiAuthRequired(handler);
