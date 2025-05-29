// Health check endpoint for ECS with security measures
import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthResponse>,
): void {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
