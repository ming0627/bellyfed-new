# Services Migration Plan

This document outlines the plan for migrating service modules from the original Bellyfed codebase to the new structure.

## Services to Migrate

1. **Authentication Services** ✅
   - **cognitoAuthService** ✅: Handles authentication with AWS Cognito
   - **serverAuth**: Server-side authentication utilities

2. **API Services**
   - **api**: Core API client for backend communication
   - **apiConfig**: API configuration utilities

3. **Data Services**
   - **databaseService**: Database interaction utilities
   - **postgresService**: PostgreSQL database interaction
   - **mockDataService**: Mock data generation for development

4. **User Services**
   - **userService**: User account management
   - **userProfileService**: User profile management
   - **rankingService**: User and restaurant ranking functionality

5. **Content Services**
   - **restaurantService**: Restaurant data management
   - **reviewService**: Review submission and management
   - **photoUploadService**: Image upload and processing

6. **Integration Services**
   - **googleMapsService**: Google Maps integration
   - **googlePlaces**: Google Places API integration
   - **social-media-service**: Social media integration
   - **analyticsService**: Analytics tracking and reporting

## Implementation Strategy

1. **Start with Core Services**
   - Begin with authentication services (cognitoAuthService)
   - These are critical for the application to function properly

2. **Implement API Services**
   - Create the core API client and configuration utilities
   - These are needed for most other services to function

3. **Implement Data Services**
   - Create database interaction utilities
   - These are needed for data persistence

4. **Implement User Services**
   - Create user account and profile management services
   - These are needed for user-specific functionality

5. **Implement Content Services**
   - Create restaurant, review, and photo upload services
   - These are needed for content management

6. **Implement Integration Services**
   - Create integration services for third-party APIs
   - These enhance the application with external functionality

## TypeScript Conversion

All services should be implemented using TypeScript to ensure type safety and better developer experience. This includes:

- Proper type definitions for service parameters and return values
- Interface definitions for service objects
- JSDoc comments for better documentation

## Testing Strategy

Each service should have comprehensive tests to ensure proper functionality:

- Unit tests for service logic
- Integration tests for services that interact with external APIs
- Mock implementations for external dependencies

## Usage Examples

Each service should include usage examples in the documentation to help developers understand how to use them correctly.
