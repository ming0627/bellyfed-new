# 1. Backend Testing

This document outlines the testing plan for the backend components of the Rankings feature.

## Overview

The backend testing will ensure that the database services, API routes, and other backend components work correctly. The tests will cover:

- Unit tests for database services
- Integration tests for API routes
- Authentication and authorization tests
- Error handling tests

## Implementation Tasks

### 1. Database Service Tests

- [ ] Create tests for dish service

    - File: `src/services/__tests__/dishService.test.ts`
    - Test CRUD operations
    - Test filtering and pagination
    - Test error handling

- [ ] Create tests for ranking service

    - File: `src/services/__tests__/rankingService.test.ts`
    - Test CRUD operations
    - Test filtering and aggregation
    - Test error handling

- [ ] Create tests for photo upload service
    - File: `src/services/__tests__/photoUploadService.test.ts`
    - Test photo metadata management
    - Test error handling

### 2. API Route Tests

- [ ] Create tests for dish API routes

    - File: `src/pages/api/__tests__/dishes.test.ts`
    - Test GET, POST, PUT, DELETE operations
    - Test validation
    - Test error handling

- [ ] Create tests for rankings API routes

    - File: `src/pages/api/__tests__/rankings.test.ts`
    - Test GET, POST, PUT, DELETE operations
    - Test validation
    - Test error handling

- [ ] Create tests for photo upload API route
    - File: `src/pages/api/__tests__/upload.test.ts`
    - Test pre-signed URL generation
    - Test validation
    - Test error handling

### 3. Authentication and Authorization Tests

- [ ] Create tests for authentication middleware

    - File: `src/middleware/__tests__/auth.test.ts`
    - Test token validation
    - Test error handling

- [ ] Create tests for authorization utility
    - File: `src/lib/__tests__/authorization.test.ts`
    - Test permission checks
    - Test error handling

## Implementation Details

### Database Service Tests

```typescript
// src/services/__tests__/rankingService.test.ts
import {
    createRanking,
    getRankingById,
    updateRanking,
    deleteRanking,
    getUserRankings,
    getRankingByDishSlug,
} from '../rankingService';
import { db } from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
    query: jest.fn(),
}));

describe('Ranking Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRanking', () => {
        it('should create a ranking', async () => {
            // Mock data
            const rankingData = {
                userId: 'user-123',
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                dishType: 'Italian',
                rank: 1,
                notes: 'Great dish!',
            };

            // Mock db.query to return the created ranking
            (db.query as jest.Mock).mockResolvedValueOnce([
                { id: 'ranking-123', ...rankingData, createdAt: new Date(), updatedAt: new Date() },
            ]);

            // Call the function
            const result = await createRanking(rankingData);

            // Assertions
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(
                expect.objectContaining({
                    id: 'ranking-123',
                    userId: 'user-123',
                    dishId: 'dish-123',
                    rank: 1,
                })
            );
        });

        it('should throw an error if creation fails', async () => {
            // Mock data
            const rankingData = {
                userId: 'user-123',
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                dishType: 'Italian',
                rank: 1,
                notes: 'Great dish!',
            };

            // Mock db.query to throw an error
            (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            // Call the function and expect it to throw
            await expect(createRanking(rankingData)).rejects.toThrow('Database error');
        });
    });

    describe('getRankingById', () => {
        it('should get a ranking by ID', async () => {
            // Mock data
            const rankingId = 'ranking-123';
            const ranking = {
                id: rankingId,
                userId: 'user-123',
                dishId: 'dish-123',
                restaurantId: 'restaurant-123',
                dishType: 'Italian',
                rank: 1,
                notes: 'Great dish!',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Mock db.query to return the ranking
            (db.query as jest.Mock).mockResolvedValueOnce([ranking]);

            // Call the function
            const result = await getRankingById(rankingId);

            // Assertions
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(ranking);
        });

        it('should return null if ranking not found', async () => {
            // Mock data
            const rankingId = 'non-existent-id';

            // Mock db.query to return empty array
            (db.query as jest.Mock).mockResolvedValueOnce([]);

            // Call the function
            const result = await getRankingById(rankingId);

            // Assertions
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });
    });

    // Additional tests for other functions...
});
```

### API Route Tests

```typescript
// src/pages/api/__tests__/rankings.test.ts
import { createMocks } from 'node-mocks-http';
import rankingsHandler from '../rankings/my/[dishSlug]';
import { verifyAuth } from '@/middleware/auth';
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

// Mock dependencies
jest.mock('@/middleware/auth');
jest.mock('@/services/rankingService');
jest.mock('@/services/dishService');
jest.mock('@/lib/authorization');

describe('Rankings API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/rankings/my/[dishSlug]', () => {
        it('should return user ranking for a dish', async () => {
            // Mock authentication
            (verifyAuth as jest.Mock).mockResolvedValueOnce({
                isAuthenticated: true,
                userId: 'user-123',
            });

            // Mock ranking service
            (getRankingByDishSlug as jest.Mock).mockResolvedValueOnce({
                id: 'ranking-123',
                userId: 'user-123',
                dishId: 'dish-123',
                rank: 1,
                notes: 'Great dish!',
            });

            // Create mock request and response
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    dishSlug: 'pasta-carbonara',
                },
            });

            // Call the handler
            await rankingsHandler(req, res);

            // Assertions
            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                success: true,
                data: {
                    id: 'ranking-123',
                    userId: 'user-123',
                    dishId: 'dish-123',
                    rank: 1,
                    notes: 'Great dish!',
                },
            });
        });

        it('should return 401 if not authenticated', async () => {
            // Mock authentication
            (verifyAuth as jest.Mock).mockResolvedValueOnce({
                isAuthenticated: false,
            });

            // Create mock request and response
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    dishSlug: 'pasta-carbonara',
                },
            });

            // Call the handler
            await rankingsHandler(req, res);

            // Assertions
            expect(res._getStatusCode()).toBe(401);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Authentication required',
            });
        });
    });

    describe('POST /api/rankings/my/[dishSlug]', () => {
        it('should create a new ranking', async () => {
            // Mock authentication
            (verifyAuth as jest.Mock).mockResolvedValueOnce({
                isAuthenticated: true,
                userId: 'user-123',
            });

            // Mock dish service
            (getDishBySlug as jest.Mock).mockResolvedValueOnce({
                id: 'dish-123',
                name: 'Pasta Carbonara',
                slug: 'pasta-carbonara',
                restaurantId: 'restaurant-123',
            });

            // Mock authorization
            (getRankingIdByDishSlugAndUserId as jest.Mock).mockResolvedValueOnce(null);

            // Mock ranking service
            (createRanking as jest.Mock).mockResolvedValueOnce({
                id: 'ranking-123',
                userId: 'user-123',
                dishId: 'dish-123',
                rank: 1,
                notes: 'Great dish!',
            });

            // Create mock request and response
            const { req, res } = createMocks({
                method: 'POST',
                query: {
                    dishSlug: 'pasta-carbonara',
                },
                body: {
                    dishId: 'dish-123',
                    restaurantId: 'restaurant-123',
                    rank: 1,
                    notes: 'Great dish!',
                },
            });

            // Call the handler
            await rankingsHandler(req, res);

            // Assertions
            expect(res._getStatusCode()).toBe(201);
            expect(JSON.parse(res._getData())).toEqual({
                success: true,
                data: {
                    id: 'ranking-123',
                    userId: 'user-123',
                    dishId: 'dish-123',
                    rank: 1,
                    notes: 'Great dish!',
                },
            });
        });

        // Additional tests for validation, error handling, etc.
    });

    // Additional tests for PUT and DELETE methods...
});
```

### Authentication and Authorization Tests

```typescript
// src/middleware/__tests__/auth.test.ts
import { verifyAuth, withAuth, withAdminAuth } from '../auth';
import { verify } from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyAuth', () => {
        it('should return isAuthenticated: true with valid token', async () => {
            // Mock request
            const req = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
            };

            // Mock jwt.verify
            (verify as jest.Mock).mockReturnValueOnce({
                userId: 'user-123',
                isAdmin: false,
            });

            // Call the function
            const result = await verifyAuth(req as any);

            // Assertions
            expect(result).toEqual({
                isAuthenticated: true,
                userId: 'user-123',
                isAdmin: false,
            });
            expect(verify).toHaveBeenCalledWith('valid-token', expect.any(String));
        });

        it('should return isAuthenticated: false with invalid token', async () => {
            // Mock request
            const req = {
                headers: {
                    authorization: 'Bearer invalid-token',
                },
            };

            // Mock jwt.verify to throw an error
            (verify as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            // Call the function
            const result = await verifyAuth(req as any);

            // Assertions
            expect(result).toEqual({
                isAuthenticated: false,
            });
        });

        it('should return isAuthenticated: false with no token', async () => {
            // Mock request
            const req = {
                headers: {},
            };

            // Call the function
            const result = await verifyAuth(req as any);

            // Assertions
            expect(result).toEqual({
                isAuthenticated: false,
            });
            expect(verify).not.toHaveBeenCalled();
        });
    });

    describe('withAuth', () => {
        it('should call the handler if authenticated', async () => {
            // Mock request and response
            const req = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock verifyAuth
            jest.spyOn(require('../auth'), 'verifyAuth').mockResolvedValueOnce({
                isAuthenticated: true,
                userId: 'user-123',
            });

            // Mock handler
            const handler = jest.fn();

            // Call the function
            await withAuth(handler)(req as any, res as any);

            // Assertions
            expect(handler).toHaveBeenCalledWith(req, res, {
                isAuthenticated: true,
                userId: 'user-123',
            });
        });

        it('should return 401 if not authenticated', async () => {
            // Mock request and response
            const req = {
                headers: {},
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock verifyAuth
            jest.spyOn(require('../auth'), 'verifyAuth').mockResolvedValueOnce({
                isAuthenticated: false,
            });

            // Mock handler
            const handler = jest.fn();

            // Call the function
            await withAuth(handler)(req as any, res as any);

            // Assertions
            expect(handler).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Authentication required',
            });
        });
    });

    // Additional tests for withAdminAuth...
});
```

## Testing Strategy

### Unit Tests

- Test each function in isolation
- Mock dependencies
- Test success and error cases
- Test edge cases

### Integration Tests

- Test API routes with mock requests and responses
- Test database services with a test database
- Test authentication and authorization flows

### Test Coverage

- Aim for at least 80% code coverage
- Focus on critical paths and error handling

## Dependencies

- Jest for testing framework
- node-mocks-http for mocking HTTP requests and responses
- jest-mock-extended for mocking TypeScript interfaces

## Estimated Time

- Database Service Tests: 2 days
- API Route Tests: 2 days
- Authentication and Authorization Tests: 1 day

Total: 5 days
