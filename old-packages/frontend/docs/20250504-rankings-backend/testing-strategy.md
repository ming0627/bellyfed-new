# Testing Strategy

This document outlines the testing strategy for the rankings feature backend implementation.

## Testing Levels

### 1. Unit Testing

Unit tests focus on testing individual components and functions in isolation.

#### API Route Handlers

Test each API route handler to ensure it:

- Returns the correct status codes
- Handles different HTTP methods appropriately
- Validates input data correctly
- Returns the expected response format

Example unit test for a route handler:

```typescript
// __tests__/api/rankings/my/[dishSlug].test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/rankings/my/[dishSlug]';
import * as rankingService from '@/services/rankingService';

// Mock the ranking service
jest.mock('@/services/rankingService');

describe('User Ranking API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET returns user ranking for a dish', async () => {
    // Mock the service functions
    const mockUserRanking = { rankingId: '123', notes: 'Test notes' };
    const mockDishDetails = { dishId: '456', name: 'Test Dish' };
    const mockRankingStats = { totalRankings: 10, averageRank: 4.5 };

    (rankingService.getUserRankingByDishSlug as jest.Mock).mockResolvedValue(
      mockUserRanking,
    );
    (rankingService.getDishBySlug as jest.Mock).mockResolvedValue(
      mockDishDetails,
    );
    (rankingService.getRankingStats as jest.Mock).mockResolvedValue(
      mockRankingStats,
    );

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      query: { dishSlug: 'test-dish' },
      headers: { 'x-user-id': 'user123' },
    });

    // Call the handler
    await handler(req, res);

    // Check the response
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      userRanking: mockUserRanking,
      dishDetails: mockDishDetails,
      rankingStats: mockRankingStats,
    });

    // Verify service calls
    expect(rankingService.getUserRankingByDishSlug).toHaveBeenCalledWith(
      'user123',
      'test-dish',
    );
    expect(rankingService.getDishBySlug).toHaveBeenCalledWith('test-dish');
    expect(rankingService.getRankingStats).toHaveBeenCalledWith('test-dish');
  });

  // Additional tests for POST, PUT, DELETE methods
  // ...
});
```

#### Service Functions

Test each service function to ensure it:

- Interacts with the database correctly
- Transforms data correctly
- Handles errors appropriately

Example unit test for a service function:

```typescript
// __tests__/services/rankingService.test.ts
import {
  getUserRankingByDishSlug,
  createRanking,
} from '@/services/rankingService';
import { executeQuery } from '@/lib/db';

// Mock the database module
jest.mock('@/lib/db');

describe('Ranking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserRankingByDishSlug returns user ranking', async () => {
    // Mock database response
    const mockDbResponse = [
      {
        id: 'ranking123',
        user_id: 'user123',
        dish_id: 'dish456',
        restaurant_id: 'rest789',
        dish_type: 'Malaysian',
        rank: 1,
        taste_status: null,
        notes: 'Test notes',
        photo_urls: JSON.stringify(['/test.jpg']),
        created_at: '2025-05-04T12:00:00Z',
        updated_at: '2025-05-04T12:00:00Z',
      },
    ];

    (executeQuery as jest.Mock).mockResolvedValue(mockDbResponse);

    // Call the function
    const result = await getUserRankingByDishSlug('user123', 'test-dish');

    // Check the result
    expect(result).toEqual({
      rankingId: 'ranking123',
      userId: 'user123',
      dishId: 'dish456',
      restaurantId: 'rest789',
      dishType: 'Malaysian',
      rank: 1,
      tasteStatus: null,
      notes: 'Test notes',
      photoUrls: ['/test.jpg'],
      createdAt: '2025-05-04T12:00:00Z',
      updatedAt: '2025-05-04T12:00:00Z',
    });

    // Verify database query
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      ['user123', 'test-dish'],
    );
  });

  // Additional tests for other service functions
  // ...
});
```

### 2. Integration Testing

Integration tests focus on testing the interaction between different components.

#### API and Database Integration

Test the integration between API routes and the database:

```typescript
// __tests__/integration/rankings.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/rankings/my/[dishSlug]';
import { executeQuery } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Use a test database for integration tests
process.env.DB_NAME = 'bellyfed_test';

describe('Rankings API Integration', () => {
  // Set up test data before tests
  beforeAll(async () => {
    // Create test user
    const userId = 'test-user-' + uuidv4();
    await executeQuery(
      'INSERT INTO users (id, username, email) VALUES (?, ?, ?)',
      [userId, 'testuser', 'test@example.com'],
    );

    // Create test dish
    const dishId = 'test-dish-' + uuidv4();
    await executeQuery(
      'INSERT INTO dishes (id, name, slug, restaurant_id, restaurant_name) VALUES (?, ?, ?, ?, ?)',
      [dishId, 'Test Dish', 'test-dish', 'rest123', 'Test Restaurant'],
    );

    // Store IDs for tests
    global.testIds = { userId, dishId };
  });

  // Clean up test data after tests
  afterAll(async () => {
    const { userId, dishId } = global.testIds;

    // Delete test data
    await executeQuery(
      'DELETE FROM ranking_photos WHERE ranking_id IN (SELECT id FROM user_rankings WHERE user_id = ?)',
      [userId],
    );
    await executeQuery('DELETE FROM user_rankings WHERE user_id = ?', [userId]);
    await executeQuery('DELETE FROM dishes WHERE id = ?', [dishId]);
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
  });

  test('Create and retrieve a ranking', async () => {
    const { userId, dishId } = global.testIds;

    // 1. Create a ranking
    const createReq = {
      method: 'POST',
      query: { dishSlug: 'test-dish' },
      headers: { 'x-user-id': userId },
      body: {
        dishId,
        restaurantId: 'rest123',
        dishType: 'Test',
        rank: 1,
        tasteStatus: null,
        notes: 'Integration test notes',
        photoUrls: [],
      },
    };

    const { req: createMockReq, res: createMockRes } = createMocks(createReq);
    await handler(createMockReq, createMockRes);

    expect(createMockRes._getStatusCode()).toBe(201);
    const createData = JSON.parse(createMockRes._getData());
    expect(createData.userRanking).toBeDefined();
    expect(createData.userRanking.notes).toBe('Integration test notes');

    // 2. Retrieve the ranking
    const { req: getMockReq, res: getMockRes } = createMocks({
      method: 'GET',
      query: { dishSlug: 'test-dish' },
      headers: { 'x-user-id': userId },
    });

    await handler(getMockReq, getMockRes);

    expect(getMockRes._getStatusCode()).toBe(200);
    const getData = JSON.parse(getMockRes._getData());
    expect(getData.userRanking).toBeDefined();
    expect(getData.userRanking.notes).toBe('Integration test notes');
    expect(getData.userRanking.rank).toBe(1);
  });

  // Additional integration tests
  // ...
});
```

#### Photo Upload Integration

Test the integration with S3 for photo uploads:

```typescript
// __tests__/integration/photo-upload.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/upload/ranking-photo';
import fetch from 'node-fetch';

describe('Photo Upload Integration', () => {
  test('Generate upload URL and upload a photo', async () => {
    // 1. Generate upload URL
    const { req, res } = createMocks({
      method: 'POST',
      headers: { 'x-user-id': 'test-user' },
      body: { contentType: 'image/jpeg' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.uploadUrl).toBeDefined();
    expect(data.photoUrl).toBeDefined();

    // 2. Upload a test image to the pre-signed URL
    // Note: This test requires actual AWS credentials and will make real S3 calls
    // Consider mocking this in CI environments
    const testImageBuffer = Buffer.from('test image data');
    const uploadResponse = await fetch(data.uploadUrl, {
      method: 'PUT',
      body: testImageBuffer,
      headers: { 'Content-Type': 'image/jpeg' },
    });

    expect(uploadResponse.status).toBe(200);

    // 3. Verify the image is accessible
    const getResponse = await fetch(data.photoUrl);
    expect(getResponse.status).toBe(200);
  });
});
```

### 3. End-to-End Testing

End-to-end tests focus on testing the complete flow from frontend to backend.

#### Cypress Tests

Use Cypress to test the complete user flow:

```javascript
// cypress/integration/rankings.spec.js
describe('Rankings Feature', () => {
  beforeEach(() => {
    // Log in before each test
    cy.login('testuser@example.com', 'password');
  });

  it('should create a new ranking', () => {
    // Visit a dish page
    cy.visit('/my/rankings/my/test-dish');

    // Click the "Rank This Dish" button
    cy.contains('Rank This Dish').click();

    // Fill out the ranking form
    cy.get('[data-test="ranking-type-rank"]').click();
    cy.get('[data-test="rank-1"]').click();
    cy.get('[data-test="notes-input"]').type(
      'This is a test ranking created by Cypress',
    );

    // Submit the form
    cy.get('[data-test="submit-ranking"]').click();

    // Verify the ranking was created
    cy.contains('Rank #1').should('be.visible');
    cy.contains('This is a test ranking created by Cypress').should(
      'be.visible',
    );
  });

  it('should edit an existing ranking', () => {
    // Visit a dish page with an existing ranking
    cy.visit('/my/rankings/my/test-dish');

    // Click the "Edit Ranking" button
    cy.contains('Edit Ranking').click();

    // Change the ranking
    cy.get('[data-test="ranking-type-taste"]').click();
    cy.get('[data-test="taste-acceptable"]').click();
    cy.get('[data-test="notes-input"]')
      .clear()
      .type('Updated notes from Cypress test');

    // Submit the form
    cy.get('[data-test="submit-ranking"]').click();

    // Verify the ranking was updated
    cy.contains('Acceptable').should('be.visible');
    cy.contains('Updated notes from Cypress test').should('be.visible');
  });

  it('should delete a ranking', () => {
    // Visit a dish page with an existing ranking
    cy.visit('/my/rankings/my/test-dish');

    // Click the "Delete" button
    cy.contains('Delete').click();

    // Confirm deletion
    cy.get('[data-test="confirm-delete"]').click();

    // Verify the ranking was deleted
    cy.contains("You haven't ranked this dish yet").should('be.visible');
  });
});
```

## Test Environment Setup

### 1. Test Database

Set up a separate test database:

```sql
CREATE DATABASE bellyfed_test;
GRANT ALL PRIVILEGES ON bellyfed_test.* TO 'bellyfed_app'@'%';
```

Create a script to initialize the test database with the same schema as the production database.

### 2. Mock S3

For unit and integration tests, use a mock S3 service:

```typescript
// __mocks__/@aws-sdk/client-s3.ts
export class S3Client {
  constructor() {}
}

export class PutObjectCommand {
  constructor(params) {
    this.params = params;
  }
}

// Mock implementation of getSignedUrl
export const getSignedUrl = jest
  .fn()
  .mockResolvedValue('https://mock-s3-url.com/upload');
```

### 3. Test Data

Create fixtures for test data:

```typescript
// __fixtures__/rankings.ts
export const mockUserRanking = {
  rankingId: 'test-ranking-id',
  userId: 'test-user-id',
  dishId: 'test-dish-id',
  restaurantId: 'test-restaurant-id',
  dishType: 'Test',
  rank: 1,
  tasteStatus: null,
  notes: 'Test notes',
  photoUrls: ['https://example.com/test.jpg'],
  createdAt: '2025-05-04T12:00:00Z',
  updatedAt: '2025-05-04T12:00:00Z',
};

export const mockDishDetails = {
  dishId: 'test-dish-id',
  name: 'Test Dish',
  description: 'Test description',
  restaurantId: 'test-restaurant-id',
  restaurantName: 'Test Restaurant',
  category: 'Test',
  imageUrl: 'https://example.com/dish.jpg',
  isVegetarian: false,
  spicyLevel: 2,
  price: 15.9,
  countryCode: 'my',
};

export const mockRankingStats = {
  totalRankings: 10,
  averageRank: 4.5,
  ranks: { '1': 5, '2': 3, '3': 1, '4': 1, '5': 0 },
  tasteStatuses: { ACCEPTABLE: 7, SECOND_CHANCE: 2, DISSATISFIED: 1 },
};
```

## Continuous Integration

Set up CI/CD pipeline to run tests automatically:

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: bellyfed_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Set up test database
        run: |
          mysql -h127.0.0.1 -uroot -proot bellyfed_test < ./scripts/schema.sql

      - name: Run tests
        run: npm test
        env:
          DB_HOST: 127.0.0.1
          DB_USER: root
          DB_PASSWORD: root
          DB_NAME: bellyfed_test
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_S3_BUCKET: test-bucket
          NODE_ENV: test
```

## Test Coverage

Aim for high test coverage, especially for critical paths:

- API route handlers: 90%+ coverage
- Service functions: 90%+ coverage
- Database utilities: 80%+ coverage

Use Jest's coverage reporting to track coverage:

```json
// jest.config.js
{
  "collectCoverage": true,
  "coverageReporters": ["text", "lcov"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 85,
      "lines": 85,
      "statements": 85
    },
    "./src/pages/api/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    },
    "./src/services/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

## Performance Testing

Test the performance of critical API endpoints:

```typescript
// __tests__/performance/rankings.test.ts
import { performance } from 'perf_hooks';
import fetch from 'node-fetch';

describe('Rankings API Performance', () => {
  test('GET /api/rankings/my should respond within 200ms', async () => {
    const start = performance.now();

    const response = await fetch('http://localhost:3000/api/rankings/my', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const end = performance.now();
    const duration = end - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  test('GET /api/rankings/local/test-dish should respond within 300ms', async () => {
    const start = performance.now();

    const response = await fetch(
      'http://localhost:3000/api/rankings/local/test-dish',
      {
        headers: {
          Authorization: 'Bearer test-token',
        },
      },
    );

    const end = performance.now();
    const duration = end - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(300);
  });
});
```

## Security Testing

Test the security of the API endpoints:

```typescript
// __tests__/security/rankings.test.ts
import fetch from 'node-fetch';

describe('Rankings API Security', () => {
  test('Unauthenticated requests should be rejected', async () => {
    const response = await fetch('http://localhost:3000/api/rankings/my');
    expect(response.status).toBe(401);
  });

  test("Users cannot access other users' rankings", async () => {
    // Get a token for user1
    const user1Token = await getAuthToken('user1@example.com', 'password');

    // Create a ranking as user1
    const createResponse = await fetch(
      'http://localhost:3000/api/rankings/my/test-dish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishId: 'test-dish-id',
          restaurantId: 'test-restaurant-id',
          rank: 1,
          notes: 'Test notes',
        }),
      },
    );

    expect(createResponse.status).toBe(201);

    // Get a token for user2
    const user2Token = await getAuthToken('user2@example.com', 'password');

    // Try to delete user1's ranking as user2
    const deleteResponse = await fetch(
      'http://localhost:3000/api/rankings/my/test-dish',
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user2Token}`,
        },
      },
    );

    // Should return 404 (not found) rather than 403 (forbidden) to avoid leaking information
    expect(deleteResponse.status).toBe(404);
  });

  test('Input validation prevents SQL injection', async () => {
    const token = await getAuthToken('user1@example.com', 'password');

    // Try to inject SQL
    const response = await fetch(
      'http://localhost:3000/api/rankings/my/test-dish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishId: "test-dish-id'; DROP TABLE user_rankings; --",
          restaurantId: 'test-restaurant-id',
          rank: 1,
          notes: 'Test notes',
        }),
      },
    );

    // Should reject the request
    expect(response.status).toBe(400);
  });
});

// Helper function to get auth token
async function getAuthToken(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data.token;
}
```
