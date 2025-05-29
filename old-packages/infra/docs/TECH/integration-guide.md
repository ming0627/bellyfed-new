# Bellyfed Integration Guide

## Overview

This guide provides technical information for partners looking to integrate with the Bellyfed platform. Our APIs and SDKs enable seamless integration of our restaurant discovery and recommendation features into your applications.

## Getting Started

### 1. Registration

- Create a developer account at [dev.bellyfed.com](https://dev.bellyfed.com)
- Generate API keys in the developer dashboard
- Review our API terms and conditions

### 2. Authentication

```javascript
// Example authentication header
Authorization: Bearer YOUR_API_KEY
```

### 3. Base URLs

- Production: `https://api.bellyfed.com/v1`
- Staging: `https://api.staging.bellyfed.com/v1`
- Development: `https://api.dev.bellyfed.com/v1`

## API Endpoints

### Restaurant Discovery

#### Search Restaurants

```http
GET /restaurants/search
```

Parameters:

- `query`: Search term
- `location`: Coordinates or address
- `radius`: Search radius in meters
- `cuisine`: Cuisine type filter
- `price`: Price range filter

Example:

```javascript
const response = await fetch(
    'https://api.bellyfed.com/v1/restaurants/search?query=sushi&location=tokyo'
);
```

#### Get Restaurant Details

```http
GET /restaurants/{id}
```

Example:

```javascript
const response = await fetch('https://api.bellyfed.com/v1/restaurants/123');
```

### Reviews

#### Get Reviews

```http
GET /restaurants/{id}/reviews
```

Parameters:

- `sort`: Sort order (recent, rating)
- `limit`: Number of reviews
- `offset`: Pagination offset

Example:

```javascript
const response = await fetch(
    'https://api.bellyfed.com/v1/restaurants/123/reviews?sort=recent&limit=10'
);
```

## SDK Integration

### JavaScript SDK

#### Installation

```bash
npm install @bellyfed/sdk
```

#### Usage

```javascript
import { BellyfedClient } from '@bellyfed/sdk';

const client = new BellyfedClient({
    apiKey: 'YOUR_API_KEY',
});

// Search restaurants
const results = await client.searchRestaurants({
    query: 'ramen',
    location: 'shibuya',
});
```

### Python SDK

#### Installation

```bash
pip install bellyfed-sdk
```

#### Usage

```python
from bellyfed import Client

client = Client(api_key='YOUR_API_KEY')

# Search restaurants
results = client.search_restaurants(
    query='ramen',
    location='shibuya'
)
```

## Rate Limits

| Plan       | Requests/min | Daily Limit |
| ---------- | ------------ | ----------- |
| Basic      | 60           | 10,000      |
| Pro        | 300          | 100,000     |
| Enterprise | Custom       | Custom      |

## Error Handling

### Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error

### Error Response Format

```json
{
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "Rate limit exceeded",
        "details": {
            "limit": 60,
            "reset": "2024-01-01T00:00:00Z"
        }
    }
}
```

## Best Practices

### 1. Error Handling

```javascript
try {
    const response = await client.searchRestaurants({
        query: 'sushi',
    });
} catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
        // Implement retry with backoff
    }
}
```

### 2. Caching

- Cache restaurant details
- Respect Cache-Control headers
- Implement stale-while-revalidate

### 3. Performance

- Use compression
- Batch requests when possible
- Implement request timeouts

## Support

- Developer Forum: [forum.bellyfed.com](https://forum.bellyfed.com)
- API Status: [status.bellyfed.com](https://status.bellyfed.com)
- Email: api@bellyfed.com
