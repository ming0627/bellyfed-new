# Next.js API Integration Patterns

## Overview

This document outlines the best practices for handling API calls in a Next.js application, specifically for our architecture using AWS API Gateway and Cognito.

## API Call Patterns

### 1. Direct-to-API Pattern (Our Current Choice)

Best for applications with a separate backend (API Gateway, Lambda, etc.)

```typescript
// services/api.ts
export class ApiService {
    private static async getHeaders() {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken.toString();

        return {
            Authorization: `Bearer ${token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
            'Content-Type': 'application/json',
        };
    }

    static async get<T>(endpoint: string): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new ApiError(error?.message || 'API request failed', response.status, error);
            }

            return response.json();
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(
                'Network error',
                500,
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    }

    // Add other methods (POST, PUT, DELETE) as needed
}

// types/api.ts
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// hooks/useApi.ts
export function useApiQuery<T>(key: string[], endpoint: string, options?: UseQueryOptions<T>) {
    return useQuery({
        queryKey: key,
        queryFn: () => ApiService.get<T>(endpoint),
        ...options,
    });
}
```

### 2. Component Usage

```typescript
// components/restaurant-page.tsx
export function RestaurantPage({ establishmentId }: { establishmentId: string }) {
    const { isAuthenticated, user } = useAuth();

    const {
        data: establishment,
        isLoading,
        error,
    } = useApiQuery(['establishment', establishmentId], `/establishments/${establishmentId}`, {
        enabled: isAuthenticated && !!user,
        retry: (failureCount, error) => {
            if (error instanceof ApiError && error.status === 401) return false;
            return failureCount < 3;
        },
    });

    // Rest of the component...
}
```

## Best Practices

### 1. API Layer Abstraction

- Create a centralized API service
- Handle authentication headers consistently
- Implement proper error handling
- Use TypeScript for better type safety

### 2. Environment Configuration

```env
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-gateway-url
NEXT_PUBLIC_API_KEY=your-api-key
```

### 3. Error Handling

- Create custom error classes
- Handle different types of errors:
    - Authentication errors (401)
    - Authorization errors (403)
    - Not found errors (404)
    - Server errors (500)
- Provide meaningful error messages to users

### 4. Data Fetching Strategy

- Use React Query for:
    - Caching
    - Auto-retrying
    - Background updates
    - Optimistic updates
    - Infinite loading

### 5. Type Safety

```typescript
// types/establishment.ts
export interface Establishment {
    id: string;
    name: string;
    type: EstablishmentType;
    address: string;
    // ... other fields
}

// Ensure API responses match these types
export type ApiResponse<T> = {
    data: T;
    metadata?: {
        nextCursor?: string;
        total?: number;
    };
};
```

## Common Patterns

### 1. Loading States

```typescript
function MyComponent() {
  const { data, isLoading, error } = useApiQuery(...);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return <DisplayData data={data} />;
}
```

### 2. Optimistic Updates

```typescript
function LikeButton({ establishmentId }: { establishmentId: string }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => ApiService.post(`/establishments/${establishmentId}/like`),
        onMutate: async () => {
            // Optimistically update UI
            await queryClient.cancelQueries(['establishment', establishmentId]);
            const previous = queryClient.getQueryData(['establishment', establishmentId]);

            queryClient.setQueryData(['establishment', establishmentId], (old: any) => ({
                ...old,
                likes: old.likes + 1,
            }));

            return { previous };
        },
        onError: (err, variables, context) => {
            // Roll back on error
            queryClient.setQueryData(['establishment', establishmentId], context?.previous);
        },
    });
}
```

## Security Considerations

1. **API Key Protection**

    - Only use API keys in authenticated contexts
    - Implement rate limiting
    - Monitor API usage

2. **Authentication**

    - Always verify token validity
    - Handle token refresh properly
    - Implement proper session management

3. **Data Validation**
    - Validate all API responses
    - Sanitize user inputs
    - Implement proper error boundaries

## Testing

```typescript
// __tests__/api.test.ts
describe('ApiService', () => {
    it('should handle authentication errors', async () => {
        // Test setup
        const mockFetch = jest.fn().mockRejectedValue(new ApiError('Unauthorized', 401));
        global.fetch = mockFetch;

        // Test
        await expect(ApiService.get('/test')).rejects.toThrow('Unauthorized');
    });
});
```
