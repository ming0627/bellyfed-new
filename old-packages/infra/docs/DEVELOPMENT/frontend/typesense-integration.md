# Typesense Frontend Integration TODO

This document outlines the tasks needed to integrate Typesense with the Bellyfed frontend application for dish search functionality.

## Repository Structure

- **Frontend Repository**: `bellyfed` - Contains the Next.js application code
- **Infrastructure Repository**: `bellyfed-infra` - Contains the CDK infrastructure code (current repository)

The tasks in this document are primarily for implementation in the **frontend repository** (`bellyfed`).

## Overview

Typesense has been implemented in the backend infrastructure to provide fast, typo-tolerant search for dishes. The frontend application needs to be updated to use this new search functionality.

## Prerequisites

### Already Implemented in Infrastructure Repository (`bellyfed-infra`)

- ✅ Typesense ECS service running in Fargate
- ✅ Lambda function for syncing dish data from PostgreSQL to Typesense
- ✅ API Gateway endpoint for dish search at `/api/dishes/search`
- ✅ Security groups and IAM permissions configured
- ✅ Scheduled events for regular data synchronization

### To Be Implemented in Frontend Repository (`bellyfed`)

- ⬜ Install Typesense client library
- ⬜ Create utility functions for Typesense client
- ⬜ Implement dish search components
- ⬜ Integrate with dish ranking workflow

## Implementation Tasks for Frontend Repository (`bellyfed`)

### 1. Install Dependencies in Frontend Repository

```bash
# Install Typesense client library
npm install typesense
# Install optional helper libraries
npm install use-debounce
```

### 2. Create Typesense Client Utility

Create a utility file to initialize and manage the Typesense client:

```typescript
// bellyfed/src/utils/typesense.ts
import Typesense from 'typesense';

let typesenseClient: Typesense.Client | null = null;

export function getTypesenseClient() {
    if (typesenseClient) return typesenseClient;

    typesenseClient = new Typesense.Client({
        nodes: [
            {
                host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost',
                port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'),
                protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http',
            },
        ],
        apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || 'xyz',
        connectionTimeoutSeconds: 2,
    });

    return typesenseClient;
}
```

### 3. Create API Client for Dish Search

Create an API client to interact with the dish search endpoint:

```typescript
// bellyfed/src/api/dishSearch.ts
import { getTypesenseClient } from '../utils/typesense';

export interface DishSearchParams {
    q?: string;
    dish_type?: string;
    restaurant_id?: string;
    tags?: string[];
    price_min?: number;
    price_max?: number;
    per_page?: number;
    page?: number;
}

export async function searchDishes(params: DishSearchParams) {
    try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.dish_type) queryParams.append('dish_type', params.dish_type);
        if (params.restaurant_id) queryParams.append('restaurant_id', params.restaurant_id);
        if (params.tags && params.tags.length > 0)
            queryParams.append('tags', params.tags.join(','));
        if (params.price_min) queryParams.append('price_min', params.price_min.toString());
        if (params.price_max) queryParams.append('price_max', params.price_max.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.page) queryParams.append('page', params.page.toString());

        // Make API request
        const response = await fetch(`/api/dishes/search?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`Error searching dishes: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching dishes:', error);
        throw error;
    }
}
```

### 4. Create Dish Search Component

Create a reusable component for dish search:

```tsx
// bellyfed/src/components/DishSearch.tsx
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { searchDishes, DishSearchParams } from '../api/dishSearch';

interface DishSearchProps {
    onSelectDish: (dish: any) => void;
    initialParams?: DishSearchParams;
}

export default function DishSearch({ onSelectDish, initialParams = {} }: DishSearchProps) {
    const [query, setQuery] = useState(initialParams.q || '');
    const [debouncedQuery] = useDebounce(query, 300);
    const [dishType, setDishType] = useState(initialParams.dish_type || '');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchResults() {
            if (!debouncedQuery && !dishType) {
                setResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const searchParams: DishSearchParams = {
                    q: debouncedQuery,
                    dish_type: dishType || undefined,
                    ...initialParams,
                };

                const data = await searchDishes(searchParams);
                setResults(data.hits || []);
            } catch (err) {
                console.error('Error searching dishes:', err);
                setError('Failed to search dishes. Please try again.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [debouncedQuery, dishType, initialParams]);

    return (
        <div className="dish-search">
            <div className="search-controls">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search dishes..."
                    className="search-input"
                />

                <select
                    value={dishType}
                    onChange={(e) => setDishType(e.target.value)}
                    className="dish-type-select"
                >
                    <option value="">All Dish Types</option>
                    <option value="Malaysian">Malaysian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Italian">Italian</option>
                    {/* Add more dish types as needed */}
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="results">
                    {results.map((hit) => (
                        <div
                            key={hit.document.dish_id}
                            className="dish-card"
                            onClick={() => onSelectDish(hit.document)}
                        >
                            <h3>{hit.document.name}</h3>
                            <p>{hit.document.description}</p>
                            <div className="dish-meta">
                                <span className="dish-type">{hit.document.dish_type}</span>
                                <span className="dish-price">
                                    ${hit.document.price?.toFixed(2)}
                                </span>
                                {hit.document.average_rank && (
                                    <span className="dish-rating">
                                        ★ {hit.document.average_rank.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {results.length === 0 && debouncedQuery && (
                        <div className="no-results">No dishes found</div>
                    )}
                </div>
            )}
        </div>
    );
}
```

### 5. Integrate with Dish Ranking Page

Update the dish ranking page to use the new search component:

```tsx
// bellyfed/src/pages/rank-dish.tsx
import { useState } from 'react';
import DishSearch from '../components/DishSearch';
import RankingForm from '../components/RankingForm';

export default function DishRankingPage() {
    const [selectedDish, setSelectedDish] = useState(null);

    const handleDishSelect = (dish) => {
        setSelectedDish(dish);
    };

    return (
        <div className="dish-ranking-page">
            <h1>Rank a Dish</h1>

            {!selectedDish ? (
                <>
                    <p>Search for a dish to rank:</p>
                    <DishSearch onSelectDish={handleDishSelect} />
                </>
            ) : (
                <>
                    <div className="selected-dish">
                        <h2>{selectedDish.name}</h2>
                        <p>{selectedDish.description}</p>
                        <button onClick={() => setSelectedDish(null)}>Change Dish</button>
                    </div>

                    <RankingForm
                        dishId={selectedDish.dish_id}
                        restaurantId={selectedDish.restaurant_id}
                        dishType={selectedDish.dish_type}
                    />
                </>
            )}
        </div>
    );
}
```

### 6. Add Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_TYPESENSE_HOST=your-typesense-host
NEXT_PUBLIC_TYPESENSE_PORT=8108
NEXT_PUBLIC_TYPESENSE_PROTOCOL=http
NEXT_PUBLIC_TYPESENSE_API_KEY=your-typesense-api-key
```

For production, add these variables to your deployment environment.

### 7. Add Styles

Add styles for the dish search component:

```css
/* bellyfed/src/styles/components/DishSearch.css */
.dish-search {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.search-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.search-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.dish-type-select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.dish-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.dish-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.dish-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

.dish-rating {
    color: #f8b400;
    font-weight: bold;
}

.loading,
.error,
.no-results {
    text-align: center;
    padding: 20px;
    color: #666;
}

.error {
    color: #e74c3c;
}
```

### 8. Testing

Test the integration with the following steps:

1. Ensure the backend Typesense infrastructure is deployed
2. Verify the dish search API endpoint is working
3. Test the dish search component with various queries
4. Test the integration with the dish ranking workflow

## Already Implemented in Infrastructure Repository (`bellyfed-infra`)

The following components have already been implemented in the infrastructure repository:

### 1. Typesense ECS Service

- Typesense running in ECS Fargate with minimal resources
- Persistent storage using EFS
- Security groups configured for proper access

### 2. Data Synchronization

- Lambda function for syncing dish data from PostgreSQL to Typesense
- Scheduled event to run the sync every hour
- Error handling and logging

### 3. Search API

- API Gateway endpoint for dish search at `/api/dishes/search`
- Lambda function to handle search requests
- Support for filtering, pagination, and sorting

### 4. Security and Configuration

- IAM roles and policies for secure access
- Environment-specific configuration
- SSM parameters for storing connection details

## Additional Considerations for Frontend Implementation

- **Error Handling**: Implement robust error handling for API failures
- **Loading States**: Add loading indicators for better user experience
- **Pagination**: Implement pagination for large result sets
- **Filters**: Add additional filters for more refined searches
- **Caching**: Consider implementing client-side caching for frequent searches
- **Analytics**: Add analytics to track search patterns and improve the search experience

## Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Typesense JavaScript Client](https://github.com/typesense/typesense-js)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
