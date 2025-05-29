# 2. API Routes Implementation

This document outlines the implementation plan for the API routes required for the Rankings feature.

## Overview

The API routes will provide the interface for the frontend to interact with the database services. The routes will be implemented using Next.js API routes.

## API Endpoints

### Dish Endpoints

- [ ] `GET /api/dishes`

    - List dishes with filtering options
    - Support pagination
    - Allow filtering by restaurant, category, etc.

- [ ] `GET /api/dishes/:id`

    - Get a specific dish by ID
    - Return detailed dish information

- [ ] `GET /api/dishes/slug/:slug`

    - Get a specific dish by slug
    - Return detailed dish information

- [ ] `POST /api/dishes` (admin only)

    - Create a new dish
    - Validate input data
    - Return the created dish

- [ ] `PUT /api/dishes/:id` (admin only)

    - Update a dish
    - Validate input data
    - Return the updated dish

- [ ] `DELETE /api/dishes/:id` (admin only)
    - Delete a dish
    - Check for existing rankings before deletion

### Rankings Endpoints

- [ ] `GET /api/rankings/my`

    - Get all rankings for the current user
    - Support pagination and filtering
    - Include dish details and photos

- [ ] `GET /api/rankings/my/:dishSlug`

    - Get current user's ranking for a specific dish
    - Include dish details and photos

- [ ] `POST /api/rankings/my/:dishSlug`

    - Create a new ranking
    - Validate input data
    - Handle photo URLs
    - Return the created ranking

- [ ] `PUT /api/rankings/my/:dishSlug`

    - Update an existing ranking
    - Validate input data
    - Handle photo URLs
    - Return the updated ranking

- [ ] `DELETE /api/rankings/my/:dishSlug`

    - Delete a ranking
    - Remove associated photos

- [ ] `GET /api/rankings/local/:dishSlug`

    - Get local rankings for a dish
    - Filter by user's country
    - Include statistics

- [ ] `GET /api/rankings/global/:dishSlug`
    - Get global rankings for a dish
    - Include statistics

## Implementation Tasks

### 1. API Route Handlers

- [ ] Create dish API route handlers

    - Files:
        - `src/pages/api/dishes/index.ts` (GET, POST)
        - `src/pages/api/dishes/[id].ts` (GET, PUT, DELETE)
        - `src/pages/api/dishes/slug/[slug].ts` (GET)

- [ ] Create rankings API route handlers
    - Files:
        - `src/pages/api/rankings/my/index.ts` (GET)
        - `src/pages/api/rankings/my/[dishSlug].ts` (GET, POST, PUT, DELETE)
        - `src/pages/api/rankings/local/[dishSlug].ts` (GET)
        - `src/pages/api/rankings/global/[dishSlug].ts` (GET)

### 2. Request Validation

- [ ] Create validation schemas for all API endpoints
    - File: `src/lib/validation/rankingSchemas.ts`
    - Implement validation for:
        - Dish creation/update
        - Ranking creation/update
        - Query parameters

### 3. Response Formatting

- [ ] Create response formatters for consistent API responses
    - File: `src/lib/api/responseFormatters.ts`
    - Implement formatters for:
        - Success responses
        - Error responses
        - Pagination metadata

### 4. API Documentation

- [ ] Create API documentation using JSDoc or Swagger
    - Document all endpoints
    - Include request/response examples
    - Document authentication requirements

## API Request/Response Examples

### Create Ranking Request

```json
POST /api/rankings/my/nasi-lemak-special
{
  "dishId": "uuid",
  "restaurantId": "uuid",
  "dishType": "Malaysian",
  "rank": 1,
  "tasteStatus": null,
  "notes": "This is the best Nasi Lemak I have ever had!",
  "photoUrls": ["https://example.com/photo1.jpg"]
}
```

### Create Ranking Response

```json
{
    "success": true,
    "data": {
        "ranking": {
            "id": "uuid",
            "userId": "uuid",
            "dishId": "uuid",
            "restaurantId": "uuid",
            "dishType": "Malaysian",
            "rank": 1,
            "tasteStatus": null,
            "notes": "This is the best Nasi Lemak I have ever had!",
            "photos": [
                {
                    "id": "uuid",
                    "photoUrl": "https://example.com/photo1.jpg",
                    "createdAt": "2025-05-04T12:00:00Z"
                }
            ],
            "createdAt": "2025-05-04T12:00:00Z",
            "updatedAt": "2025-05-04T12:00:00Z"
        },
        "dish": {
            "id": "uuid",
            "name": "Nasi Lemak Special",
            "slug": "nasi-lemak-special",
            "description": "Fragrant coconut rice served with spicy sambal...",
            "restaurantId": "uuid",
            "restaurantName": "Village Park Restaurant",
            "category": "Malaysian",
            "imageUrl": "https://example.com/dish.jpg",
            "isVegetarian": false,
            "spicyLevel": 2,
            "price": 15.9,
            "countryCode": "my"
        }
    }
}
```

### Get Local Rankings Response

```json
{
    "success": true,
    "data": {
        "dish": {
            "id": "uuid",
            "name": "Nasi Lemak Special",
            "slug": "nasi-lemak-special",
            "description": "Fragrant coconut rice served with spicy sambal...",
            "restaurantId": "uuid",
            "restaurantName": "Village Park Restaurant",
            "category": "Malaysian",
            "imageUrl": "https://example.com/dish.jpg",
            "isVegetarian": false,
            "spicyLevel": 2,
            "price": 15.9,
            "countryCode": "my"
        },
        "userRanking": {
            "id": "uuid",
            "rank": 1,
            "tasteStatus": null,
            "notes": "This is the best Nasi Lemak I have ever had!",
            "photos": [
                {
                    "id": "uuid",
                    "photoUrl": "https://example.com/photo1.jpg",
                    "createdAt": "2025-05-04T12:00:00Z"
                }
            ],
            "createdAt": "2025-05-04T12:00:00Z",
            "updatedAt": "2025-05-04T12:00:00Z"
        },
        "rankings": [
            {
                "id": "uuid",
                "userId": "uuid",
                "username": "foodlover",
                "rank": 1,
                "tasteStatus": null,
                "notes": "Amazing dish!",
                "photoCount": 2,
                "createdAt": "2025-05-03T10:00:00Z"
            }
            // More rankings...
        ],
        "stats": {
            "totalRankings": 1250,
            "averageRank": 4.8,
            "ranks": {
                "1": 850,
                "2": 250,
                "3": 100,
                "4": 30,
                "5": 20
            },
            "tasteStatuses": {
                "ACCEPTABLE": 950,
                "SECOND_CHANCE": 250,
                "DISSATISFIED": 50
            }
        },
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "totalPages": 63,
            "totalItems": 1250
        }
    }
}
```

## Error Handling

- [ ] Implement consistent error handling for all API routes
    - Handle validation errors
    - Handle database errors
    - Handle authentication/authorization errors
    - Return appropriate HTTP status codes

## Testing

- [ ] Write unit tests for API route handlers
    - Test success cases
    - Test error cases
    - Test authentication/authorization

## Dependencies

- Database services from previous step
- Authentication middleware
- Validation library (e.g., Zod, Joi)

## Estimated Time

- Dish API Routes: 1 day
- Rankings API Routes: 2 days
- Request Validation: 0.5 day
- Response Formatting: 0.5 day
- API Documentation: 1 day
- Testing: 1 day

Total: 6 days
