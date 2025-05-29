# One-Best Ranking System Database Schema

This document outlines the database schema for the One-Best Ranking System in the Bellyfed application.

## Overview

The One-Best Ranking System is the primary foundation of the Bellyfed platform. It serves as the core mechanism through which users can rank dishes at restaurants. The system follows these key principles:

1. **One-Best Rule**: Users can designate only ONE #1 ranking for each dish type at a restaurant
2. **Dynamic Evolution**: When a superior version is discovered, previous #1 is automatically demoted
3. **Restaurant-Specific Rankings**: Rankings are maintained at the restaurant and dish-type level
4. **Documentation Requirements**: Professional notes and photos required for rankings

## Database Schema

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

## Indexing Strategy

```sql
-- Users indexes
CREATE INDEX idx_users_cognito_id ON users(cognito_id);
CREATE INDEX idx_users_email ON users(email);

-- Restaurants indexes
CREATE INDEX idx_restaurants_location ON restaurants(city, state, country);
CREATE INDEX idx_restaurants_cuisine ON restaurants USING GIN (cuisine_type);
CREATE INDEX idx_restaurants_geo ON restaurants(latitude, longitude);

-- Dishes indexes
CREATE INDEX idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX idx_dishes_type ON dishes(dish_type);
CREATE INDEX idx_dishes_tags ON dishes USING GIN (tags);

-- Rankings indexes
CREATE INDEX idx_rankings_user ON dish_rankings(user_id);
CREATE INDEX idx_rankings_dish ON dish_rankings(dish_id);
CREATE INDEX idx_rankings_restaurant ON dish_rankings(restaurant_id);
CREATE INDEX idx_rankings_user_dish_type ON dish_rankings(user_id, dish_type);
CREATE INDEX idx_rankings_restaurant_dish_type ON dish_rankings(restaurant_id, dish_type);
CREATE INDEX idx_rankings_rank ON dish_rankings(rank);
CREATE INDEX idx_rankings_taste_status ON dish_rankings(taste_status);

-- Ranking history indexes
CREATE INDEX idx_ranking_history_ranking ON ranking_history(ranking_id);
CREATE INDEX idx_ranking_history_user ON ranking_history(user_id);
CREATE INDEX idx_ranking_history_dish ON ranking_history(dish_id);
CREATE INDEX idx_ranking_history_restaurant ON ranking_history(restaurant_id);
```

## Constraints and Rules

1. **Rank or Taste Status**: A ranking must have either a rank (1-5) or a taste status (ACCEPTABLE, SECOND_CHANCE, DISSATISFIED), but not both.
2. **Unique Rank**: A user can have only ONE dish with a specific rank for each dish type at a restaurant.
3. **Required Documentation**: All rankings require notes and at least one photo.
4. **History Tracking**: All ranking changes are tracked in the ranking_history table.

## Triggers

### Enforce One-Best Rule

```sql
CREATE OR REPLACE FUNCTION enforce_one_best_rule()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a rank 1 assignment
    IF NEW.rank = 1 THEN
        -- Find any existing rank 1 for the same user, dish type, and restaurant
        UPDATE dish_rankings
        SET rank = 2,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id
          AND dish_type = NEW.dish_type
          AND restaurant_id = NEW.restaurant_id
          AND rank = 1
          AND ranking_id != NEW.ranking_id;

        -- Record the demotion in history
        INSERT INTO ranking_history (
            history_id, ranking_id, user_id, dish_id, restaurant_id,
            dish_type, previous_rank, new_rank, notes, photo_urls, created_at
        )
        SELECT
            gen_random_uuid(), ranking_id, user_id, dish_id, restaurant_id,
            dish_type, 1, 2, notes, photo_urls, CURRENT_TIMESTAMP
        FROM dish_rankings
        WHERE user_id = NEW.user_id
          AND dish_type = NEW.dish_type
          AND restaurant_id = NEW.restaurant_id
          AND rank = 2
          AND ranking_id != NEW.ranking_id;
    END IF;

    -- Record the new ranking in history
    INSERT INTO ranking_history (
        history_id, ranking_id, user_id, dish_id, restaurant_id,
        dish_type, previous_rank, new_rank, previous_taste_status, new_taste_status,
        notes, photo_urls, created_at
    )
    VALUES (
        gen_random_uuid(), NEW.ranking_id, NEW.user_id, NEW.dish_id, NEW.restaurant_id,
        NEW.dish_type, OLD.rank, NEW.rank, OLD.taste_status, NEW.taste_status,
        NEW.notes, NEW.photo_urls, CURRENT_TIMESTAMP
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_one_best_rule
AFTER INSERT OR UPDATE ON dish_rankings
FOR EACH ROW
EXECUTE FUNCTION enforce_one_best_rule();
```

## Data Access Patterns

1. **Get User Rankings**

    ```sql
    SELECT * FROM dish_rankings
    WHERE user_id = :userId
    ORDER BY restaurant_id, dish_type, rank NULLS LAST;
    ```

2. **Get Restaurant Rankings**

    ```sql
    SELECT * FROM dish_rankings
    WHERE restaurant_id = :restaurantId
    ORDER BY dish_type, rank NULLS LAST;
    ```

3. **Get Top Dishes by Type**

    ```sql
    SELECT d.*, COUNT(dr.ranking_id) as total_rankings,
           AVG(dr.rank) as average_rank
    FROM dishes d
    JOIN dish_rankings dr ON d.dish_id = dr.dish_id
    WHERE d.dish_type = :dishType
    GROUP BY d.dish_id
    ORDER BY average_rank ASC, total_rankings DESC
    LIMIT 10;
    ```

4. **Get User Ranking History**

    ```sql
    SELECT * FROM ranking_history
    WHERE user_id = :userId
    ORDER BY created_at DESC;
    ```

5. **Get Dish Ranking History**
    ```sql
    SELECT * FROM ranking_history
    WHERE dish_id = :dishId
    ORDER BY created_at DESC;
    ```

## API Endpoints

1. **Create Ranking**

    ```
    POST /rankings/create
    ```

2. **Update Ranking**

    ```
    PUT /rankings/update/:id
    ```

3. **Get User Rankings**

    ```
    GET /rankings/user/:userId
    ```

4. **Get Restaurant Rankings**

    ```
    GET /rankings/restaurant/:restaurantId
    ```

5. **Get Ranking History**
    ```
    GET /rankings/history/:userId
    ```

## Implementation Notes

1. **Automatic Demotion**: When a user assigns rank 1 to a dish, any previous rank 1 dish of the same type is automatically demoted to rank 2.
2. **Validation**: The system validates that a user can have only ONE dish with a specific rank for each dish type at a restaurant.
3. **Documentation**: All rankings require notes and at least one photo for credibility.
4. **History Tracking**: All ranking changes are tracked in the ranking_history table for expertise verification.
