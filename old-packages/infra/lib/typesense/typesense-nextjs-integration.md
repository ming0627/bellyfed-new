# Typesense Integration with NextJS

This document provides instructions for integrating Typesense with the NextJS Bellyfed application.

## Overview

Typesense is a fast, typo-tolerant search engine that is a lightweight alternative to Elasticsearch/OpenSearch. It's designed to be simple to set up and use, with a clean API and excellent performance characteristics.

## Environment Variables

Add the following environment variables to your NextJS application:

```env
TYPESENSE_HOST=bellyfed-typesense-{environment}.bellyfed-{environment}.internal
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

Replace `{environment}` with your environment name (dev, test, qa, prod).

## Client Setup

Install the Typesense client:

```bash
npm install typesense
```

Create a utility file for Typesense client setup:

```typescript
// utils/typesense.ts
import Typesense from 'typesense';

let typesenseClient: Typesense.Client | null = null;

export function getTypesenseClient() {
    if (typesenseClient) return typesenseClient;

    typesenseClient = new Typesense.Client({
        nodes: [
            {
                host: process.env.TYPESENSE_HOST || 'localhost',
                port: parseInt(process.env.TYPESENSE_PORT || '8108'),
                protocol: process.env.TYPESENSE_PROTOCOL || 'http',
            },
        ],
        apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
        connectionTimeoutSeconds: 2,
    });

    return typesenseClient;
}
```

## Schema Setup

Create a schema for your collections:

```typescript
// Example schema for restaurants
const restaurantSchema = {
    name: 'restaurants',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'cuisine', type: 'string[]' },
        { name: 'location', type: 'geopoint' },
        { name: 'rating', type: 'float' },
        { name: 'price_range', type: 'int32' },
        { name: 'created_at', type: 'int64' },
    ],
    default_sorting_field: 'created_at',
};

// Create the collection
async function createCollection() {
    const client = getTypesenseClient();
    try {
        return await client.collections().create(restaurantSchema);
    } catch (error) {
        // Collection might already exist
        console.error('Error creating collection:', error);
    }
}
```

## Indexing Data

Index your data into Typesense:

```typescript
async function indexRestaurant(restaurant) {
    const client = getTypesenseClient();
    try {
        return await client.collections('restaurants').documents().upsert(restaurant);
    } catch (error) {
        console.error('Error indexing restaurant:', error);
    }
}
```

## Searching

Perform searches:

```typescript
async function searchRestaurants(query, filters = {}) {
    const client = getTypesenseClient();
    const searchParams = {
        q: query,
        query_by: 'name,description,cuisine',
        filter_by: Object.entries(filters)
            .map(([key, value]) => `${key}:${value}`)
            .join(' && '),
        sort_by: '_text_match:desc,rating:desc',
        per_page: 20,
    };

    try {
        return await client.collections('restaurants').documents().search(searchParams);
    } catch (error) {
        console.error('Error searching restaurants:', error);
        return { found: 0, hits: [] };
    }
}
```

## API Routes

Create API routes to interact with Typesense:

```typescript
// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getTypesenseClient } from '../../utils/typesense';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { q, cuisine, price_range } = req.query;

    if (!q) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    const filters: Record<string, string> = {};
    if (cuisine) filters.cuisine = cuisine as string;
    if (price_range) filters.price_range = price_range as string;

    try {
        const client = getTypesenseClient();
        const searchParams = {
            q: q as string,
            query_by: 'name,description,cuisine',
            filter_by: Object.entries(filters)
                .map(([key, value]) => `${key}:${value}`)
                .join(' && '),
            sort_by: '_text_match:desc,rating:desc',
            per_page: 20,
        };

        const results = await client.collections('restaurants').documents().search(searchParams);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Error searching:', error);
        return res.status(500).json({ message: 'Error performing search' });
    }
}
```

## React Components

Create React components to use the search functionality:

```tsx
// components/Search.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data.hits || []);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search restaurants..."
                    className="p-2 border rounded"
                />
                <button
                    type="submit"
                    className="ml-2 p-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="mt-4">
                {results.length > 0 ? (
                    <ul>
                        {results.map((hit) => (
                            <li key={hit.document.id} className="p-2 border-b">
                                <h3 className="font-bold">{hit.document.name}</h3>
                                <p>{hit.document.description}</p>
                                <div className="flex mt-1">
                                    <span className="mr-2">Rating: {hit.document.rating}</span>
                                    <span>Price: {'$'.repeat(hit.document.price_range)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    query && !loading && <p>No results found</p>
                )}
            </div>
        </div>
    );
}
```

## Conclusion

This integration provides a lightweight, fast search experience for the Bellyfed application. Typesense is configured with minimal resources to be cost-effective while still providing excellent search capabilities.

The ECS Fargate configuration ensures that Typesense runs efficiently and scales appropriately based on demand.
