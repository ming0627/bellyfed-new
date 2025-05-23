/**
 * Health check endpoint for ECS with security measures
 * This endpoint is used by load balancers and monitoring systems to check if the service is healthy
 */

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Health response interface
 */
interface HealthResponse {
  /**
   * Service status
   */
  status: string;
  
  /**
   * Response timestamp (ISO 8601 format)
   */
  timestamp: string;
}

/**
 * Health check handler
 * @param req Next.js API request
 * @param res Next.js API response
 */
export default function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  // Return a simple health check response
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
