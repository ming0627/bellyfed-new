// Simplified health check endpoint for ECS
import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthResponse>,
): void {
  // Always return a 200 OK status for health checks
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
