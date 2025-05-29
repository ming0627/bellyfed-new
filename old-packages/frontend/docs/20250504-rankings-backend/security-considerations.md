# Security Considerations

This document outlines the security considerations for the rankings feature backend implementation.

## Authentication and Authorization

### Authentication

All ranking endpoints must require authentication to ensure that only authenticated users can access them.

#### JWT Authentication

Use JWT (JSON Web Tokens) for authentication:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './utils/auth';

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/api/rankings/my')) {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    try {
      // Verify the JWT token
      const payload = await verifyJWT(token);

      // Add user info to request headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}
```

#### Session-Based Authentication

Alternatively, use session-based authentication with cookies:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './utils/session';

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/api/rankings/my')) {
    // Get the session from cookies
    const session = await getSession(request);

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}
```

### Authorization

Ensure that users can only access and modify their own rankings:

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRankingByDishSlug } from '@/services/rankingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { dishSlug } = req.query;
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'DELETE') {
    // Check if the ranking exists and belongs to the user
    const ranking = await getUserRankingByDishSlug(userId, dishSlug as string);

    if (!ranking) {
      return res.status(404).json({ error: 'Ranking not found' });
    }

    // If we get here, the ranking exists and belongs to the user
    // Proceed with deletion
    // ...
  }

  // Handle other methods
  // ...
}
```

## Input Validation

### Request Validation

Validate all input data on the server side to prevent injection attacks and ensure data integrity:

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Define validation schema
const createRankingSchema = z
  .object({
    dishId: z.string().uuid(),
    restaurantId: z.string().uuid(),
    dishType: z.string().optional(),
    rank: z.number().int().min(1).max(5).nullable(),
    tasteStatus: z
      .enum(['ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED'])
      .nullable(),
    notes: z.string().min(1).max(1000),
    photoUrls: z.array(z.string().url()).max(10),
  })
  .refine(
    (data) =>
      (data.rank !== null && data.tasteStatus === null) ||
      (data.rank === null && data.tasteStatus !== null),
    {
      message: 'Either rank or tasteStatus must be provided, but not both',
      path: ['rank', 'tasteStatus'],
    },
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      // Validate request body
      const validatedData = createRankingSchema.parse(req.body);

      // Proceed with creating the ranking
      // ...
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid input data',
          details: error.errors,
        });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle other methods
  // ...
}
```

### SQL Injection Prevention

Use parameterized queries to prevent SQL injection:

```typescript
// src/lib/db.ts
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Execute a query with parameters
export async function executeQuery(query: string, params: any = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

## Rate Limiting

Implement rate limiting to prevent abuse of the API:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './utils/rateLimit';

// Create a rate limiter that allows 100 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max number of users per interval
});

export async function middleware(request: NextRequest) {
  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get a unique identifier for the client
    const ip = request.ip || 'anonymous';

    try {
      // Check if the client has exceeded the rate limit
      await limiter.check(ip, 100); // 100 requests per minute
    } catch (error) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 },
      );
    }
  }

  return NextResponse.next();
}
```

## HTTPS

Ensure all API endpoints use HTTPS to encrypt data in transit:

1. Configure your Next.js application to use HTTPS in production
2. Set the `secure` flag on cookies to ensure they are only sent over HTTPS
3. Implement HTTP Strict Transport Security (HSTS) to prevent downgrade attacks

```typescript
// next.config.js
module.exports = {
  // ...
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
```

## Content Security Policy

Implement a Content Security Policy (CSP) to prevent cross-site scripting (XSS) attacks:

```typescript
// next.config.js
module.exports = {
  // ...
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https://*.amazonaws.com;
              font-src 'self';
              connect-src 'self' https://api.bellyfed.com;
              frame-src 'none';
              object-src 'none';
            `
              .replace(/\s+/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
};
```

## Cross-Origin Resource Sharing (CORS)

Configure CORS to restrict which domains can access your API:

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

// Initialize the CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://bellyfed.com', 'https://www.bellyfed.com']
      : '*',
  credentials: true,
});

// Helper method to run middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle the request
  // ...
}
```

## S3 Security

Secure the S3 bucket used for photo storage:

### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bellyfed-uploads/*"
    },
    {
      "Sid": "DenyPublicWriteAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::bellyfed-uploads/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalArn": "arn:aws:iam::123456789012:user/bellyfed-app"
        }
      }
    }
  ]
}
```

### Pre-signed URLs

Use pre-signed URLs for secure uploads:

```typescript
// src/pages/api/upload/ranking-photo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const fileId = uuidv4();
    const fileKey = `rankings/${userId}/${fileId}`;
    const contentType = req.body.contentType || 'image/jpeg';

    // Create the command to put an object in the S3 bucket
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'bellyfed-uploads',
      Key: fileKey,
      ContentType: contentType,
    });

    // Generate a pre-signed URL for the S3 PutObject operation
    // Set a short expiration time to limit the window of opportunity for misuse
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // The URL where the file will be accessible after upload
    const photoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      uploadUrl,
      photoUrl,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
```

## Error Handling

Implement secure error handling to avoid leaking sensitive information:

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Handle the request
    // ...
  } catch (error) {
    console.error('Error handling request:', error);

    // Return a generic error message to the client
    return res.status(500).json({
      error: 'An unexpected error occurred',
      // Include a request ID for tracking
      requestId: req.headers['x-request-id'] || uuidv4(),
    });
  }
}
```

## Logging and Monitoring

Implement secure logging and monitoring to detect and respond to security incidents:

```typescript
// src/utils/logger.ts
import winston from 'winston';

// Create a logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'rankings-api' },
  transports: [
    new winston.transports.Console(),
    // Add additional transports for production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
          }),
          new winston.transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});

// Sanitize sensitive data before logging
export function sanitizeData(data: any) {
  if (!data) return data;

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
  ];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// Log API requests
export function logApiRequest(req: any, res: any, next: Function) {
  const start = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    query: sanitizeData(req.query),
    headers: sanitizeData(req.headers),
    body: sanitizeData(req.body),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      type: 'response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}
```

## Security Headers

Implement security headers to protect against common web vulnerabilities:

```typescript
// next.config.js
module.exports = {
  // ...
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

## Dependency Security

Regularly scan and update dependencies to fix security vulnerabilities:

1. Use `npm audit` to scan for vulnerabilities
2. Set up automated dependency scanning with GitHub Dependabot
3. Keep all dependencies up to date

```json
// .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    versioning-strategy: "auto"
    labels:
      - "dependencies"
      - "security"
```

## Security Checklist

Before deploying to production, ensure the following security measures are in place:

- [ ] Authentication is required for all ranking operations
- [ ] Authorization checks ensure users can only access their own data
- [ ] Input validation is implemented for all user inputs
- [ ] Parameterized queries are used to prevent SQL injection
- [ ] Rate limiting is in place to prevent abuse
- [ ] HTTPS is enforced for all API endpoints
- [ ] Content Security Policy is implemented to prevent XSS
- [ ] CORS is configured to restrict access to trusted domains
- [ ] S3 bucket is properly secured
- [ ] Error handling does not leak sensitive information
- [ ] Logging and monitoring are in place to detect security incidents
- [ ] Security headers are implemented to protect against common vulnerabilities
- [ ] Dependencies are regularly scanned and updated
