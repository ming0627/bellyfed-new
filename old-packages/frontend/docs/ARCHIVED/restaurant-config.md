# Restaurant Configuration

This document outlines the configuration for restaurant-related data in the BellyFed application.

## Cuisine Types

The application supports the following cuisine types:

- Japanese
- Chinese
- Korean
- Thai
- Vietnamese
- Indian
- Italian
- French
- American
- Mexican
- Mediterranean
- Middle Eastern
- Vegetarian
- Seafood
- Fusion

These cuisine types are used for:

- Categorizing restaurants
- Filtering search results
- Analytics and reporting

## Price Ranges

Price ranges are represented using the following scale:

| Symbol | Description | Average Cost per Person |
| ------ | ----------- | ----------------------- |
| $      | Budget      | Under RM25              |
| $$     | Moderate    | RM25-RM50               |
| $$$    | Expensive   | RM51-RM100              |
| $$$$   | Luxury      | Over RM100              |

These price ranges are used for:

- Restaurant classification
- Search filtering
- User preferences

## Implementation Details

- The cuisine types and price ranges are defined as constant arrays in `src/config/restaurantConfig.ts`
- These values are used throughout the application to maintain consistency
- The types are enforced using TypeScript's const assertions and type unions
- Changes to these configurations should be coordinated with updates to:
  - Database schemas
  - API endpoints
  - UI components
  - Search functionality
