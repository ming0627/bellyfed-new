import { withApiAuthRequired, getUserId } from '@bellyfed/utils';

/**
 * API route to follow a user
 *
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the target user ID from the request body
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    // In a real implementation, this would create a follow relationship in a database
    // For now, we'll just return a success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({ error: 'Failed to follow user' });
  }
}

export default withApiAuthRequired(handler);
