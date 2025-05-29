# Database Schema Design

This document provides a detailed explanation of the database schema design for the rankings feature.

## Overview

The rankings feature requires three main tables:

1. `dishes` - Stores information about dishes
2. `user_rankings` - Stores user rankings for dishes
3. `ranking_photos` - Stores photos associated with rankings

## Tables

### Dishes Table

The `dishes` table stores information about dishes that can be ranked.

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

#### Fields

| Field           | Type           | Description                                     |
| --------------- | -------------- | ----------------------------------------------- |
| id              | VARCHAR(36)    | Primary key, UUID                               |
| name            | VARCHAR(255)   | Name of the dish                                |
| slug            | VARCHAR(255)   | URL-friendly version of the name                |
| description     | TEXT           | Description of the dish                         |
| restaurant_id   | VARCHAR(36)    | ID of the restaurant where the dish is served   |
| restaurant_name | VARCHAR(255)   | Name of the restaurant                          |
| category        | VARCHAR(100)   | Category of the dish (e.g., Malaysian, Italian) |
| image_url       | TEXT           | URL to an image of the dish                     |
| is_vegetarian   | BOOLEAN        | Whether the dish is vegetarian                  |
| spicy_level     | INT            | Spiciness level (0-5)                           |
| price           | DECIMAL(10, 2) | Price of the dish                               |
| country_code    | VARCHAR(10)    | Country code where the dish is from             |
| created_at      | TIMESTAMP      | When the dish was created                       |
| updated_at      | TIMESTAMP      | When the dish was last updated                  |

#### Indexes

- Primary Key: `id`
- Unique Key: `(slug, country_code)` - Ensures unique slugs per country
- Index: `restaurant_id` - For efficient queries by restaurant
- Index: `category` - For efficient queries by category
- Index: `country_code` - For efficient queries by country

### User Rankings Table

The `user_rankings` table stores user rankings for dishes.

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

#### Fields

| Field         | Type         | Description                                            |
| ------------- | ------------ | ------------------------------------------------------ |
| id            | VARCHAR(36)  | Primary key, UUID                                      |
| user_id       | VARCHAR(36)  | ID of the user who created the ranking                 |
| dish_id       | VARCHAR(36)  | ID of the dish being ranked                            |
| restaurant_id | VARCHAR(36)  | ID of the restaurant where the dish was eaten          |
| dish_type     | VARCHAR(100) | Type of the dish                                       |
| rank          | INT          | Numerical rank (1-5, with 1 being the best)            |
| taste_status  | ENUM         | Taste status (ACCEPTABLE, SECOND_CHANCE, DISSATISFIED) |
| notes         | TEXT         | User's notes about the dish                            |
| created_at    | TIMESTAMP    | When the ranking was created                           |
| updated_at    | TIMESTAMP    | When the ranking was last updated                      |

#### Indexes

- Primary Key: `id`
- Unique Key: `(user_id, dish_id)` - A user can only rank a dish once
- Index: `user_id` - For efficient queries by user
- Index: `dish_id` - For efficient queries by dish
- Index: `restaurant_id` - For efficient queries by restaurant
- Index: `rank` - For efficient queries by rank
- Index: `taste_status` - For efficient queries by taste status

#### Constraints

- `check_ranking_type` - Ensures that either `rank` or `taste_status` is provided, but not both

### Ranking Photos Table

The `ranking_photos` table stores photos associated with rankings.

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

#### Fields

| Field      | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| id         | VARCHAR(36) | Primary key, UUID                      |
| ranking_id | VARCHAR(36) | ID of the ranking the photo belongs to |
| photo_url  | TEXT        | URL to the photo                       |
| created_at | TIMESTAMP   | When the photo was added               |

#### Indexes

- Primary Key: `id`
- Index: `ranking_id` - For efficient queries by ranking

#### Foreign Keys

- `ranking_id` references `user_rankings(id)` - Ensures that photos are associated with valid rankings
- `ON DELETE CASCADE` - Automatically deletes photos when the associated ranking is deleted

## Relationships

### One-to-Many: User to Rankings

A user can have many rankings, but each ranking belongs to only one user.

```
users (1) --- (*) user_rankings
```

### One-to-Many: Dish to Rankings

A dish can have many rankings, but each ranking is for only one dish.

```
dishes (1) --- (*) user_rankings
```

### One-to-Many: Restaurant to Rankings

A restaurant can have many rankings, but each ranking is for a dish at only one restaurant.

```
restaurants (1) --- (*) user_rankings
```

### One-to-Many: Ranking to Photos

A ranking can have many photos, but each photo belongs to only one ranking.

```
user_rankings (1) --- (*) ranking_photos
```

## Data Integrity

### Cascading Deletes

When a ranking is deleted, all associated photos should be deleted automatically. This is handled by the `ON DELETE CASCADE` clause in the foreign key constraint.

### Unique Constraints

- A user can only rank a dish once (enforced by the unique key on `user_id` and `dish_id`)
- A dish slug must be unique within a country (enforced by the unique key on `slug` and `country_code`)

### Check Constraints

- A ranking must have either a numerical rank or a taste status, but not both (enforced by the `check_ranking_type` constraint)

## Query Examples

### Get a User's Ranking for a Dish

```sql
SELECT ur.*,
       (SELECT JSON_ARRAYAGG(photo_url)
        FROM ranking_photos
        WHERE ranking_id = ur.id) as photo_urls
FROM user_rankings ur
JOIN dishes d ON ur.dish_id = d.id
WHERE ur.user_id = ? AND d.slug = ?
```

### Get Local Rankings for a Dish

```sql
SELECT ur.rank, ur.taste_status, ur.notes,
       u.username, u.avatar_url,
       (SELECT JSON_ARRAYAGG(photo_url)
        FROM ranking_photos
        WHERE ranking_id = ur.id) as photo_urls,
       ur.created_at
FROM user_rankings ur
JOIN dishes d ON ur.dish_id = d.id
JOIN users u ON ur.user_id = u.id
WHERE d.slug = ? AND u.country_code = ?
ORDER BY ur.created_at DESC
LIMIT 50
```

### Get Ranking Statistics for a Dish

```sql
-- Get total rankings and average rank
SELECT COUNT(*) as total_rankings,
       AVG(CASE WHEN rank IS NOT NULL THEN rank ELSE NULL END) as average_rank
FROM user_rankings ur
JOIN dishes d ON ur.dish_id = d.id
WHERE d.slug = ?;

-- Get rank distribution
SELECT rank, COUNT(*) as count
FROM user_rankings ur
JOIN dishes d ON ur.dish_id = d.id
WHERE d.slug = ? AND rank IS NOT NULL
GROUP BY rank;

-- Get taste status distribution
SELECT taste_status, COUNT(*) as count
FROM user_rankings ur
JOIN dishes d ON ur.dish_id = d.id
WHERE d.slug = ? AND taste_status IS NOT NULL
GROUP BY taste_status;
```

## Migration Strategy

When deploying the database schema, follow these steps:

1. Create the `dishes` table first
2. Create the `user_rankings` table next
3. Create the `ranking_photos` table last

This order ensures that foreign key constraints are satisfied.

For future schema changes, use migration scripts with the following pattern:

```sql
-- Migration: Add new field to dishes table
ALTER TABLE dishes ADD COLUMN allergens TEXT AFTER is_vegetarian;

-- Migration: Add new index to user_rankings table
CREATE INDEX idx_user_rankings_created_at ON user_rankings(created_at);
```

## Performance Considerations

### Indexing Strategy

The schema includes indexes on fields that are frequently used in WHERE clauses, JOIN conditions, and ORDER BY clauses:

- `user_id` in `user_rankings` - For queries that filter by user
- `dish_id` in `user_rankings` - For queries that filter by dish
- `restaurant_id` in `user_rankings` - For queries that filter by restaurant
- `rank` in `user_rankings` - For queries that filter by rank
- `taste_status` in `user_rankings` - For queries that filter by taste status
- `ranking_id` in `ranking_photos` - For queries that join photos with rankings

### Denormalization

Some denormalization is used to improve query performance:

- `restaurant_name` is stored in the `dishes` table to avoid joins with the `restaurants` table for common queries
- `dish_type` is stored in the `user_rankings` table to avoid joins with the `dishes` table for certain queries

### JSON Aggregation

For queries that need to retrieve photos for rankings, JSON aggregation is used to avoid multiple queries:

```sql
(SELECT JSON_ARRAYAGG(photo_url)
 FROM ranking_photos
 WHERE ranking_id = ur.id) as photo_urls
```

This returns all photo URLs for a ranking as a JSON array in a single query.

## Backup and Recovery

Implement regular backups of the database:

1. Daily full backups
2. Hourly incremental backups
3. Transaction log backups every 15 minutes

Store backups in a separate AWS region for disaster recovery.

Test the restore process regularly to ensure backups are valid.
