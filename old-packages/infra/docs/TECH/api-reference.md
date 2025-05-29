# Bellyfed API Documentation

## Authentication

All API endpoints require:

1. A valid Cognito JWT token in the `Authorization` header as a Bearer token
2. API key in the `x-api-key` header

### Getting the JWT Token

The JWT token is automatically handled by the AuthContext (`src/contexts/AuthContext.tsx`). The token is obtained when:

1. User signs in successfully
2. Token is refreshed automatically by Amplify
3. User completes Cognito hosted UI flow

### Authentication Errors

The following scenarios will result in authentication errors:

- Missing or invalid JWT token
- Expired token that cannot be refreshed
- Missing or invalid API key
- Token refresh failures

## Endpoints

### List Restaurants

```http
GET /restaurants
```

Query restaurants with optional filters.

#### Query Parameters

- `city` (optional): Filter restaurants by city
- `cuisine` (optional): Filter restaurants by cuisine type

#### Response

```typescript
{
  statusCode: 200,
  body: [
    {
      id: string;
      name: string;
      city: string;
      cuisine: string;
      address: string;
      rating: number;
      priceRange: string;
      // ... other restaurant details
    }
  ]
}
```

### Get Restaurant Details

```http
GET /restaurants/{id}
```

Get detailed information about a specific restaurant.

#### Path Parameters

- `id`: Restaurant ID

#### Response

```typescript
{
  statusCode: 200,
  body: {
    id: string;
    name: string;
    city: string;
    cuisine: string;
    address: string;
    rating: number;
    priceRange: string;
    openingHours: {
      monday: string;
      tuesday: string;
      // ... other days
    };
    contact: {
      phone: string;
      email: string;
      website?: string;
    };
    // ... other restaurant details
  }
}
```

### Get Restaurant Menu

```http
GET /restaurants/{id}/menu
```

Get the menu items for a specific restaurant.

#### Path Parameters

- `id`: Restaurant ID

#### Response

```typescript
{
  statusCode: 200,
  body: [
    {
      id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      spicyLevel?: number;
      allergens?: string[];
      dietaryInfo?: {
        vegetarian: boolean;
        vegan: boolean;
        glutenFree: boolean;
      }
    }
  ]
}
```
