# Database Implementation Guide

This guide provides practical implementation details for working with the hybrid database approach in Bellyfed.

## Database Services

Bellyfed uses two main database services:

1. **PostgreSQL Service**: For complex relational data
2. **DynamoDB Service**: For high-throughput, low-latency data

## PostgreSQL Implementation

### Connection Setup

```typescript
// src/services/postgresService.ts
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export class PostgresService {
    // Service methods...
}
```

### Example: Fetching Restaurant Data

```typescript
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
```

### Example: Creating a Dish Ranking

```typescript
async createRanking(params: {
  userId: string;
  dishId: string;
  restaurantId: string;
  dishType: string;
  rank: number | null;
  tasteStatus: string | null;
  notes: string;
  photoUrls: string[];
  timestamp: string;
}): Promise<any> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check for existing ranking
    const checkQuery = `
      SELECT ranking_id FROM dish_rankings
      WHERE user_id = $1 AND dish_id = $2
    `;
    const checkResult = await client.query(checkQuery, [params.userId, params.dishId]);

    let rankingId;

    if (checkResult.rows.length > 0) {
      // Update existing ranking
      rankingId = checkResult.rows[0].ranking_id;
      // Update logic...
    } else {
      // Insert new ranking
      rankingId = uuidv4();
      // Insert logic...
    }

    await client.query('COMMIT');
    return { rankingId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## DynamoDB Implementation

### Connection Setup

```typescript
// src/services/dynamoService.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

const docClient = DynamoDBDocumentClient.from(client);

export class DynamoService {
    // Service methods...
}
```

### Example: Storing Session Data

```typescript
async saveSession(sessionId: string, data: any, ttl: number): Promise<void> {
  const command = new PutCommand({
    TableName: process.env.SESSIONS_TABLE,
    Item: {
      sessionId,
      data,
      ttl: Math.floor(Date.now() / 1000) + ttl,
    },
  });

  await docClient.send(command);
}
```

### Example: Tracking View Counts

```typescript
async incrementViewCount(entityType: string, entityId: string): Promise<number> {
  const updateCommand = new UpdateCommand({
    TableName: process.env.ANALYTICS_TABLE,
    Key: {
      pk: `${entityType}#${entityId}`,
      sk: 'VIEWS',
    },
    UpdateExpression: 'ADD viewCount :inc',
    ExpressionAttributeValues: {
      ':inc': 1,
    },
    ReturnValues: 'UPDATED_NEW',
  });

  const result = await docClient.send(updateCommand);
  return result.Attributes?.viewCount;
}
```

## Service Layer Integration

The service layer should abstract the database implementation details:

```typescript
// src/services/restaurantService.ts
import { postgresService } from './postgresService';
import { dynamoService } from './dynamoService';

export class RestaurantService {
    async getRestaurantById(id: string): Promise<any> {
        // Use PostgreSQL for restaurant data
        return postgresService.getRestaurantById(id);
    }

    async trackRestaurantView(id: string): Promise<void> {
        // Use DynamoDB for view tracking
        await dynamoService.incrementViewCount('RESTAURANT', id);
    }

    async getPopularRestaurants(): Promise<any[]> {
        // Use DynamoDB for real-time analytics
        return dynamoService.getTopViewedEntities('RESTAURANT', 10);
    }
}
```

## Database Selection Guidelines

When implementing a new feature, consider these questions to determine which database to use:

1. **Does the data have complex relationships?**

    - If yes, use PostgreSQL
    - If no, consider DynamoDB

2. **Is low-latency access critical?**

    - If yes, consider DynamoDB
    - If no, PostgreSQL may be sufficient

3. **Will the data be accessed by a single key?**

    - If yes, DynamoDB is a good fit
    - If no, PostgreSQL may be better

4. **Do you need ACID transactions?**

    - If yes, use PostgreSQL
    - If no, either database may work

5. **Is the data write-heavy with simple reads?**
    - If yes, DynamoDB may be more efficient
    - If no, PostgreSQL may be better

## Common Use Cases

### PostgreSQL Use Cases

1. **Restaurant Management**

    ```typescript
    // Create a new restaurant
    await postgresService.createRestaurant(restaurantData);

    // Update restaurant details
    await postgresService.updateRestaurant(id, updatedData);

    // Get restaurant with related dishes
    await postgresService.getRestaurantWithDishes(id);
    ```

2. **User Profiles**

    ```typescript
    // Create a new user
    await postgresService.createUser(userData);

    // Update user profile
    await postgresService.updateUser(id, profileData);

    // Get user with preferences
    await postgresService.getUserWithPreferences(id);
    ```

### DynamoDB Use Cases

1. **Session Management**

    ```typescript
    // Save session
    await dynamoService.saveSession(sessionId, sessionData, 3600);

    // Get session
    const session = await dynamoService.getSession(sessionId);

    // Delete session
    await dynamoService.deleteSession(sessionId);
    ```

2. **Feature Flags**

    ```typescript
    // Check if feature is enabled
    const isEnabled = await dynamoService.isFeatureEnabled('new-ranking-ui', userId);

    // Enable feature for user
    await dynamoService.enableFeatureForUser('new-ranking-ui', userId);
    ```

3. **Real-time Analytics**

    ```typescript
    // Track event
    await dynamoService.trackEvent(userId, 'VIEW_RESTAURANT', { restaurantId });

    // Get user activity
    const activity = await dynamoService.getUserActivity(userId, startDate, endDate);
    ```

## Migration Between Databases

When migrating data between databases:

```typescript
async migrateRestaurantAnalytics() {
  // 1. Fetch data from PostgreSQL
  const restaurants = await postgresService.getAllRestaurants();

  // 2. Transform data for DynamoDB
  const analyticsItems = restaurants.map(restaurant => ({
    pk: `RESTAURANT#${restaurant.id}`,
    sk: 'ANALYTICS',
    viewCount: 0,
    lastUpdated: new Date().toISOString()
  }));

  // 3. Batch write to DynamoDB
  await dynamoService.batchWriteItems(process.env.ANALYTICS_TABLE, analyticsItems);
}
```

## Error Handling and Retries

Implement proper error handling and retries for both databases:

```typescript
async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Check if error is retryable
            if (!isRetryableError(error) || attempt === maxRetries) {
                throw error;
            }

            // Exponential backoff
            const delay = Math.pow(2, attempt) * 100;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}
```

## Conclusion

By following these implementation guidelines, you can effectively use both PostgreSQL and DynamoDB in the Bellyfed application, leveraging the strengths of each database for appropriate use cases.
