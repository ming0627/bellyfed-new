import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Bellyfed API Configuration
 *
 * Available environments:
 * - dev: Development environment (api-dev.bellyfed.com)
 * - test: Testing environment (api-test.bellyfed.com)
 * - qa: QA environment (api-qa.bellyfed.com)
 * - prod: Production environment (api.bellyfed.com)
 *
 * API Connection Control:
 * - USE_AWS_API=true: Use AWS API endpoints (api-dev.bellyfed.com, etc.)
 * - USE_AWS_API=false: Use local API endpoints (localhost:3001)
 *
 * See docs/API_CONNECTION.md for detailed documentation on API connection configuration.
 */

// Determine which environment to use
const API_ENV = process.env.API_ENV || 'dev';

// Base URLs for different API endpoints
// Use AWS API based on environment variable or fallback to local for development
const USE_AWS_API = process.env.USE_AWS_API === 'true';

const API_BASE_URL =
  USE_AWS_API || process.env.NODE_ENV !== 'development'
    ? `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1`
    : 'http://localhost:3001/api'; // Fallback to local API if not using AWS

const DB_API_BASE_URL =
  USE_AWS_API || process.env.NODE_ENV !== 'development'
    ? `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1/db`
    : 'http://localhost:3001/api/database'; // Fallback to local API if not using AWS

const RANKINGS_API_BASE_URL =
  USE_AWS_API || process.env.NODE_ENV !== 'development'
    ? `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1/rankings`
    : 'http://localhost:3001/api/rankings'; // Fallback to local API if not using AWS

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { path } = req.query;
  let apiPath = Array.isArray(path) ? path.join('/') : path || '';

  // Ensure we have an API key
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (!apiKey) {
    console.error('API key missing');
    res.status(500).json({ error: 'API key is not configured' });
    return;
  }

  try {
    // Construct the URL carefully
    const queryString = req.url?.includes('?')
      ? req.url.substring(req.url.indexOf('?'))
      : '';

    // Determine which API base URL to use based on the path
    let baseUrl = API_BASE_URL;

    // Database operations
    if (apiPath.startsWith('db/') || apiPath.startsWith('database/')) {
      baseUrl = DB_API_BASE_URL;
      // Remove the 'db/' or 'database/' prefix
      apiPath = apiPath.replace(/^(db|database)\//, '');
    }
    // Rankings operations
    else if (apiPath.startsWith('rankings/')) {
      baseUrl = RANKINGS_API_BASE_URL;
      // Remove the 'rankings/' prefix
      apiPath = apiPath.replace(/^rankings\//, '');
    }

    const targetUrl = `${baseUrl}/${apiPath}${queryString}`;

    console.log('API Proxy Request:', {
      url: targetUrl,
      method: req.method,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
      environment: API_ENV,
      baseUrl: baseUrl,
      path: apiPath,
    });

    // Add retry logic with exponential backoff
    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(targetUrl, {
          method: req.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-api-key': apiKey.trim(), // Ensure no whitespace
            'User-Agent': 'BellyFed-Proxy',
          },
          body:
            req.method !== 'GET' && req.method !== 'HEAD'
              ? JSON.stringify(req.body)
              : undefined,
        });

        console.log('API Proxy Response:', {
          url: targetUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          environment: API_ENV,
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = parseInt(
            response.headers.get('retry-after') || '5',
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
          attempt++;
          continue;
        }

        const data = await response.json();

        if (!response.ok) {
          console.error('API Proxy Error:', {
            url: targetUrl,
            status: response.status,
            statusText: response.statusText,
            data,
            environment: API_ENV,
          });
        }

        res.status(response.status).json(data);
        return;
      } catch (retryError) {
        lastError = retryError;
        attempt++;
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
        }
      }
    }

    throw lastError || new Error('Max retries reached');
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Proxy error details:', errorMessage);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: errorMessage });
  }
}
