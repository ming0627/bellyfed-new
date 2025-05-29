import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to handle CSRF tokens
 * This endpoint allows users to save and retrieve CSRF tokens
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  // Generate a session ID from cookies or IP address for non-authenticated users
  const sessionId =
    req.cookies.session_id ||
    `ip-${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;

  if (req.method === 'GET') {
    try {
      // In a real implementation, this would fetch from a database
      // For now, we'll use a simple in-memory store
      const token = global.csrfTokens?.[sessionId] || null;
      return res.status(200).json({ token });
    } catch (error: unknown) {
      console.error('Error fetching CSRF token:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Get token from request body
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      // In a real implementation, this would save to a database
      // For now, we'll use a simple in-memory store
      if (!global.csrfTokens) {
        global.csrfTokens = {};
      }

      global.csrfTokens[sessionId] = token;

      // Set the token in a cookie as well for backward compatibility
      res.setHeader('Set-Cookie', [
        `csrf_token=${token}; path=/; max-age=3600; SameSite=Strict; Secure; HttpOnly`,
      ]);

      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      console.error('Error saving CSRF token:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Add type declaration for global CSRF tokens
declare global {
  var csrfTokens: {
    [userId: string]: string;
  };
}

// This endpoint is public and doesn't require authentication
export default handler;
