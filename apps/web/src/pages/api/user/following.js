import { withApiAuthRequired, getUserId } from '@bellyfed/utils';

/**
 * API route to get the users the current user is following
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

    // In a real implementation, this would fetch the users the current user is following from a database
    // For now, we'll return mock data
    const following = [
      {
        id: 'user-4',
        username: 'user4',
        email: 'user4@example.com',
        name: 'User Four',
        nickname: 'User 4',
        location: 'Kuala Lumpur, Malaysia',
        bio: 'Food critic',
        stats: {
          reviews: 52,
          followers: 120,
          following: 45,
          cities: 8,
        },
      },
      {
        id: 'user-5',
        username: 'user5',
        email: 'user5@example.com',
        name: 'User Five',
        nickname: 'User 5',
        location: 'Ipoh, Malaysia',
        bio: 'Street food lover',
        stats: {
          reviews: 34,
          followers: 78,
          following: 62,
          cities: 5,
        },
      },
      {
        id: 'user-6',
        username: 'user6',
        email: 'user6@example.com',
        name: 'User Six',
        nickname: 'User 6',
        location: 'Melaka, Malaysia',
        bio: 'Dessert enthusiast',
        stats: {
          reviews: 41,
          followers: 95,
          following: 73,
          cities: 7,
        },
      },
    ];

    return res.status(200).json(following);
  } catch (error) {
    console.error('Error getting user following:', error);
    return res.status(500).json({ error: 'Failed to get user following' });
  }
}

export default withApiAuthRequired(handler);
