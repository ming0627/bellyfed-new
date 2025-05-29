# Rankings Feature Frontend Implementation Guide

This document provides a comprehensive guide for the frontend team to implement the rankings feature UI components and API integration.

## Requirements

The rankings feature enables users to:

1. Rank dishes on a scale of 1-5 or with taste status (Acceptable, Second Chance, Dissatisfied)
2. Add notes and photos to their rankings
3. View their own rankings across restaurants
4. See local and global rankings for dishes
5. Upload and view photos of dishes with their rankings

## API Endpoints

The backend provides the following API endpoints that need to be integrated:

### Dish Endpoints

- `GET /api/dishes` - List dishes with filtering options
- `GET /api/dishes/:id` - Get a specific dish by ID
- `GET /api/dishes/slug/:slug` - Get a specific dish by slug

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

## Implementation Checklist

### 1. API Integration (Priority: High)

- [ ] Create API client for dish endpoints

    - File: `src/api/dishesApi.ts`
    - Implement functions for fetching dishes with proper error handling
    - Add TypeScript interfaces for dish data

- [ ] Create API client for rankings endpoints

    - File: `src/api/rankingsApi.ts`
    - Implement CRUD operations for rankings
    - Add pagination and filtering support

- [ ] Implement photo upload service
    - File: `src/services/photoUploadService.ts`
    - Get pre-signed URL from API
    - Handle direct upload to S3
    - Implement image compression before upload

### 2. Core Components (Priority: High)

- [ ] Create RankingForm component

    - File: `src/components/rankings/RankingForm.tsx`
    - Implement form for numerical ranking (1-5)
    - Add taste status selection (Acceptable, Second Chance, Dissatisfied)
    - Include notes field with character counter
    - Add validation and error handling

- [ ] Build PhotoUploader component

    - File: `src/components/shared/PhotoUploader.tsx`
    - Create drag-and-drop interface
    - Add file selection dialog
    - Implement image preview
    - Show upload progress
    - Handle multiple photos

- [ ] Develop RankingCard component

    - File: `src/components/rankings/RankingCard.tsx`
    - Display ranking information
    - Show photos in gallery format
    - Add edit and delete options
    - Include timestamp and user info

- [ ] Create RankingStats component
    - File: `src/components/rankings/RankingStats.tsx`
    - Display average ranking
    - Show distribution of rankings
    - Visualize data with charts

### 3. Pages (Priority: Medium)

- [ ] Implement MyRankings page

    - File: `src/pages/my-rankings.tsx`
    - List all user rankings
    - Add filtering by restaurant, dish type
    - Implement sorting options
    - Add pagination

- [ ] Create DishRankings page

    - File: `src/pages/dish/[slug].tsx`
    - Show dish details
    - Display user's ranking if exists
    - Show local and global rankings
    - Add tabs for different views

- [ ] Build RestaurantRankings page
    - File: `src/pages/restaurant/[id].tsx`
    - List all dishes at restaurant
    - Show user's rankings
    - Add sorting by popularity, rating

### 4. State Management (Priority: Medium)

- [ ] Create rankings context/store

    - File: `src/context/RankingsContext.tsx`
    - Implement state for rankings data
    - Add actions for CRUD operations
    - Include loading and error states

- [ ] Implement caching strategy
    - File: `src/utils/cacheUtils.ts`
    - Add local storage caching
    - Implement cache invalidation
    - Add optimistic updates

### 5. Testing (Priority: Medium)

- [ ] Write unit tests for API clients

    - Files: `src/api/__tests__/*.test.ts`
    - Test API request/response handling
    - Mock API responses

- [ ] Create component tests

    - Files: `src/components/__tests__/*.test.tsx`
    - Test form validation
    - Verify UI rendering
    - Test user interactions

- [ ] Implement integration tests
    - Files: `src/integration-tests/*.test.tsx`
    - Test complete user flows
    - Verify API integration

## Technical Specifications

### Data Models

```typescript
// Dish model
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
    createdAt: string;
    updatedAt: string;
}

// User Ranking model
interface UserRanking {
    id: string;
    userId: string;
    dishId: string;
    restaurantId: string;
    dishType?: string;
    rank?: number; // 1-5, with 1 being the best
    tasteStatus?: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED';
    notes?: string;
    photoUrls: string[];
    createdAt: string;
    updatedAt: string;
}

// Ranking Statistics model
interface RankingStats {
    totalRankings: number;
    averageRank?: number;
    ranks: {
        [key: number]: number; // key is rank (1-5), value is count
    };
    tasteStatuses: {
        ACCEPTABLE: number;
        SECOND_CHANCE: number;
        DISSATISFIED: number;
    };
}
```

### Component Props

```typescript
// RankingForm props
interface RankingFormProps {
    dish: Dish;
    existingRanking?: UserRanking;
    onSubmit: (ranking: UserRankingInput) => Promise<void>;
    onCancel: () => void;
}

// PhotoUploader props
interface PhotoUploaderProps {
    onPhotoUploaded: (photoUrl: string) => void;
    maxPhotos?: number;
    existingPhotos?: string[];
    onPhotoRemoved?: (photoUrl: string) => void;
}

// RankingCard props
interface RankingCardProps {
    ranking: UserRanking;
    dish: Dish;
    onEdit?: () => void;
    onDelete?: () => void;
}

// RankingStats props
interface RankingStatsProps {
    stats: RankingStats;
    isLocal?: boolean;
}
```

## Development Workflow

1. Start by implementing the API clients and services
2. Build the core components with mock data
3. Implement the pages using the components
4. Add state management
5. Connect components to real API
6. Write tests for all components and flows

## Environment Setup

The following environment variables need to be configured:

```
# S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=bellyfed-rankings-dev-123456789012

# API Configuration
NEXT_PUBLIC_API_URL=https://api-dev.bellyfed.com
```

## Resources

- API documentation: `docs/20250504-rankings-backend/api-endpoints.md`
- Database schema: `docs/20250504-rankings-backend/database-schema.md`
- Frontend integration guide: `docs/20250504-rankings-backend/frontend-integration.md`
- Photo upload integration: `docs/20250504-rankings-backend/photo-upload-integration.md`

## Timeline

- API Integration: Week 1
- Core Components: Weeks 2-3
- Pages: Week 4
- State Management: Week 5
- Testing & Refinement: Week 6

Total estimated time: 6 weeks
