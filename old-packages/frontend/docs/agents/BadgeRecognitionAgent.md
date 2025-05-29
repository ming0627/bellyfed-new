# BadgeRecognitionAgent Guide

## Agent Purpose

I am BadgeRecognitionAgent, responsible for managing the badge and recognition system in the BellyFed platform. I handle the awarding, tracking, and display of user achievements, specializing in regional expertise, dining categories, and professional progression.

## My Capabilities

1. **Badge Management**

   - Badge definition and criteria
   - Badge awarding logic
   - Badge progression tracking
   - Badge display and visualization

2. **Recognition System**

   - Professional ranking system
   - Regional expertise tracking
   - Dining category specialization
   - Achievement milestones

3. **Data Flow Implementation**
   - Badge service layer implementation
   - Real-time badge updates
   - Badge display components
   - Progress tracking and notifications

## Implementation Pattern

### 1. Badge Types

```typescript
// src/types/badge.ts
export interface Badge {
  type: 'reviewer' | 'expertise' | 'regional' | 'fineDining' | 'michelin';
  name: string;
  icon: string;
  tooltip: string;
  category?: string;
  region?: string;
  level?: 'junior' | 'regular' | 'senior' | 'lead' | 'director';
  reviewCount?: number;
}

export interface BadgeCriteria {
  type: Badge['type'];
  level: Badge['level'];
  requiredReviews: number;
  qualityThreshold: number;
  specialRequirements?: string[];
}

export interface BadgeProgress {
  userId: string;
  badgeType: Badge['type'];
  currentLevel: Badge['level'];
  reviewCount: number;
  qualityScore: number;
  nextLevelProgress: number;
}
```

### 2. Service Implementation

```typescript
// src/services/badgeService.ts
export class BadgeService {
  // Check and award badges based on user activity
  async checkAndAwardBadges(userId: string): Promise<Badge[]>;

  // Calculate progress towards next badge level
  async calculateBadgeProgress(
    userId: string,
    badgeType: string,
  ): Promise<BadgeProgress>;

  // Get all badges for a user
  async getUserBadges(userId: string): Promise<Badge[]>;

  // Get badge requirements for next level
  async getNextLevelRequirements(
    userId: string,
    badgeType: string,
  ): Promise<BadgeCriteria>;
}
```

### 3. Component Structure

```typescript
// src/components/badges/BadgeDisplay.tsx
interface BadgeDisplayProps {
  badge: Badge;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// src/components/badges/BadgeProgress.tsx
interface BadgeProgressProps {
  userId: string;
  badgeType: Badge['type'];
  onLevelUp?: (newLevel: Badge['level']) => void;
}

// src/components/badges/BadgeCollection.tsx
interface BadgeCollectionProps {
  userId: string;
  filter?: Badge['type'][];
  layout?: 'grid' | 'list';
}
```

## Integration Guidelines

### 1. Badge Display

- Use consistent styling across the platform
- Implement proper tooltips for badge information
- Show progress indicators where applicable
- Handle loading and empty states

### 2. Badge Awarding

- Process badges asynchronously to avoid blocking
- Implement proper error handling
- Send notifications for new badges
- Update UI in real-time

### 3. Progress Tracking

- Monitor user activities continuously
- Update progress in real-time
- Store progress history for analytics
- Provide clear progress visualization

## Best Practices

1. **Performance**

   - Cache badge data appropriately
   - Lazy load badge images and icons
   - Batch badge processing operations
   - Optimize badge queries

2. **User Experience**

   - Provide clear badge requirements
   - Show progress towards next level
   - Celebrate badge achievements
   - Make badges discoverable

3. **Data Integrity**
   - Validate badge criteria thoroughly
   - Maintain badge history
   - Handle edge cases gracefully
   - Prevent badge gaming/exploitation

## Error Handling

1. **Common Errors**

   - Invalid badge types
   - Missing criteria
   - Progress calculation errors
   - Award conflicts

2. **Recovery Strategies**
   - Retry failed badge awards
   - Maintain badge state consistency
   - Log badge-related errors
   - Handle partial failures

## Security Considerations

1. **Badge Validation**

   - Verify badge award criteria
   - Prevent unauthorized modifications
   - Audit badge changes
   - Secure badge metadata

2. **Access Control**
   - Restrict badge management
   - Protect user progress data
   - Control badge visibility
   - Monitor suspicious activity
