# Database Architecture for Bellyfed

## Overview

This document outlines the recommended database architecture for the Bellyfed platform. Based on the platform's requirements, we recommend a hybrid approach:

1. **Primary Database**: Amazon Aurora PostgreSQL for core relational data
2. **Performance Layer**: Amazon DynamoDB for specific high-throughput components

## Why This Hybrid Approach?

### Amazon Aurora PostgreSQL Benefits

- Strong support for complex relationships between entities (users, restaurants, dishes, rankings)
- Robust transaction support for maintaining data integrity in the ranking system
- Advanced querying capabilities for complex analytics and reporting
- ACID compliance for critical user operations
- Support for complex constraints needed for the professional progression system
- Up to 3x performance improvement over standard PostgreSQL RDS
- High availability with 6-way replication across 3 Availability Zones
- Automated storage scaling without downtime (up to 128TB)
- Fast database recovery after crashes (typically less than 30 seconds)
- Cost-effective with pay-only-for-what-you-use pricing model
- Seamless PostgreSQL compatibility with support for the latest versions

### DynamoDB Benefits

- High throughput for specific read-heavy scenarios (like leaderboards)
- Seamless scaling for certain components that need massive scale
- Low-latency access for global deployment requirements
- Pay-for-what-you-use pricing model for cost optimization

## Core Schema Design (PostgreSQL)

### Users Table

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),
    career_level_id INTEGER REFERENCES career_levels(career_level_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Restaurants Table

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

### Dishes Table

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

### Dish Rankings Table (One-Best System)

```sql
CREATE TABLE dish_rankings (
    ranking_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    dish_id UUID REFERENCES dishes(dish_id),
    dish_type VARCHAR(100) NOT NULL,
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    rank INTEGER NOT NULL CHECK (rank > 0),
    notes TEXT,
    photo_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, dish_type, restaurant_id, rank)
);
```

### Career Levels Table

```sql
CREATE TABLE career_levels (
    career_level_id SERIAL PRIMARY KEY,
    level_name VARCHAR(100) NOT NULL,
    description TEXT,
    required_points INTEGER,
    required_badges VARCHAR(50)[],
    icon_url VARCHAR(255),
    benefits TEXT[]
);
```

### Badges Table

```sql
CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    requirements JSONB,
    icon_url VARCHAR(255)
);
```

### User Badges Table

```sql
CREATE TABLE user_badges (
    user_badge_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    badge_id INTEGER REFERENCES badges(badge_id),
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress JSONB,
    is_featured BOOLEAN DEFAULT FALSE
);
```

### User Activity Points Table

```sql
CREATE TABLE user_activity_points (
    activity_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    activity_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    reference_id UUID,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);
```

### Follows Table

```sql
CREATE TABLE follows (
    follow_id UUID PRIMARY KEY,
    follower_id UUID REFERENCES users(user_id),
    followed_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, followed_id)
);
```

### Reviews Table

```sql
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    dish_id UUID REFERENCES dishes(dish_id),
    content TEXT,
    photos VARCHAR(255)[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Comments Table

```sql
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    review_id UUID REFERENCES reviews(review_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## DynamoDB Tables (Performance Layer)

### User Popularity Table

```
Table Name: BellyfedUserPopularity

Primary Key:
- Partition Key: user_id (String)

Attributes:
- follower_count (Number)
- ranking_count (Number)
- review_count (Number)
- influence_score (Number)
- last_updated (String - ISO date)
```

### Trending Dishes Table

```
Table Name: BellyfedTrendingDishes

Primary Key:
- Partition Key: location_id (String - city or region)
- Sort Key: dish_type#timestamp (String - composite key)

Attributes:
- dish_id (String)
- restaurant_id (String)
- dish_name (String)
- restaurant_name (String)
- ranking_count (Number)
- trending_score (Number)
- image_url (String)
```

### Leaderboards Table

```
Table Name: BellyfedLeaderboards

Primary Key:
- Partition Key: leaderboard_type (String - e.g., "city#cuisine_type")
- Sort Key: rank (Number)

Attributes:
- entity_id (String - user_id, restaurant_id, or dish_id)
- entity_name (String)
- score (Number)
- last_updated (String - ISO date)
```

## Indexing Strategy

### PostgreSQL Indexes

```sql
-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_career_level ON users(career_level_id);

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
CREATE INDEX idx_rankings_user_dish_type ON dish_rankings(user_id, dish_type);
CREATE INDEX idx_rankings_restaurant_dish_type ON dish_rankings(restaurant_id, dish_type);
```

### DynamoDB Indexes

#### User Popularity GSI

```
GSI Name: InfluenceScoreIndex
Partition Key: "ALL" (constant string)
Sort Key: influence_score (Number)
Projected Attributes: ALL
```

#### Trending Dishes GSI

```
GSI Name: TrendingScoreIndex
Partition Key: location_id (String)
Sort Key: trending_score (Number)
Projected Attributes: ALL
```

## Data Access Patterns

1. **Find Best Dishes by Type in a Location**

    - PostgreSQL query joining restaurants, dishes, and rankings

2. **User Profile with Badges and Career Level**

    - PostgreSQL query joining users, user_badges, and career_levels

3. **Real-time Trending Dishes**

    - DynamoDB query on TrendingScoreIndex

4. **User Activity Feed**

    - PostgreSQL function combining recent rankings, reviews, and comments

5. **Expert Discovery**
    - DynamoDB query on InfluenceScoreIndex + PostgreSQL join for details

## Database Migration Strategy

1. **Initial Setup**

    - Deploy Amazon Aurora PostgreSQL cluster
    - Create schema and initial tables
    - Set up DynamoDB tables

2. **Data Synchronization**

    - Implement AWS Lambda functions for keeping DynamoDB in sync with PostgreSQL
    - Use DynamoDB Streams for event-driven updates

3. **Monitoring and Optimization**
    - Set up CloudWatch metrics for both database systems
    - Implement automated scaling policies
    - Regular performance reviews and optimization

## Conclusion

This hybrid database architecture provides Bellyfed with the best of both worlds:

- Strong relational capabilities for complex data relationships
- High performance for specific high-throughput scenarios
- Scalability for future growth
- Cost optimization through the right tool for each job

As the platform grows, regularly review the database performance and consider further optimizations or additional specialized data stores for specific use cases.
