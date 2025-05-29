import { withApiAuthRequired } from '@/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';
// Import AWS SDK in all environments
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

/**
 * AWS Secrets Manager API endpoint
 *
 * This endpoint gets a secret from AWS Secrets Manager
 * It requires authentication and accepts the following parameters:
 * - name: Secret name
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
      return res.status(400).json({ message: 'Secret name is required' });
    }

    // Always use AWS SDK, even in development mode
    // This ensures we're always using the real environment secrets
    try {
      // Use AWS SDK for all environments
      const client = new SecretsManagerClient({
        region: process.env.AWS_REGION || 'ap-southeast-1',
      });

      const command = new GetSecretValueCommand({
        SecretId: name as string,
      });

      const response = await client.send(command);

      if (!response.SecretString) {
        return res.status(404).json({ message: 'Secret not found' });
      }

      return res.status(200).json({ value: response.SecretString });
    } catch (error: unknown) {
      console.error('Error getting secret:', error);
      return res.status(500).json({ message: 'Error getting secret' });
    }
  } catch (error: unknown) {
    console.error('Error getting secret:', error);
    return res.status(500).json({ message: 'Error getting secret' });
  }
}

export default withApiAuthRequired(handler);
