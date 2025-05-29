# Hybrid Database Example: Restaurant Analytics Feature

This example demonstrates how to implement a new feature using both PostgreSQL and DynamoDB in a hybrid approach.

## Feature Overview

The Restaurant Analytics feature tracks and displays:

1. Restaurant profile data (PostgreSQL)
2. Real-time view counts (DynamoDB)
3. User engagement metrics (DynamoDB)
4. Detailed review analytics (PostgreSQL)

## Database Schema

### PostgreSQL Schema

```sql
-- Restaurant table (existing)
CREATE TABLE restaurants (
  restaurant_id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  -- other fields...
);

-- Restaurant analytics summary (new)
CREATE TABLE restaurant_analytics_summary (
  restaurant_id UUID PRIMARY KEY REFERENCES restaurants(restaurant_id),
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);
```

### DynamoDB Schema

```javascript
// Analytics table
{
  pk: "RESTAURANT#123", // Partition key
  sk: "VIEWS",          // Sort key
  viewCount: 1250,
  uniqueViewers: 850,
  lastUpdated: "2023-04-14T12:34:56Z"
}

// Real-time engagement table
{
  pk: "RESTAURANT#123",  // Partition key
  sk: "DATE#2023-04-14", // Sort key
  hourlyViews: {
    "00": 12,
    "01": 8,
    // ... other hours
    "23": 45
  },
  deviceTypes: {
    "mobile": 450,
    "desktop": 320,
    "tablet": 80
  }
}
```

## Implementation

### 1. Service Layer

```typescript
// src/services/restaurantAnalyticsService.ts
import { postgresService } from './postgresService';
import { dynamoService } from './dynamoService';

export class RestaurantAnalyticsService {
    /**
     * Track a restaurant view
     */
    async trackRestaurantView(
        restaurantId: string,
        userId?: string,
        deviceType?: string
    ): Promise<void> {
        // Use DynamoDB for real-time view tracking
        await dynamoService.incrementViewCount('RESTAURANT', restaurantId);

        // Track unique viewer if userId is provided
        if (userId) {
            await dynamoService.trackUniqueViewer('RESTAURANT', restaurantId, userId);
        }

        // Track device type
        if (deviceType) {
            await dynamoService.incrementDeviceTypeCount('RESTAURANT', restaurantId, deviceType);
        }
    }

    /**
     * Get restaurant analytics dashboard data
     */
    async getRestaurantAnalytics(restaurantId: string): Promise<any> {
        // Get restaurant profile from PostgreSQL
        const restaurant = await postgresService.getRestaurantById(restaurantId);

        // Get real-time view data from DynamoDB
        const viewData = await dynamoService.getEntityViews('RESTAURANT', restaurantId);

        // Get review analytics from PostgreSQL
        const reviewAnalytics = await postgresService.getRestaurantReviewAnalytics(restaurantId);

        // Combine the data
        return {
            restaurant,
            viewData,
            reviewAnalytics,
        };
    }

    /**
     * Get trending restaurants based on real-time data
     */
    async getTrendingRestaurants(limit: number = 10): Promise<any[]> {
        // Get top viewed restaurants from DynamoDB
        const topViewedIds = await dynamoService.getTopViewedEntities('RESTAURANT', limit);

        // Get restaurant details from PostgreSQL
        const restaurants = await postgresService.getRestaurantsByIds(topViewedIds);

        // Combine with real-time data
        const restaurantsWithAnalytics = await Promise.all(
            restaurants.map(async (restaurant) => {
                const viewData = await dynamoService.getEntityViews('RESTAURANT', restaurant.id);
                return {
                    ...restaurant,
                    viewCount: viewData.viewCount,
                    uniqueViewers: viewData.uniqueViewers,
                };
            })
        );

        return restaurantsWithAnalytics;
    }

    /**
     * Update review analytics summary
     * This would typically be run as a scheduled job
     */
    async updateReviewAnalyticsSummary(restaurantId: string): Promise<void> {
        // Calculate review analytics from PostgreSQL
        const reviewStats = await postgresService.calculateRestaurantReviewStats(restaurantId);

        // Update the summary table in PostgreSQL
        await postgresService.updateRestaurantAnalyticsSummary(
            restaurantId,
            reviewStats.totalReviews,
            reviewStats.averageRating,
            reviewStats.ratingDistribution
        );
    }
}
```

### 2. DynamoDB Implementation

```typescript
// src/services/dynamoService.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    UpdateCommand,
    GetCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

const docClient = DynamoDBDocumentClient.from(client);

export class DynamoService {
    /**
     * Increment view count for an entity
     */
    async incrementViewCount(entityType: string, entityId: string): Promise<number> {
        const pk = `${entityType}#${entityId}`;
        const sk = 'VIEWS';

        const command = new UpdateCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Key: { pk, sk },
            UpdateExpression: 'ADD viewCount :inc SET lastUpdated = :now',
            ExpressionAttributeValues: {
                ':inc': 1,
                ':now': new Date().toISOString(),
            },
            ReturnValues: 'UPDATED_NEW',
        });

        const response = await docClient.send(command);
        return response.Attributes?.viewCount || 0;
    }

    /**
     * Track unique viewer
     */
    async trackUniqueViewer(entityType: string, entityId: string, userId: string): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const pk = `${entityType}#${entityId}`;
        const sk = `VIEWERS#${today}`;

        // Use UpdateCommand with ADD for a SET data type
        const command = new UpdateCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Key: { pk, sk },
            UpdateExpression: 'ADD viewers :user SET lastUpdated = :now',
            ExpressionAttributeValues: {
                ':user': docClient.createSet([userId]),
                ':now': new Date().toISOString(),
            },
        });

        await docClient.send(command);

        // Also update the unique viewers count in the main record
        await this.updateUniqueViewersCount(entityType, entityId);
    }

    /**
     * Update unique viewers count
     */
    private async updateUniqueViewersCount(entityType: string, entityId: string): Promise<void> {
        // Query to get all viewer sets
        const queryCommand = new QueryCommand({
            TableName: process.env.ANALYTICS_TABLE,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: {
                ':pk': `${entityType}#${entityId}`,
                ':prefix': 'VIEWERS#',
            },
        });

        const response = await docClient.send(queryCommand);

        // Calculate unique viewers across all days
        const allViewers = new Set();
        response.Items?.forEach((item) => {
            const viewers = item.viewers?.values || [];
            viewers.forEach((viewer: string) => allViewers.add(viewer));
        });

        // Update the main record
        const updateCommand = new UpdateCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Key: {
                pk: `${entityType}#${entityId}`,
                sk: 'VIEWS',
            },
            UpdateExpression: 'SET uniqueViewers = :count, lastUpdated = :now',
            ExpressionAttributeValues: {
                ':count': allViewers.size,
                ':now': new Date().toISOString(),
            },
        });

        await docClient.send(updateCommand);
    }

    /**
     * Increment device type count
     */
    async incrementDeviceTypeCount(
        entityType: string,
        entityId: string,
        deviceType: string
    ): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const pk = `${entityType}#${entityId}`;
        const sk = `DATE#${today}`;

        const command = new UpdateCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Key: { pk, sk },
            UpdateExpression: 'ADD deviceTypes.:device :inc SET lastUpdated = :now',
            ExpressionAttributeValues: {
                ':device': deviceType.toLowerCase(),
                ':inc': 1,
                ':now': new Date().toISOString(),
            },
        });

        await docClient.send(command);
    }

    /**
     * Get entity views
     */
    async getEntityViews(entityType: string, entityId: string): Promise<any> {
        const command = new GetCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Key: {
                pk: `${entityType}#${entityId}`,
                sk: 'VIEWS',
            },
        });

        const response = await docClient.send(command);
        return response.Item || { viewCount: 0, uniqueViewers: 0 };
    }

    /**
     * Get top viewed entities
     */
    async getTopViewedEntities(entityType: string, limit: number = 10): Promise<string[]> {
        // Query to get all entities of a specific type
        const queryCommand = new QueryCommand({
            TableName: process.env.ANALYTICS_TABLE,
            IndexName: 'GSI1', // Global Secondary Index on entityType and viewCount
            KeyConditionExpression: 'entityType = :type',
            ExpressionAttributeValues: {
                ':type': entityType,
            },
            Limit: limit,
            ScanIndexForward: false, // Sort in descending order
        });

        const response = await docClient.send(queryCommand);

        // Extract entity IDs
        return (response.Items || []).map((item) => {
            const pk = item.pk;
            return pk.split('#')[1]; // Extract ID from partition key
        });
    }
}
```

### 3. PostgreSQL Implementation

```typescript
// src/services/postgresService.ts
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export class PostgresService {
    /**
     * Get restaurant by ID
     */
    async getRestaurantById(id: string): Promise<any> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM restaurants WHERE restaurant_id = $1';
            const result = await client.query(query, [id]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    /**
     * Get restaurants by IDs
     */
    async getRestaurantsByIds(ids: string[]): Promise<any[]> {
        if (ids.length === 0) return [];

        const client = await pool.connect();
        try {
            const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
            const query = `SELECT * FROM restaurants WHERE restaurant_id IN (${placeholders})`;
            const result = await client.query(query, ids);
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Get restaurant review analytics
     */
    async getRestaurantReviewAnalytics(restaurantId: string): Promise<any> {
        const client = await pool.connect();
        try {
            const query = `
        SELECT * FROM restaurant_analytics_summary 
        WHERE restaurant_id = $1
      `;
            const result = await client.query(query, [restaurantId]);
            return (
                result.rows[0] || {
                    total_reviews: 0,
                    average_rating: 0,
                    rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
                }
            );
        } finally {
            client.release();
        }
    }

    /**
     * Calculate restaurant review statistics
     */
    async calculateRestaurantReviewStats(restaurantId: string): Promise<any> {
        const client = await pool.connect();
        try {
            // Get total reviews and average rating
            const statsQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rank) as average_rating
        FROM dish_rankings
        WHERE restaurant_id = $1 AND rank IS NOT NULL
      `;
            const statsResult = await client.query(statsQuery, [restaurantId]);

            // Get rating distribution
            const distributionQuery = `
        SELECT 
          rank,
          COUNT(*) as count
        FROM dish_rankings
        WHERE restaurant_id = $1 AND rank IS NOT NULL
        GROUP BY rank
      `;
            const distributionResult = await client.query(distributionQuery, [restaurantId]);

            // Build rating distribution object
            const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
            distributionResult.rows.forEach((row) => {
                ratingDistribution[row.rank] = parseInt(row.count);
            });

            return {
                totalReviews: parseInt(statsResult.rows[0].total_reviews) || 0,
                averageRating: parseFloat(statsResult.rows[0].average_rating) || 0,
                ratingDistribution,
            };
        } finally {
            client.release();
        }
    }

    /**
     * Update restaurant analytics summary
     */
    async updateRestaurantAnalyticsSummary(
        restaurantId: string,
        totalReviews: number,
        averageRating: number,
        ratingDistribution: Record<string, number>
    ): Promise<void> {
        const client = await pool.connect();
        try {
            const query = `
        INSERT INTO restaurant_analytics_summary (
          restaurant_id, 
          total_reviews, 
          average_rating, 
          rating_distribution,
          last_updated
        ) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (restaurant_id) 
        DO UPDATE SET 
          total_reviews = $2,
          average_rating = $3,
          rating_distribution = $4,
          last_updated = $5
      `;

            await client.query(query, [
                restaurantId,
                totalReviews,
                averageRating,
                JSON.stringify(ratingDistribution),
                new Date(),
            ]);
        } finally {
            client.release();
        }
    }
}
```

### 4. API Endpoints

```typescript
// src/pages/api/restaurants/[id]/analytics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { restaurantAnalyticsService } from '@/services/restaurantAnalyticsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const restaurantId = Array.isArray(id) ? id[0] : id;

    if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Track view
    if (req.method === 'POST') {
        try {
            const { userId, deviceType } = req.body;
            await restaurantAnalyticsService.trackRestaurantView(restaurantId, userId, deviceType);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error tracking restaurant view:', error);
            return res.status(500).json({ error: 'Failed to track restaurant view' });
        }
    }

    // Get analytics
    if (req.method === 'GET') {
        try {
            const analytics = await restaurantAnalyticsService.getRestaurantAnalytics(restaurantId);
            return res.status(200).json(analytics);
        } catch (error) {
            console.error('Error fetching restaurant analytics:', error);
            return res.status(500).json({ error: 'Failed to fetch restaurant analytics' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
```

### 5. Frontend Component

```tsx
// src/components/restaurant/AnalyticsDashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart } from '@/components/ui/charts';

export function AnalyticsDashboard({ restaurantId }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Track view when component mounts
        const trackView = async () => {
            try {
                await fetch(`/api/restaurants/${restaurantId}/analytics`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        deviceType: getDeviceType(),
                        // Include userId if available
                        userId: getUserId(),
                    }),
                });
            } catch (error) {
                console.error('Error tracking view:', error);
            }
        };

        trackView();
    }, [restaurantId]);

    useEffect(() => {
        // Fetch analytics data
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/restaurants/${restaurantId}/analytics`);

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }

                const data = await response.json();
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [restaurantId]);

    // Helper function to get device type
    const getDeviceType = () => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    };

    // Helper function to get user ID
    const getUserId = () => {
        // Get user ID from auth context or localStorage
        return localStorage.getItem('userId') || null;
    };

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    if (error) {
        return <div>Error loading analytics: {error}</div>;
    }

    if (!analytics) {
        return <div>No analytics data available</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Restaurant Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{analytics.viewData.viewCount}</div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{analytics.viewData.uniqueViewers}</div>
                        <div className="text-sm text-muted-foreground">Unique Visitors</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {analytics.reviewAnalytics.total_reviews}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Reviews</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="traffic">Traffic</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Restaurant Performance</h3>
                            <LineChart
                                data={analytics.trafficData}
                                xAxis="date"
                                series={[{ name: 'Views', value: 'views' }]}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Rating Distribution</h3>
                            <BarChart
                                data={[
                                    {
                                        rating: '5 Stars',
                                        count: analytics.reviewAnalytics.rating_distribution['5'],
                                    },
                                    {
                                        rating: '4 Stars',
                                        count: analytics.reviewAnalytics.rating_distribution['4'],
                                    },
                                    {
                                        rating: '3 Stars',
                                        count: analytics.reviewAnalytics.rating_distribution['3'],
                                    },
                                    {
                                        rating: '2 Stars',
                                        count: analytics.reviewAnalytics.rating_distribution['2'],
                                    },
                                    {
                                        rating: '1 Star',
                                        count: analytics.reviewAnalytics.rating_distribution['1'],
                                    },
                                ]}
                                xAxis="rating"
                                series={[{ name: 'Reviews', value: 'count' }]}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="traffic">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Device Distribution</h3>
                            <BarChart
                                data={[
                                    { device: 'Mobile', count: analytics.deviceData.mobile || 0 },
                                    { device: 'Desktop', count: analytics.deviceData.desktop || 0 },
                                    { device: 'Tablet', count: analytics.deviceData.tablet || 0 },
                                ]}
                                xAxis="device"
                                series={[{ name: 'Views', value: 'count' }]}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

## Scheduled Jobs

For data aggregation and maintenance:

```typescript
// src/jobs/updateAnalyticsSummaries.ts
import { postgresService } from '../services/postgresService';

export async function updateAllRestaurantAnalyticsSummaries() {
    // Get all restaurant IDs
    const restaurants = await postgresService.getAllRestaurants(['restaurant_id']);

    // Update analytics for each restaurant
    for (const restaurant of restaurants) {
        try {
            // Calculate review statistics
            const stats = await postgresService.calculateRestaurantReviewStats(
                restaurant.restaurant_id
            );

            // Update summary
            await postgresService.updateRestaurantAnalyticsSummary(
                restaurant.restaurant_id,
                stats.totalReviews,
                stats.averageRating,
                stats.ratingDistribution
            );

            console.log(`Updated analytics for restaurant ${restaurant.restaurant_id}`);
        } catch (error) {
            console.error(
                `Error updating analytics for restaurant ${restaurant.restaurant_id}:`,
                error
            );
        }
    }

    console.log('Completed updating all restaurant analytics summaries');
}
```

## Conclusion

This example demonstrates a hybrid database approach for a restaurant analytics feature:

1. **PostgreSQL** is used for:

    - Restaurant profile data
    - Review data and analytics summaries
    - Historical data that requires complex queries

2. **DynamoDB** is used for:
    - Real-time view tracking
    - User engagement metrics
    - Device usage statistics
    - High-throughput data with simple access patterns

By using both databases appropriately, the feature benefits from:

- Complex relational queries for analytics (PostgreSQL)
- High-performance real-time tracking (DynamoDB)
- Scalable architecture for growing data volumes
- Optimized cost based on access patterns
