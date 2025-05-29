# Typesense Migration Guide

This document outlines the migration path from the existing search functionality to the new Typesense-based search implementation.

## Overview

The Bellyfed platform is transitioning from traditional database queries for search to a dedicated search engine (Typesense) for improved performance, relevance, and user experience. This guide explains what's changing and how to migrate existing code.

## What's Being Replaced

### Current Search Implementations

The following existing search implementations will be replaced by Typesense:

1. **Restaurant Search in RDS** (`functions/rds-restaurant-query/index.ts`)

    - Currently uses SQL LIKE queries with `ILIKE` for case-insensitive matching
    - Limited to exact or partial string matches
    - No typo tolerance or relevance ranking

2. **Restaurant Search in DynamoDB** (`functions/restaurant-query/index.ts`)

    - Uses DynamoDB Scan operations with FilterExpressions
    - Inefficient for large datasets
    - Limited filtering capabilities

3. **User Search** (`functions/user-query/src/index.ts`)
    - Uses DynamoDB Scan with contains() function
    - Inefficient for large user bases

## New Typesense-Based Search

### Dish Search API

The new Typesense implementation provides a dedicated search API for dishes:

- **Endpoint**: `/api/dishes/search`
- **Implementation**: `functions/typesense-dish-search/index.ts`
- **Infrastructure**: `lib/typesense/typesense-lambda-stack.ts`

### Benefits of Typesense

1. **Performance**: Faster search results, especially for large datasets
2. **Relevance**: Better ranking of search results based on relevance
3. **Typo Tolerance**: Handles misspellings and typos gracefully
4. **Filtering**: Rich filtering capabilities (dish type, price range, etc.)
5. **Faceting**: Support for faceted search (coming soon)
6. **Resource Efficiency**: Lower resource usage compared to database scans

## Migration Steps

### For Backend Developers

1. **Phase 1: Dish Search** (Current Implementation)

    - Dish search is now available through the Typesense API
    - Existing database queries for dish search should be replaced with calls to the new API

2. **Phase 2: Restaurant Search** (Future Implementation)

    - Create a Typesense schema for restaurants
    - Implement data sync for restaurants
    - Create a restaurant search API using Typesense
    - Replace existing restaurant search implementations

3. **Phase 3: User Search** (Future Implementation)
    - Create a Typesense schema for users
    - Implement data sync for users
    - Create a user search API using Typesense
    - Replace existing user search implementations

### For Frontend Developers

1. **Update API Clients**

    - Replace calls to the old search endpoints with the new Typesense-based endpoints
    - Update request and response handling to match the Typesense format

2. **Implement New Search Components**
    - Create or update search components to take advantage of Typesense features
    - Add support for filtering, pagination, etc.

## API Comparison

### Old Dish Search API (RDS-based)

```http
GET /restaurants?q=sushi
```

Response:

```json
{
    "items": [
        {
            "id": "123",
            "name": "Sushi Restaurant",
            "description": "...",
            "...": "..."
        }
    ],
    "count": 1,
    "totalCount": 1,
    "nextOffset": null
}
```

### New Dish Search API (Typesense-based)

```http
GET /api/dishes/search?q=sushi
```

Response:

```json
{
    "found": 10,
    "out_of": 100,
    "page": 1,
    "request_params": { "...": "..." },
    "hits": [
        {
            "document": {
                "dish_id": "456",
                "name": "Sushi Platter",
                "description": "...",
                "dish_type": "Japanese",
                "...": "..."
            },
            "highlights": [
                {
                    "field": "name",
                    "matched_tokens": ["Sushi"],
                    "snippet": "<mark>Sushi</mark> Platter"
                }
            ],
            "text_match": 0.92
        }
    ]
}
```

## Deprecation Timeline

1. **Phase 1 (Current)**: Typesense dish search is available alongside existing search
2. **Phase 2 (Q2 2024)**: Typesense restaurant search will be implemented
3. **Phase 3 (Q3 2024)**: Typesense user search will be implemented
4. **Phase 4 (Q4 2024)**: Old search endpoints will be deprecated

## Testing and Validation

When migrating to the Typesense-based search:

1. **Compare Results**: Ensure the new search returns at least as many relevant results as the old search
2. **Performance Testing**: Verify that the new search is faster, especially for large datasets
3. **Edge Cases**: Test with special characters, typos, and unusual queries
4. **Load Testing**: Ensure the Typesense service can handle expected load

## Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Typesense Architecture in Bellyfed](./typesense-architecture.md)
- [Frontend Typesense Integration TODO](./frontend-typesense-integration-todo.md)
