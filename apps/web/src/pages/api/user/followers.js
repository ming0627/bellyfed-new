import { withApiAuthRequired, getUserId } from '@bellyfed/utils';

/**
 * API route to get the current user's followers
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

    // In a real implementation, this would fetch the user's followers from a database
    // For now, we'll return mock data
    const followers = [
      {
        id: 'user-1',
        username: 'user1',
        email: 'user1@example.com',
        name: 'User One',
        nickname: 'User 1',
        location: 'Kuala Lumpur, Malaysia',
        bio: 'Food enthusiast',
        stats: {
          reviews: 15,
          followers: 45,
          following: 30,
          cities: 3,
        },
      },
      {
        id: 'user-2',
        username: 'user2',
        email: 'user2@example.com',
        name: 'User Two',
        nickname: 'User 2',
        location: 'Penang, Malaysia',
        bio: 'Foodie explorer',
        stats: {
          reviews: 28,
          followers: 62,
          following: 41,
          cities: 4,
        },
      },
      {
        id: 'user-3',
        username: 'user3',
        email: 'user3@example.com',
        name: 'User Three',
        nickname: 'User 3',
        location: 'Johor Bahru, Malaysia',
        bio: 'Food photographer',
        stats: {
          reviews: 37,
          followers: 89,
          following: 52,
          cities: 6,
        },
      },
    ];

    return res.status(200).json(followers);
  } catch (error) {
    console.error('Error getting user followers:', error);
    return res.status(500).json({ error: 'Failed to get user followers' });
  }
}

export default withApiAuthRequired(handler);
