// Using type declarations to avoid TS errors when modules are not found
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../../../../services/api';

// Declare process for Node.js environment
declare const process: {
  env: {
    [key: string]: string | undefined;
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL?: string;
    API_KEY?: string;
  };
};

/**
 * API route for tracking user engagements
 * This sends the engagement data to the analytics-service Lambda function
 * which then publishes an event to EventBridge
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user ID from request body
    const userId = req.body.userId || null;

    // Get request data
    const {
      entityType,
      entityId,
      engagementType,
      metadata,
      sessionId: bodySessionId,
    } = req.body;

    if (!entityType || !entityId || !engagementType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate a session ID if not provided
    const sessionId =
      bodySessionId || req.cookies['bellyfed-session'] || uuidv4();

    // Set session cookie if it doesn't exist
    if (!req.cookies['bellyfed-session'] && !bodySessionId) {
      res.setHeader(
        'Set-Cookie',
        `bellyfed-session=${sessionId}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
      );
    }

    // Get request information
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const referrer = req.headers.referer || '';

    // Map engagement type to event
    let eventType = 'entity.viewed'; // Default event type

    if (engagementType === 'LIKE') {
      eventType = 'entity.liked';
    } else if (engagementType === 'SHARE') {
      eventType = 'entity.shared';
    } else if (engagementType === 'COMMENT') {
      eventType = 'entity.commented';
    }

    // Prepare event data
    const eventData = {
      entityType,
      entityId,
      userId,
      sessionId,
      engagementType,
      metadata: metadata || {},
      userAgent,
      ipAddress:
        typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
      referrer,
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      source: 'frontend',
      eventType,
    };

    // Send to analytics service
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const analyticsEndpoint = `${apiUrl}/analytics/track-engagement`;

    // Modified to match ApiService.post signature (path, data)
    await ApiService.post(analyticsEndpoint, eventData);

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error('Error tracking engagement:', error);
    // Don't fail the request for analytics errors
    return res
      .status(200)
      .json({ success: false, error: 'Failed to track engagement' });
  }
}
