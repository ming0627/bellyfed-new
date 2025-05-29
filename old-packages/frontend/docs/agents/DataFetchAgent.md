# DataFetchAgent Guide

## Agent Purpose

I am DataFetchAgent, one of several specialized agents in the BellyFed platform. While I use the restaurant feature as an example pattern, this pattern can be applied to any data type with its own dedicated agent (e.g., UserAgent, ProfileAgent). I assist in creating consistent and efficient data flows from backend to frontend.

## My Capabilities

1. **Data Flow Implementation**

   - Set up API service layers
   - Create feature-specific services
   - Implement React Query hooks
   - Structure data display components

2. **Type Definition**

   - Define data interfaces
   - Create request/response types
   - Set up search parameter types

3. **Error Handling**
   - Implement consistent error patterns
   - Set up loading states
   - Handle edge cases

## Implementation Pattern Using Restaurant Example

### 1. API Layer (Base Communication)

```typescript
// src/services/api.ts
export class ApiService {
  // I help implement these base API methods
  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }

    return response.json();
  }
}
```

### 2. Feature Service Layer (Business Logic)

```typescript
// src/services/restaurantService.ts
export class RestaurantService {
  // I help implement these feature-specific methods
  static async getById(id: string): Promise<Restaurant> {
    return ApiService.get<Restaurant>(`/restaurants/${id}`);
  }

  static async search(
    params: RestaurantSearchParams,
  ): Promise<SearchResponse<Restaurant>> {
    const queryString = formatQueryParams(params);
    return ApiService.get<SearchResponse<Restaurant>>(
      `/restaurants?${queryString}`,
    );
  }

  static async listRestaurants(
    params: ListRestaurantsParams,
  ): Promise<ListRestaurantsResponse> {
    const queryString = formatQueryParams(params);
    return ApiService.get<ListRestaurantsResponse>(
      `/restaurants/list?${queryString}`,
    );
  }
}
```

### 3. React Query Hooks (Data Management)

```typescript
// src/hooks/useRestaurant.ts
// I help implement these custom hooks
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => RestaurantService.getById(id),
    enabled: !!id,
  });
}

export function useRestaurantSearch(params: RestaurantSearchParams) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => {
      // Use listRestaurants when no filters are active
      const noFiltersSelected =
        !params.cuisine && !params.location && !params.maxPrice;
      return noFiltersSelected
        ? RestaurantService.listRestaurants({
            limit: params.limit,
            nextToken: params.nextToken,
          })
        : RestaurantService.search(params);
    },
  });
}
```

### 4. Display Components (UI Layer)

```typescript
// src/pages/restaurants.tsx
// I help structure these display components
export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useState<RestaurantSearchParams>({
    limit: 10
  });

  const { data, isLoading, error } = useRestaurantSearch(searchParams);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <SearchFilters
        params={searchParams}
        onChange={setSearchParams}
      />
      <RestaurantGrid restaurants={data.items} />
      {data.nextToken && (
        <LoadMoreButton
          onClick={() => setSearchParams(prev => ({
            ...prev,
            nextToken: data.nextToken
          }))}
        />
      )}
    </div>
  );
}
```

## Restaurant Photo Handling

### Google Places API Integration

The system now directly uses Google Places API for restaurant photos. The implementation follows these steps:

1. **Photo Data Fetching**

```javascript
// scripts/fetch-restaurants.js
// Fetch and store complete photo URLs during data collection
const photosData =
  details.photos?.map(
    (photo) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${photo.widthPx || 1200}&maxheight=${photo.heightPx || 800}&photo_reference=${photo.name}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
  ) || [];
```

2. **PhotoGallery Component**

```typescript
// src/components/restaurant/PhotoGallery.tsx
interface PhotoGalleryProps {
  photos: string[]; // Array of direct photo URLs
  restaurantName: string;
}

export function PhotoGallery({ photos, restaurantName }: PhotoGalleryProps) {
  // Component implementation that directly uses the photo URLs
}
```

3. **Restaurant Page Integration**

```typescript
// src/pages/[country]/restaurant/[id].tsx
const imageComponent = useMemo(() => {
  if (restaurant?.photos && restaurant.photos.length > 0) {
    return <PhotoGallery photos={restaurant.photos} restaurantName={restaurant?.name || ''} />;
  }
  return null;
}, [restaurant?.name, restaurant?.photos]);
```

### Security Considerations

- The Google Maps API key is stored with the photo URLs in DynamoDB
- It's recommended to:
  1. Set appropriate restrictions on the Google Maps API key (HTTP referrers/domains)
  2. Consider implementing a server-side proxy if API key privacy becomes a concern

## Authentication and Configuration

### AWS Amplify Setup

The project uses AWS Amplify for authentication, which provides seamless integration with Amazon Cognito. The configuration is automatically generated:

```bash
# Generate Amplify configuration
npx ampx generate outputs --app-id dkyhafjo77aeo --branch staging
```

This creates `amplify_outputs.json` which contains all necessary AWS configurations.

### Development Environment

In development mode, API calls are routed through a proxy to handle CORS restrictions:

```typescript
// src/services/api.ts
private static getBaseUrl(): string {
  // Use local proxy in development to handle CORS
  if (process.env.APP_ENV === 'development') {
    return '/api/proxy';
  }
  return process.env.NEXT_PUBLIC_API_URL;
}
```

### Authentication Flow

All data fetching requires authentication through AWS Cognito. The flow is:

1. **Auth Context Setup**

```typescript
// src/contexts/AuthContext.tsx provides the authentication state
const { user, isAuthenticated } = useAuth();
```

2. **API Service Layer**

```typescript
// src/services/api.ts
export class ApiService {
  static async get<T>(endpoint: string): Promise<T> {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken.toString();

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }

    return response.json();
  }
}
```

3. **Protected Routes**

```typescript
// Example of a protected page component
export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  // ... rest of the component
}
```

### Authentication States

1. **Not Authenticated**

   - User is redirected to sign-in
   - API calls will fail with 401
   - `isAuthenticated` is false

2. **Authenticated**

   - JWT token is automatically included in requests
   - `isAuthenticated` is true
   - User object is available

3. **Token Refresh**
   - Handled automatically by Amplify
   - Transparent to the application code
   - Failed refreshes trigger sign-out

## How to Use Me

1. **Starting a New Feature**
   Tell me:

   - The data structure you need to fetch
   - The API endpoints available
   - Any special requirements (real-time updates, caching, etc.)
   - Whether you need a new specialized agent for your data type

2. **Implementing Data Flow**
   I'll help you:

   - Create the service layer
   - Set up React Query hooks
   - Implement display components

3. **Type Safety**
   I'll ensure:

   - All data interfaces are properly defined
   - Type safety across the data flow
   - Proper error typing

4. **Error Handling**
   I'll implement:
   - Consistent error handling patterns
   - Loading states
   - Empty states
   - Error boundaries where needed

## Example Usage

```typescript
// Tell me what you need:
"I need to implement a menu item feature with:
- GET /menu-items/{id}
- GET /menu-items with filters
- Real-time updates when items are modified"

// I'll help you create:
1. MenuItemService with appropriate methods
2. useMenuItem and useMenuItems hooks
3. MenuItemGrid and MenuItemDetail components
4. Real-time update functionality using React Query's invalidation
```

## Best Practices I Enforce

1. **Data Fetching**

   - Use React Query for caching and state management
   - Implement proper error handling
   - Handle loading states consistently

2. **Type Safety**

   - Define clear interfaces for all data structures
   - Use strict type checking
   - Avoid any type

3. **Performance**

   - Implement pagination
   - Use proper caching strategies
   - Optimize re-renders

4. **Code Organization**
   - Keep services in src/services
   - Keep hooks in src/hooks
   - Keep components focused and reusable

## Related Agents

- **UIPatternAgent**: For UI component patterns and styling
- **TestingAgent**: For implementing tests for data flow
- **SecurityAgent**: For handling authentication and authorization
- **StateManagementAgent**: For complex state management scenarios

## Need Help?

Ask me about:

1. Setting up a new data flow
2. Implementing specific API integrations
3. Handling complex data fetching scenarios
4. Optimizing existing data flows
5. Debugging data fetching issues

I'm here to ensure consistent and efficient data handling across the application!
