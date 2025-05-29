import { NextApiResponse } from 'next';
import { withApiAuth } from '@/utils/serverAuth';
import type { AuthenticatedRequest } from '@/utils/types';

// Add type declaration for global debugLogs
declare global {
  var debugLogs: Record<string, any[]> | undefined;
}

/**
 * API endpoint to handle debug logs
 * This endpoint allows users to save and retrieve debug logs
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse,
): Promise<void> {
  // Get user ID from the authenticated request
  // const userId = req.user.id; // Uncomment when needed

  if (req.method === 'GET') {
    try {
      // In a real implementation, this would fetch from a database
      // For now, we'll use a simple in-memory store
      const logs = global.debugLogs?.['user-123'] || [];
      res.status(200).json(logs);
      return;
    } catch (error: unknown) {
      console.error('Error fetching debug logs:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  } else if (req.method === 'POST') {
    try {
      // Get log entry from request body
      const logEntry = req.body;

      // In a real implementation, this would save to a database
      // For now, we'll use a simple in-memory store
      if (!global.debugLogs) {
        global.debugLogs = {};
      }

      if (!global.debugLogs['user-123']) {
        global.debugLogs['user-123'] = [];
      }

      // Add new log entry
      global.debugLogs['user-123'].push(logEntry);

      // Trim logs if they exceed the maximum (1000 entries)
      const MAX_LOG_ENTRIES = 1000;
      if (global.debugLogs['user-123'].length > MAX_LOG_ENTRIES) {
        global.debugLogs['user-123'].splice(
          0,
          global.debugLogs['user-123'].length - MAX_LOG_ENTRIES,
        );
      }

      res.status(200).json({ success: true });
      return;
    } catch (error: unknown) {
      console.error('Error saving debug log:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  } else if (req.method === 'DELETE') {
    try {
      // In a real implementation, this would delete from a database
      // For now, we'll use a simple in-memory store
      if (global.debugLogs) {
        global.debugLogs['user-123'] = [];
      }

      res.status(200).json({ success: true });
      return;
    } catch (error: unknown) {
      console.error('Error clearing debug logs:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
}

// Add
// Protect this API route with server-side authentication
export default withApiAuth(handler);
