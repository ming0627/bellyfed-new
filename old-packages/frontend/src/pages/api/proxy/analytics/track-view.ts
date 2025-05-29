import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

/**
 * API route for tracking entity views
 * This sends the view data to the analytics-service Lambda function
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
    // Get user ID from request body or cookie
    const userId = req.body.userId || null;

    // Get request data
    const {
      entityType,
      entityId,
      deviceType,
      sessionId: bodySessionId,
    } = req.body;

    if (!entityType || !entityId) {
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

    // Prepare event data
    const eventData = {
      entityType,
      entityId,
      userId,
      sessionId,
      deviceType: deviceType || 'unknown',
      userAgent,
      ipAddress:
        typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
      referrer,
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      source: 'frontend',
      eventType: 'entity.viewed',
    };

    // Send to analytics service
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const analyticsEndpoint = `${apiUrl}/analytics/track-view`;

    // Use fetch directly since ApiService.post doesn't support custom headers
    await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || '',
      },
      body: JSON.stringify(eventData),
    });

    res.status(200).json({ success: true });
    return;
  } catch (error: unknown) {
    console.error('Error tracking view:', error);
    // Don't fail the request for analytics errors
    res.status(200).json({ success: false, error: 'Failed to track view' });
    return;
  }
}
