# Hooks Migration Plan

This document outlines the plan for migrating custom React hooks from the original Bellyfed codebase to the new structure.

## Hooks to Migrate

1. **useDebounce** ✅
   - Debounces a value to prevent excessive re-renders
   - Used in search inputs and other frequently changing values

2. **useToast**
   - Provides toast notification functionality
   - Used for displaying success, error, and info messages

3. **useAnalytics**
   - Tracks user interactions and page views
   - Integrates with analytics services

4. **useApi**
   - Provides a standardized way to make API requests
   - Handles error handling, loading states, and authentication

5. **useCognitoUser**
   - Manages Cognito user authentication state
   - Provides user profile information

6. **useDishVotes**
   - Manages dish voting functionality
   - Tracks user votes and updates UI accordingly

7. **useGeolocation**
   - Detects and manages user location
   - Provides coordinates for nearby restaurant searches

8. **useRestaurant**
   - Fetches and manages restaurant data
   - Provides restaurant details, menu items, and reviews

9. **useReviews**
   - Manages review submission and display
   - Provides review filtering and sorting

10. **useUser**
    - Manages user data and authentication state
    - Provides user profile information

11. **useUserProfile**
    - Manages user profile data
    - Provides profile editing functionality

12. **useUserRanking**
    - Manages user ranking data
    - Provides leaderboard information

## Implementation Strategy

1. **Start with Independent Hooks**
   - Begin with hooks that have minimal dependencies (useDebounce, useToast)
   - These can be implemented without relying on other packages

2. **Implement API-Related Hooks**
   - Once the API client package is created, implement hooks that depend on API calls
   - This includes useApi, useRestaurant, useReviews, etc.

3. **Implement Authentication Hooks**
   - After the authentication service is fully implemented, migrate authentication-related hooks
   - This includes useCognitoUser, useUser, useUserProfile

4. **Implement Feature-Specific Hooks**
   - Finally, implement hooks that are specific to certain features
   - This includes useDishVotes, useUserRanking, etc.

## TypeScript Conversion

All hooks should be implemented using TypeScript to ensure type safety and better developer experience. This includes:

- Proper type definitions for hook parameters and return values
- Generic types where appropriate (e.g., useDebounce<T>)
- JSDoc comments for better documentation

## Testing Strategy

Each hook should have comprehensive tests to ensure proper functionality:

- Unit tests for hook logic
- Integration tests for hooks that interact with external services
- Mock implementations for external dependencies

## Usage Examples

Each hook should include usage examples in the documentation to help developers understand how to use them correctly.
