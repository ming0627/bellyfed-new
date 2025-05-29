# Bellyfed API Documentation

## Overview

The Bellyfed API provides programmatic access to our restaurant discovery and recommendation platform. This document outlines the API endpoints, authentication, and best practices for integration.

## Prerequisites

- API Key (obtain from developer dashboard)
- HTTPS-capable client
- JSON parsing capability
- Basic understanding of REST APIs
- Familiarity with HTTP status codes

## Key Concepts

### API Architecture

Our API follows REST principles:

- Resource-based URLs
- Standard HTTP methods
- Stateless requests
- JSON responses
- Token-based authentication

### Base URLs

- Production: `https://api.bellyfed.com/v1`
- Staging: `https://api-staging.bellyfed.com/v1`
- Development: `https://api-dev.bellyfed.com/v1`

### Authentication

All requests require an API key in the header:

```http
Authorization: Bearer YOUR_API_KEY
```

## Core Services

### Restaurant Discovery

**Endpoint:** `GET /restaurants`

**Use Cases:**

- Search restaurants by location
- Filter by cuisine type
- Sort by rating or distance
- Paginate results

**Example Request:**

```http
GET /restaurants?location=tokyo&cuisine_type=ramen&rating=4
Authorization: Bearer YOUR_API_KEY
```

**Example Response:**

```json
{
    "data": {
        "restaurants": [
            {
                "id": "123",
                "name": "Ramen Master",
                "rating": 4.5,
                "location": {
                    "address": "1-2-3 Shibuya, Tokyo"
                }
            }
        ]
    },
    "meta": {
        "total": 100,
        "page": 1
    }
}
```

### User Preferences

**Endpoint:** `GET/PUT /users/{user_id}/preferences`

**Use Cases:**

- Retrieve user preferences
- Update dietary restrictions
- Manage favorite cuisines
- Set price range preferences

### Recommendations

**Endpoint:** `GET /recommendations`

**Use Cases:**

- Get personalized recommendations
- Discover trending restaurants
- Find similar restaurants
- Special occasion suggestions

## Error Handling

### Common Error Codes

1. **400 Bad Request**

    - Invalid parameters
    - Missing required fields
    - Malformed request body

2. **401 Unauthorized**

    - Invalid API key
    - Expired token

3. **403 Forbidden**

    - Insufficient permissions
    - Rate limit exceeded
    - Account restrictions

4. **404 Not Found**

    - Resource doesn't exist
    - Invalid endpoint
    - Deleted content

5. **500 Internal Server Error**
    - Server-side issues
    - Database errors
    - Integration failures

### Error Response Format

```json
{
    "error": {
        "code": "INVALID_PARAMETER",
        "message": "Invalid cuisine_type parameter",
        "details": {
            "field": "cuisine_type",
            "reason": "Must be one of: japanese, italian, chinese"
        }
    }
}
```
