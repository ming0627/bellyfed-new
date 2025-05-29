# 4. Authentication and Security Implementation

This document outlines the implementation plan for authentication and security features required for the Rankings feature.

## Overview

The authentication and security implementation will ensure that:

- Only authenticated users can create, update, or delete rankings
- Users can only access and modify their own rankings
- Admin-only routes are properly protected
- API endpoints are secured against common attacks

## Implementation Tasks

### 1. Authentication Middleware

- [ ] Create authentication middleware
    - File: `src/middleware/auth.ts`
    - Implement JWT token validation
    - Extract user information from tokens
    - Handle expired or invalid tokens

### 2. Authorization Checks

- [ ] Create authorization utility functions
    - File: `src/lib/authorization.ts`
    - Implement function to check if user owns a ranking
    - Implement function to check if user has admin privileges
    - Add helper functions for common authorization patterns

### 3. Route Protection

- [ ] Apply authentication middleware to protected routes
    - Protect all ranking creation/modification endpoints
    - Protect admin-only dish management endpoints
    - Ensure public endpoints remain accessible

### 4. Security Headers

- [ ] Configure security headers
    - File: `next.config.js`
    - Implement Content Security Policy
    - Add X-Frame-Options header
    - Configure other security headers

### 5. Rate Limiting

- [ ] Implement rate limiting for API endpoints
    - File: `src/middleware/rateLimit.ts`
    - Add rate limiting for photo upload endpoint
    - Add rate limiting for ranking creation/modification
    - Configure different limits for different endpoints

## Implementation Details

### Authentication Middleware

```typescript
// src/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

export interface AuthResult {
    isAuthenticated: boolean;
    userId?: string;
    isAdmin?: boolean;
}

export async function verifyAuth(req: NextApiRequest): Promise<AuthResult> {
    try {
        // Get the authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { isAuthenticated: false };
        }

        // Extract the token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return { isAuthenticated: false };
        }

        // Verify the token
        const decoded = verify(token, process.env.JWT_SECRET || '') as {
            userId: string;
            isAdmin?: boolean;
        };

        return {
            isAuthenticated: true,
            userId: decoded.userId,
            isAdmin: decoded.isAdmin || false,
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return { isAuthenticated: false };
    }
}

export function withAuth(
    handler: (req: NextApiRequest, res: NextApiResponse, authResult: AuthResult) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const authResult = await verifyAuth(req);

        if (!authResult.isAuthenticated) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        return handler(req, res, authResult);
    };
}

export function withAdminAuth(
    handler: (req: NextApiRequest, res: NextApiResponse, authResult: AuthResult) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const authResult = await verifyAuth(req);

        if (!authResult.isAuthenticated) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!authResult.isAdmin) {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        return handler(req, res, authResult);
    };
}
```

### Authorization Utility

```typescript
// src/lib/authorization.ts
import { db } from '@/lib/db';

/**
 * Check if a user owns a ranking
 */
export async function userOwnsRanking(userId: string, rankingId: string): Promise<boolean> {
    const [ranking] = await db.query('SELECT user_id FROM user_rankings WHERE id = ?', [rankingId]);

    return ranking && ranking.user_id === userId;
}

/**
 * Check if a user can modify a ranking by dish slug
 */
export async function userCanModifyRankingByDishSlug(
    userId: string,
    dishSlug: string
): Promise<boolean> {
    const [ranking] = await db.query(
        `SELECT ur.id 
     FROM user_rankings ur
     JOIN dishes d ON ur.dish_id = d.id
     WHERE d.slug = ? AND ur.user_id = ?`,
        [dishSlug, userId]
    );

    return !!ranking;
}

/**
 * Get ranking ID by dish slug and user ID
 */
export async function getRankingIdByDishSlugAndUserId(
    dishSlug: string,
    userId: string
): Promise<string | null> {
    const [ranking] = await db.query(
        `SELECT ur.id 
     FROM user_rankings ur
     JOIN dishes d ON ur.dish_id = d.id
     WHERE d.slug = ? AND ur.user_id = ?`,
        [dishSlug, userId]
    );

    return ranking ? ranking.id : null;
}
```

### Protected API Route Example

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthResult } from '@/middleware/auth';
import {
    getRankingByDishSlug,
    createRanking,
    updateRanking,
    deleteRanking,
} from '@/services/rankingService';
import { getDishBySlug } from '@/services/dishService';
import {
    userCanModifyRankingByDishSlug,
    getRankingIdByDishSlugAndUserId,
} from '@/lib/authorization';
import { validateRankingInput } from '@/lib/validation/rankingSchemas';

async function handler(req: NextApiRequest, res: NextApiResponse, authResult: AuthResult) {
    const { dishSlug } = req.query as { dishSlug: string };
    const userId = authResult.userId!;

    // GET: Get user's ranking for a dish
    if (req.method === 'GET') {
        try {
            const ranking = await getRankingByDishSlug(dishSlug, userId);
            return res.status(200).json({ success: true, data: ranking });
        } catch (error) {
            console.error('Error getting ranking:', error);
            return res.status(500).json({ error: 'Failed to get ranking' });
        }
    }

    // POST: Create a new ranking
    if (req.method === 'POST') {
        try {
            // Validate input
            const validationResult = validateRankingInput(req.body);
            if (!validationResult.success) {
                return res
                    .status(400)
                    .json({ error: 'Invalid input', details: validationResult.errors });
            }

            // Get dish by slug
            const dish = await getDishBySlug(dishSlug);
            if (!dish) {
                return res.status(404).json({ error: 'Dish not found' });
            }

            // Check if ranking already exists
            const existingRankingId = await getRankingIdByDishSlugAndUserId(dishSlug, userId);
            if (existingRankingId) {
                return res.status(409).json({ error: 'Ranking already exists' });
            }

            // Create ranking
            const ranking = await createRanking({
                ...req.body,
                userId,
                dishId: dish.id,
            });

            return res.status(201).json({ success: true, data: ranking });
        } catch (error) {
            console.error('Error creating ranking:', error);
            return res.status(500).json({ error: 'Failed to create ranking' });
        }
    }

    // PUT: Update an existing ranking
    if (req.method === 'PUT') {
        try {
            // Validate input
            const validationResult = validateRankingInput(req.body);
            if (!validationResult.success) {
                return res
                    .status(400)
                    .json({ error: 'Invalid input', details: validationResult.errors });
            }

            // Check if user can modify the ranking
            const canModify = await userCanModifyRankingByDishSlug(userId, dishSlug);
            if (!canModify) {
                return res.status(404).json({ error: 'Ranking not found' });
            }

            // Get ranking ID
            const rankingId = await getRankingIdByDishSlugAndUserId(dishSlug, userId);
            if (!rankingId) {
                return res.status(404).json({ error: 'Ranking not found' });
            }

            // Update ranking
            const ranking = await updateRanking(rankingId, req.body);

            return res.status(200).json({ success: true, data: ranking });
        } catch (error) {
            console.error('Error updating ranking:', error);
            return res.status(500).json({ error: 'Failed to update ranking' });
        }
    }

    // DELETE: Delete a ranking
    if (req.method === 'DELETE') {
        try {
            // Check if user can modify the ranking
            const canModify = await userCanModifyRankingByDishSlug(userId, dishSlug);
            if (!canModify) {
                return res.status(404).json({ error: 'Ranking not found' });
            }

            // Get ranking ID
            const rankingId = await getRankingIdByDishSlugAndUserId(dishSlug, userId);
            if (!rankingId) {
                return res.status(404).json({ error: 'Ranking not found' });
            }

            // Delete ranking
            await deleteRanking(rankingId);

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting ranking:', error);
            return res.status(500).json({ error: 'Failed to delete ranking' });
        }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
```

### Rate Limiting Middleware

```typescript
// src/middleware/rateLimit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL || '',
    token: process.env.UPSTASH_REDIS_TOKEN || '',
});

interface RateLimitOptions {
    limit: number;
    window: number; // in seconds
}

export function withRateLimit(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
    options: RateLimitOptions = { limit: 10, window: 60 }
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // Get client IP
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const key = `ratelimit:${ip}:${req.url}`;

            // Get current count
            const count = (await redis.get(key)) || 0;

            // Check if limit exceeded
            if (count >= options.limit) {
                return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
            }

            // Increment count
            await redis.incr(key);

            // Set expiry if not already set
            if (count === 0) {
                await redis.expire(key, options.window);
            }

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', options.limit);
            res.setHeader('X-RateLimit-Remaining', options.limit - (count as number) - 1);

            // Call handler
            return handler(req, res);
        } catch (error) {
            console.error('Rate limiting error:', error);
            // Proceed with the request even if rate limiting fails
            return handler(req, res);
        }
    };
}

// Example usage for photo upload endpoint
export const photoUploadRateLimit = {
    limit: 10,
    window: 60 * 5, // 5 minutes
};

// Example usage for ranking creation/modification
export const rankingRateLimit = {
    limit: 20,
    window: 60 * 10, // 10 minutes
};
```

## Security Headers Configuration

```javascript
// next.config.js
module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; img-src 'self' https://*.amazonaws.com data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.amazonaws.com https://api.bellyfed.com;",
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
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

## Testing

- [ ] Write unit tests for authentication middleware
- [ ] Test authorization utility functions
- [ ] Verify rate limiting functionality
- [ ] Test security headers configuration

## Dependencies

- JWT for authentication
- Redis for rate limiting
- Next.js for security headers configuration

## Estimated Time

- Authentication Middleware: 0.5 day
- Authorization Checks: 0.5 day
- Route Protection: 0.5 day
- Security Headers: 0.5 day
- Rate Limiting: 1 day
- Testing: 1 day

Total: 4 days
