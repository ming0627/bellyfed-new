import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for getting analytics data for an entity
 * This retrieves analytics data from the analytics-service Lambda function
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Get query parameters
    const { entityType, entityId, period } = req.query;

    if (!entityType || !entityId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Prepare query parameters
    const params = new URLSearchParams();
    params.append('entityType', entityType as string);
    params.append('entityId', entityId as string);

    if (period) {
      params.append('period', period as string);
    }

    // Get analytics data from the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const analyticsEndpoint = `${apiUrl}/analytics/get-analytics?${params.toString()}`;

    // Use fetch directly since ApiService.get doesn't support custom headers
    const response = await fetch(analyticsEndpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || '',
      },
    }).then((res) => res.json());

    // Return the analytics data
    res.status(200).json(response);
    return;
  } catch (error: unknown) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      message: 'Failed to get analytics',
      viewData: { viewCount: 0, uniqueViewers: 0 },
      engagementData: {},
      timeSeriesData: {},
    });
    return;
  }
}
