/**
 * API Route: CSRF Protection
 * 
 * This API route provides CSRF token generation and validation.
 * It helps protect against Cross-Site Request Forgery attacks.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import crypto from 'crypto';

/**
 * Handler for CSRF protection API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetToken(req, res);
    case 'POST':
      return handleValidateToken(req, res);
    default:
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET and POST requests are supported'
      });
  }
}

/**
 * Handle GET request to generate CSRF token
 */
async function handleGetToken(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to generate CSRF token'
      });
    }

    // Generate CSRF token
    const token = generateCSRFToken(session.user.id);
    
    // Set token in cookie for automatic inclusion in requests
    res.setHeader('Set-Cookie', [
      `csrf-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
    ]);

    // Return token in response
    res.status(200).json({
      success: true,
      data: {
        token,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        usage: 'Include this token in X-CSRF-Token header for state-changing requests'
      },
      meta: {
        generatedAt: new Date().toISOString(),
        userId: session.user.id
      }
    });

  } catch (error) {
    console.error('Error generating CSRF token:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate CSRF token'
    });
  }
}

/**
 * Handle POST request to validate CSRF token
 */
async function handleValidateToken(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to validate CSRF token'
      });
    }

    const { token } = req.body;

    // Validate token parameter
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Invalid token parameter',
        message: 'CSRF token is required and must be a string'
      });
    }

    // Get token from header or cookie
    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies['csrf-token'];

    // Validate token
    const isValid = validateCSRFToken(token, session.user.id) ||
                   validateCSRFToken(headerToken, session.user.id) ||
                   validateCSRFToken(cookieToken, session.user.id);

    if (!isValid) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'The provided CSRF token is invalid or expired'
      });
    }

    // Return validation result
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        validatedAt: new Date().toISOString()
      },
      meta: {
        userId: session.user.id,
        tokenSource: headerToken ? 'header' : cookieToken ? 'cookie' : 'body'
      }
    });

  } catch (error) {
    console.error('Error validating CSRF token:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate CSRF token'
    });
  }
}

/**
 * Generate CSRF token for a user
 */
function generateCSRFToken(userId) {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  
  // Create token payload
  const payload = `${userId}:${timestamp}:${randomBytes}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Combine payload and signature
  const token = Buffer.from(`${payload}:${signature}`).toString('base64');
  
  return token;
}

/**
 * Validate CSRF token for a user
 */
function validateCSRFToken(token, userId) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
    
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) {
      return false;
    }

    const [tokenUserId, timestamp, randomBytes, signature] = parts;
    
    // Check user ID
    if (tokenUserId !== userId) {
      return false;
    }

    // Check timestamp (1 hour expiry)
    const tokenTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (currentTime - tokenTime > oneHour) {
      return false;
    }

    // Verify signature
    const payload = `${tokenUserId}:${timestamp}:${randomBytes}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}
