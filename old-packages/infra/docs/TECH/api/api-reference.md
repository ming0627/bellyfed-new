# Oishiiteru API Documentation

## Authentication

All API endpoints require an API key to be included in the `x-api-key` header.

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
    menu: MenuItem[];
    openingHours: OpeningHours;
    contact: ContactInfo;
  }
}
```

## Error Responses

All endpoints may return the following error responses:

```typescript
{
  statusCode: 400 | 401 | 403 | 404 | 500,
  error: string;
  message: string;
}
```

- 400: Bad Request - Invalid parameters
- 401: Unauthorized - Missing or invalid API key
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error
