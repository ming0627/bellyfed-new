/**
 * API Route: AWS SSM Parameter Store
 * 
 * This API route provides secure access to AWS Systems Manager Parameter Store.
 * It requires admin authentication and handles parameter retrieval.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SSMClient, GetParameterCommand, GetParametersCommand } from '@aws-sdk/client-ssm';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for AWS SSM Parameter Store API endpoint
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
        message: 'Authentication required to access AWS SSM parameters'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to access AWS SSM parameters'
      });
    }

    const { 
      name: parameterName,
      names: parameterNames,
      region = process.env.AWS_REGION || 'us-east-1',
      withDecryption = 'true'
    } = req.query;

    // Validate that either name or names is provided
    if (!parameterName && !parameterNames) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'Either "name" or "names" parameter is required'
      });
    }

    // Validate parameter name(s)
    if (parameterName && typeof parameterName !== 'string') {
      return res.status(400).json({
        error: 'Invalid parameter name',
        message: 'Parameter name must be a string'
      });
    }

    if (parameterNames) {
      const namesArray = Array.isArray(parameterNames) ? parameterNames : [parameterNames];
      if (namesArray.some(name => typeof name !== 'string')) {
        return res.status(400).json({
          error: 'Invalid parameter names',
          message: 'All parameter names must be strings'
        });
      }
      if (namesArray.length > 10) {
        return res.status(400).json({
          error: 'Too many parameters',
          message: 'Maximum 10 parameters can be retrieved at once'
        });
      }
    }

    // Validate region
    if (typeof region !== 'string' || region.length < 3) {
      return res.status(400).json({
        error: 'Invalid region',
        message: 'Region must be a valid AWS region string'
      });
    }

    // Check AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AWS credentials not configured'
      });
    }

    // Initialize SSM client
    const client = new SSMClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
      }
    });

    let response;
    let parameters = [];

    if (parameterName) {
      // Get single parameter
      const command = new GetParameterCommand({
        Name: parameterName,
        WithDecryption: withDecryption === 'true'
      });
      
      response = await client.send(command);
      parameters = [response.Parameter];
    } else {
      // Get multiple parameters
      const namesArray = Array.isArray(parameterNames) ? parameterNames : [parameterNames];
      const command = new GetParametersCommand({
        Names: namesArray,
        WithDecryption: withDecryption === 'true'
      });
      
      response = await client.send(command);
      parameters = response.Parameters || [];
    }

    // Transform parameters for response
    const transformedParameters = parameters.map(param => ({
      name: param.Name,
      type: param.Type,
      version: param.Version,
      lastModifiedDate: param.LastModifiedDate,
      arn: param.ARN,
      dataType: param.DataType,
      // Note: Value is intentionally not included in the main response for security
      hasValue: !!param.Value
    }));

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        parameters: transformedParameters,
        invalidParameters: response.InvalidParameters || []
      },
      meta: {
        region,
        withDecryption: withDecryption === 'true',
        retrievedAt: new Date().toISOString(),
        count: transformedParameters.length
      }
    });

    // Set parameter values in custom headers (for secure transmission)
    parameters.forEach((param, index) => {
      if (param.Value) {
        const headerName = `X-Parameter-${index}`;
        const headerValue = Buffer.from(JSON.stringify({
          name: param.Name,
          value: param.Value
        })).toString('base64');
        res.setHeader(headerName, headerValue);
      }
    });

  } catch (error) {
    console.error('Error retrieving AWS SSM parameter:', error.message);
    
    // Handle specific AWS errors
    if (error.name === 'ParameterNotFound') {
      return res.status(404).json({
        error: 'Parameter not found',
        message: 'The specified parameter does not exist'
      });
    }

    if (error.name === 'InvalidKeyId') {
      return res.status(400).json({
        error: 'Invalid key ID',
        message: 'The KMS key ID is invalid'
      });
    }

    if (error.name === 'ParameterVersionNotFound') {
      return res.status(404).json({
        error: 'Parameter version not found',
        message: 'The specified parameter version does not exist'
      });
    }

    if (error.name === 'InternalServerError') {
      return res.status(503).json({
        error: 'AWS service error',
        message: 'AWS SSM is temporarily unavailable'
      });
    }

    if (error.name === 'UnauthorizedOperation') {
      return res.status(403).json({
        error: 'AWS access denied',
        message: 'Insufficient permissions to access the parameter'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve AWS SSM parameter'
    });
  }
}
