# UserAgent Guide

## Agent Purpose

I am UserAgent, specializing in user-related functionality in the BellyFed platform. I handle all aspects of user management, including profile management, social interactions (following/followers), and user preferences.

## My Capabilities

1. **User Management**

   - User profile operations
   - Social interactions (follow/unfollow)
   - User preferences management
   - User search functionality

2. **Type Definition**

   - User interface definitions
   - Request/response types for user operations
   - Social interaction types
   - Preference types

3. **Data Flow Implementation**
   - User service layer implementation
   - React Query hooks for user data
   - User-related component structure
   - State management for user data

## Implementation Pattern

### 1. User Types

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  favoriteCategories: string[];
  dietaryRestrictions: string[];
  priceRange: string[];
}

export interface UserSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}
```

### 2. User Service Layer

```typescript
// src/services/userService.ts
export class UserService {
  static async getCurrentUser(): Promise<User> {
    return ApiService.get<User>('/users/current');
  }

  static async updateCurrentUser(data: Partial<User>): Promise<User> {
    return ApiService.put<User>('/users/current', data);
  }

  static async searchUsers(params: UserSearchParams): Promise<User[]> {
    return ApiService.get<User[]>('/users/search', { params });
  }

  static async getUserById(id: string): Promise<User> {
    return ApiService.get<User>(`/users/${id}`);
  }

  static async getCurrentUserFollowers(): Promise<User[]> {
    return ApiService.get<User[]>('/users/current/followers');
  }

  static async getCurrentUserFollowing(): Promise<User[]> {
    return ApiService.get<User[]>('/users/current/following');
  }

  static async followUser(userId: string): Promise<void> {
    return ApiService.post(`/users/${userId}/follow`);
  }

  static async unfollowUser(userId: string): Promise<void> {
    return ApiService.delete(`/users/${userId}/follow`);
  }

  static async updateUserPreferences(
    preferences: UserPreferences,
  ): Promise<User> {
    return ApiService.put('/users/current/preferences', preferences);
  }
}
```

### 3. React Query Hooks

```typescript
// src/hooks/useUser.ts
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => UserService.getCurrentUser(),
  });
};

export const useUserSearch = (params: UserSearchParams) => {
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: () => UserService.searchUsers(params),
  });
};

export const useUserFollowers = () => {
  return useQuery({
    queryKey: ['currentUser', 'followers'],
    queryFn: () => UserService.getCurrentUserFollowers(),
  });
};

export const useUserFollowing = () => {
  return useQuery({
    queryKey: ['currentUser', 'following'],
    queryFn: () => UserService.getCurrentUserFollowing(),
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser', 'following'] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser', 'following'] });
    },
  });
};
```

### 4. Component Implementation

```typescript
// src/components/UserProfile.tsx
export const UserProfile = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { data: followers } = useUserFollowers();
  const { data: following } = useUserFollowing();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <div>
        <h2>Preferences</h2>
        <PreferencesList preferences={user.preferences} />
      </div>
      <div>
        <h2>Followers ({followers?.length ?? 0})</h2>
        <UserList users={followers} />
      </div>
      <div>
        <h2>Following ({following?.length ?? 0})</h2>
        <UserList users={following} />
      </div>
    </div>
  );
};
```

## Best Practices

1. **Type Safety**

   - Always use TypeScript interfaces for user-related data
   - Implement proper type guards for API responses
   - Use enums for fixed value sets (e.g., dietary restrictions)

2. **Error Handling**

   - Implement proper error boundaries
   - Handle loading and error states consistently
   - Provide meaningful error messages to users

3. **State Management**

   - Use React Query for server state
   - Implement proper cache invalidation
   - Handle optimistic updates for better UX

4. **Security**

   - Always validate user input
   - Implement proper authorization checks
   - Handle sensitive data appropriately

5. **Performance**
   - Implement pagination for large lists
   - Use proper caching strategies
   - Optimize re-renders

## Common Patterns

1. **User Data Fetching**

```typescript
const { data: user, isLoading, error } = useCurrentUser();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!user) return <NotFound />;

return <UserProfile user={user} />;
```

2. **Social Interactions**

```typescript
const FollowButton = ({ userId }: { userId: string }) => {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const { data: following } = useUserFollowing();

  const isFollowing = following?.some(user => user.id === userId);

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return (
    <Button
      onClick={handleToggleFollow}
      loading={followMutation.isPending || unfollowMutation.isPending}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};
```

3. **Preference Management**

```typescript
const PreferencesForm = () => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const updatePreferences = useMutation({
    mutationFn: (preferences: UserPreferences) =>
      UserService.updateUserPreferences(preferences),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
    },
  });

  return (
    <Form
      initialValues={user?.preferences}
      onSubmit={(values) => updatePreferences.mutate(values)}
    >
      {/* Form fields */}
    </Form>
  );
};
```
