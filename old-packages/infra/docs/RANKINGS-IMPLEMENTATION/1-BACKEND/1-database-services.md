# 1. Database Services Implementation

This document outlines the implementation plan for the database services required for the Rankings feature.

## Overview

The database services will handle all interactions with the database for the Rankings feature, including:

- CRUD operations for dishes
- CRUD operations for user rankings
- Storage and retrieval of ranking photos metadata

## Database Schema

The following tables need to be created:

### Dishes Table

```sql
CREATE TABLE dishes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  restaurant_id VARCHAR(36) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  spicy_level INT DEFAULT 0,
  price DECIMAL(10, 2),
  country_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (slug, country_code),
  INDEX (restaurant_id),
  INDEX (category),
  INDEX (country_code)
);
```

### User Rankings Table

```sql
CREATE TABLE user_rankings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  rank INT,
  taste_status ENUM('ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, dish_id),
  INDEX (user_id),
  INDEX (dish_id),
  INDEX (restaurant_id),
  INDEX (rank),
  INDEX (taste_status),
  CONSTRAINT check_ranking_type CHECK (
    (rank IS NOT NULL AND taste_status IS NULL) OR
    (rank IS NULL AND taste_status IS NOT NULL)
  )
);
```

### Ranking Photos Table

```sql
CREATE TABLE ranking_photos (
  id VARCHAR(36) PRIMARY KEY,
  ranking_id VARCHAR(36) NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (ranking_id),
  FOREIGN KEY (ranking_id) REFERENCES user_rankings(id) ON DELETE CASCADE
);
```

## Implementation Tasks

### 1. Database Connection Utility

- [ ] Create a database connection utility
    - File: `src/lib/db.ts`
    - Implement connection pooling
    - Add error handling and retries
    - Create query helper functions

### 2. Dish Service

- [ ] Create dish service
    - File: `src/services/dishService.ts`
    - Implement the following functions:
        - `getDishes(filters, pagination)`: Get dishes with filtering and pagination
        - `getDishById(id)`: Get a dish by ID
        - `getDishBySlug(slug)`: Get a dish by slug
        - `createDish(dishData)`: Create a new dish (admin only)
        - `updateDish(id, dishData)`: Update a dish (admin only)
        - `deleteDish(id)`: Delete a dish (admin only)

### 3. Ranking Service

- [ ] Create ranking service
    - File: `src/services/rankingService.ts`
    - Implement the following functions:
        - `getUserRankings(userId, filters)`: Get all rankings for a user
        - `getUserRankingForDish(userId, dishId)`: Get user's ranking for a specific dish
        - `createRanking(rankingData)`: Create a new ranking
        - `updateRanking(id, rankingData)`: Update an existing ranking
        - `deleteRanking(id)`: Delete a ranking
        - `getLocalRankings(dishId, countryCode)`: Get local rankings for a dish
        - `getGlobalRankings(dishId)`: Get global rankings for a dish

### 4. Ranking Photos Service

- [ ] Create ranking photos service
    - File: `src/services/rankingPhotosService.ts`
    - Implement the following functions:
        - `addPhotoToRanking(rankingId, photoUrl)`: Add a photo URL to a ranking
        - `removePhotoFromRanking(photoId)`: Remove a photo from a ranking
        - `getPhotosForRanking(rankingId)`: Get all photos for a ranking

## Data Models

### Dish Model

```typescript
interface Dish {
    id: string;
    name: string;
    slug: string;
    description?: string;
    restaurantId: string;
    restaurantName: string;
    category?: string;
    imageUrl?: string;
    isVegetarian: boolean;
    spicyLevel: number;
    price?: number;
    countryCode?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### User Ranking Model

```typescript
interface UserRanking {
    id: string;
    userId: string;
    dishId: string;
    restaurantId: string;
    dishType?: string;
    rank?: number; // 1-5, with 1 being the best
    tasteStatus?: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    photos?: RankingPhoto[];
}
```

### Ranking Photo Model

```typescript
interface RankingPhoto {
    id: string;
    rankingId: string;
    photoUrl: string;
    createdAt: Date;
}
```

## Testing

- [ ] Write unit tests for each service
    - Test CRUD operations
    - Test error handling
    - Test edge cases

## Dependencies

- Aurora PostgreSQL database
- Database migration script

## Estimated Time

- Database Connection Utility: 0.5 day
- Dish Service: 1 day
- Ranking Service: 1.5 days
- Ranking Photos Service: 1 day
- Testing: 1 day

Total: 5 days
