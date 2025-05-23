/**
 * API Route: AWS Secrets Manager
 * 
 * This API route provides secure access to AWS Secrets Manager.
 * It requires admin authentication and handles secret retrieval.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for AWS Secrets Manager API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to access AWS Secrets'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to access AWS Secrets'
      });
    }

    const { 
      secretName,
      region = process.env.AWS_REGION || 'us-east-1',
      versionId,
      versionStage = 'AWSCURRENT'
    } = req.query;

    // Validate secret name
    if (!secretName || typeof secretName !== 'string') {
      return res.status(400).json({
        error: 'Invalid secret name',
        message: 'Secret name is required and must be a string'
      });
    }

    // Validate region
    if (typeof region !== 'string' || region.length < 3) {
      return res.status(400).json({
        error: 'Invalid region',
        message: 'Region must be a valid AWS region string'
      });
    }

    // Validate version parameters
    if (versionId && typeof versionId !== 'string') {
      return res.status(400).json({
        error: 'Invalid version ID',
        message: 'Version ID must be a string'
      });
    }

    if (typeof versionStage !== 'string') {
      return res.status(400).json({
        error: 'Invalid version stage',
        message: 'Version stage must be a string'
      });
    }

    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AWS credentials not configured'
      });
    }

    // Initialize Secrets Manager client
    const client = new SecretsManagerClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
      }
    });

    // Prepare command parameters
    const commandParams = {
      SecretId: secretName,
      VersionStage: versionStage
    };

    if (versionId) {
      commandParams.VersionId = versionId;
    }

    // Get secret value
    const command = new GetSecretValueCommand(commandParams);
    const response = await client.send(command);

    // Parse secret value
    let secretValue;
    if (response.SecretString) {
      try {
        secretValue = JSON.parse(response.SecretString);
      } catch (error) {
        secretValue = response.SecretString;
      }
    } else if (response.SecretBinary) {
      secretValue = Buffer.from(response.SecretBinary).toString('base64');
    } else {
      throw new Error('No secret value found');
    }

    // Return success response (be careful not to log sensitive data)
    res.status(200).json({
      success: true,
      data: {
        name: response.Name,
        arn: response.ARN,
        versionId: response.VersionId,
        versionStages: response.VersionStages,
        createdDate: response.CreatedDate,
        // Note: secretValue is intentionally not included in logs
        hasValue: !!secretValue
      },
      meta: {
        region,
        retrievedAt: new Date().toISOString()
      }
    });

    // Set the actual secret value in a custom header (for secure transmission)
    if (typeof secretValue === 'string') {
      res.setHeader('X-Secret-Value', Buffer.from(secretValue).toString('base64'));
    } else {
      res.setHeader('X-Secret-Value', Buffer.from(JSON.stringify(secretValue)).toString('base64'));
    }

  } catch (error) {
    console.error('Error retrieving AWS secret:', error.message);
    
    // Handle specific AWS errors
    if (error.name === 'ResourceNotFoundException') {
      return res.status(404).json({
        error: 'Secret not found',
        message: 'The specified secret does not exist'
      });
    }

    if (error.name === 'InvalidParameterException') {
      return res.status(400).json({
        error: 'Invalid parameter',
        message: 'One or more parameters are invalid'
      });
    }

    if (error.name === 'InvalidRequestException') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'The request is invalid'
      });
    }

    if (error.name === 'DecryptionFailureException') {
      return res.status(500).json({
        error: 'Decryption failed',
        message: 'Failed to decrypt the secret'
      });
    }

    if (error.name === 'InternalServiceErrorException') {
      return res.status(503).json({
        error: 'AWS service error',
        message: 'AWS Secrets Manager is temporarily unavailable'
      });
    }

    if (error.name === 'UnauthorizedOperation') {
      return res.status(403).json({
        error: 'AWS access denied',
        message: 'Insufficient permissions to access the secret'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve AWS secret'
    });
  }
}
