import { withApiAuthRequired, getUserId } from '@bellyfed/utils';

/**
 * API route to update the current user's profile
 *
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the user data from the request body
    const userData = req.body;

    // In a real implementation, this would update the user profile in Cognito or a database
    // For now, we'll return mock data with the updates applied
    const updatedProfile = {
      id: userId,
      username: 'johndoe',
      email: 'john.doe@example.com',
      ...userData,
      updated_at: new Date().toISOString(),
    };

    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
}

export default withApiAuthRequired(handler);
