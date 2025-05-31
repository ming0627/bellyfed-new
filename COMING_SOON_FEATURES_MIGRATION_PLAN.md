# Coming Soon Features Migration Plan

## Executive Summary

This document outlines the comprehensive migration plan for completing "coming soon" features from `old-packages/frontend` to `apps/web` in the bellyfed-new monorepo. The migration focuses on enhancing user experience through advanced profile management, restaurant owner tools, social networking features, and sophisticated search capabilities.

### Migration Scope

- **Source**: `old-packages/frontend` (TypeScript/TSX implementation)
- **Target**: `apps/web` (JavaScript/JSX with Next.js 15)
- **Timeline**: 5 phases over 4-6 weeks
- **Impact**: Enhanced user engagement, restaurant owner tools, and platform completeness

### Key Objectives

1. Complete user profile functionality including avatar upload
2. Implement comprehensive restaurant management tools
3. Enhance social networking and community features
4. Develop advanced search and discovery capabilities
5. Finalize settings and user preferences management

## Migration Phases Overview

| Phase | Focus Area                       | Duration  | Dependencies                      |
| ----- | -------------------------------- | --------- | --------------------------------- |
| 1     | User Profile Service Enhancement | 1 week    | packages/services, packages/hooks |
| 2     | Restaurant Management Features   | 1.5 weeks | Phase 1, packages/trpc            |
| 3     | Social Features Enhancement      | 1 week    | Phase 1, packages/ui              |
| 4     | Advanced Search and Discovery    | 1 week    | packages/services, packages/utils |
| 5     | Settings and Preferences         | 0.5 weeks | All previous phases               |

---

## Phase 1: User Profile Service Enhancement

### Objective

Complete the user profile functionality including avatar upload, profile data management, and social profile features.

### Current State Analysis

- Basic profile service exists in `packages/services/src/userProfileService.ts`
- Profile edit page has placeholder for avatar upload ("coming soon")
- Missing advanced profile management features

### Files to Migrate/Create/Enhance

#### New Files to Create

```
apps/web/src/components/profile/
├── AvatarUpload.js                 # Avatar upload with image processing
├── ProfileImageCropper.js          # Image cropping functionality
├── SocialProfileLinks.js           # Social media profile management
├── ProfilePrivacySettings.js       # Privacy controls for profile
└── ProfileBadgeDisplay.js          # User achievement badges

apps/web/src/components/ui/
├── ImageUploader.js                # Reusable image upload component
├── CropperModal.js                 # Modal for image cropping
└── ProgressIndicator.js            # Upload progress display
```

#### Files to Enhance

```
packages/services/src/userProfileService.ts    # Add avatar upload methods
packages/hooks/src/useUserProfile.ts           # Add avatar management hooks
apps/web/src/pages/profile/edit.js             # Complete profile editing
apps/web/src/pages/api/user/update-profile.js  # Add avatar upload API
```

### Implementation Details

#### Avatar Upload Service

```javascript
// packages/services/src/userProfileService.ts additions
export const uploadAvatar = async (file, userId) => {
  // Image validation and processing
  // S3 upload with optimized sizes
  // Database update with new avatar URL
};

export const deleteAvatar = async userId => {
  // Remove from S3
  // Update database
};
```

#### Profile Edit Page Enhancement

```javascript
// apps/web/src/pages/profile/edit.js
export default function ProfileEdit() {
  // Replace "Avatar upload functionality coming soon"
  // with full implementation
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // 1 hour
  };
}
```

### Success Criteria

- [ ] Users can upload, crop, and set profile avatars
- [ ] Avatar images are optimized and stored efficiently
- [ ] Profile privacy settings are functional
- [ ] Social media links can be added and managed
- [ ] All profile changes are properly validated and saved

### Testing Requirements

- Unit tests for avatar upload service
- Integration tests for profile API endpoints
- E2E tests for profile editing workflow
- Image processing performance tests

---

## Phase 2: Restaurant Management Features

### Objective

Complete restaurant management functionality for restaurant owners including advanced dashboard, menu management, and analytics.

### Current State Analysis

- ✅ **Restaurant Listing Pages** - **COMPLETED**: Fully functional restaurant discovery with RestaurantList component integration
- ✅ **Restaurant Components** - **COMPLETED**: RestaurantCard, RestaurantList, and detail pages working with Next.js 15.x
- ✅ **Restaurant Data** - **COMPLETED**: Country-specific mock data integrated with realistic restaurant information
- ✅ **Search & Filtering** - **COMPLETED**: Working search, filter by cuisine/price/rating, and sort functionality
- Basic restaurant management exists in `apps/web/src/pages/restaurant-management.js`
- Missing advanced features for restaurant owners (dashboard, analytics)
- No comprehensive restaurant owner dashboard or analytics

### Files to Migrate/Create/Enhance

#### New Files to Create

```
apps/web/src/components/restaurant-management/
├── RestaurantDashboard.js          # Owner dashboard overview
├── MenuManagement.js               # Menu items CRUD operations
├── RestaurantAnalytics.js          # Performance metrics and insights
├── BookingManagement.js            # Reservation system
├── ReviewManagement.js             # Review responses and management
├── PromotionManager.js             # Deals and promotions
└── StaffManagement.js              # Staff accounts and permissions

apps/web/src/components/analytics/
├── RevenueChart.js                 # Revenue tracking charts
├── CustomerInsights.js             # Customer behavior analytics
├── PopularDishesChart.js           # Menu item performance
└── RatingsTrends.js                # Rating trends over time

apps/web/src/pages/[country]/restaurant/
├── dashboard.js                    # Restaurant owner dashboard
├── menu/
│   ├── index.js                    # Menu overview
│   ├── add.js                      # Add menu item
│   └── edit/[id].js                # Edit menu item
├── analytics.js                    # Detailed analytics page
├── bookings.js                     # Booking management
└── settings.js                     # Restaurant settings
```

#### Files to Enhance

```
packages/services/src/restaurantService.ts     # Add management methods
packages/trpc/src/routers/restaurant.ts        # Add management endpoints
apps/web/src/pages/restaurant-management.js    # Enhance existing page
apps/web/src/pages/api/restaurants/[id].js     # Add management APIs
```

### Implementation Details

#### Restaurant Dashboard

```javascript
// apps/web/src/pages/[country]/restaurant/dashboard.js
export default function RestaurantDashboard() {
  // Overview metrics
  // Recent bookings
  // Review summary
  // Quick actions
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: { country: params.country },
    revalidate: 300, // 5 minutes
  };
}
```

#### Menu Management System

```javascript
// apps/web/src/components/restaurant-management/MenuManagement.js
export default function MenuManagement({ restaurantId }) {
  // Menu categories
  // Item CRUD operations
  // Pricing management
  // Availability controls
}
```

### Success Criteria

- [ ] Restaurant owners can access comprehensive dashboard
- [ ] Menu items can be added, edited, and removed
- [ ] Analytics provide meaningful business insights
- [ ] Booking system is functional and user-friendly
- [ ] Review management allows owner responses

### Testing Requirements

- Restaurant owner workflow tests
- Menu management functionality tests
- Analytics data accuracy tests
- Booking system integration tests

---

## Phase 3: Social Features Enhancement

### Objective

Complete social networking features including user interactions, content sharing, and community building tools.

### Current State Analysis

- Basic social feed exists in `apps/web/src/pages/social.js`
- Missing advanced social interactions
- No user following system implementation

### Files to Migrate/Create/Enhance

#### New Files to Create

```
apps/web/src/components/social/
├── UserFollowButton.js             # Follow/unfollow functionality
├── SocialPostCreator.js            # Create new posts
├── PostInteractions.js             # Like, comment, share
├── UserStories.js                  # Instagram-style stories
├── SocialNotifications.js          # Social activity notifications
├── UserFeedFilters.js              # Filter social feed content
└── CommunityGroups.js              # Food community groups

apps/web/src/components/feed/
├── PostCard.js                     # Individual post display
├── StoryViewer.js                  # Story viewing modal
├── CommentThread.js                # Nested comments
└── ShareModal.js                   # Content sharing options

apps/web/src/pages/[country]/social/
├── index.js                        # Main social feed
├── following.js                    # Following feed
├── discover.js                     # Discover new users
├── groups/
│   ├── index.js                    # Community groups
│   └── [id].js                     # Individual group
└── notifications.js                # Social notifications
```

#### Files to Enhance

```
packages/services/src/socialMediaService.ts    # Add social interactions
packages/hooks/src/useUser.ts                  # Add social hooks
apps/web/src/pages/social.js                   # Enhance existing feed
apps/web/src/pages/api/user/follow.js          # Complete follow system
```

### Implementation Details

#### Enhanced Social Feed

```javascript
// apps/web/src/pages/[country]/social/index.js
export default function SocialFeed() {
  // Stories section
  // Post creation
  // Feed with interactions
  // Real-time updates
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: { country: params.country },
    revalidate: 60, // 1 minute for social content
  };
}
```

#### User Following System

```javascript
// packages/services/src/socialMediaService.ts additions
export const followUser = async (followerId, followingId) => {
  // Create follow relationship
  // Send notification
  // Update follower counts
};

export const unfollowUser = async (followerId, followingId) => {
  // Remove follow relationship
  // Update follower counts
};
```

### Success Criteria

- [ ] Users can follow and unfollow other users
- [ ] Social feed displays relevant content
- [ ] Post interactions (like, comment, share) work correctly
- [ ] Stories feature is functional
- [ ] Social notifications are delivered

### Testing Requirements

- Social interaction workflow tests
- Follow/unfollow functionality tests
- Real-time updates testing
- Content moderation tests

---

## Phase 4: Advanced Search and Discovery

### Objective

Implement sophisticated search and filtering capabilities with location-based discovery and recommendation algorithms.

### Current State Analysis

- Basic search exists in components
- Missing advanced filtering options
- No recommendation engine

### Files to Migrate/Create/Enhance

#### New Files to Create

```
apps/web/src/components/search/
├── AdvancedSearchForm.js           # Complex search with filters
├── SearchResultsGrid.js            # Grid layout for results
├── FilterSidebar.js                # Advanced filtering options
├── LocationSearch.js               # GPS and map-based search
├── SavedSearches.js                # User's saved search queries
└── SearchSuggestions.js            # Auto-complete suggestions

apps/web/src/components/discovery/
├── RecommendationEngine.js         # AI-powered recommendations
├── TrendingDishes.js               # Popular dishes widget
├── NearbyRestaurants.js            # Location-based suggestions
├── PersonalizedFeed.js             # User preference-based content
└── DiscoveryCards.js               # Swipeable discovery interface

apps/web/src/pages/[country]/search/
├── index.js                        # Main search page
├── advanced.js                     # Advanced search interface
├── results.js                      # Search results page
└── saved.js                        # Saved searches management

apps/web/src/pages/[country]/discover/
├── index.js                        # Discovery dashboard
├── trending.js                     # Trending content
├── nearby.js                       # Location-based discovery
└── recommendations.js              # Personalized recommendations
```

#### Files to Enhance

```
packages/services/src/restaurantService.ts     # Add search methods
packages/utils/src/searchHelpers.ts            # Search utility functions
apps/web/src/components/SearchAndFilter.tsx    # Enhance existing component
```

### Implementation Details

#### Advanced Search Implementation

```javascript
// apps/web/src/pages/[country]/search/advanced.js
export default function AdvancedSearch() {
  // Multi-criteria search form
  // Real-time filtering
  // Map integration
  // Save search functionality
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: { country: params.country },
    revalidate: 1800, // 30 minutes
  };
}
```

#### Recommendation Engine

```javascript
// packages/services/src/recommendationService.ts
export const getPersonalizedRecommendations = async (userId, preferences) => {
  // Analyze user behavior
  // Apply recommendation algorithms
  // Return ranked suggestions
};

export const getTrendingContent = async (location, timeframe) => {
  // Analyze trending patterns
  // Location-based trending
  // Return trending items
};
```

### Success Criteria

- [ ] Advanced search with multiple filters works correctly
- [ ] Location-based search provides accurate results
- [ ] Recommendation engine provides relevant suggestions
- [ ] Search performance is optimized
- [ ] Users can save and manage search queries

### Testing Requirements

- Search accuracy and performance tests
- Location-based functionality tests
- Recommendation algorithm validation
- User experience testing for search flows

---

## Phase 5: Settings and Preferences

### Objective

Complete user settings and preferences management including notifications, privacy, and accessibility options.

### Current State Analysis

- Basic settings component exists with incomplete tabs
- Missing notification preferences
- No privacy or accessibility settings

### Files to Migrate/Create/Enhance

#### New Files to Create

```
apps/web/src/components/settings/
├── NotificationSettings.js         # Email and push notifications
├── PrivacySettings.js              # Account privacy controls
├── AccessibilitySettings.js        # UI and accessibility options
├── DataManagement.js               # Data export and deletion
├── AccountSecurity.js              # Password and 2FA settings
└── PreferenceManager.js            # Food preferences and dietary restrictions

apps/web/src/pages/[country]/settings/
├── index.js                        # Main settings page
├── notifications.js                # Notification preferences
├── privacy.js                      # Privacy settings
├── accessibility.js                # Accessibility options
├── security.js                     # Account security
└── data.js                         # Data management
```

#### Files to Enhance

```
apps/web/src/components/settings.tsx           # Complete all tabs
apps/web/src/pages/settings.js                 # Enhance main settings page
packages/services/src/userService.ts           # Add settings methods
```

### Implementation Details

#### Complete Settings Page

```javascript
// apps/web/src/pages/[country]/settings/index.js
export default function Settings() {
  // All settings categories
  // Tab navigation
  // Save/cancel functionality
  // Settings validation
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: { country: params.country },
    revalidate: 3600, // 1 hour
  };
}
```

#### Notification Settings

```javascript
// apps/web/src/components/settings/NotificationSettings.js
export default function NotificationSettings() {
  // Email notification preferences
  // Push notification settings
  // Frequency controls
  // Category-specific settings
}
```

### Success Criteria

- [ ] All settings tabs are functional
- [ ] Notification preferences are properly saved
- [ ] Privacy settings control data visibility
- [ ] Accessibility options improve usability
- [ ] Data management tools work correctly

### Testing Requirements

- Settings persistence tests
- Notification delivery tests
- Privacy controls validation
- Accessibility compliance tests

---

## Implementation Timeline

### Week 1: Phase 1 - User Profile Enhancement

- **Days 1-2**: Create avatar upload components and service
- **Days 3-4**: Implement profile editing enhancements
- **Days 5-7**: Testing and integration

### Week 2: Phase 2 - Restaurant Management (Part 1)

- **Days 1-3**: Restaurant dashboard and basic management
- **Days 4-5**: Menu management system
- **Days 6-7**: Testing and refinement

### Week 3: Phase 2 - Restaurant Management (Part 2) & Phase 3 Start

- **Days 1-2**: Analytics and booking management
- **Days 3-4**: Complete restaurant management testing
- **Days 5-7**: Begin social features enhancement

### Week 4: Phase 3 - Social Features & Phase 4 Start

- **Days 1-3**: Complete social features implementation
- **Days 4-5**: Social features testing
- **Days 6-7**: Begin advanced search implementation

### Week 5: Phase 4 - Advanced Search & Phase 5

- **Days 1-3**: Complete search and discovery features
- **Days 4-5**: Settings and preferences implementation
- **Days 6-7**: Final testing and integration

### Week 6: Final Integration and Testing

- **Days 1-3**: End-to-end testing
- **Days 4-5**: Performance optimization
- **Days 6-7**: Documentation and deployment preparation

---

## Dependencies and Prerequisites

### Technical Dependencies

- **Next.js 15**: All components must be compatible
- **Monorepo Packages**: Integration with existing packages
- **Database Schema**: May require schema updates
- **API Endpoints**: New endpoints for enhanced functionality

### Package Dependencies

```json
{
  "dependencies": {
    "@bellyfed/services": "workspace:*",
    "@bellyfed/hooks": "workspace:*",
    "@bellyfed/ui": "workspace:*",
    "@bellyfed/utils": "workspace:*",
    "@bellyfed/types": "workspace:*"
  }
}
```

### External Dependencies

- Image processing libraries for avatar upload
- Real-time communication for social features
- Analytics libraries for restaurant insights
- Search optimization tools

---

## Next.js 15 Compatibility Requirements

### File Structure Standards

- **Use .js files** instead of .tsx for all new components
- **Default exports only** - no dual export patterns
- **Explicit re-exports** in index files when needed

### Static Generation Implementation

```javascript
// Standard pattern for all pages
export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: { country: params.country },
    revalidate: 3600, // Appropriate revalidation time
  };
}
```

### Component Standards

```javascript
// Default export pattern
export default function ComponentName() {
  // Component implementation
}

// Named exports for utilities only
export { utilityFunction };
```

### Import/Export Patterns

```javascript
// Correct import pattern
import ComponentName from './ComponentName';
import { utilityFunction } from './utils';

// Avoid dual exports
// ❌ export const Component = () => {};
// ❌ export default Component;

// ✅ Use only default export
// export default function Component() {}
```

---

## Success Criteria and Testing Requirements

### Phase 1 Success Criteria

- [ ] Avatar upload with image processing works flawlessly
- [ ] Profile editing saves all changes correctly
- [ ] Social profile links are functional
- [ ] Privacy settings control profile visibility
- [ ] All profile features are mobile-responsive

### Phase 2 Success Criteria

- [ ] Restaurant dashboard provides comprehensive overview
- [ ] Menu management allows full CRUD operations
- [ ] Analytics provide actionable business insights
- [ ] Booking system handles reservations correctly
- [ ] Review management enables owner responses

### Phase 3 Success Criteria

- [ ] Social feed displays relevant, engaging content
- [ ] User following system works bidirectionally
- [ ] Post interactions are real-time and responsive
- [ ] Stories feature matches modern social media UX
- [ ] Social notifications are timely and accurate

### Phase 4 Success Criteria

- [ ] Advanced search returns accurate, relevant results
- [ ] Location-based discovery works with GPS integration
- [ ] Recommendation engine provides personalized suggestions
- [ ] Search performance meets sub-second response times
- [ ] Filter combinations work correctly

### Phase 5 Success Criteria

- [ ] All settings categories are fully functional
- [ ] Notification preferences are respected system-wide
- [ ] Privacy controls effectively manage data visibility
- [ ] Accessibility options improve user experience
- [ ] Data management tools comply with privacy regulations

### Testing Strategy

#### Unit Testing

- Component functionality tests
- Service method validation
- Utility function verification
- Hook behavior testing

#### Integration Testing

- API endpoint integration
- Database operation validation
- Package interaction testing
- Cross-component communication

#### End-to-End Testing

- Complete user workflows
- Multi-step processes
- Cross-browser compatibility
- Mobile responsiveness

#### Performance Testing

- Page load times
- Search response times
- Image upload performance
- Real-time feature latency

---

## Risk Assessment and Mitigation Strategies

### High-Risk Areas

#### 1. Avatar Upload and Image Processing

**Risk**: Large file uploads causing performance issues
**Mitigation**:

- Implement client-side image compression
- Set file size limits
- Use progressive upload with progress indicators
- Implement fallback for upload failures

#### 2. Real-time Social Features

**Risk**: Scalability issues with real-time updates
**Mitigation**:

- Implement efficient WebSocket connections
- Use connection pooling
- Implement graceful degradation
- Add offline support

#### 3. Search Performance

**Risk**: Slow search response times with large datasets
**Mitigation**:

- Implement search indexing
- Use caching strategies
- Optimize database queries
- Implement search result pagination

#### 4. Data Migration

**Risk**: Data loss or corruption during migration
**Mitigation**:

- Create comprehensive backups
- Implement rollback procedures
- Use staged migration approach
- Validate data integrity at each step

### Medium-Risk Areas

#### 1. Cross-Package Dependencies

**Risk**: Breaking changes affecting multiple packages
**Mitigation**:

- Use semantic versioning
- Implement comprehensive testing
- Maintain backward compatibility
- Document breaking changes

#### 2. Mobile Responsiveness

**Risk**: Features not working correctly on mobile devices
**Mitigation**:

- Mobile-first development approach
- Regular testing on various devices
- Progressive enhancement strategy
- Touch-friendly interface design

### Low-Risk Areas

#### 1. Settings and Preferences

**Risk**: Minor UI/UX issues
**Mitigation**:

- User testing and feedback
- Iterative improvement
- Accessibility compliance
- Clear documentation

---

## Quality Assurance and Code Standards

### Code Quality Standards

- **ESLint Configuration**: Follow project's ESLint rules
- **TypeScript Types**: Use proper typing from packages/types
- **Component Structure**: Consistent component organization
- **Error Handling**: Comprehensive error boundaries and handling

### Documentation Requirements

- **Component Documentation**: JSDoc comments for all components
- **API Documentation**: Complete API endpoint documentation
- **User Guides**: End-user documentation for new features
- **Developer Guides**: Technical implementation guides

### Review Process

1. **Self-Review**: Developer reviews own code
2. **Peer Review**: Code review by team member
3. **Testing Review**: QA validation of functionality
4. **Integration Review**: Full system integration testing

---

## Deployment and Rollout Strategy

### Staged Deployment

1. **Development Environment**: Initial implementation and testing
2. **Staging Environment**: Integration testing and user acceptance
3. **Production Deployment**: Gradual rollout with monitoring

### Feature Flags

- Implement feature flags for new functionality
- Enable gradual rollout to user segments
- Quick rollback capability if issues arise

### Monitoring and Analytics

- Performance monitoring for new features
- User engagement analytics
- Error tracking and alerting
- Usage pattern analysis

---

## Post-Migration Maintenance

### Ongoing Responsibilities

- **Performance Monitoring**: Regular performance reviews
- **User Feedback**: Continuous user feedback collection
- **Security Updates**: Regular security assessments
- **Feature Enhancement**: Iterative improvements based on usage

### Documentation Maintenance

- Keep technical documentation updated
- Maintain user guides and help content
- Update API documentation with changes
- Version control for documentation

---

## Conclusion

This comprehensive migration plan ensures the successful completion of all "coming soon" features while maintaining high code quality, performance, and user experience standards. The phased approach allows for iterative development, testing, and refinement, minimizing risks and ensuring robust implementation.

The migration will transform the bellyfed platform into a complete, feature-rich application that serves both end users and restaurant owners with advanced functionality, social networking capabilities, and sophisticated discovery tools.

**Next Steps**: Begin Phase 1 implementation with user profile service enhancement, following the detailed timeline and success criteria outlined in this document.
