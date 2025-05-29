# DEV-4: Implement Event-Driven Dish Ranking System

## Summary

Implement an event-driven system to handle dish rankings, track user achievements, and maintain analytics data across multiple tables.

## Description

The Bellyfed application allows users to rank dishes at different restaurants. When a user ranks a dish, several related tables need to be updated:

1. The primary ranking is stored in the `user_rankings` table
2. The ranking history is tracked in the `ranking_history` table
3. User dish statistics need to be updated in `user_dish_stats`
4. Badge progress needs to be tracked and updated in `user_badges`
5. Analytics summaries need to be updated

Currently, these operations are handled separately, which can lead to inconsistencies. This task involves implementing an event-driven system to ensure all related tables are updated consistently when a user ranks a dish.

## Acceptance Criteria

- [ ] Implement a dish ranking event that is triggered when a user ranks a dish
- [ ] Create event handlers to update the following tables:
    - [ ] `ranking_history` to track changes to rankings
    - [ ] `user_dish_stats` to track how many times a user has ranked a specific dish type
    - [ ] `user_badges` to update progress toward achievements
    - [ ] `dish_analytics_summary` to update dish statistics
    - [ ] `restaurant_analytics_summary` to update restaurant statistics
    - [ ] `user_analytics_summary` to update user statistics
- [ ] Implement badge awarding logic based on dish ranking milestones
- [ ] Ensure all operations are transactional and atomic
- [ ] Add comprehensive logging for debugging and monitoring
- [ ] Write unit and integration tests for the event system

## Technical Details

### Database Schema Changes

The following schema changes have been implemented to support this feature:

1. Modified the unique constraint on `user_rankings` to include `restaurant_id`, allowing users to rank the same dish at different restaurants:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_rankings_user_dish_restaurant ON user_rankings(user_id, dish_id, restaurant_id);
```

2. Enhanced the `user_badges` table to track progress toward achievements:

```sql
CREATE TABLE IF NOT EXISTS user_badges (
  badge_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_image_url TEXT,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER DEFAULT 1,
  progress_data JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

3. Added a new `user_dish_stats` table to track dish ranking counts for badges:

```sql
CREATE TABLE IF NOT EXISTS user_dish_stats (
  stat_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  total_rankings INTEGER DEFAULT 0,
  total_restaurants INTEGER DEFAULT 0,
  first_ranked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_ranked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_dish_stat UNIQUE (user_id, dish_id)
);
```

### Event System Implementation

The event system should use AWS EventBridge to publish and subscribe to events. The following events should be implemented:

1. `DISH_RANKED` - Triggered when a user ranks a dish
2. `DISH_RANKING_UPDATED` - Triggered when a user updates an existing ranking
3. `BADGE_PROGRESS_UPDATED` - Triggered when a user's progress toward a badge is updated
4. `BADGE_AWARDED` - Triggered when a user earns a badge

### Badge Logic

Implement the following badge types:

1. "First Timer" - Awarded when a user ranks their first dish
2. "Dish Explorer" - Awarded when a user ranks 5 different dishes
3. "Dish Connoisseur" - Awarded when a user ranks 10 different dishes
4. "Dish Expert" - Awarded when a user ranks the same dish at 3 different restaurants
5. "Dish Master" - Awarded when a user ranks the same dish at 5 different restaurants

## Benefits

- Ensures data consistency across multiple tables
- Simplifies application code by centralizing ranking logic
- Enables real-time updates to analytics and badges
- Improves user experience by providing immediate feedback on achievements
- Facilitates future extensions to the ranking system

## Priority

Medium

## Estimated Story Points

8

## Dependencies

- Database schema updates (completed)
- AWS EventBridge configuration
- Lambda functions for event handling

## Attachments

- [Database Schema Diagram](../diagrams/database-schema.png)
