# Rankings Feature Backend Implementation

**Date:** May 4, 2025  
**Task:** Implement backend integration for the rankings feature with RDS  
**Priority:** High

## Overview

This document outlines the requirements and implementation plan for integrating the rankings feature with the RDS backend. The rankings feature allows users to rank dishes and view rankings from other users.

## Requirements

1. Store and retrieve user rankings for dishes
2. Support both numerical rankings (1-5) and taste status rankings (Acceptable, Second Chance, Dissatisfied)
3. Allow users to add notes and photos to their rankings
4. Provide statistics for local and global rankings
5. Ensure proper authentication and authorization

## Database Schema

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

## API Endpoints

### Dish Endpoints

- `GET /api/dishes` - List dishes with filtering options
- `GET /api/dishes/:id` - Get a specific dish by ID
- `GET /api/dishes/slug/:slug` - Get a specific dish by slug
- `POST /api/dishes` - Create a new dish (admin only)
- `PUT /api/dishes/:id` - Update a dish (admin only)
- `DELETE /api/dishes/:id` - Delete a dish (admin only)

### Rankings Endpoints

- `GET /api/rankings/my` - Get all rankings for the current user
- `GET /api/rankings/my/:dishSlug` - Get current user's ranking for a specific dish
- `POST /api/rankings/my/:dishSlug` - Create a new ranking
- `PUT /api/rankings/my/:dishSlug` - Update an existing ranking
- `DELETE /api/rankings/my/:dishSlug` - Delete a ranking
- `GET /api/rankings/local/:dishSlug` - Get local rankings for a dish
- `GET /api/rankings/global/:dishSlug` - Get global rankings for a dish

### Photo Upload Endpoint

- `POST /api/upload/ranking-photo` - Upload a photo for a ranking

## Implementation Tasks

1. **Database Setup**

   - [ ] Create database tables
   - [ ] Set up indexes for performance
   - [ ] Configure database connection

2. **API Implementation**

   - [ ] Create API route handlers for all endpoints
   - [ ] Implement authentication middleware
   - [ ] Add validation for request data
   - [ ] Implement error handling

3. **Photo Upload Service**

   - [ ] Set up S3 bucket for photo storage
   - [ ] Implement secure upload mechanism
   - [ ] Add image processing for thumbnails

4. **Testing**
   - [ ] Write unit tests for API handlers
   - [ ] Create integration tests for database operations
   - [ ] Test authentication and authorization

## Response Formats

### Get User Ranking Response

```json
{
  "userRanking": {
    "rankingId": "uuid",
    "userId": "uuid",
    "dishId": "uuid",
    "restaurantId": "uuid",
    "dishType": "Malaysian",
    "rank": 1,
    "tasteStatus": null,
    "notes": "This is the best Nasi Lemak I have ever had!",
    "photoUrls": ["https://example.com/photo1.jpg"],
    "createdAt": "2025-05-04T12:00:00Z",
    "updatedAt": "2025-05-04T12:00:00Z"
  },
  "dishDetails": {
    "dishId": "uuid",
    "name": "Nasi Lemak Special",
    "description": "Fragrant coconut rice served with spicy sambal...",
    "restaurantId": "uuid",
    "restaurantName": "Village Park Restaurant",
    "category": "Malaysian",
    "imageUrl": "https://example.com/dish.jpg",
    "isVegetarian": false,
    "spicyLevel": 2,
    "price": 15.9,
    "countryCode": "my"
  },
  "rankingStats": {
    "totalRankings": 1250,
    "averageRank": 4.8,
    "ranks": {
      "1": 850,
      "2": 250,
      "3": 100,
      "4": 30,
      "5": 20
    },
    "tasteStatuses": {
      "ACCEPTABLE": 950,
      "SECOND_CHANCE": 250,
      "DISSATISFIED": 50
    }
  }
}
```

### Create/Update Ranking Request

```json
{
  "dishId": "uuid",
  "restaurantId": "uuid",
  "dishType": "Malaysian",
  "rank": 1,
  "tasteStatus": null,
  "notes": "This is the best Nasi Lemak I have ever had!",
  "photoUrls": ["https://example.com/photo1.jpg"]
}
```

## Implementation Phases

### Phase 1: Core Database and API Setup

- Set up database schema
- Implement basic API endpoints for CRUD operations
- Connect frontend to backend for basic ranking operations

### Phase 2: Photo Upload Functionality

- Set up S3 or similar storage
- Implement photo upload API
- Update frontend to use real photo upload

### Phase 3: Analytics and Statistics

- Implement endpoints for ranking statistics
- Add aggregation queries for local and global rankings
- Update frontend to display real statistics

## Security Considerations

1. **Authentication**

   - All ranking endpoints must require authentication
   - Use JWT tokens for API authentication

2. **Authorization**

   - Users can only access and modify their own rankings
   - Admin-only routes for dish management

3. **Data Validation**

   - Validate all input data on the server side
   - Sanitize user input to prevent injection attacks

4. **Rate Limiting**
   - Implement rate limiting for API endpoints
   - Prevent abuse of the system

## Dependencies

- AWS RDS for database
- AWS S3 for photo storage
- Next.js API routes for backend implementation
- Authentication middleware for user verification
