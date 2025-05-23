import { withApiAuthRequired, getUserId } from '@bellyfed/utils';

/**
 * API route to unfollow a user
 *
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the target user ID from the query parameters
    const { targetUserId } = req.query;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    // In a real implementation, this would remove a follow relationship from a database
    // For now, we'll just return a success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ error: 'Failed to unfollow user' });
  }
}

export default withApiAuthRequired(handler);
