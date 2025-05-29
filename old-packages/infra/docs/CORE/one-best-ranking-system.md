# One-Best Ranking System: Core Foundation

## Overview

The One-Best Ranking System is the primary foundation of the Bellyfed platform. It serves as the core mechanism through which all other platform features operate and extend. This document outlines the system's principles, implementation details, and how it enables the progressive Expert Recognition System.

## Fundamental Principles

### 1. One-Best Rule

- Users can designate only ONE #1 ranking for each dish type at a restaurant
- When a superior version is discovered, previous #1 is automatically demoted
- Creates scarcity and value in recommendations
- Forces meaningful choices about what truly deserves to be #1

### 2. Dynamic Evolution

- Rankings automatically update as users discover better versions
- Creates a living history of personal taste development
- Ensures recommendations always reflect current, most accurate preferences
- Shows the evolution of your expertise over time

### 3. Restaurant-Specific Rankings

- Rankings are maintained at the restaurant and dish-type level
- Enables fair comparison of dishes within the same context
- Maintains credibility through venue-specific judgments
- Creates meaningful dish-by-dish discovery

### 4. Documentation Requirements

- Professional notes required for rankings
- Photo verification for credibility
- Context documentation to establish authority
- Complete history maintained for transparency

## Technical Implementation

```typescript
interface DishRanking {
    userId: string;
    restaurantId: string;
    dishTypeId: string;
    rank: 1 | 2 | 3 | 4 | 5 | null;
    tasteStatus: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED' | null;
    notes: string;
    photoUrls: string[];
    createdAt: Date;
    updatedAt: Date;
}
```

### Ranking Rules

1. A user can have only ONE dish with rank 1 for each dishType at a restaurant
2. When a user assigns rank 1 to a dish, any previous rank 1 dish of the same type is demoted
3. Ranking and tasteStatus are mutually exclusive: a dish can have either a rank (1-5) or a tasteStatus
4. All rankings require notes and at least one photo
5. All ranking changes are tracked in a history table for expertise verification

### Ranking Flow

1. User selects a restaurant
2. User selects a dish and dish type
3. User can assign:
    - A rank (1-5) for exceptional dishes
    - A taste status (ACCEPTABLE/SECOND_CHANCE/DISSATISFIED) for other dishes
4. If assigning rank 1, system checks for existing rank 1 dishes
5. If found, system automatically demotes previous rank 1 dish
6. User adds required notes and photos
7. System saves the ranking and updates history

## Enabling the Expert Recognition System

The One-Best Ranking System provides the essential foundation that enables the Expert Recognition System:

1. **Credibility Building**: Rankings create a verifiable record of expertise and judgment
2. **Expertise Validation**: The quality and consistency of rankings determine expert status
3. **Career Progression**: Expert levels are unlocked based on ranking history and quality
4. **Specialization**: Expertise badges are earned through consistent quality in specific cuisines

Without the structured data from the One-Best Ranking System, the Expert Recognition System cannot meaningfully establish or validate expertise.

## Implementation Timeline

1. **Phase 1: Core Ranking System** (Current)

    - Basic ranking functionality
    - Restaurant and dish management
    - Ranking history tracking

2. **Phase 2: Enhanced Validation**

    - Photo verification
    - Notes quality assessment
    - Consistency checks

3. **Phase 3: Expert Recognition Integration**
    - Connect ranking data to expertise levels
    - Enable badge qualification
    - Activate progression tracking

## API Endpoints

```typescript
// Core ranking endpoints
POST /api/rankings/create
PUT /api/rankings/update/:id
GET /api/rankings/user/:userId
GET /api/rankings/restaurant/:restaurantId
GET /api/rankings/history/:userId

// Dish management endpoints
GET /api/dishes/restaurant/:restaurantId
GET /api/dishes/types
POST /api/dishes/create
```

## Database Interactions

The One-Best Ranking System interacts with multiple database tables:

- `restaurants` - Store restaurant information
- `dishes` - Store dish information
- `dishTypes` - Categorize dishes
- `rankings` - Store current rankings
- `rankingHistory` - Track all ranking changes
- `users` - Connect rankings to users

This interconnected data structure enables both the ranking system and the expert recognition features that build upon it.
