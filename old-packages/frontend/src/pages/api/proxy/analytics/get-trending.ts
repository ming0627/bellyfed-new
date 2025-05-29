import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route for getting trending entities
 * This retrieves trending data from the analytics-service Lambda function
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
    const { entityType, limit, period } = req.query;

    if (!entityType) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Prepare query parameters
    const params = new URLSearchParams();
    params.append('entityType', entityType as string);

    if (limit) {
      params.append('limit', limit as string);
    }

    if (period) {
      params.append('period', period as string);
    }

    // Get trending data from the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const analyticsEndpoint = `${apiUrl}/analytics/get-trending?${params.toString()}`;

    // Use fetch directly since ApiService.get doesn't support custom headers
    const response = await fetch(analyticsEndpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || '',
      },
    }).then((res) => res.json());

    // Return the trending data
    res.status(200).json(response);
    return;
  } catch (error: unknown) {
    console.error('Error getting trending entities:', error);
    res.status(500).json({
      message: 'Failed to get trending entities',
      trending: [],
    });
    return;
  }
}
