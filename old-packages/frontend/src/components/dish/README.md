# Dish Ranking Components

This directory contains components for the One-Best Ranking System in the Bellyfed application.

## Components

### DishRanking

The `DishRanking` component allows users to rank dishes. It displays a ranking system with both numeric ranks (1-5) and taste status options (ACCEPTABLE, SECOND_CHANCE, DISSATISFIED). It also shows the current ranking statistics for the dish.

#### Props

| Prop           | Type   | Description                |
| -------------- | ------ | -------------------------- |
| dishId         | string | The ID of the dish         |
| dishName       | string | The name of the dish       |
| restaurantId   | string | The ID of the restaurant   |
| restaurantName | string | The name of the restaurant |
| dishType       | string | The type of the dish       |

#### Usage

```tsx
<DishRanking
  dishId={dishId}
  dishName={dishName}
  restaurantId={restaurantId}
  restaurantName={restaurantName}
  dishType={dishType}
/>
```

#### Features

- Numeric ranking system (1-5)
- Taste status options (ACCEPTABLE, SECOND_CHANCE, DISSATISFIED)
- Professional notes and photo requirements
- Ranking statistics display
- User ranking display
- Error handling for unauthenticated users
- Automatic demotion of previous #1 ranked dishes

#### Implementation Details

The component uses the `databaseService` to interact with the backend API. It retrieves ranking statistics when the component mounts and updates them when a user creates or updates a ranking.

The component also uses the `useAuth` hook to check if the user is authenticated before allowing them to create or update rankings.

The component enforces the One-Best Rule by automatically demoting previous #1 ranked dishes when a user assigns rank 1 to a new dish of the same type at the same restaurant.

## Hooks

### useDishRankings

The `useDishRankings` hook provides a convenient way to manage dish rankings in a component.

#### Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| dishId    | string | The ID of the dish |

#### Returns

| Property      | Type                                              | Description                                            |
| ------------- | ------------------------------------------------- | ------------------------------------------------------ |
| rankingStats  | RankingStats                                      | The ranking statistics for the dish                    |
| userRanking   | Ranking                                           | The user's ranking for the dish                        |
| isLoading     | boolean                                           | Whether the ranking data is loading                    |
| error         | Error                                             | Any error that occurred while loading the ranking data |
| createRanking | (params: CreateRankingParams) => Promise<boolean> | Function to create a ranking for the dish              |
| updateRanking | (params: UpdateRankingParams) => Promise<boolean> | Function to update a ranking for the dish              |

#### Usage

```tsx
const {
  rankingStats,
  userRanking,
  isLoading,
  error,
  createRanking,
  updateRanking,
} = useDishRankings(dishId);

// Create a ranking for the dish
await createRanking({
  restaurantId,
  dishType,
  rank: 1,
  tasteStatus: null,
  notes: 'This is the best dish I have ever had!',
  photoUrls: ['/images/photo1.jpg'],
});

// Update a ranking for the dish
await updateRanking({
  rankingId: userRanking.ranking_id,
  rank: 2,
  tasteStatus: null,
  notes: 'Updated notes about this dish.',
  photoUrls: ['/images/photo1.jpg', '/images/photo2.jpg'],
});
```

## Backend Integration

The dish ranking components integrate with the backend using the following services:

### databaseService

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
  photoUrls,
);

// Update a ranking
const response = await databaseService.updateRanking(
  rankingId,
  rank,
  tasteStatus,
  notes,
  photoUrls,
);

// For backward compatibility
const voteStats = await databaseService.getDishVotes(dishId); // Calls getDishRankings
await databaseService.voteDish(dishId, restaurantId, rating); // Calls createRanking
```

### postgresService

The `postgresService` provides methods for interacting with the PostgreSQL database directly.

```typescript
// Get dish rankings
const rankingStats = await postgresService.getDishRankings(dishId);

// Create a ranking
const response = await postgresService.createRanking({
  userId,
  dishId,
  restaurantId,
  dishType,
  rank,
  tasteStatus,
  notes,
  photoUrls,
  timestamp,
});

// Update a ranking
const response = await postgresService.updateRanking(rankingId, {
  rank,
  tasteStatus,
  notes,
  photoUrls,
  timestamp,
});

// For backward compatibility
const voteStats = await postgresService.getDishVotes(dishId); // Calls getDishRankings
await postgresService.voteDish(dishId, userId, restaurantId, rating); // Calls createRanking
```

## Environment Configuration

The dish ranking components support the following environments:

| Environment | API Endpoint                  |
| ----------- | ----------------------------- |
| dev         | https://api-dev.bellyfed.com  |
| test        | https://api-test.bellyfed.com |
| qa          | https://api-qa.bellyfed.com   |
| prod        | https://api.bellyfed.com      |

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

## API Endpoints

The following API endpoints are used for the One-Best Ranking System:

### Create Ranking

```
POST /rankings/create
```

### Update Ranking

```
PUT /rankings/update/{id}
```

### Get Dish Rankings

```
GET /dishes/{dishId}/rankings
```

### Get User Rankings

```
GET /rankings/user/{userId}
```

### Get Ranking History

```
GET /rankings/history/{userId}
```

### For Backward Compatibility

```
GET /db/dishes/{dishId}/votes
```

```
POST /db/dishes/{dishId}/vote
```

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure that the `NEXT_PUBLIC_API_KEY` environment variable is set in `.env.local`.
2. **Database Connection Issues**: Check the database connection string in the Lambda function environment variables.
3. **Authentication Issues**: Ensure that the user is authenticated before creating or updating rankings.
4. **Missing Required Fields**: Ensure that notes and photos are provided when creating or updating rankings.
5. **Rank or Taste Status Validation**: Ensure that either rank or taste status is provided, but not both.
6. **One-Best Rule Conflicts**: If a user already has a rank 1 dish for a specific dish type at a restaurant, creating another rank 1 dish will automatically demote the previous one.

### Debugging

1. **API Proxy Logs**: Check the API proxy logs in the browser console for detailed information about API requests and responses.
2. **Component State**: Use React DevTools to inspect the component state and props.
3. **Network Requests**: Use the browser's Network tab to inspect API requests and responses.
4. **Database Queries**: Check the database logs for detailed information about SQL queries and errors.
5. **Ranking History**: Check the ranking_history table for detailed information about ranking changes.
