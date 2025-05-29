# API Endpoints Reference

This document provides a comprehensive reference for all API endpoints related to the rankings feature.

## Authentication

All ranking endpoints require authentication. The authentication is handled by the middleware, which verifies the user's session and adds the user ID to the request headers.

## Endpoints Overview

| Endpoint                         | Method | Description                                    |
| -------------------------------- | ------ | ---------------------------------------------- |
| `/api/dishes`                    | GET    | List dishes with filtering options             |
| `/api/dishes/:id`                | GET    | Get a specific dish by ID                      |
| `/api/dishes/slug/:slug`         | GET    | Get a specific dish by slug                    |
| `/api/rankings/my`               | GET    | Get all rankings for the current user          |
| `/api/rankings/my/:dishSlug`     | GET    | Get current user's ranking for a specific dish |
| `/api/rankings/my/:dishSlug`     | POST   | Create a new ranking                           |
| `/api/rankings/my/:dishSlug`     | PUT    | Update an existing ranking                     |
| `/api/rankings/my/:dishSlug`     | DELETE | Delete a ranking                               |
| `/api/rankings/local/:dishSlug`  | GET    | Get local rankings for a dish                  |
| `/api/rankings/global/:dishSlug` | GET    | Get global rankings for a dish                 |
| `/api/upload/ranking-photo`      | POST   | Upload a photo for a ranking                   |

## Detailed Endpoint Specifications

### GET /api/dishes

List dishes with filtering options.

#### Query Parameters

| Parameter    | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| `country`    | string | Filter by country code                   |
| `category`   | string | Filter by category                       |
| `restaurant` | string | Filter by restaurant ID                  |
| `search`     | string | Search term for dish name or description |
| `page`       | number | Page number for pagination (default: 1)  |
| `limit`      | number | Number of results per page (default: 20) |

#### Response

```json
{
  "dishes": [
    {
      "dishId": "uuid",
      "name": "Nasi Lemak Special",
      "slug": "nasi-lemak-special",
      "description": "Fragrant coconut rice...",
      "restaurantId": "uuid",
      "restaurantName": "Village Park Restaurant",
      "category": "Malaysian",
      "imageUrl": "https://example.com/dish.jpg",
      "isVegetarian": false,
      "spicyLevel": 2,
      "price": 15.9,
      "countryCode": "my"
    }
    // More dishes...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### GET /api/dishes/:id

Get a specific dish by ID.

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Dish ID     |

#### Response

```json
{
  "dishId": "uuid",
  "name": "Nasi Lemak Special",
  "slug": "nasi-lemak-special",
  "description": "Fragrant coconut rice...",
  "restaurantId": "uuid",
  "restaurantName": "Village Park Restaurant",
  "category": "Malaysian",
  "imageUrl": "https://example.com/dish.jpg",
  "isVegetarian": false,
  "spicyLevel": 2,
  "price": 15.9,
  "countryCode": "my"
}
```

### GET /api/dishes/slug/:slug

Get a specific dish by slug.

#### URL Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `slug`    | string | Dish slug   |

#### Query Parameters

| Parameter | Type   | Description                                                    |
| --------- | ------ | -------------------------------------------------------------- |
| `country` | string | Country code (required if slug is not unique across countries) |

#### Response

```json
{
  "dishId": "uuid",
  "name": "Nasi Lemak Special",
  "slug": "nasi-lemak-special",
  "description": "Fragrant coconut rice...",
  "restaurantId": "uuid",
  "restaurantName": "Village Park Restaurant",
  "category": "Malaysian",
  "imageUrl": "https://example.com/dish.jpg",
  "isVegetarian": false,
  "spicyLevel": 2,
  "price": 15.9,
  "countryCode": "my"
}
```

### GET /api/rankings/my

Get all rankings for the current user.

#### Query Parameters

| Parameter | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| `page`    | number | Page number for pagination (default: 1)  |
| `limit`   | number | Number of results per page (default: 20) |

#### Response

```json
{
  "rankings": [
    {
      "rankingId": "uuid",
      "dishId": "uuid",
      "dishName": "Nasi Lemak Special",
      "dishSlug": "nasi-lemak-special",
      "restaurantId": "uuid",
      "restaurantName": "Village Park Restaurant",
      "dishType": "Malaysian",
      "rank": 1,
      "tasteStatus": null,
      "notes": "This is the best Nasi Lemak I have ever had!",
      "photoUrls": ["https://example.com/photo1.jpg"],
      "createdAt": "2025-05-04T12:00:00Z",
      "updatedAt": "2025-05-04T12:00:00Z"
    }
    // More rankings...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### GET /api/rankings/my/:dishSlug

Get current user's ranking for a specific dish.

#### URL Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `dishSlug` | string | Dish slug   |

#### Response

```json
{
  "userRanking": {
    "rankingId": "uuid",
    "userId": "uuid",
    "dishId": "uuid",
    "restaurantId": "uuid",
    "dishType": "Malaysian",
    "rank": 1,
    "tasteStatus": null,
    "notes": "This is the best Nasi Lemak I have ever had!",
    "photoUrls": ["https://example.com/photo1.jpg"],
    "createdAt": "2025-05-04T12:00:00Z",
    "updatedAt": "2025-05-04T12:00:00Z"
  },
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "rankingStats": {
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
  }
}
```

### POST /api/rankings/my/:dishSlug

Create a new ranking.

#### URL Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `dishSlug` | string | Dish slug   |

#### Request Body

```json
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

Note: Either `rank` or `tasteStatus` must be provided, but not both.

#### Response

```json
{
  "userRanking": {
    "rankingId": "uuid",
    "userId": "uuid",
    "dishId": "uuid",
    "restaurantId": "uuid",
    "dishType": "Malaysian",
    "rank": 1,
    "tasteStatus": null,
    "notes": "This is the best Nasi Lemak I have ever had!",
    "photoUrls": ["https://example.com/photo1.jpg"],
    "createdAt": "2025-05-04T12:00:00Z",
    "updatedAt": "2025-05-04T12:00:00Z"
  },
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "rankingStats": {
    "totalRankings": 1251,
    "averageRank": 4.8,
    "ranks": {
      "1": 851,
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
  }
}
```

### PUT /api/rankings/my/:dishSlug

Update an existing ranking.

#### URL Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `dishSlug` | string | Dish slug   |

#### Request Body

```json
{
  "rank": 2,
  "tasteStatus": null,
  "notes": "Updated notes for this dish.",
  "photoUrls": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

Note: Either `rank` or `tasteStatus` must be provided, but not both.

#### Response

```json
{
  "userRanking": {
    "rankingId": "uuid",
    "userId": "uuid",
    "dishId": "uuid",
    "restaurantId": "uuid",
    "dishType": "Malaysian",
    "rank": 2,
    "tasteStatus": null,
    "notes": "Updated notes for this dish.",
    "photoUrls": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "createdAt": "2025-05-04T12:00:00Z",
    "updatedAt": "2025-05-04T13:00:00Z"
  },
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "rankingStats": {
    "totalRankings": 1250,
    "averageRank": 4.8,
    "ranks": {
      "1": 849,
      "2": 251,
      "3": 100,
      "4": 30,
      "5": 20
    },
    "tasteStatuses": {
      "ACCEPTABLE": 950,
      "SECOND_CHANCE": 250,
      "DISSATISFIED": 50
    }
  }
}
```

### DELETE /api/rankings/my/:dishSlug

Delete a ranking.

#### URL Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `dishSlug` | string | Dish slug   |

#### Response

```json
{
  "success": true,
  "message": "Ranking deleted successfully",
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "rankingStats": {
    "totalRankings": 1249,
    "averageRank": 4.8,
    "ranks": {
      "1": 849,
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
  }
}
```

### GET /api/rankings/local/:dishSlug

Get local rankings for a dish.

#### URL Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `dishSlug` | string | Dish slug   |

#### Query Parameters

| Parameter | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| `country` | string | Country code for local rankings          |
| `page`    | number | Page number for pagination (default: 1)  |
| `limit`   | number | Number of results per page (default: 20) |

#### Response

```json
{
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "localRankings": [
    {
      "username": "user1",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "rank": 1,
      "tasteStatus": null,
      "notes": "This is the best Nasi Lemak I have ever had!",
      "photoUrls": ["https://example.com/photo1.jpg"],
      "createdAt": "2025-05-04T12:00:00Z"
    },
    {
      "username": "user2",
      "avatarUrl": "https://example.com/avatar2.jpg",
      "rank": null,
      "tasteStatus": "ACCEPTABLE",
      "notes": "Really good, would eat again!",
      "photoUrls": [],
      "createdAt": "2025-05-03T10:00:00Z"
    }
    // More rankings...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  },
  "stats": {
    "totalRankings": 100,
    "averageRank": 4.5,
    "ranks": {
      "1": 60,
      "2": 20,
      "3": 10,
      "4": 5,
      "5": 5
    },
    "tasteStatuses": {
      "ACCEPTABLE": 80,
      "SECOND_CHANCE": 15,
      "DISSATISFIED": 5
    }
  }
}
```

### GET /api/rankings/global/:dishSlug

Get global rankings for a dish.

#### URL Parameters

| Parameter  | Type   | Description |
| ---------- | ------ | ----------- |
| `dishSlug` | string | Dish slug   |

#### Query Parameters

| Parameter | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| `page`    | number | Page number for pagination (default: 1)  |
| `limit`   | number | Number of results per page (default: 20) |

#### Response

```json
{
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "globalRankings": [
    {
      "username": "user1",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "countryCode": "my",
      "rank": 1,
      "tasteStatus": null,
      "notes": "This is the best Nasi Lemak I have ever had!",
      "photoUrls": ["https://example.com/photo1.jpg"],
      "createdAt": "2025-05-04T12:00:00Z"
    },
    {
      "username": "user2",
      "avatarUrl": "https://example.com/avatar2.jpg",
      "countryCode": "sg",
      "rank": null,
      "tasteStatus": "ACCEPTABLE",
      "notes": "Really good, would eat again!",
      "photoUrls": [],
      "createdAt": "2025-05-03T10:00:00Z"
    }
    // More rankings...
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "pages": 63
  },
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
    },
    "countryDistribution": {
      "my": 500,
      "sg": 300,
      "id": 200,
      "th": 150,
      "other": 100
    }
  }
}
```

### POST /api/upload/ranking-photo

Upload a photo for a ranking.

#### Request Body

```json
{
  "contentType": "image/jpeg"
}
```

#### Response

```json
{
  "uploadUrl": "https://presigned-s3-url.com/for-direct-upload",
  "photoUrl": "https://bellyfed-uploads.s3.amazonaws.com/rankings/user-id/photo-id.jpg"
}
```

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request

```json
{
  "error": "Invalid input",
  "details": "Either rank or tasteStatus must be provided, but not both"
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Permission denied",
  "details": "You do not have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found",
  "details": "The requested dish does not exist"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "details": "Please try again later"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

## Pagination

All endpoints that return lists support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 20, max: 100)

The response includes a `pagination` object with the following properties:

```json
"pagination": {
  "total": 100,  // Total number of items
  "page": 1,     // Current page
  "limit": 20,   // Items per page
  "pages": 5     // Total number of pages
}
```

## Filtering and Sorting

Some endpoints support filtering and sorting with the following query parameters:

- `sort`: Field to sort by (e.g., `createdAt`, `rank`)
- `order`: Sort order (`asc` or `desc`, default: `desc`)
- `filter`: Filter criteria (e.g., `rank=1`, `tasteStatus=ACCEPTABLE`)

Example:

```
GET /api/rankings/my?sort=createdAt&order=desc&filter=rank=1
```

This would return the user's rankings sorted by creation date in descending order, filtered to only include rankings with rank 1.

## Rate Limiting

All endpoints are subject to rate limiting to prevent abuse. The rate limits are as follows:

- GET endpoints: 100 requests per minute
- POST/PUT/DELETE endpoints: 20 requests per minute
- Photo upload endpoint: 10 uploads per hour

When a rate limit is exceeded, the API returns a 429 Too Many Requests response with a Retry-After header indicating when the client can try again.
