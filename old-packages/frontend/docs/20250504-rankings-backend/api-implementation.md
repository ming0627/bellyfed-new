# API Implementation Guide

This document provides detailed implementation guidelines for the rankings feature API endpoints.

## Authentication Middleware

All ranking endpoints should use the authentication middleware to ensure that only authenticated users can access them.

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './utils/auth';

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/api/rankings/my')) {
    const authResult = await verifyAuth(request);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', authResult.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}
```

## API Route Implementations

### Get User Rankings

```typescript
// src/pages/api/rankings/my/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserRankings } from '@/services/rankingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-user-id'] as string;

  try {
    const rankings = await getUserRankings(userId);
    return res.status(200).json({ rankings });
  } catch (error) {
    console.error('Error fetching user rankings:', error);
    return res.status(500).json({ error: 'Failed to fetch rankings' });
  }
}
```

### Get User Ranking for a Dish

```typescript
// src/pages/api/rankings/my/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getUserRankingByDishSlug,
  getDishBySlug,
  getRankingStats,
} from '@/services/rankingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { dishSlug } = req.query;
  const userId = req.headers['x-user-id'] as string;

  if (!dishSlug || Array.isArray(dishSlug)) {
    return res.status(400).json({ error: 'Invalid dish slug' });
  }

  try {
    // Get dish details
    const dishDetails = await getDishBySlug(dishSlug);

    if (!dishDetails) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        const userRanking = await getUserRankingByDishSlug(userId, dishSlug);
        const rankingStats = await getRankingStats(dishSlug);

        return res.status(200).json({
          userRanking,
          dishDetails,
          rankingStats,
        });

      case 'POST':
      // Create a new ranking
      // Implementation in the next section

      case 'PUT':
      // Update an existing ranking
      // Implementation in the next section

      case 'DELETE':
      // Delete a ranking
      // Implementation in the next section

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error handling ${req.method} for dish ranking:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Create a New Ranking

```typescript
// Inside the POST case of the [dishSlug].ts handler
case 'POST':
  const { rank, tasteStatus, notes, photoUrls } = req.body;

  // Validate input
  if ((rank === null && tasteStatus === null) || (rank !== null && tasteStatus !== null)) {
    return res.status(400).json({
      error: 'Either rank or tasteStatus must be provided, but not both'
    });
  }

  if (!notes || notes.trim() === '') {
    return res.status(400).json({ error: 'Notes are required' });
  }

  try {
    const newRanking = await createRanking({
      userId,
      dishId: dishDetails.id,
      restaurantId: dishDetails.restaurantId,
      dishType: dishDetails.category,
      rank,
      tasteStatus,
      notes,
      photoUrls: photoUrls || []
    });

    return res.status(201).json({
      userRanking: newRanking,
      dishDetails,
      rankingStats: await getRankingStats(dishSlug)
    });
  } catch (error) {
    console.error('Error creating ranking:', error);
    return res.status(500).json({ error: 'Failed to create ranking' });
  }
```

### Update an Existing Ranking

```typescript
// Inside the PUT case of the [dishSlug].ts handler
case 'PUT':
  const { rank, tasteStatus, notes, photoUrls } = req.body;

  // Validate input
  if ((rank === null && tasteStatus === null) || (rank !== null && tasteStatus !== null)) {
    return res.status(400).json({
      error: 'Either rank or tasteStatus must be provided, but not both'
    });
  }

  if (!notes || notes.trim() === '') {
    return res.status(400).json({ error: 'Notes are required' });
  }

  // Check if ranking exists
  const existingRanking = await getUserRankingByDishSlug(userId, dishSlug);

  if (!existingRanking) {
    return res.status(404).json({ error: 'Ranking not found' });
  }

  try {
    const updatedRanking = await updateRanking(existingRanking.rankingId, {
      rank,
      tasteStatus,
      notes,
      photoUrls: photoUrls || []
    });

    return res.status(200).json({
      userRanking: updatedRanking,
      dishDetails,
      rankingStats: await getRankingStats(dishSlug)
    });
  } catch (error) {
    console.error('Error updating ranking:', error);
    return res.status(500).json({ error: 'Failed to update ranking' });
  }
```

### Delete a Ranking

```typescript
// Inside the DELETE case of the [dishSlug].ts handler
case 'DELETE':
  // Check if ranking exists
  const existingRanking = await getUserRankingByDishSlug(userId, dishSlug);

  if (!existingRanking) {
    return res.status(404).json({ error: 'Ranking not found' });
  }

  try {
    await deleteRanking(existingRanking.rankingId);

    return res.status(200).json({
      success: true,
      message: 'Ranking deleted successfully',
      dishDetails,
      rankingStats: await getRankingStats(dishSlug)
    });
  } catch (error) {
    console.error('Error deleting ranking:', error);
    return res.status(500).json({ error: 'Failed to delete ranking' });
  }
```

### Get Local Rankings

```typescript
// src/pages/api/rankings/local/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getLocalRankings, getDishBySlug } from '@/services/rankingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dishSlug } = req.query;
  const { country } = req.query;

  if (!dishSlug || Array.isArray(dishSlug)) {
    return res.status(400).json({ error: 'Invalid dish slug' });
  }

  try {
    // Get dish details
    const dishDetails = await getDishBySlug(dishSlug);

    if (!dishDetails) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Get local rankings
    const localRankings = await getLocalRankings(dishSlug, country as string);

    return res.status(200).json({
      dishDetails,
      localRankings,
    });
  } catch (error) {
    console.error('Error fetching local rankings:', error);
    return res.status(500).json({ error: 'Failed to fetch local rankings' });
  }
}
```

### Get Global Rankings

```typescript
// src/pages/api/rankings/global/[dishSlug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGlobalRankings, getDishBySlug } from '@/services/rankingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dishSlug } = req.query;

  if (!dishSlug || Array.isArray(dishSlug)) {
    return res.status(400).json({ error: 'Invalid dish slug' });
  }

  try {
    // Get dish details
    const dishDetails = await getDishBySlug(dishSlug);

    if (!dishDetails) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Get global rankings
    const globalRankings = await getGlobalRankings(dishSlug);

    return res.status(200).json({
      dishDetails,
      globalRankings,
    });
  } catch (error) {
    console.error('Error fetching global rankings:', error);
    return res.status(500).json({ error: 'Failed to fetch global rankings' });
  }
}
```

## Photo Upload Implementation

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
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

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

## Database Service Implementation

Create a service layer to handle database operations:

```typescript
// src/services/rankingService.ts
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '@/lib/db';

// Get all rankings for a user
export async function getUserRankings(userId: string) {
  const query = `
    SELECT ur.*, d.name as dish_name, d.slug as dish_slug, 
           r.name as restaurant_name, 
           (SELECT JSON_ARRAYAGG(photo_url) 
            FROM ranking_photos 
            WHERE ranking_id = ur.id) as photo_urls
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    JOIN restaurants r ON ur.restaurant_id = r.id
    WHERE ur.user_id = ?
    ORDER BY ur.updated_at DESC
  `;

  const rankings = await executeQuery(query, [userId]);

  // Transform the results
  return rankings.map((ranking) => ({
    rankingId: ranking.id,
    userId: ranking.user_id,
    dishId: ranking.dish_id,
    dishName: ranking.dish_name,
    dishSlug: ranking.dish_slug,
    restaurantId: ranking.restaurant_id,
    restaurantName: ranking.restaurant_name,
    dishType: ranking.dish_type,
    rank: ranking.rank,
    tasteStatus: ranking.taste_status,
    notes: ranking.notes,
    photoUrls: ranking.photo_urls ? JSON.parse(ranking.photo_urls) : [],
    createdAt: ranking.created_at,
    updatedAt: ranking.updated_at,
  }));
}

// Get a user's ranking for a specific dish by slug
export async function getUserRankingByDishSlug(
  userId: string,
  dishSlug: string,
) {
  const query = `
    SELECT ur.*, 
           (SELECT JSON_ARRAYAGG(photo_url) 
            FROM ranking_photos 
            WHERE ranking_id = ur.id) as photo_urls
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    WHERE ur.user_id = ? AND d.slug = ?
  `;

  const results = await executeQuery(query, [userId, dishSlug]);

  if (results.length === 0) {
    return null;
  }

  const ranking = results[0];

  return {
    rankingId: ranking.id,
    userId: ranking.user_id,
    dishId: ranking.dish_id,
    restaurantId: ranking.restaurant_id,
    dishType: ranking.dish_type,
    rank: ranking.rank,
    tasteStatus: ranking.taste_status,
    notes: ranking.notes,
    photoUrls: ranking.photo_urls ? JSON.parse(ranking.photo_urls) : [],
    createdAt: ranking.created_at,
    updatedAt: ranking.updated_at,
  };
}

// Get dish details by slug
export async function getDishBySlug(dishSlug: string) {
  const query = `
    SELECT d.*, r.name as restaurant_name
    FROM dishes d
    JOIN restaurants r ON d.restaurant_id = r.id
    WHERE d.slug = ?
  `;

  const results = await executeQuery(query, [dishSlug]);

  if (results.length === 0) {
    return null;
  }

  const dish = results[0];

  return {
    dishId: dish.id,
    name: dish.name,
    description: dish.description,
    restaurantId: dish.restaurant_id,
    restaurantName: dish.restaurant_name,
    category: dish.category,
    imageUrl: dish.image_url,
    isVegetarian: dish.is_vegetarian === 1,
    spicyLevel: dish.spicy_level,
    price: dish.price,
    countryCode: dish.country_code,
  };
}

// Get ranking statistics for a dish
export async function getRankingStats(dishSlug: string) {
  // Get total rankings and average rank
  const statsQuery = `
    SELECT COUNT(*) as total_rankings,
           AVG(CASE WHEN rank IS NOT NULL THEN rank ELSE NULL END) as average_rank
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    WHERE d.slug = ?
  `;

  // Get rank distribution
  const rankDistributionQuery = `
    SELECT rank, COUNT(*) as count
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    WHERE d.slug = ? AND rank IS NOT NULL
    GROUP BY rank
  `;

  // Get taste status distribution
  const tasteStatusDistributionQuery = `
    SELECT taste_status, COUNT(*) as count
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    WHERE d.slug = ? AND taste_status IS NOT NULL
    GROUP BY taste_status
  `;

  const statsResults = await executeQuery(statsQuery, [dishSlug]);
  const rankResults = await executeQuery(rankDistributionQuery, [dishSlug]);
  const tasteStatusResults = await executeQuery(tasteStatusDistributionQuery, [
    dishSlug,
  ]);

  // Transform rank distribution
  const ranks: Record<string, number> = {};
  rankResults.forEach((row: any) => {
    ranks[row.rank] = row.count;
  });

  // Transform taste status distribution
  const tasteStatuses: Record<string, number> = {};
  tasteStatusResults.forEach((row: any) => {
    tasteStatuses[row.taste_status] = row.count;
  });

  return {
    totalRankings: statsResults[0].total_rankings || 0,
    averageRank: statsResults[0].average_rank || 0,
    ranks,
    tasteStatuses,
  };
}

// Create a new ranking
export async function createRanking(data: {
  userId: string;
  dishId: string;
  restaurantId: string;
  dishType: string;
  rank: number | null;
  tasteStatus: string | null;
  notes: string;
  photoUrls: string[];
}) {
  const rankingId = uuidv4();

  // Insert the ranking
  const query = `
    INSERT INTO user_rankings (
      id, user_id, dish_id, restaurant_id, dish_type, 
      rank, taste_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await executeQuery(query, [
    rankingId,
    data.userId,
    data.dishId,
    data.restaurantId,
    data.dishType,
    data.rank,
    data.tasteStatus,
    data.notes,
  ]);

  // Insert photos if any
  if (data.photoUrls && data.photoUrls.length > 0) {
    const photoValues = data.photoUrls.map((url) => [uuidv4(), rankingId, url]);

    const photoQuery = `
      INSERT INTO ranking_photos (id, ranking_id, photo_url)
      VALUES ?
    `;

    await executeQuery(photoQuery, [photoValues]);
  }

  // Return the created ranking
  return {
    rankingId,
    userId: data.userId,
    dishId: data.dishId,
    restaurantId: data.restaurantId,
    dishType: data.dishType,
    rank: data.rank,
    tasteStatus: data.tasteStatus,
    notes: data.notes,
    photoUrls: data.photoUrls,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Update an existing ranking
export async function updateRanking(
  rankingId: string,
  data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
  },
) {
  // Update the ranking
  const query = `
    UPDATE user_rankings
    SET rank = ?, taste_status = ?, notes = ?, updated_at = NOW()
    WHERE id = ?
  `;

  await executeQuery(query, [
    data.rank,
    data.tasteStatus,
    data.notes,
    rankingId,
  ]);

  // Delete existing photos
  await executeQuery('DELETE FROM ranking_photos WHERE ranking_id = ?', [
    rankingId,
  ]);

  // Insert new photos if any
  if (data.photoUrls && data.photoUrls.length > 0) {
    const photoValues = data.photoUrls.map((url) => [uuidv4(), rankingId, url]);

    const photoQuery = `
      INSERT INTO ranking_photos (id, ranking_id, photo_url)
      VALUES ?
    `;

    await executeQuery(photoQuery, [photoValues]);
  }

  // Get the updated ranking
  const result = await executeQuery(
    'SELECT * FROM user_rankings WHERE id = ?',
    [rankingId],
  );

  const ranking = result[0];

  // Get photos
  const photos = await executeQuery(
    'SELECT photo_url FROM ranking_photos WHERE ranking_id = ?',
    [rankingId],
  );

  const photoUrls = photos.map((photo: any) => photo.photo_url);

  return {
    rankingId: ranking.id,
    userId: ranking.user_id,
    dishId: ranking.dish_id,
    restaurantId: ranking.restaurant_id,
    dishType: ranking.dish_type,
    rank: ranking.rank,
    tasteStatus: ranking.taste_status,
    notes: ranking.notes,
    photoUrls,
    createdAt: ranking.created_at,
    updatedAt: ranking.updated_at,
  };
}

// Delete a ranking
export async function deleteRanking(rankingId: string) {
  // Delete photos first (cascade should handle this, but just to be safe)
  await executeQuery('DELETE FROM ranking_photos WHERE ranking_id = ?', [
    rankingId,
  ]);

  // Delete the ranking
  await executeQuery('DELETE FROM user_rankings WHERE id = ?', [rankingId]);

  return true;
}

// Get local rankings for a dish
export async function getLocalRankings(dishSlug: string, countryCode: string) {
  const query = `
    SELECT ur.rank, ur.taste_status, ur.notes, 
           u.username, u.avatar_url,
           (SELECT JSON_ARRAYAGG(photo_url) 
            FROM ranking_photos 
            WHERE ranking_id = ur.id) as photo_urls,
           ur.created_at
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    JOIN users u ON ur.user_id = u.id
    WHERE d.slug = ? AND u.country_code = ?
    ORDER BY ur.created_at DESC
    LIMIT 50
  `;

  const rankings = await executeQuery(query, [dishSlug, countryCode]);

  return rankings.map((ranking: any) => ({
    username: ranking.username,
    avatarUrl: ranking.avatar_url,
    rank: ranking.rank,
    tasteStatus: ranking.taste_status,
    notes: ranking.notes,
    photoUrls: ranking.photo_urls ? JSON.parse(ranking.photo_urls) : [],
    createdAt: ranking.created_at,
  }));
}

// Get global rankings for a dish
export async function getGlobalRankings(dishSlug: string) {
  const query = `
    SELECT ur.rank, ur.taste_status, ur.notes, 
           u.username, u.avatar_url, u.country_code,
           (SELECT JSON_ARRAYAGG(photo_url) 
            FROM ranking_photos 
            WHERE ranking_id = ur.id) as photo_urls,
           ur.created_at
    FROM user_rankings ur
    JOIN dishes d ON ur.dish_id = d.id
    JOIN users u ON ur.user_id = u.id
    WHERE d.slug = ?
    ORDER BY ur.created_at DESC
    LIMIT 50
  `;

  const rankings = await executeQuery(query, [dishSlug]);

  return rankings.map((ranking: any) => ({
    username: ranking.username,
    avatarUrl: ranking.avatar_url,
    countryCode: ranking.country_code,
    rank: ranking.rank,
    tasteStatus: ranking.taste_status,
    notes: ranking.notes,
    photoUrls: ranking.photo_urls ? JSON.parse(ranking.photo_urls) : [],
    createdAt: ranking.created_at,
  }));
}
```

## Database Connection Utility

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

## Environment Variables

Make sure to set up the following environment variables:

```
# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=bellyfed

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=bellyfed-uploads
```
