# One-Best Ranking System Integration

This document outlines the integration between the Bellyfed frontend application and the backend infrastructure for the One-Best Ranking System.

## Overview

The One-Best Ranking System is the primary foundation of the Bellyfed platform. It allows users to rank dishes at restaurants following these key principles:

1. **One-Best Rule**: Users can designate only ONE #1 ranking for each dish type at a restaurant
2. **Dynamic Evolution**: When a superior version is discovered, previous #1 is automatically demoted
3. **Restaurant-Specific Rankings**: Rankings are maintained at the restaurant and dish-type level
4. **Documentation Requirements**: Professional notes and photos required for rankings

This functionality is implemented using the following components:

1. **Frontend Components**: React components for displaying and interacting with dish voting
2. **API Services**: Services for communicating with the backend API
3. **Database Services**: Services for storing and retrieving dish voting data
4. **Backend Infrastructure**: AWS Lambda functions and Aurora PostgreSQL database for storing dish voting data

## Environment Configuration

The Bellyfed application supports the following environments:

| Environment | API Endpoint                  | Description             |
| ----------- | ----------------------------- | ----------------------- |
| dev         | https://api-dev.bellyfed.com  | Development environment |
| test        | https://api-test.bellyfed.com | Testing environment     |
| qa          | https://api-qa.bellyfed.com   | QA environment          |
| prod        | https://api.bellyfed.com      | Production environment  |

The environment is configured using the `API_ENV` environment variable in `.env.local`. If not specified, it defaults to `dev`.

## Database Schema

The database schema for the One-Best Ranking System uses the following tables:

### dish_rankings

Stores user rankings for dishes.

```sql
CREATE TABLE dish_rankings (
    ranking_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    dish_id UUID REFERENCES dishes(dish_id),
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    dish_type VARCHAR(100) NOT NULL,
    rank INTEGER CHECK (rank BETWEEN 1 AND 5 OR rank IS NULL),
    taste_status VARCHAR(20) CHECK (
        taste_status IN ('ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED') OR
        taste_status IS NULL
    ),
    notes TEXT NOT NULL,
    photo_urls TEXT[] NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rank_or_taste_status CHECK (
        (rank IS NOT NULL AND taste_status IS NULL) OR
        (rank IS NULL AND taste_status IS NOT NULL)
    ),
    CONSTRAINT unique_user_dish_type_restaurant_rank CHECK (
        rank IS NULL OR
        NOT EXISTS (
            SELECT 1 FROM dish_rankings dr
            WHERE dr.user_id = user_id
            AND dr.dish_type = dish_type
            AND dr.restaurant_id = restaurant_id
            AND dr.rank = rank
            AND dr.ranking_id != ranking_id
        )
    )
);
```

### ranking_history

Tracks all ranking changes for expertise verification.

```sql
CREATE TABLE ranking_history (
    history_id UUID PRIMARY KEY,
    ranking_id UUID REFERENCES dish_rankings(ranking_id),
    user_id UUID REFERENCES users(user_id),
    dish_id UUID REFERENCES dishes(dish_id),
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    dish_type VARCHAR(100) NOT NULL,
    previous_rank INTEGER,
    new_rank INTEGER,
    previous_taste_status VARCHAR(20),
    new_taste_status VARCHAR(20),
    notes TEXT NOT NULL,
    photo_urls TEXT[] NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### dishes

Stores dish information.

```sql
CREATE TABLE dishes (
    dish_id UUID PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url VARCHAR(255),
    dish_type VARCHAR(100) NOT NULL,
    tags VARCHAR(50)[],
    is_seasonal BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### dish_types

Categorizes dishes.

```sql
CREATE TABLE dish_types (
    dish_type_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_type_id UUID REFERENCES dish_types(dish_type_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### restaurants

Stores restaurant information.

```sql
CREATE TABLE restaurants (
    restaurant_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    website VARCHAR(255),
    hours JSONB,
    cuisine_type VARCHAR(100)[],
    price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### users

Stores user information.

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    cognito_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

The following API endpoints are used for the One-Best Ranking System:

### Create Ranking

```
POST /rankings/create
```

Creates a new ranking for a dish.

**Request Body:**

```json
{
    "userId": "user123",
    "dishId": "dish123",
    "restaurantId": "restaurant123",
    "dishType": "Malaysian",
    "rank": 1,
    "tasteStatus": null,
    "notes": "This is the best Nasi Lemak I have ever had!",
    "photoUrls": ["/images/photo1.jpg", "/images/photo2.jpg"],
    "timestamp": "2023-04-13T12:34:56.789Z"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Ranking created successfully",
    "rankingId": "ranking123",
    "dishId": "dish123",
    "totalRankings": 10,
    "averageRank": 2.5,
    "ranks": {
        "1": 2,
        "2": 3,
        "3": 3,
        "4": 1,
        "5": 1
    },
    "tasteStatuses": {
        "ACCEPTABLE": 5,
        "SECOND_CHANCE": 2,
        "DISSATISFIED": 1
    }
}
```

### Update Ranking

```
PUT /rankings/update/{id}
```

Updates an existing ranking.

**Request Body:**

```json
{
    "rank": 2,
    "tasteStatus": null,
    "notes": "Updated notes about this dish.",
    "photoUrls": ["/images/photo1.jpg", "/images/photo2.jpg"],
    "timestamp": "2023-04-13T12:34:56.789Z"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Ranking updated successfully",
    "rankingId": "ranking123",
    "dishId": "dish123",
    "totalRankings": 10,
    "averageRank": 2.6,
    "ranks": {
        "1": 1,
        "2": 4,
        "3": 3,
        "4": 1,
        "5": 1
    },
    "tasteStatuses": {
        "ACCEPTABLE": 5,
        "SECOND_CHANCE": 2,
        "DISSATISFIED": 1
    }
}
```

### Get Dish Rankings

```
GET /dishes/{dishId}/rankings
```

Returns ranking statistics for a specific dish.

**Response:**

```json
{
    "dishId": "dish123",
    "dish": {
        "dish_id": "dish123",
        "name": "Nasi Lemak Special",
        "description": "Fragrant coconut rice served with spicy sambal",
        "dish_type": "Malaysian",
        "restaurant_id": "restaurant123"
    },
    "totalRankings": 10,
    "averageRank": 2.6,
    "ranks": {
        "1": 1,
        "2": 4,
        "3": 3,
        "4": 1,
        "5": 1
    },
    "tasteStatuses": {
        "ACCEPTABLE": 5,
        "SECOND_CHANCE": 2,
        "DISSATISFIED": 1
    },
    "topRankings": [
        {
            "ranking_id": "ranking123",
            "user_id": "user123",
            "user_name": "John Doe",
            "dish_id": "dish123",
            "restaurant_id": "restaurant123",
            "dish_type": "Malaysian",
            "rank": 1,
            "taste_status": null,
            "notes": "This is the best Nasi Lemak I have ever had!",
            "photo_urls": ["/images/photo1.jpg", "/images/photo2.jpg"],
            "created_at": "2023-04-13T12:34:56.789Z",
            "updated_at": "2023-04-13T12:34:56.789Z"
        }
    ],
    "tasteStatusRankings": [
        {
            "ranking_id": "ranking456",
            "user_id": "user456",
            "user_name": "Jane Smith",
            "dish_id": "dish123",
            "restaurant_id": "restaurant123",
            "dish_type": "Malaysian",
            "rank": null,
            "taste_status": "ACCEPTABLE",
            "notes": "Good dish, meets professional standards.",
            "photo_urls": ["/images/photo3.jpg"],
            "created_at": "2023-04-13T12:34:56.789Z",
            "updated_at": "2023-04-13T12:34:56.789Z"
        }
    ]
}
```

### Get User Rankings

```
GET /rankings/user/{userId}
```

Returns rankings for a specific user.

**Response:**

```json
{
    "userId": "user123",
    "user": {
        "user_id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-04-13T12:34:56.789Z"
    },
    "totalRankings": 5,
    "rankCounts": {
        "1": 2,
        "2": 1,
        "3": 1,
        "4": 0,
        "5": 1
    },
    "tasteStatusCounts": {
        "ACCEPTABLE": 3,
        "SECOND_CHANCE": 1,
        "DISSATISFIED": 0
    },
    "rankings": [
        {
            "ranking_id": "ranking123",
            "user_id": "user123",
            "dish_id": "dish123",
            "restaurant_id": "restaurant123",
            "dish_type": "Malaysian",
            "rank": 1,
            "taste_status": null,
            "notes": "This is the best Nasi Lemak I have ever had!",
            "photo_urls": ["/images/photo1.jpg", "/images/photo2.jpg"],
            "created_at": "2023-04-13T12:34:56.789Z",
            "updated_at": "2023-04-13T12:34:56.789Z",
            "dish_name": "Nasi Lemak Special",
            "restaurant_name": "Village Park Restaurant"
        }
    ],
    "topRankings": [
        {
            "ranking_id": "ranking123",
            "user_id": "user123",
            "dish_id": "dish123",
            "restaurant_id": "restaurant123",
            "dish_type": "Malaysian",
            "rank": 1,
            "taste_status": null,
            "notes": "This is the best Nasi Lemak I have ever had!",
            "photo_urls": ["/images/photo1.jpg", "/images/photo2.jpg"],
            "created_at": "2023-04-13T12:34:56.789Z",
            "updated_at": "2023-04-13T12:34:56.789Z",
            "dish_name": "Nasi Lemak Special",
            "restaurant_name": "Village Park Restaurant"
        }
    ]
}
```

### Get Ranking History

```
GET /rankings/history/{userId}
```

Returns ranking history for a specific user.

**Response:**

```json
{
    "userId": "user123",
    "history": [
        {
            "history_id": "history123",
            "ranking_id": "ranking123",
            "user_id": "user123",
            "dish_id": "dish123",
            "restaurant_id": "restaurant123",
            "dish_type": "Malaysian",
            "previous_rank": 2,
            "new_rank": 1,
            "previous_taste_status": null,
            "new_taste_status": null,
            "notes": "This is the best Nasi Lemak I have ever had!",
            "photo_urls": ["/images/photo1.jpg", "/images/photo2.jpg"],
            "created_at": "2023-04-13T12:34:56.789Z",
            "dish_name": "Nasi Lemak Special",
            "restaurant_name": "Village Park Restaurant"
        }
    ]
}
```

## Frontend Implementation

The frontend implementation consists of the following components:

### DishRanking Component

The `DishRanking` component allows users to rank dishes. It displays a ranking system with both numeric ranks (1-5) and taste status options (ACCEPTABLE, SECOND_CHANCE, DISSATISFIED). It also shows the current ranking statistics for the dish.

```tsx
<DishRanking
    dishId={dishId}
    dishName={dishName}
    restaurantId={restaurantId}
    restaurantName={restaurantName}
    dishType={dishType}
/>
```

### TopRankedDishes Component

The `TopRankedDishes` component displays a list of top-ranked dishes on the homepage.

```tsx
<TopRankedDishes />
```

### UserRankings Component

The `UserRankings` component displays a user's rankings.

```tsx
<UserRankings userId={userId} />
```

### Database Service

The `databaseService` provides methods for interacting with the database API.

```typescript
// Get dish rankings
const rankingStats = await databaseService.getDishRankings(dishId);

// Create a ranking
const response = await databaseService.createRanking(
    dishId,
    restaurantId,
    dishType,
    rank, // 1-5 or null
    tasteStatus, // 'ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED' or null
    notes,
    photoUrls
);

// Update a ranking
const response = await databaseService.updateRanking(
    rankingId,
    rank,
    tasteStatus,
    notes,
    photoUrls
);

// Get top dishes
const topDishes = await databaseService.getTopDishes(5);

// Get user rankings
const userRankings = await databaseService.getUserRankings(userId);

// For backward compatibility
const voteStats = await databaseService.getDishVotes(dishId); // Calls getDishRankings
await databaseService.voteDish(dishId, restaurantId, rating); // Calls createRanking
```

## Backend Implementation

The backend implementation consists of the following components:

### API Gateway

The API Gateway routes requests to the appropriate Lambda functions.

### Lambda Functions

Lambda functions handle the business logic for dish voting.

### Aurora PostgreSQL

Aurora PostgreSQL stores the dish voting data.

## Development Workflow

1. **Local Development**: During local development, the application uses local API endpoints first, then falls back to the dev environment.
2. **Testing**: After local development, changes are deployed to the test environment for testing.
3. **QA**: After testing, changes are deployed to the QA environment for quality assurance.
4. **Production**: After QA, changes are deployed to the production environment.

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure that the `NEXT_PUBLIC_API_KEY` environment variable is set in `.env.local`.
2. **Database Connection Issues**: Check the database connection string in the Lambda function environment variables.
3. **Authentication Issues**: Ensure that the user is authenticated before voting.

### Debugging

1. **API Proxy Logs**: Check the API proxy logs in the browser console for detailed information about API requests and responses.
2. **Lambda Logs**: Check the Lambda logs in AWS CloudWatch for detailed information about backend errors.
3. **Database Logs**: Check the Aurora PostgreSQL logs for detailed information about database errors.

## Future Improvements

1. **Performance Optimization**: Optimize database queries for better performance.
2. **Error Handling**: Improve error handling and user feedback for database operations.
3. **User Experience**: Enhance the user interface for dish voting.
4. **Analytics**: Implement analytics to track voting patterns and popular dishes.
