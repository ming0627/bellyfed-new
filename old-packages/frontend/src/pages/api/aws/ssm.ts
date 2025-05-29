import { withApiAuthRequired } from '@/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';
// Import AWS SDK in all environments
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

/**
 * AWS SSM Parameter Store API endpoint
 *
 * This endpoint gets a parameter from AWS SSM Parameter Store
 * It requires authentication and accepts the following parameters:
 * - name: Parameter name
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Parameter name is required' });
    }

    // Always use AWS SDK, even in development mode
    // This ensures we're always using the real environment parameters
    try {
      // Use AWS SDK for all environments
      const client = new SSMClient({
        region: process.env.AWS_REGION || 'ap-southeast-1',
      });

      const command = new GetParameterCommand({
        Name: name as string,
        WithDecryption: true,
      });

      const response = await client.send(command);

      if (!response.Parameter?.Value) {
        return res.status(404).json({ message: 'Parameter not found' });
      }

      return res.status(200).json({ value: response.Parameter.Value });
    } catch (error: unknown) {
      console.error('Error getting SSM parameter:', error);
      return res.status(500).json({ message: 'Error getting SSM parameter' });
    }
  } catch (error: unknown) {
    console.error('Error getting SSM parameter:', error);
    return res.status(500).json({ message: 'Error getting SSM parameter' });
  }
}

export default withApiAuthRequired(handler);
