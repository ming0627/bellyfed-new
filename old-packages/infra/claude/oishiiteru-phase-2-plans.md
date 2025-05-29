# Oishiiteru Phase 2 Enhancement Plans

## Table of Contents

1. [Introduction](#introduction)
2. [Current System Overview](#current-system-overview)
3. [Proposed Enhancements](#proposed-enhancements)
   3.1 [Time-Based Scoring System](#time-based-scoring-system)
   3.2 [Customizable Multi-Faceted Rankings](#customizable-multi-faceted-rankings)
4. [Technical Implementation](#technical-implementation)
5. [User Experience Improvements](#user-experience-improvements)
6. [Potential Challenges and Solutions](#potential-challenges-and-solutions)
7. [Conclusion](#conclusion)

## 1. Introduction

Oishiiteru has introduced an innovative approach to food discovery and ranking in its initial phase. As we move into Phase 2, we aim to address potential challenges and further enhance the platform's capabilities. This document outlines the planned improvements and their technical implementations.

## 2. Current System Overview

Oishiiteru's current ranking system is based on user-generated top 10 lists for various food categories or restaurants. Key features include:

- Personalized top 10 lists maintained by users
- Aggregation of rankings across users
- Majority-based ranking system
- Dynamic and easily updatable rankings
- Focus on favorite experiences

While this system offers numerous advantages, it also presents some challenges that we aim to address in Phase 2.

## 3. Proposed Enhancements

### 3.1 Time-Based Scoring System

To address the issue of potentially outdated user data, we will implement a time-based scoring system. This system will automatically adjust the weight of rankings based on how recently they were updated.

Key features:

- Exponential decay applied to scores based on time since last update
- Maintains relevance of recent updates
- Gradually reduces impact of outdated rankings

### 3.2 Customizable Multi-Faceted Rankings

To provide more nuanced recommendations and create opportunities for diverse restaurants to shine, we will implement customizable, multi-faceted rankings.

Key features:

- Allow users to create custom ranking categories
- Include factors such as time of day, specific attributes, and subcategories
- Provide more granular and personalized recommendations

## 4. Technical Implementation

### 4.1 Time-Based Scoring System

```typescript
interface UserRanking {
    userId: string;
    restaurantId: string;
    position: number;
    lastUpdated: Date;
}

function calculateScore(ranking: UserRanking, currentDate: Date): number {
    const daysSinceUpdate =
        (currentDate.getTime() - ranking.lastUpdated.getTime()) / (1000 * 3600 * 24);
    const baseScore = Math.max(11 - ranking.position, 0);
    const decayFactor = Math.exp(-daysSinceUpdate / 30); // 30-day half-life

    return baseScore * decayFactor;
}

function aggregateScores(rankings: UserRanking[]): number {
    const currentDate = new Date();
    return rankings.reduce((total, ranking) => total + calculateScore(ranking, currentDate), 0);
}
```

### 4.2 Customizable Multi-Faceted Rankings

```typescript
interface CustomRanking {
    id: string;
    name: string;
    category: string;
    subcategories: string[];
    timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'lateNight';
    attributes: string[];
}

const customRankingExample: CustomRanking = {
    id: 'nasi-lemak-midnight',
    name: 'Best Midnight Nasi Lemak',
    category: 'Nasi Lemak',
    subcategories: ['Midnight Supper'],
    timeOfDay: 'lateNight',
    attributes: ['ambiance', 'value'],
};

function getCustomRankings(criteria: Partial<CustomRanking>): CustomRanking[] {
    // Implementation to query the database for rankings matching the given criteria
}

function calculateCustomScore(
    restaurant: Restaurant,
    ranking: UserRanking,
    criteria: CustomRanking
): number {
    let score = calculateScore(ranking, new Date());

    if (criteria.timeOfDay && restaurant.operatingHours[criteria.timeOfDay]) {
        score *= 1.2; // 20% bonus for matching time of day
    }

    criteria.attributes.forEach((attr) => {
        if (restaurant.attributes.includes(attr)) {
            score *= 1.1; // 10% bonus for each matching attribute
        }
    });

    return score;
}
```

## 5. User Experience Improvements

- Implement UI for users to create and view custom ranking categories
- Develop a system to suggest custom rankings based on user preferences and behavior
- Create visualizations to show how rankings change over time
- Implement features to highlight new or improving restaurants in specific categories

## 6. Potential Challenges and Solutions

1. **Data Sparsity for Niche Categories**

    - Challenge: Custom categories might have fewer user rankings
    - Solution: Implement a hybrid recommendation system that considers both custom rankings and general popularity

2. **User Adoption of New Features**

    - Challenge: Users might be hesitant to use more complex ranking systems
    - Solution: Gradually introduce new features with clear tutorials and showcase the benefits through personalized examples

3. **System Performance with Increased Complexity**
    - Challenge: More complex calculations could impact system performance
    - Solution: Implement efficient caching strategies and consider using background jobs for heavy calculations

## 7. Conclusion

The proposed enhancements for Oishiiteru Phase 2 aim to address the current limitations while expanding the platform's capabilities. By implementing a time-based scoring system and customizable multi-faceted rankings, Oishiiteru will offer more accurate, personalized, and diverse recommendations to its users.

These improvements will maintain Oishiiteru's innovative edge in the food discovery space, providing a unique and valuable service that evolves with users' preferences and the dynamic food scene.
