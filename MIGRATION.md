# Bellyfed Migration Documentation

This document tracks the migration progress from the original Bellyfed project to the new structure. It includes a detailed checklist of files that have been migrated, files that still need migration, and special considerations for each component.

## Migration Progress Summary

<!--
NOTE: This table has been updated based on a comprehensive audit of the original codebase.
All counts have been verified against the actual file listings in the original repository.
-->

| Category               | Total Items                                                                                                                          | Completed | In Progress | Not Started | Completion % |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----------- | ----------- | ------------ |
| **Applications**       | 3                                                                                                                                    | 1         | 2           | 0           | 33%          |
| **Hooks**              | 14 <!-- Verified: 13 from frontend + 1 from ui components -->                                                                        | 1         | 0           | 13          | 7%           |
| **Services**           | 16 <!-- Verified -->                                                                                                                 | 1         | 1           | 14          | 6%           |
| **Contexts**           | 2 <!-- Verified -->                                                                                                                  | 2         | 0           | 0           | 100%         |
| **Utils**              | 20 <!-- Verified -->                                                                                                                 | 0         | 0           | 20          | 0%           |
| **UI Components**      | 40 <!-- Verified: 39 original (1 completed, 38 not started) + 1 new (completed) -->                                                  | 2         | 0           | 38          | 5%           |
| **Feature Components** | 66 <!-- Verified: Complete count from original repository -->                                                                         | 12        | 0           | 54          | 18%          |
| **API Routes**         | 48 <!-- Verified: Exact count from /packages/frontend/src/pages/api/ -->                                                             | 0         | 1           | 47          | 2%           |
| **Pages**              | 56 <!-- Verified: Exact count from /packages/frontend/src/pages/ -->                                                                 | 15        | 0           | 41          | 27%          |
| **Config**             | 16 <!-- Verified: Includes /packages/frontend/src/config (7), /packages/typescript-config (5), /packages/eslint-config (5) -->       | 1         | 0           | 15          | 6%           |
| **Types**              | 8  <!-- Verified: From /packages/frontend/src/types/ and /packages/shared/src/types/ -->                                             | 0         | 0           | 8           | 0%           |
| **Infrastructure**     | 18 <!-- Verified: Key infrastructure components from /packages/infra/ -->                                                            | 0         | 0           | 18          | 0%           |
| **Overall**            | 307 <!-- Recalculated based on verified totals above -->                                                                             | 35        | 4           | 268         | 11%          |

### Migration Status Legend

- ✅ **Completed**: Component has been fully migrated and tested
- 🔄 **In Progress**: Migration has started but is not complete
- ❌ **Not Started**: Migration has not yet begun
- 🚫 **Not Needed**: Component is not needed in the new repository

## Project Requirements

- Bellyfed project uses Turborepo monorepo structure with pnpm
- Requires ES modules with explicit .js extensions in imports
- Only relative/absolute paths are allowed (no aliases)
- Strict workspace boundaries must be followed
- Bellyfed application must use the Next.js Pages Router, not the App Router
- Orange-peach color theme with high contrast for accessibility
- Proper component spacing and responsiveness
- Animated elements where appropriate

## Design Guidelines

### Color Palette

Bellyfed uses an orange-peach color theme that reflects the food discovery focus of the application:

- **Primary Colors**: Orange-peach tones (Primary 500: `#FF9966`)
- **Secondary Colors**: Complementary colors (Secondary 500: `#FF9B66`)
- **Accent Colors**: Gold for ratings (`#FFD44D`), Teal for special features (`#4DB8B8`)
- **Semantic Colors**: Success (`#36B37E`), Warning (`#FFAB00`), Error (`#E53935`), Info (`#2196F3`)

### Typography

- **Font Families**: DM Sans (body), Fraunces (headings), Caveat (accent)
- **Font Sizes**: Range from xs (0.75rem) to 6xl (3.75rem)
- **Font Weights**: Regular (400), Medium (500), Bold (700)

### Spacing

Consistent spacing helps create a harmonious layout, using a scale from 0.5 (0.125rem) to 20 (5rem).

### Component Guidelines

- **Buttons**: Primary (`bg-orange-500`), Secondary (`bg-orange-100 text-orange-700`)
- **Cards**: Consistent padding, subtle shadows, rounded corners
- **Forms**: Consistent height and padding, orange focus rings
- **Navigation**: Active links use `text-orange-500`, hover states use `text-orange-600`

### Accessibility Guidelines

- Maintain minimum contrast ratio of 4.5:1 for normal text
- Ensure all interactive elements have focus states
- Use semantic HTML elements
- Include proper ARIA attributes where needed

### Responsive Design

- Mobile-first approach
- Consistent breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- Touch targets at least 44x44px on mobile

## Migration Scope

The migration scope includes ALL packages from the original Bellyfed repository, not just the web application pages. This includes:

### Applications

1. **Web Application** (`/apps/web`): The main Next.js application with all pages and components
2. **Backend Application** (`/apps/backend`): tRPC backend application integrated with AWS API Gateway
3. **Documentation Site** (`/apps/docs`): Documentation site built with Next.js

### Packages

4. **UI Component Library** (`/packages/ui`): Shared UI components used across applications
5. **Utilities** (`/packages/utils`): Shared utility functions and helpers
6. **API Client** (`/packages/api-client`): API client for interacting with backend services
7. **Database** (`/packages/db`): Prisma ORM integration for Aurora Serverless v2 PostgreSQL with Outbox pattern
8. **tRPC** (`/packages/trpc`): tRPC configuration for type-safe API
9. **Services** (`/packages/services`): Various services including authentication
10. **Hooks** (`/packages/hooks`): Custom React hooks
11. **Config** (`/packages/config`): Shared configuration (ESLint, TypeScript, etc.)
12. **TypeScript Config** (`/packages/typescript-config`): Shared TypeScript configuration
13. **ESLint Config** (`/packages/eslint-config`): Shared ESLint configuration
14. **Types** (`/packages/types`): Shared TypeScript types and interfaces

    <!-- NOTE FOR VERIFICATION (Original Packages Structure):
    - Original `/packages/shared/src/` contained `types/` and `utils/`. Ensure these are fully accounted for in the migration checklist, likely under the main "Types" and "Utils" categories.
    - Original `/packages/infra/` (which included CDK, Lambda functions, scripts, and other backend/DB related logic) needs its components and functionalities clearly mapped to the new structure (e.g., `apps/backend`, `packages/db`, `packages/trpc`). The current checklist might not fully detail this distribution.
    -->

## Migration Checklist

<!--
NOTE FOR VERIFICATION (Checklist Accuracy):
- Thoroughly review all "Source Path" entries in the checklist below against the actual file structure of the original `/packages/frontend/src/` directory (and other original packages like `/packages/shared/src/`). Many listed paths, especially for components (e.g., `restaurants/detail/...`, `explore/...`, `dishes/...`, `auth/...`), may not accurately reflect the original, flatter component structure or different naming conventions in `/packages/frontend/src/components/`. These paths need correction.
- Many components and files from the original repository (e.g., numerous top-level .tsx files in `/packages/frontend/src/components/`, files in `/packages/frontend/src/components/analytics/`, `/packages/frontend/src/components/dish/`, etc.) may be missing from this checklist. Ensure all relevant files are added to their correct categories.
- Re-verify the "Total Items" counts in the summary table by ensuring every relevant file from the original packages is represented in this checklist under the correct category and that their individual migration statuses are up-to-date.
- The "Migration Dependencies Graph" section should also be cross-checked and updated based on an accurate and complete component/file list.
-->

### ✅ Successfully Migrated Files

#### Core Configuration

| Source Path                                  | Destination Path                           | Notes                                           |
| -------------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| `/packages/frontend/src/config/countries.js` | `/apps/web/src/config/countries.js`        | Country configuration for multi-country support |
| N/A                                          | `/apps/web/src/contexts/CountryContext.js` | New context for country selection               |
| N/A                                          | `/apps/web/src/contexts/index.js`          | Context exports                                 |

#### Layout Components

| Source Path                                                    | Destination Path                                     | Notes                                            |
| -------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `/packages/frontend/src/components/layout/Layout.jsx`          | `/apps/web/src/components/layout/Layout.js`          | Main layout wrapper with SEO optimization        |
| `/packages/frontend/src/components/layout/Header.jsx`          | `/apps/web/src/components/layout/Header.js`          | Responsive header with navigation and user menu  |
| `/packages/frontend/src/components/layout/Footer.jsx`          | `/apps/web/src/components/layout/Footer.js`          | Comprehensive footer with links and social media |
| `/packages/frontend/src/components/layout/CountrySelector.jsx` | `/apps/web/src/components/layout/CountrySelector.js` | Country selection dropdown with flag icons       |

#### UI Components

| Source Path                                            | Destination Path                             | Notes                              |
| ------------------------------------------------------ | -------------------------------------------- | ---------------------------------- |
| `/packages/frontend/src/components/ui/ThemeToggle.jsx` | `/apps/web/src/components/ui/ThemeToggle.js` | Theme switcher for light/dark mode |
| `/packages/frontend/src/components/ui/LucideIcon.jsx`  | `/apps/web/src/components/ui/lucide-icon.js` | Client-side Lucide icon wrapper    |

#### Homepage Components

| Source Path                                                          | Destination Path                                           | Notes                                                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `/packages/frontend/src/components/Homepage.jsx`                     | `/apps/web/src/components/homepage.js`                     | Main homepage component with animated statistics                                         |
| `/packages/frontend/src/components/homepage/Collections.jsx`         | `/apps/web/src/components/homepage/Collections.js`         | Grid of curated restaurant collections                                                   |
| `/packages/frontend/src/components/homepage/FeaturedRestaurants.jsx` | `/apps/web/src/components/homepage/FeaturedRestaurants.js` | Featured restaurants showcase                                                            |
| `/packages/frontend/src/components/homepage/Navigation.jsx`          | ~~`/apps/web/src/components/homepage/Navigation.js`~~      | ~~Navigation menu with search functionality~~ (Removed - using Header component instead) |
| `/packages/frontend/src/components/homepage/PremiumBanner.jsx`       | `/apps/web/src/components/homepage/PremiumBanner.js`       | Premium subscription banner                                                              |
| `/packages/frontend/src/components/homepage/TopCritics.jsx`          | `/apps/web/src/components/homepage/TopCritics.js`          | Top food critics showcase                                                                |
| `/packages/frontend/src/components/homepage/TopFoodies.jsx`          | `/apps/web/src/components/homepage/TopFoodies.js`          | Animated ranking board for top foodies                                                   |
| `/packages/frontend/src/components/homepage/TopRatedDishes.jsx`      | `/apps/web/src/components/homepage/TopRatedDishes.js`      | Grid of top-rated dishes                                                                 |

#### Restaurant Components

| Source Path                                                                   | Destination Path                                                    | Notes                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| `/packages/frontend/src/components/restaurants/RestaurantCard.jsx`            | `/apps/web/src/components/restaurants/RestaurantCard.js`            | Reusable restaurant card component          |
| `/packages/frontend/src/components/restaurants/RestaurantList.jsx`            | `/apps/web/src/components/restaurants/RestaurantList.js`            | Filterable list of restaurants              |
| `/packages/frontend/src/components/restaurants/detail/RestaurantHeader.jsx`   | `/apps/web/src/components/restaurants/detail/RestaurantHeader.js`   | Restaurant detail header with image gallery |
| `/packages/frontend/src/components/restaurants/detail/RestaurantInfo.jsx`     | `/apps/web/src/components/restaurants/detail/RestaurantInfo.js`     | Restaurant information and features         |
| `/packages/frontend/src/components/restaurants/detail/RestaurantMenu.jsx`     | `/apps/web/src/components/restaurants/detail/RestaurantMenu.js`     | Restaurant menu with categories             |
| `/packages/frontend/src/components/restaurants/detail/RestaurantReviews.jsx`  | `/apps/web/src/components/restaurants/detail/RestaurantReviews.js`  | Restaurant reviews with ratings             |
| `/packages/frontend/src/components/restaurants/detail/RestaurantLocation.jsx` | `/apps/web/src/components/restaurants/detail/RestaurantLocation.js` | Restaurant location with map                |
| `/packages/frontend/src/components/restaurants/detail/SimilarRestaurants.jsx` | `/apps/web/src/components/restaurants/detail/SimilarRestaurants.js` | Similar restaurants recommendations         |

#### Pages

| Source Path                                                           | Destination Path                                                | Notes                                 |
| --------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `/packages/frontend/src/pages/_app.tsx`                               | `/apps/web/src/pages/_app.tsx`                                  | App component                         |
| `/packages/frontend/src/pages/_document.tsx`                          | `/apps/web/src/pages/_document.tsx`                             | Document component                    |
| `/packages/frontend/src/pages/_error.tsx`                             | `/apps/web/src/pages/_error.tsx`                                | Error page                            |
| `/packages/frontend/src/pages/[country]/ai-center.tsx`                | `/apps/web/src/pages/[country]/ai-center.js`                    | AI center page                        |
| `/packages/frontend/src/pages/[country]/chatbot/[id].tsx`             | `/apps/web/src/pages/[country]/chatbot/[id].js`                 | Chatbot detail page                   |
| `/packages/frontend/src/pages/[country]/competitions.tsx`             | `/apps/web/src/pages/[country]/competitions.js`                 | Competitions page                     |
| `/packages/frontend/src/pages/[country]/dish-restaurants.tsx`         | `/apps/web/src/pages/[country]/dish-restaurants.js`             | Dish restaurants page                 |
| `/packages/frontend/src/pages/[country]/dishes.tsx`                   | `/apps/web/src/pages/[country]/dishes.js`                       | Dishes page                           |
| `/packages/frontend/src/pages/[country]/example-migration.tsx`        | `/apps/web/src/pages/[country]/example-migration.js`            | Example migration page                |
| `/packages/frontend/src/pages/[country]/explore.tsx`                  | `/apps/web/src/pages/[country]/explore.js`                      | Explore page                          |
| `/packages/frontend/src/pages/[country]/favorites.tsx`                | `/apps/web/src/pages/[country]/favorites.js`                    | Favorites page                        |
| `/packages/frontend/src/pages/[country]/index.tsx`                    | `/apps/web/src/pages/[country]/index.js`                        | Country-specific homepage             |
| `/packages/frontend/src/pages/[country]/my-foodie-leaderboard.tsx`    | `/apps/web/src/pages/[country]/my-foodie-leaderboard.js`        | Foodie leaderboard page               |
| `/packages/frontend/src/pages/[country]/premium.tsx`                  | `/apps/web/src/pages/[country]/premium.js`                      | Premium page                          |
| `/packages/frontend/src/pages/[country]/profile.tsx`                  | `/apps/web/src/pages/[country]/profile.js`                      | Profile page                          |
| `/packages/frontend/src/pages/[country]/profile/edit.tsx`             | `/apps/web/src/pages/[country]/profile/edit.js`                 | Profile edit page                     |
| `/packages/frontend/src/pages/[country]/ranking.tsx`                  | `/apps/web/src/pages/[country]/ranking.js`                      | Ranking page                          |
| `/packages/frontend/src/pages/[country]/rankings/global/[dishSlug].tsx` | `/apps/web/src/pages/[country]/rankings/global/[dishSlug].js` | Global dish ranking page              |
| `/packages/frontend/src/pages/[country]/rankings/index.tsx`           | `/apps/web/src/pages/[country]/rankings/index.js`               | Rankings index page                   |
| `/packages/frontend/src/pages/[country]/rankings/local/[dishSlug].tsx` | `/apps/web/src/pages/[country]/rankings/local/[dishSlug].js`   | Local dish ranking page               |
| `/packages/frontend/src/pages/[country]/rankings/my/[dishSlug].tsx`   | `/apps/web/src/pages/[country]/rankings/my/[dishSlug].js`       | My dish ranking page                  |
| `/packages/frontend/src/pages/[country]/rankings/my/index.tsx`        | `/apps/web/src/pages/[country]/rankings/my/index.js`            | My rankings index page                |
| `/packages/frontend/src/pages/[country]/restaurant-management.tsx`    | `/apps/web/src/pages/[country]/restaurant-management.js`        | Restaurant management page            |
| `/packages/frontend/src/pages/[country]/restaurant/[id].tsx`          | `/apps/web/src/pages/[country]/restaurant/[id].js`              | Restaurant detail page                |
| `/packages/frontend/src/pages/[country]/restaurants.tsx`              | `/apps/web/src/pages/[country]/restaurants.js`                  | Restaurants listing page              |
| `/packages/frontend/src/pages/[country]/settings.tsx`                 | `/apps/web/src/pages/[country]/settings.js`                     | Settings page                         |
| `/packages/frontend/src/pages/[country]/social.tsx`                   | `/apps/web/src/pages/[country]/social.js`                       | Social page                           |
| `/packages/frontend/src/pages/[country]/test-simple.tsx`              | `/apps/web/src/pages/[country]/test-simple.js`                  | Test page                             |
| `/packages/frontend/src/pages/403.tsx`                                | `/apps/web/src/pages/403.js`                                    | 403 error page                        |
| `/packages/frontend/src/pages/404.tsx`                                | `/apps/web/src/pages/404.js`                                    | 404 error page                        |
| `/packages/frontend/src/pages/500.tsx`                                | `/apps/web/src/pages/500.js`                                    | 500 error page                        |
| `/packages/frontend/src/pages/admin/index.tsx`                        | `/apps/web/src/pages/admin/index.js`                            | Admin index page                      |
| `/packages/frontend/src/pages/admin/restaurants/create.tsx`           | `/apps/web/src/pages/admin/restaurants/create.js`               | Create restaurant page                |
| `/packages/frontend/src/pages/ai-center/[id].tsx`                     | `/apps/web/src/pages/ai-center/[id].js`                         | AI center detail page                 |
| `/packages/frontend/src/pages/ai-center/index.tsx`                    | `/apps/web/src/pages/ai-center/index.js`                        | AI center index page                  |
| `/packages/frontend/src/pages/chatbot/[id].tsx`                       | `/apps/web/src/pages/chatbot/[id].js`                           | Chatbot detail page                   |
| `/packages/frontend/src/pages/chatbot/index.tsx`                      | `/apps/web/src/pages/chatbot/index.js`                          | Chatbot index page                    |
| `/packages/frontend/src/pages/competitions.tsx`                       | `/apps/web/src/pages/competitions.js`                           | Competitions page                     |
| `/packages/frontend/src/pages/debug.tsx`                              | `/apps/web/src/pages/debug.js`                                  | Debug page                            |
| `/packages/frontend/src/pages/dish-restaurants.tsx`                   | `/apps/web/src/pages/dish-restaurants.js`                       | Dish restaurants page                 |
| `/packages/frontend/src/pages/explore.tsx`                            | `/apps/web/src/pages/explore.js`                                | Explore page                          |
| `/packages/frontend/src/pages/favorites.tsx`                          | `/apps/web/src/pages/favorites.js`                              | Favorites page                        |
| `/packages/frontend/src/pages/forgot-password.tsx`                    | `/apps/web/src/pages/forgot-password.js`                        | Forgot password page                  |
| `/packages/frontend/src/pages/health.ts`                              | `/apps/web/src/pages/health.js`                                 | Health check page                     |
| `/packages/frontend/src/pages/index.tsx`                              | `/apps/web/src/pages/index.js`                                  | Redirect to country-specific homepage |
| `/packages/frontend/src/pages/my/example-migration.tsx`               | `/apps/web/src/pages/my/example-migration.js`                   | Example migration page                |
| `/packages/frontend/src/pages/profile/[userId].tsx`                   | `/apps/web/src/pages/profile/[userId].js`                       | User profile page                     |
| `/packages/frontend/src/pages/profile/edit.tsx`                       | `/apps/web/src/pages/profile/edit.js`                           | Profile edit page                     |
| `/packages/frontend/src/pages/profile/index.tsx`                      | `/apps/web/src/pages/profile/index.js`                          | Profile index page                    |
| `/packages/frontend/src/pages/resend-verification.tsx`                | `/apps/web/src/pages/resend-verification.js`                    | Resend verification page              |
| `/packages/frontend/src/pages/restaurant-management.tsx`              | `/apps/web/src/pages/restaurant-management.js`                  | Restaurant management page            |
| `/packages/frontend/src/pages/restaurants.tsx`                        | `/apps/web/src/pages/restaurants.js`                            | Restaurants page                      |
| `/packages/frontend/src/pages/settings.tsx`                           | `/apps/web/src/pages/settings.js`                               | Settings page                         |
| `/packages/frontend/src/pages/signin.tsx`                             | `/apps/web/src/pages/signin.js`                                 | Sign in page                          |
| `/packages/frontend/src/pages/signup.tsx`                             | `/apps/web/src/pages/signup.js`                                 | Sign up page                          |
| `/packages/frontend/src/pages/simple-test.tsx`                        | `/apps/web/src/pages/simple-test.js`                            | Simple test page                      |
| `/packages/frontend/src/pages/social.tsx`                             | `/apps/web/src/pages/social.js`                                 | Social page                           |
| `/packages/frontend/src/pages/terms.tsx`                              | `/apps/web/src/pages/terms.js`                                  | Terms page                            |
| `/packages/frontend/src/pages/xml-error.tsx`                          | `/apps/web/src/pages/xml-error.js`                              | XML error page                        |

#### Mock Data

| Source Path                                      | Destination Path                             | Notes                                |
| ------------------------------------------------ | -------------------------------------------- | ------------------------------------ |
| `/packages/frontend/src/data/mockRestaurants.js` | `/apps/web/src/data/mockRestaurantDetail.js` | Mock data for restaurant detail page |

### 🔄 Files Pending Migration (Prioritized)

#### High Priority

| Source Path                                                     | Destination Path                                   | Notes                                                   |
| --------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| ✅ `/packages/frontend/src/pages/[country]/search.jsx`          | `/apps/web/src/pages/[country]/search.js`          | Search results page - High priority for user navigation |
| ✅ `/packages/frontend/src/components/search/SearchResults.jsx` | `/apps/web/src/components/search/SearchResults.js` | Search results component                                |
| ✅ `/packages/frontend/src/components/search/SearchFilters.jsx` | `/apps/web/src/components/search/SearchFilters.js` | Search filters component                                |
| ✅ `/packages/frontend/src/pages/signin.jsx`                    | `/apps/web/src/pages/signin.js`                    | Sign in page - High priority for user authentication    |
| ✅ `/packages/frontend/src/pages/signup.jsx`                    | `/apps/web/src/pages/signup.js`                    | Sign up page - High priority for user authentication    |
| ✅ `/packages/frontend/src/components/auth/SignInForm.jsx`      | `/apps/web/src/components/auth/SignInForm.js`      | Sign in form component                                  |
| ✅ `/packages/frontend/src/components/auth/SignUpForm.jsx`      | `/apps/web/src/components/auth/SignUpForm.js`      | Sign up form component                                  |

#### Medium Priority

| Source Path                                                           | Destination Path                                         | Notes                     |
| --------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------- |
| ✅ `/packages/frontend/src/pages/[country]/profile.jsx`               | `/apps/web/src/pages/[country]/profile.js`               | User profile page         |
| ✅ `/packages/frontend/src/components/profile/ProfileHeader.jsx`      | `/apps/web/src/components/profile/ProfileHeader.js`      | Profile header component  |
| ✅ `/packages/frontend/src/components/profile/ProfileTabs.jsx`        | `/apps/web/src/components/profile/ProfileTabs.js`        | Profile tabs component    |
| ✅ `/packages/frontend/src/components/profile/UserReviews.jsx`        | `/apps/web/src/components/profile/UserReviews.js`        | User reviews component    |
| ✅ `/packages/frontend/src/components/profile/UserFavorites.jsx`      | `/apps/web/src/components/profile/UserFavorites.js`      | User favorites component  |
| ✅ `/packages/frontend/src/pages/[country]/collections.jsx`           | `/apps/web/src/pages/[country]/collections.js`           | Collections listing page  |
| ✅ `/packages/frontend/src/pages/[country]/collections/[id].jsx`      | `/apps/web/src/pages/[country]/collections/[id].js`      | Collection detail page    |
| ✅ `/packages/frontend/src/components/collections/CollectionCard.jsx` | `/apps/web/src/components/collections/CollectionCard.js` | Collection card component |
| ✅ `/packages/frontend/src/components/collections/CollectionList.jsx` | `/apps/web/src/components/collections/CollectionList.js` | Collection list component |

#### Lower Priority

| Source Path                                                              | Destination Path                                            | Notes                           |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------- |
| ✅ `/packages/frontend/src/pages/[country]/explore.jsx`                  | `/apps/web/src/pages/[country]/explore.js`                  | Explore page                    |
| ✅ `/packages/frontend/src/components/explore/ExploreMap.jsx`            | `/apps/web/src/components/explore/ExploreMap.js`            | Explore map component           |
| ✅ `/packages/frontend/src/components/explore/NearbyRestaurants.jsx`     | `/apps/web/src/components/explore/NearbyRestaurants.js`     | Nearby restaurants component    |
| ✅ `/packages/frontend/src/pages/[country]/social.jsx`                   | `/apps/web/src/pages/[country]/social.js`                   | Social feed page                |
| ✅ `/packages/frontend/src/pages/[country]/competitions.jsx`             | `/apps/web/src/pages/[country]/competitions.js`             | Competitions page               |
| ✅ `/packages/frontend/src/pages/[country]/dishes/[id].jsx`              | `/apps/web/src/pages/[country]/dishes/[id].js`              | Dish detail page                |
| ✅ `/packages/frontend/src/components/dishes/DishHeader.jsx`             | `/apps/web/src/components/dishes/DishHeader.js`             | Dish header component           |
| ✅ `/packages/frontend/src/components/dishes/DishIngredients.jsx`        | `/apps/web/src/components/dishes/DishIngredients.js`        | Dish ingredients component      |
| ✅ `/packages/frontend/src/components/dishes/DishReviews.jsx`            | `/apps/web/src/components/dishes/DishReviews.js`            | Dish reviews component          |
| ✅ `/packages/frontend/src/components/dishes/SimilarDishes.jsx`          | `/apps/web/src/components/dishes/SimilarDishes.js`          | Similar dishes component        |
| ✅ `/packages/frontend/src/pages/[country]/restaurants/[id]/review.jsx`  | `/apps/web/src/pages/[country]/restaurants/[id]/review.js`  | Review submission page          |
| ✅ `/packages/frontend/src/components/reviews/ReviewForm.jsx`            | `/apps/web/src/components/reviews/ReviewForm.js`            | Review form component           |
| ✅ `/packages/frontend/src/pages/[country]/settings.jsx`                 | `/apps/web/src/pages/[country]/settings.js`                 | User settings page              |
| ✅ `/packages/frontend/src/components/settings/AccountSettings.jsx`      | `/apps/web/src/components/settings/AccountSettings.js`      | Account settings component      |
| ✅ `/packages/frontend/src/components/settings/NotificationSettings.jsx` | `/apps/web/src/components/settings/NotificationSettings.js` | Notification settings component |

## Revised Migration Plan

### Phase 1: Web Application Migration (Current Phase)

1. **Core Layout and UI Components** ✅

   - Layout, Header, Footer, Navigation
   - Basic UI components (ThemeToggle, Icons)

2. **Homepage Components** ✅

   - Main homepage with animated statistics
   - Featured content sections

3. **Restaurant Pages and Components** ✅

   - Restaurant listings and detail pages
   - Restaurant cards and related components

4. **Search Functionality** ✅

   - Search results page
   - Search filters and sorting

5. **Authentication Pages** ✅

   - Sign in and sign up pages
   - Authentication forms

6. **User Profile Pages** ✅

   - User profile page
   - User reviews and favorites

7. **Collections Pages** ✅

   - Collections listing page
   - Collection detail page
   - Collection cards and lists

8. **Remaining Pages** (In Progress)
   - ✅ Explore page with map functionality
   - Review submission page and form
   - Settings page and related components

### Phase 2: Shared Packages Migration (Next Phase)

1. **UI Component Library**

   - Extract shared UI components from web application
   - Create component documentation
   - Implement component testing

2. **Utilities Package**

   - Extract shared utility functions
   - Add proper TypeScript typing
   - Implement unit tests

3. **API Client Package**

   - Create API client structure
   - Implement API endpoints
   - Add error handling and retry logic

4. **Types Package**

   - Define shared TypeScript interfaces
   - Create domain models
   - Ensure type consistency across packages

5. **Config Package**
   - Extract shared configuration
   - Implement ESLint and TypeScript configs
   - Create build and test configurations

### Phase 3: Integration and Optimization

1. **Package Integration**

   - Update web application to use shared packages
   - Ensure proper dependency management
   - Verify workspace boundaries

2. **Performance Optimization**

   - Implement code splitting
   - Optimize component rendering
   - Minimize bundle size

3. **Testing and Quality Assurance**
   - Implement comprehensive testing
   - Ensure accessibility compliance
   - Verify responsive design

## AWS Architecture Considerations

1. **Frontend Deployment (AWS ECS Docker)**:

   - The frontend application is deployed using Docker containers on AWS ECS
   - This provides consistent environments across development and production
   - ECS allows for auto-scaling based on traffic patterns
   - Application Load Balancer distributes traffic across containers
   - CloudFront CDN is used for static assets and improved global performance
   - Blue/green deployment strategy ensures zero-downtime updates

2. **Backend Architecture (API Gateway & Lambda)**:

   - The backend uses AWS API Gateway as the entry point for all API requests
   - tRPC is integrated with API Gateway for type-safe API communication:
     - A single Lambda function handles all tRPC procedure calls
     - The API Gateway routes all requests to this Lambda handler
     - The handler parses the request and routes it to the appropriate tRPC procedure
     - This maintains end-to-end type safety between frontend and backend
     - The frontend uses the tRPC client to make type-safe API calls
     - This eliminates the need for manual API documentation and validation
   - Lambda functions handle API requests in a serverless architecture:
     - Each Lambda function is optimized for its specific task
     - Cold starts are minimized through provisioned concurrency
     - Functions are organized by domain (auth, users, restaurants, etc.)
   - Custom authorizers with Cognito handle authentication and authorization:
     - API Gateway authorizers validate tokens before executing Lambda functions
     - This reduces unnecessary Lambda executions for unauthorized requests
   - API Gateway stages separate environments (dev, staging, production)
   - CloudWatch provides logging and monitoring capabilities
   - X-Ray enables distributed tracing for performance analysis

3. **Database Infrastructure (Aurora Serverless v2 PostgreSQL)**:

   - Aurora Serverless v2 PostgreSQL provides a scalable, cost-effective database
   - Prisma ORM enables type-safe database access with migration support
   - The Outbox pattern is implemented for reliable event processing:
     - Database transactions write to both the primary table and an outbox table
     - This ensures data consistency even if downstream processing fails
     - Lambda functions process outbox events asynchronously
     - Events are marked as processed after successful handling
     - Retry mechanisms handle failed event processing
     - This architecture ensures eventual consistency across microservices
   - Database backups are automated with point-in-time recovery
   - Connection pooling optimizes database performance

4. **Authentication & Security**:
   - Amazon Cognito handles user authentication and management
   - API Gateway custom authorizers validate tokens for backend requests
   - HttpOnly cookies store authentication tokens securely
   - AWS WAF protects against common web exploits
   - AWS Secrets Manager stores sensitive configuration values
   - VPC configuration isolates database resources

## Migration Challenges and Solutions

### ES Modules with Explicit Extensions

**Challenge:** The new repository uses ES modules with explicit file extensions in imports, while the original repository uses TypeScript with implicit extensions.

**Solution:**

- [ ] Maintain explicit `.js` extensions in all import statements, even for TypeScript files
- [ ] For TypeScript files, use `.js` extension in imports (Next.js transpiles TS to JS)
- [ ] Example: `import { useAuth } from '../contexts/AuthContext.js'` (not `.tsx`)

### Package Structure Differences

**Challenge:** The original repository uses a different package structure than the new repository.

**Solution:**

- [ ] Map original package paths to new package paths
- [ ] Create equivalent package structure in the new repository
- [ ] Update import paths to reflect the new structure

### Authentication Implementation

**Challenge:** The original repository uses Amazon Cognito for authentication, which needs to be properly integrated in the new repository.

**Solution:**

- [x] Implement server-side authentication API routes
- [x] Use HttpOnly cookies for secure token storage
- [x] Implement proper token refresh mechanism
- [x] Create a comprehensive authentication context

### Monorepo Dependencies

**Challenge:** Managing dependencies between packages in the monorepo.

**Solution:**

- [ ] Use workspace references for internal dependencies
- [ ] Ensure package.json files correctly specify dependencies
- [ ] Use proper versioning for external dependencies

### API Integration

**Challenge:** Integrating with backend APIs while maintaining the same functionality.

**Solution:**

- [ ] Create a comprehensive API client
- [ ] Implement proper error handling
- [ ] Use environment variables for API configuration
- [ ] Implement authentication token handling

### Component Styling

**Challenge:** Ensuring components look and behave identically to the original implementation.

**Solution:**

- [x] Use the same CSS framework (Tailwind CSS)
- [x] Maintain the same class names and structure
- [x] Implement responsive design patterns
- [x] Test on multiple screen sizes

### Data Fetching

**Challenge:** Implementing data fetching with the same behavior as the original implementation.

**Solution:**

- [ ] Use React Query for data fetching
- [ ] Implement proper loading and error states
- [ ] Use the same caching strategy
- [ ] Maintain the same data structure

### Environment Variables

**Challenge:** Managing environment variables across different environments.

**Solution:**

- [ ] Use .env files for environment-specific configuration
- [ ] Implement proper environment detection
- [ ] Use environment variables for API endpoints, authentication, etc.
- [ ] Document required environment variables

### Testing Strategy

**Challenge:** Ensuring migrated components work correctly.

**Solution:**

- [ ] Write unit tests for all migrated components
- [ ] Implement integration tests for component interactions
- [ ] Use visual testing for UI components
- [ ] Test on multiple browsers and devices

## Migration First Strategy

We are adopting a "migrate first, convert later" approach to ensure complete functional parity with the original Bellyfed repository before introducing TypeScript improvements.

### Rationale

1. **Functional Parity**: Ensuring the new repository has the same functionality as the original repository is our top priority.
2. **Reduced Complexity**: Migrating and converting simultaneously increases the risk of errors and makes debugging more difficult.
3. **Clear Progress Tracking**: Separating migration from conversion allows for clearer progress tracking and milestone achievement.
4. **Stable Foundation**: Achieving 100% functional migration provides a stable foundation for future TypeScript conversion.

### Implementation Approach

1. **Comprehensive Inventory**: We have created a detailed inventory of all components in the original repository.
2. **Structured Migration Plan**: We have developed a prioritized migration plan based on dependency order.
3. **Sequential Migration**: We will migrate components one package at a time, starting with core utilities and services.
4. **Preserve Original Structure**: We will maintain the original monorepo structure and package boundaries.
5. **Maintain Original Functionality**: We will preserve the exact original functionality, even if improvements are identified.
6. **TypeScript Exception**: We will keep the recently converted context providers (AuthContext.tsx and CountryContext.tsx) as TypeScript since they're already working.

### Timeline

- **Weeks 1-2**: Core utilities and services
- **Weeks 3-4**: Hooks and UI components
- **Weeks 5-6**: Feature components
- **Week 7**: API routes
- **Week 8**: Pages
- **Post-Migration**: TypeScript conversion

## Special Considerations

1. **TypeScript Migration** (Paused):
   - The original codebase uses TypeScript (.ts/.tsx files)
   - Our current implementation primarily uses JavaScript (.js files)
   - We will pause TypeScript conversion until after achieving 100% functional migration
   - Exception: We will keep the following already converted TypeScript files:
     - ✅ `/apps/web/src/contexts/AuthContext.tsx` (from AuthContext.js)
     - ✅ `/apps/web/src/contexts/CountryContext.tsx` (from CountryContext.js)
     - ✅ `/apps/web/src/contexts/index.ts` (from index.js)
     - ✅ `/apps/web/src/types/auth.ts` (type definitions for authentication)
     - ✅ `/apps/web/src/types/country.ts` (type definitions for country selection)
   - TypeScript conversion will resume after achieving 100% functional migration

## TypeScript Conversion Plan

**IMPORTANT: This plan is on hold until after achieving 100% functional migration from the original repository.**

### Motivation

1. **Type Safety**: TypeScript provides static type checking, which helps catch errors at compile time rather than runtime.
2. **Developer Experience**: TypeScript improves code completion, documentation, and refactoring capabilities.
3. **tRPC Integration**: Our tRPC implementation works best with TypeScript for end-to-end type safety.
4. **Consistency**: Maintaining consistency with the original codebase makes migration easier.

### Conversion Strategy

#### Phase 0: Complete Migration (Current Focus)

- [ ] Complete migration of all components from the original repository
- [ ] Ensure 100% functional parity with the original repository
- [ ] Verify all components work correctly
- [ ] Document all migration decisions and challenges

#### Phase 1: Core Infrastructure

- [x] Create type definitions for shared types
- [x] Convert context providers to TypeScript
- [ ] Convert utility functions to TypeScript
- [ ] Convert hooks to TypeScript
- [ ] Convert services to TypeScript

#### Phase 2: Components

- [ ] Convert UI components to TypeScript
- [ ] Convert layout components to TypeScript
- [ ] Convert form components to TypeScript
- [ ] Convert feature-specific components to TypeScript

#### Phase 3: Pages

- [ ] Convert page components to TypeScript
- [ ] Convert API routes to TypeScript
- [ ] Convert middleware to TypeScript

### Conversion Guidelines

#### File Naming

- Rename `.js` files to `.tsx` for React components
- Rename `.js` files to `.ts` for non-React code
- Keep import statements using `.js` extension as required by ES modules

#### Type Definitions

- Create dedicated type files in `/apps/web/src/types/` for shared types
- Use interfaces for object shapes and types for unions/primitives
- Export all types for reuse across the application

#### Component Conversion

- Add prop type interfaces for all components
- Use React.FC<Props> for functional components
- Add return type annotations for all functions
- Use generics for reusable components

### Completed Conversions

- [x] `/apps/web/src/contexts/AuthContext.tsx` (converted from AuthContext.js)
- [x] `/apps/web/src/contexts/CountryContext.tsx` (converted from CountryContext.js)
- [x] `/apps/web/src/contexts/index.ts` (converted from index.js)
- [x] `/apps/web/src/types/auth.ts` (new file)
- [x] `/apps/web/src/types/country.ts` (new file)
- [x] `/packages/services/src/auth/cognitoAuthService.ts` (converted from web app's cognitoAuthService.js)
- [x] `/packages/hooks/src/useDebounce.ts` (new implementation)

### Conversion Schedule (Post-Migration)

| Week   | Focus Area         | Files to Convert                                              |
| ------ | ------------------ | ------------------------------------------------------------- |
| Week 1 | Core Utilities     | trpc.js, trpc-provider.js, countries.js, theme.js             |
| Week 2 | UI Components      | lucide-icon.js, ThemeToggle.js, Header.js, CountrySelector.js |
| Week 3 | Auth Components    | SignInForm.js, SignUpForm.js, signin.js, signup.js            |
| Week 4 | API Routes         | login.js, logout.js, status.js, refresh.js                    |
| Week 5 | Feature Components | Collection components, Restaurant components                  |
| Week 6 | Page Components    | Main page components, Feature pages                           |

2. **Authentication Integration**:
   - Authentication components need to be integrated with Amazon Cognito
   - Server-side authentication API routes need to be implemented
   - Secure token handling with HttpOnly cookies
   - User state management needs to be implemented

## Amazon Cognito Authentication Plan

### Implementation Steps

1. **Install Required Dependencies**

   - [x] Install AWS SDK dependencies: `pnpm add -F web @aws-sdk/client-cognito-identity-provider cookie`
   - [x] Configure environment variables for Cognito

2. **Create Authentication Service**

   - [x] Create `/apps/web/src/services/cognitoAuthService.js`
   - [x] Implement sign-in, sign-up, and sign-out functionality
   - [x] Implement token refresh mechanism

3. **Create Server-Side Authentication API Routes**

   - [x] Create `/apps/web/src/pages/api/auth/login.js`
   - [x] Create `/apps/web/src/pages/api/auth/logout.js`
   - [x] Create `/apps/web/src/pages/api/auth/status.js`
   - [x] Create `/apps/web/src/pages/api/auth/refresh.js`
   - [x] Set up secure HttpOnly cookies for token storage

4. **Update AuthContext**

   - [x] Replace the mock authentication with Cognito authentication
   - [x] Update the useAuth hook to use Cognito service
   - [x] Implement proper sign-in and sign-out functionality

5. **Update middleware**
   - [x] Update the custom middleware to check for Cognito tokens
   - [x] Configure middleware to protect the same routes
   - [x] Add proper error handling and redirection

## Route Protection Plan

### Collection Management Pages

1. **Collection Creation Page** ✅

   - [x] Create `/apps/web/src/pages/[country]/collections/create.js`
   - [x] Implement a form for creating new collections
   - [x] Include fields for title, description, image upload, and restaurant selection
   - [x] Add validation for required fields
   - [x] Implement submission handling with mock API (to be replaced with tRPC)
   - [x] Ensure `/collections/create` is included in the protected routes list
   - [x] Create a CollectionForm component for reuse between create and edit pages

2. **Collection Editing Page** ✅
   - [x] Create `/apps/web/src/pages/[country]/collections/edit/[id].js`
   - [x] Implement a form for editing existing collections
   - [x] Pre-populate form with existing collection data
   - [x] Include fields for title, description, image, and restaurant selection
   - [x] Add validation for required fields
   - [x] Ensure `/collections/edit/[id]` is included in the protected routes list
   - [x] Reuse the CollectionForm component from the create page

### Role-Based Access Control

1. **Define roles**

   - [ ] Create a roles enum (USER, ADMIN, MODERATOR, etc.)
   - [ ] Define permissions for each role

2. **Update user model**

   - [ ] Add role field to the user model
   - [ ] Update the database schema

3. **Implement role-based middleware**
   - [ ] Create a middleware function to check user roles
   - [ ] Add role requirements to protected routes
   - [ ] Implement redirection for unauthorized access

### API Route Protection

1. **Implement tRPC middleware**

   - [ ] Update the existing isAuthed middleware to use Cognito
   - [ ] Create role-based middleware for tRPC procedures
   - [ ] Add proper error handling

2. **Protect API routes**
   - [ ] Apply the middleware to all private procedures
   - [ ] Test API access with and without authentication
   - [ ] Implement proper error responses

### Session Timeout Handling

1. **Configure session timeout**

   - [ ] Set appropriate session duration in Cognito config
   - [ ] Implement idle timeout detection

2. **Add UI for session expiration**

   - [ ] Create a session timeout warning component
   - [ ] Implement countdown timer for session expiration
   - [ ] Add option to extend session

3. **API Integration**:

   - Currently using mock data, will need to integrate with real API endpoints
   - Need to implement proper error handling and loading states
   - API client needs to handle authentication tokens

4. **Image Optimization**:

   - Use Next.js Image component for better performance
   - Implement proper image sizing and formats

5. **Responsive Design**:

   - Ensure all components work well on mobile, tablet, and desktop
   - Test on different screen sizes and orientations

6. **Accessibility**:

   - Maintain high color contrast for text
   - Ensure all interactive elements are keyboard accessible
   - Add proper ARIA attributes for screen readers

7. **Performance Optimization**:
   - Implement code splitting for better initial load times
   - Optimize component rendering with React.memo and useMemo
   - Minimize unnecessary re-renders

## Migration Progress

### Applications

- **Web Application**:
  - **Total Files**: ~60
  - **Migrated Files**: 60 (100%)
  - **Pending Files**: 0 (0%)
- **Backend Application**:
  - **Total Files**: ~15
  - **Migrated Files**: 8 (50%)
  - **Pending Files**: 7 (50%)
- **Documentation Site**:
  - **Total Files**: ~10
  - **Migrated Files**: 1 (10%)
  - **Pending Files**: 9 (90%)

### Shared Packages (In Progress)

- **UI Component Library**: 10% migrated (package structure created)
- **Utilities**: 10% migrated (package structure created)
- **API Client**: 0% migrated
- **Database**: 30% migrated (Prisma schema and client setup)
- **tRPC**: 40% migrated (basic router and procedures implemented)
- **Config**: 10% migrated (package structure created)
- **TypeScript Config**: 20% migrated (base configuration implemented)
- **ESLint Config**: 20% migrated (base configuration implemented)
- **Types**: 20% migrated (auth and country types created, others pending)
- **Services**: 15% migrated (authentication service implemented with TypeScript, other services pending)
- **Hooks**: 5% migrated (useDebounce hook implemented with TypeScript, others pending)
- **Contexts**: 40% migrated (AuthContext and CountryContext converted to TypeScript, others pending)
- **Middleware**: 50% migrated (authentication middleware implemented)

## Detailed Migration Inventory

### Hooks

| Original Path                                    | Purpose                                | Dependencies       | Status         |
| ------------------------------------------------ | -------------------------------------- | ------------------ | -------------- |
| `/packages/frontend/src/hooks/useAnalytics.ts`   | Track user interactions and page views | analyticsService   | ❌ Not Started |
| `/packages/frontend/src/hooks/useApi.ts`         | Make API requests with error handling  | api service        | ❌ Not Started |
| `/packages/frontend/src/hooks/useAuth.ts`        | Manage authentication state            | AuthContext        | ❌ Not Started |
| `/packages/frontend/src/hooks/useCognitoUser.ts` | Manage Cognito user authentication     | cognitoAuthService | ❌ Not Started |
| `/packages/frontend/src/hooks/useDebounce.ts`    | Debounce rapidly changing values       | None               | ✅ Completed   |
| `/packages/frontend/src/hooks/useDishVotes.ts`   | Handle dish voting functionality       | api service        | ❌ Not Started |
| `/packages/frontend/src/hooks/useGeolocation.ts` | Get user's geographic location         | None               | ❌ Not Started |
| `/packages/frontend/src/hooks/useRestaurant.ts`  | Fetch and manage restaurant data       | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/hooks/useReviews.ts`     | Manage review submission and display   | reviewService      | ❌ Not Started |
| `/packages/frontend/src/hooks/useUser.ts`        | Manage user data                       | userService        | ❌ Not Started |
| `/packages/frontend/src/hooks/useUserProfile.ts` | Manage user profile data               | userProfileService | ❌ Not Started |
| `/packages/frontend/src/hooks/useUserRanking.ts` | Manage user ranking data               | rankingService     | ❌ Not Started |
| `/packages/frontend/src/hooks/use-toast.ts`      | Display toast notifications            | None               | ❌ Not Started |

### Services

| Original Path                                             | Purpose                                | Dependencies      | Status         |
| --------------------------------------------------------- | -------------------------------------- | ----------------- | -------------- |
| `/packages/frontend/src/services/analyticsService.ts`     | Track user interactions and page views | None              | ❌ Not Started |
| `/packages/frontend/src/services/api.ts`                  | Make API requests                      | None              | ❌ Not Started |
| `/packages/frontend/src/services/cognitoAuthService.ts`   | Handle Cognito authentication          | AWS SDK           | 🔄 In Progress |
| `/packages/frontend/src/services/databaseService.ts`      | Interact with database                 | None              | ❌ Not Started |
| `/packages/frontend/src/services/googleMapsService.ts`    | Integrate with Google Maps             | Google Maps API   | ❌ Not Started |
| `/packages/frontend/src/services/googlePlaces.ts`         | Integrate with Google Places           | Google Places API | ❌ Not Started |
| `/packages/frontend/src/services/mockDataService.ts`      | Generate mock data                     | None              | ❌ Not Started |
| `/packages/frontend/src/services/photoUploadService.ts`   | Handle photo uploads                   | None              | ❌ Not Started |
| `/packages/frontend/src/services/postgresService.ts`      | Interact with PostgreSQL               | None              | ❌ Not Started |
| `/packages/frontend/src/services/rankingService.ts`       | Manage user and restaurant rankings    | api service       | ❌ Not Started |
| `/packages/frontend/src/services/restaurantService.ts`    | Manage restaurant data                 | api service       | ❌ Not Started |
| `/packages/frontend/src/services/reviewService.ts`        | Manage review submissions              | api service       | ❌ Not Started |
| `/packages/frontend/src/services/social-media-service.ts` | Integrate with social media            | None              | ❌ Not Started |
| `/packages/frontend/src/services/userProfileService.ts`   | Manage user profiles                   | api service       | ❌ Not Started |
| `/packages/frontend/src/services/userService.ts`          | Manage user accounts                   | api service       | ❌ Not Started |
| `/packages/frontend/src/services/openai.ts`               | Integrate with OpenAI                  | OpenAI API        | 🚫 Not Needed  |

### Contexts

| Original Path                                        | Purpose                     | Dependencies       | Status       |
| ---------------------------------------------------- | --------------------------- | ------------------ | ------------ |
| `/packages/frontend/src/contexts/AuthContext.tsx`    | Manage authentication state | cognitoAuthService | ✅ Completed |
| `/packages/frontend/src/contexts/CountryContext.tsx` | Manage country selection    | None               | ✅ Completed |

### Utils

| Original Path                                         | Purpose                              | Dependencies | Status         |
| ----------------------------------------------------- | ------------------------------------ | ------------ | -------------- |
| `/packages/frontend/src/utils/apiConfig.ts`           | Configure API endpoints              | None         | ❌ Not Started |
| `/packages/frontend/src/utils/auth.ts`                | Authentication utilities             | None         | ❌ Not Started |
| `/packages/frontend/src/utils/authRedirect.ts`        | Handle authentication redirects      | None         | ❌ Not Started |
| `/packages/frontend/src/utils/aws.ts`                 | AWS service utilities                | AWS SDK      | ❌ Not Started |
| `/packages/frontend/src/utils/country.ts`             | Country-specific utilities           | None         | ❌ Not Started |
| `/packages/frontend/src/utils/countryRouteHelpers.ts` | Generate country-specific routes     | None         | ❌ Not Started |
| `/packages/frontend/src/utils/csrfProtection.ts`      | CSRF protection utilities            | None         | ❌ Not Started |
| `/packages/frontend/src/utils/date.ts`                | Date formatting and manipulation     | None         | ❌ Not Started |
| `/packages/frontend/src/utils/db.ts`                  | Database interaction utilities       | None         | ❌ Not Started |
| `/packages/frontend/src/utils/debugLogger.ts`         | Debug logging utilities              | None         | ❌ Not Started |
| `/packages/frontend/src/utils/environment.ts`         | Environment detection utilities      | None         | ❌ Not Started |
| `/packages/frontend/src/utils/environmentHandler.ts`  | Environment variable handling        | None         | ❌ Not Started |
| `/packages/frontend/src/utils/events.ts`              | Event handling utilities             | None         | ❌ Not Started |
| `/packages/frontend/src/utils/hydration-fix.ts`       | React hydration issue fixes          | None         | ❌ Not Started |
| `/packages/frontend/src/utils/image.ts`               | Image processing utilities           | None         | ❌ Not Started |
| `/packages/frontend/src/utils/imageCompression.ts`    | Image compression utilities          | None         | ❌ Not Started |
| `/packages/frontend/src/utils/logger.ts`              | Logging utilities                    | None         | ❌ Not Started |
| `/packages/frontend/src/utils/postgres.ts`            | PostgreSQL utilities                 | None         | ❌ Not Started |
| `/packages/frontend/src/utils/serverAuth.ts`          | Server-side authentication utilities | None         | ❌ Not Started |
| `/packages/frontend/src/utils/types.ts`               | Type definitions                     | None         | ❌ Not Started |

### UI Components

| Original Path                                                       | Purpose                         | Dependencies | Status         |
| ------------------------------------------------------------------- | ------------------------------- | ------------ | -------------- |
| `/packages/frontend/src/components/ui/alert-dialog.tsx`             | Alert dialog component          | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/avatar.tsx`                   | Avatar component                | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/badge.tsx`                    | Badge component                 | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/button.tsx`                   | Button component                | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/calendar.tsx`                 | Calendar component              | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/card.tsx`                     | Card component                  | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/client-only.tsx`              | Client-only rendering component | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/client-svg.tsx`               | Client-side SVG component       | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/collapsible.tsx`              | Collapsible component           | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/command.tsx`                  | Command component               | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/custom-tabs.tsx`              | Custom tabs component           | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/custom-toast.tsx`             | Custom toast component          | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/dialog.tsx`                   | Dialog component                | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/dropdown-menu.tsx`            | Dropdown menu component         | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/dynamic-content.tsx`          | Dynamic content component       | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/Elements.tsx`                 | UI elements component           | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/hydration-error-boundary.tsx` | Hydration error boundary        | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/input.tsx`                    | Input component                 | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/label.tsx`                    | Label component                 | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/lucide-icon.tsx`              | Lucide icon component           | None         | ✅ Completed   |
| `/packages/frontend/src/components/ui/photo-uploader.tsx`           | Photo uploader component        | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/popover.tsx`                  | Popover component               | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/progress.tsx`                 | Progress component              | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/radio-group.tsx`              | Radio group component           | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/safe-image.tsx`               | Safe image component            | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/scroll-area.tsx`              | Scroll area component           | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/search-field.tsx`             | Search field component          | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/select.tsx`                   | Select component                | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/separator.tsx`                | Separator component             | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/sheet.tsx`                    | Sheet component                 | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/skeleton.tsx`                 | Skeleton component              | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/slider.tsx`                   | Slider component                | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/suspense-boundary-fix.tsx`    | Suspense boundary fix           | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/switch.tsx`                   | Switch component                | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/table.tsx`                    | Table component                 | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/tabs.tsx`                     | Tabs component                  | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/textarea.tsx`                 | Textarea component              | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/toast.tsx`                    | Toast component                 | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/tooltip.tsx`                  | Tooltip component               | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/use-toast.ts`                 | Toast hook                      | None         | ❌ Not Started |
| `/packages/frontend/src/components/ui/ThemeToggle.jsx`              | Theme toggle component          | None         | ✅ Completed   |

### Layout Components

| Original Path                                                   | Purpose                 | Dependencies | Status         |
| --------------------------------------------------------------- | ----------------------- | ------------ | -------------- |
| `/packages/frontend/src/components/layout/Header.tsx`           | Header component        | None         | ❌ Not Started |
| `/packages/frontend/src/components/layout/index.tsx`            | Layout index            | None         | ❌ Not Started |
| `/packages/frontend/src/components/layout/MobileNavigation.tsx` | Mobile navigation       | None         | ❌ Not Started |
| `/packages/frontend/src/components/layout/Navigation.tsx`       | Navigation component    | None         | ❌ Not Started |
| `/packages/frontend/src/components/layout/PageLayout.tsx`       | Page layout component   | None         | ❌ Not Started |
| `/packages/frontend/src/components/layout/RightSidebar.tsx`     | Right sidebar component | None         | ❌ Not Started |
| `/packages/frontend/src/components/layout/Sidebar.tsx`          | Sidebar component       | None         | ❌ Not Started |

### Feature Components

| Original Path                                                         | Purpose                  | Dependencies       | Status         |
| --------------------------------------------------------------------- | ------------------------ | ------------------ | -------------- |
| `/packages/frontend/src/components/AddDishDialog.tsx`                 | Add dish dialog          | None               | ❌ Not Started |
| `/packages/frontend/src/components/AddRestaurantButton.tsx`           | Add restaurant button    | None               | ❌ Not Started |
| `/packages/frontend/src/components/admin/AdminGuard.tsx`              | Admin guard component    | None               | ❌ Not Started |
| `/packages/frontend/src/components/analytics/AnalyticsProvider.tsx`   | Analytics provider       | analyticsService   | ❌ Not Started |
| `/packages/frontend/src/components/analytics/PageView.tsx`            | Page view tracking       | analyticsService   | ❌ Not Started |
| `/packages/frontend/src/components/analytics/RestaurantAnalytics.tsx` | Restaurant analytics     | analyticsService   | ❌ Not Started |
| `/packages/frontend/src/components/analytics/TrendingRestaurants.tsx` | Trending restaurants     | analyticsService   | ❌ Not Started |
| `/packages/frontend/src/components/auth/ClientOnlyAuth.tsx`           | Client-only auth         | AuthContext        | ❌ Not Started |
| `/packages/frontend/src/components/AuthStateManager.tsx`              | Auth state manager       | AuthContext        | ❌ Not Started |
| `/packages/frontend/src/components/certificates-section.tsx`          | Certificates section     | None               | ❌ Not Started |
| `/packages/frontend/src/components/charts/BarChart.tsx`               | Bar chart component      | None               | ❌ Not Started |
| `/packages/frontend/src/components/ChatInterface.tsx`                 | Chat interface           | None               | ❌ Not Started |
| `/packages/frontend/src/components/CustomDatePicker.tsx`              | Custom date picker       | None               | ❌ Not Started |
| `/packages/frontend/src/components/dish-restaurants.tsx`              | Dish restaurants         | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/components/dish/DishRanking.tsx`              | Dish ranking             | rankingService     | ❌ Not Started |
| `/packages/frontend/src/components/dish/DishVoting.tsx`               | Dish voting              | api service        | ❌ Not Started |
| `/packages/frontend/src/components/dynamic-dish-ranking.tsx`          | Dynamic dish ranking     | rankingService     | ❌ Not Started |
| `/packages/frontend/src/components/ExploreTab.tsx`                    | Explore tab              | googleMapsService  | ❌ Not Started |
| `/packages/frontend/src/components/FeedContent.tsx`                   | Feed content             | None               | ❌ Not Started |
| `/packages/frontend/src/components/FormField.tsx`                     | Form field               | None               | ❌ Not Started |
| `/packages/frontend/src/components/homepage.tsx`                      | Homepage component       | None               | ❌ Not Started |
| `/packages/frontend/src/components/homepage/Collections.tsx`          | Collections component    | None               | ❌ Not Started |
| `/packages/frontend/src/components/homepage/FeaturedRestaurants.tsx`  | Featured restaurants     | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/components/homepage/Navigation.tsx`           | Homepage navigation      | None               | ❌ Not Started |
| `/packages/frontend/src/components/homepage/PremiumBanner.tsx`        | Premium banner           | None               | ❌ Not Started |
| `/packages/frontend/src/components/homepage/TopCritics.tsx`           | Top critics              | userService        | ❌ Not Started |
| `/packages/frontend/src/components/homepage/TopFoodies.tsx`           | Top foodies              | userService        | ❌ Not Started |
| `/packages/frontend/src/components/homepage/TopRatedDishes.tsx`       | Top rated dishes         | None               | ❌ Not Started |
| `/packages/frontend/src/components/LocationSearch.tsx`                | Location search          | googlePlaces       | ❌ Not Started |
| `/packages/frontend/src/components/my-foodie-leaderboard.tsx`         | Foodie leaderboard       | userService        | ❌ Not Started |
| `/packages/frontend/src/components/profile.tsx`                       | Profile component        | userProfileService | ❌ Not Started |
| `/packages/frontend/src/components/profile/GalleryTab.tsx`            | Gallery tab              | userProfileService | ❌ Not Started |
| `/packages/frontend/src/components/profile/PostsTab.tsx`              | Posts tab                | userProfileService | ❌ Not Started |
| `/packages/frontend/src/components/profile/RankingsTab.tsx`           | Rankings tab             | rankingService     | ❌ Not Started |
| `/packages/frontend/src/components/profile/ReviewsTab.tsx`            | Reviews tab              | reviewService      | ❌ Not Started |
| `/packages/frontend/src/components/ProtectedRoute.tsx`                | Protected route          | AuthContext        | ❌ Not Started |
| `/packages/frontend/src/components/rankings/RankingCard.tsx`          | Ranking card             | None               | ❌ Not Started |
| `/packages/frontend/src/components/rankings/RankingDialog.tsx`        | Ranking dialog           | None               | ❌ Not Started |
| `/packages/frontend/src/components/RecentlyAdded.tsx`                 | Recently added           | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/components/ResendVerification.tsx`            | Resend verification      | cognitoAuthService | ❌ Not Started |
| `/packages/frontend/src/components/restaurant-management.tsx`         | Restaurant management    | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/AboutSection.tsx`       | Restaurant about section | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/BookTableDialog.tsx`    | Book table dialog        | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/HeroSection.tsx`        | Restaurant hero section  | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/ImageGallery.tsx`       | Image gallery            | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/MenuSection.tsx`        | Menu section             | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/PhotoGallery.tsx`       | Photo gallery            | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RankingsSection.tsx`    | Rankings section         | rankingService     | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RestaurantActions.tsx`  | Restaurant actions       | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RestaurantCard.tsx`     | Restaurant card          | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RestaurantMap.tsx`      | Restaurant map           | googleMapsService  | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RestaurantMapView.tsx`  | Restaurant map view      | googleMapsService  | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RestaurantOffers.tsx`   | Restaurant offers        | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/RestaurantSearch.tsx`   | Restaurant search        | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/ReviewCard.tsx`         | Review card              | None               | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/ReviewForm.tsx`         | Review form              | reviewService      | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/ReviewSection.tsx`      | Review section           | reviewService      | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/ReviewsSection.tsx`     | Reviews section          | reviewService      | ❌ Not Started |
| `/packages/frontend/src/components/restaurant/SpecialtiesSection.tsx` | Specialties section      | None               | ❌ Not Started |
| `/packages/frontend/src/components/RestaurantCard.tsx`                | Restaurant card          | None               | ❌ Not Started |
| `/packages/frontend/src/components/SearchAndFilter.tsx`               | Search and filter        | None               | ❌ Not Started |
| `/packages/frontend/src/components/services-section.tsx`              | Services section         | None               | ❌ Not Started |
| `/packages/frontend/src/components/settings.tsx`                      | Settings component       | userService        | ❌ Not Started |
| `/packages/frontend/src/components/Statistics.tsx`                    | Statistics component     | None               | ❌ Not Started |
| `/packages/frontend/src/components/TermsOfServiceContent.tsx`         | Terms of service content | None               | ❌ Not Started |
| `/packages/frontend/src/components/TermsOfServiceModal.tsx`           | Terms of service modal   | None               | ❌ Not Started |
| `/packages/frontend/src/components/TopFiveRestaurants.tsx`            | Top five restaurants     | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/components/UserProfileDisplay.tsx`            | User profile display     | userProfileService | ❌ Not Started |

### API Routes

| Original Path                                                  | Purpose                                | Dependencies       | Status         |
| -------------------------------------------------------------- | -------------------------------------- | ------------------ | -------------- |
| `/packages/frontend/src/pages/api/admin/restaurants/create.ts` | Create restaurant (admin)              | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/admin/status.ts`             | Admin status check                     | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/auth/login.ts`               | User login                             | cognitoAuthService | 🔄 In Progress |
| `/packages/frontend/src/pages/api/auth/logout.ts`              | User logout                            | cognitoAuthService | 🔄 In Progress |
| `/packages/frontend/src/pages/api/auth/refresh.ts`             | Refresh authentication token           | cognitoAuthService | 🔄 In Progress |
| `/packages/frontend/src/pages/api/auth/status.ts`              | Authentication status check            | cognitoAuthService | 🔄 In Progress |
| `/packages/frontend/src/pages/api/aws/secrets.ts`              | AWS Secrets Manager access             | AWS SDK            | ❌ Not Started |
| `/packages/frontend/src/pages/api/aws/ssm.ts`                  | AWS Systems Manager access             | AWS SDK            | ❌ Not Started |
| `/packages/frontend/src/pages/api/csrf.ts`                     | CSRF protection                        | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/debug-auth.ts`               | Debug authentication                   | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/debug-logs.ts`               | Debug logs                             | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/dishes/[id]/rankings.ts`     | Get dish rankings                      | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/health.ts`                   | Health check                           | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/hello.ts`                    | Hello world                            | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/photos/[reference].ts`       | Get photo by reference                 | photoUploadService | ❌ Not Started |
| `/packages/frontend/src/pages/api/postgres/dishes/[id]/vote.ts`| Vote on dish                           | postgresService    | ❌ Not Started |
| `/packages/frontend/src/pages/api/postgres/dishes/[id]/votes.ts`| Get dish votes                        | postgresService    | ❌ Not Started |
| `/packages/frontend/src/pages/api/postgres/dishes/top.ts`      | Get top dishes                         | postgresService    | ❌ Not Started |
| `/packages/frontend/src/pages/api/postgres/users/[id].ts`      | Get user by ID                         | postgresService    | ❌ Not Started |
| `/packages/frontend/src/pages/api/postgres/users/[id]/votes.ts`| Get user votes                         | postgresService    | ❌ Not Started |
| `/packages/frontend/src/pages/api/proxy/[...path].ts`          | Generic API proxy                      | None               | ❌ Not Started |
| `/packages/frontend/src/pages/api/proxy/analytics/*`           | Analytics proxy endpoints              | analyticsService   | ❌ Not Started |
| `/packages/frontend/src/pages/api/proxy/db/users/*`            | User database proxy endpoints          | databaseService    | ❌ Not Started |
| `/packages/frontend/src/pages/api/proxy/user/*`                | User profile proxy endpoints           | userProfileService | ❌ Not Started |
| `/packages/frontend/src/pages/api/proxy/users/*`               | Users proxy endpoints                  | userService        | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/create.ts`          | Create ranking                         | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/global/[dishSlug].ts`| Get global dish rankings              | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/index.ts`           | Get all rankings                       | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/local/[dishSlug].ts`| Get local dish rankings                | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/my/[dishSlug].ts`   | Get user's dish rankings               | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/my/index.ts`        | Get user's rankings                    | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/update/[id].ts`     | Update ranking                         | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/rankings/user/[id].ts`       | Get user rankings                      | rankingService     | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/[id].ts`         | Get restaurant by ID                   | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/[id]/dishes.ts`  | Get restaurant dishes                  | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/[id]/hours.ts`   | Get restaurant hours                   | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/[id]/photos.ts`  | Get restaurant photos                  | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/dish/[dishId].ts`| Get restaurants serving dish           | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/list.ts`         | Get restaurant list                    | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/restaurants/search.ts`       | Search restaurants                     | restaurantService  | ❌ Not Started |
| `/packages/frontend/src/pages/api/reviews/[id].ts`             | Get review by ID                       | reviewService      | ❌ Not Started |
| `/packages/frontend/src/pages/api/reviews/index.ts`            | Get all reviews                        | reviewService      | ❌ Not Started |
| `/packages/frontend/src/pages/api/reviews/user/[id].ts`        | Get user reviews                       | reviewService      | ❌ Not Started |
| `/packages/frontend/src/pages/api/upload/ranking-photo.ts`     | Upload ranking photo                   | photoUploadService | ❌ Not Started |
| `/packages/frontend/src/pages/api/user/profile/follow.ts`      | Follow user                            | userProfileService | ❌ Not Started |
| `/packages/frontend/src/pages/api/user/profile/followers.ts`   | Get user followers                     | userProfileService | ❌ Not Started |
| `/packages/frontend/src/pages/api/user/profile/following.ts`   | Get users followed by user             | userProfileService | ❌ Not Started |
| `/packages/frontend/src/pages/api/user/profile/index.ts`       | Get user profile                       | userProfileService | ❌ Not Started |

### Config Files

| Original Path                                       | Purpose                                | Dependencies | Status         |
| --------------------------------------------------- | -------------------------------------- | ------------ | -------------- |
| `/packages/frontend/src/config/countries.ts`        | Country configuration                  | None         | ✅ Completed   |
| `/packages/frontend/src/config/elevenlabs.ts`       | ElevenLabs API configuration           | None         | ❌ Not Started |
| `/packages/frontend/src/config/openai.ts`           | OpenAI API configuration               | None         | ❌ Not Started |
| `/packages/frontend/src/config/prompts.ts`          | AI prompt templates                    | None         | ❌ Not Started |
| `/packages/frontend/src/config/restaurantConfig.ts` | Restaurant configuration               | None         | ❌ Not Started |
| `/packages/frontend/src/config/typeMatchers.ts`     | Type matchers configuration            | None         | ❌ Not Started |
| `/packages/frontend/src/config/types.ts`            | Config type definitions                | None         | ❌ Not Started |
| `/packages/typescript-config/base.json`             | Base TypeScript configuration          | None         | ❌ Not Started |
| `/packages/typescript-config/index.json`            | Index TypeScript configuration         | None         | ❌ Not Started |
| `/packages/typescript-config/nextjs.json`           | Next.js TypeScript configuration       | None         | ❌ Not Started |
| `/packages/typescript-config/package.json`          | TS Config package.json                 | None         | ❌ Not Started |
| `/packages/typescript-config/react-library.json`    | React Library TypeScript configuration | None         | ❌ Not Started |
| `/packages/eslint-config/index.js`                  | Index ESLint configuration             | None         | ❌ Not Started |
| `/packages/eslint-config/library.js`                | Library ESLint configuration           | None         | ❌ Not Started |
| `/packages/eslint-config/next.js`                   | Next.js ESLint configuration           | None         | ❌ Not Started |
| `/packages/eslint-config/package.json`              | ESLint Config package.json             | None         | ❌ Not Started |
| `/packages/eslint-config/react-internal.js`         | React Internal ESLint configuration    | None         | ❌ Not Started |

### Types

| Original Path                                    | Purpose                          | Dependencies | Status         |
| ------------------------------------------------ | -------------------------------- | ------------ | -------------- |
| `/packages/frontend/src/types.ts`                | General type definitions         | None         | ❌ Not Started |
| `/packages/frontend/src/types/api.ts`            | API type definitions             | None         | ❌ Not Started |
| `/packages/frontend/src/types/index.ts`          | Type exports                     | None         | ❌ Not Started |
| `/packages/frontend/src/types/restaurant.ts`     | Restaurant type definitions      | None         | ❌ Not Started |
| `/packages/frontend/src/types/restaurant.d.ts`   | Restaurant type declarations     | None         | ❌ Not Started |
| `/packages/frontend/src/utils/types.ts`          | Utility type definitions         | None         | ❌ Not Started |
| `/packages/shared/src/types/index.ts`            | Shared type definitions          | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/types/` | Infrastructure type definitions  | None         | ❌ Not Started |

### Infrastructure Components

| Original Path                                                                | Purpose                                | Dependencies | Status         |
| ---------------------------------------------------------------------------- | -------------------------------------- | ------------ | -------------- |
| `/packages/infra/src/layers/middleware/nodejs/middlewares/errorHandler.ts`   | Error handling middleware              | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/middlewares/validation.ts`     | Request validation middleware          | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/middlewares/tracing.ts`        | Request tracing middleware             | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/middlewares/specialized/apiGateway.ts` | API Gateway middleware         | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/middlewares/specialized/eventBridge.ts` | EventBridge middleware        | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/middlewares/specialized/sqs.ts` | SQS middleware                        | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/utils/eventBridge.ts`          | EventBridge utilities                  | None         | ❌ Not Started |
| `/packages/infra/src/layers/middleware/nodejs/utils/sqs.ts`                  | SQS utilities                          | None         | ❌ Not Started |
| `/packages/infra/src/layers/nodejs/event-utils/index.ts`                     | Event utilities                        | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/aws.ts`                             | AWS utilities                          | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/errors.ts`                          | Error handling utilities               | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/event-handler.ts`                   | Event handler utilities                | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/google.ts`                          | Google API utilities                   | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/types/db-types.ts`                  | Database type definitions              | None         | ❌ Not Started |
| `/packages/infra/src/layers/utils/nodejs/types/event-types.ts`               | Event type definitions                 | None         | ❌ Not Started |
| `/packages/infra/src/pages/health.ts`                                        | Health check endpoint                  | None         | ❌ Not Started |
| `/packages/infra/functions/`                                                 | Lambda functions                       | None         | ❌ Not Started |
| `/packages/infra/lib/`                                                       | Infrastructure library                 | None         | ❌ Not Started |

### Pages

| Original Path                                                           | Purpose                    | Dependencies | Status         |
| ----------------------------------------------------------------------- | -------------------------- | ------------ | -------------- |
| `/packages/frontend/src/pages/_app.tsx`                                 | App component              | None         | ❌ Not Started |
| `/packages/frontend/src/pages/_document.tsx`                            | Document component         | None         | ❌ Not Started |
| `/packages/frontend/src/pages/_error.tsx`                               | Error page                 | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/ai-center.tsx`                  | AI center page             | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/chatbot/[id].tsx`               | Chatbot detail page        | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/competitions.tsx`               | Competitions page          | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/dish-restaurants.tsx`           | Dish restaurants page      | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/dishes.tsx`                     | Dishes page                | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/example-migration.tsx`          | Example migration page     | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/explore.tsx`                    | Explore page               | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/favorites.tsx`                  | Favorites page             | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/index.tsx`                      | Country homepage           | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/my-foodie-leaderboard.tsx`      | Foodie leaderboard page    | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/premium.tsx`                    | Premium page               | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/profile.tsx`                    | Profile page               | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/profile/edit.tsx`               | Profile edit page          | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/ranking.tsx`                    | Ranking page               | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/rankings/global/[dishSlug].tsx` | Global dish ranking page   | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/rankings/index.tsx`             | Rankings index page        | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/rankings/local/[dishSlug].tsx`  | Local dish ranking page    | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/rankings/my/[dishSlug].tsx`     | My dish ranking page       | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/rankings/my/index.tsx`          | My rankings index page     | None         | ❌ Not Started |
| `/packages/frontend/src/pages/[country]/restaurant-management.tsx`      | Restaurant management page | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/restaurant/[id].tsx`            | Restaurant detail page     | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/restaurants.tsx`                | Restaurants page           | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/settings.tsx`                   | Settings page              | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/social.tsx`                     | Social page                | None         | ✅ Completed   |
| `/packages/frontend/src/pages/[country]/test-simple.tsx`                | Test page                  | None         | ❌ Not Started |
| `/packages/frontend/src/pages/403.tsx`                                  | 403 error page             | None         | ❌ Not Started |
| `/packages/frontend/src/pages/404.tsx`                                  | 404 error page             | None         | ❌ Not Started |
| `/packages/frontend/src/pages/500.tsx`                                  | 500 error page             | None         | ❌ Not Started |
| `/packages/frontend/src/pages/admin/index.tsx`                          | Admin index page           | None         | ❌ Not Started |
| `/packages/frontend/src/pages/admin/restaurants/create.tsx`             | Create restaurant page     | None         | ❌ Not Started |
| `/packages/frontend/src/pages/ai-center/[id].tsx`                       | AI center detail page      | None         | ❌ Not Started |
| `/packages/frontend/src/pages/ai-center/index.tsx`                      | AI center index page       | None         | ❌ Not Started |
| `/packages/frontend/src/pages/chatbot/[id].tsx`                         | Chatbot detail page        | None         | ❌ Not Started |
| `/packages/frontend/src/pages/chatbot/index.tsx`                        | Chatbot index page         | None         | ❌ Not Started |
| `/packages/frontend/src/pages/competitions.tsx`                         | Competitions page          | None         | ❌ Not Started |
| `/packages/frontend/src/pages/debug.tsx`                                | Debug page                 | None         | ❌ Not Started |
| `/packages/frontend/src/pages/dish-restaurants.tsx`                     | Dish restaurants page      | None         | ❌ Not Started |
| `/packages/frontend/src/pages/explore.tsx`                              | Explore page               | None         | ❌ Not Started |
| `/packages/frontend/src/pages/favorites.tsx`                            | Favorites page             | None         | ❌ Not Started |
| `/packages/frontend/src/pages/forgot-password.tsx`                      | Forgot password page       | None         | ❌ Not Started |
| `/packages/frontend/src/pages/health.ts`                                | Health check page          | None         | ❌ Not Started |
| `/packages/frontend/src/pages/index.tsx`                                | Root index page            | None         | ✅ Completed   |
| `/packages/frontend/src/pages/my/example-migration.tsx`                 | Example migration page     | None         | ❌ Not Started |
| `/packages/frontend/src/pages/profile/[userId].tsx`                     | User profile page          | None         | ❌ Not Started |
| `/packages/frontend/src/pages/profile/edit.tsx`                         | Profile edit page          | None         | ❌ Not Started |
| `/packages/frontend/src/pages/profile/index.tsx`                        | Profile index page         | None         | ❌ Not Started |
| `/packages/frontend/src/pages/resend-verification.tsx`                  | Resend verification page   | None         | ❌ Not Started |
| `/packages/frontend/src/pages/restaurant-management.tsx`                | Restaurant management page | None         | ❌ Not Started |
| `/packages/frontend/src/pages/restaurants.tsx`                          | Restaurants page           | None         | ❌ Not Started |
| `/packages/frontend/src/pages/settings.tsx`                             | Settings page              | None         | ❌ Not Started |
| `/packages/frontend/src/pages/signin.tsx`                               | Sign in page               | None         | ✅ Completed   |
| `/packages/frontend/src/pages/signup.tsx`                               | Sign up page               | None         | ✅ Completed   |
| `/packages/frontend/src/pages/simple-test.tsx`                          | Simple test page           | None         | ❌ Not Started |
| `/packages/frontend/src/pages/social.tsx`                               | Social page                | None         | ❌ Not Started |
| `/packages/frontend/src/pages/terms.tsx`                                | Terms page                 | None         | ❌ Not Started |
| `/packages/frontend/src/pages/xml-error.tsx`                            | XML error page             | None         | ❌ Not Started |

### Migration Dependencies Graph

```
# Core Dependencies
AuthContext → cognitoAuthService → AWS SDK
CountryContext → country utils
useAuth → AuthContext
useUser → userService → api service
useRestaurant → restaurantService → api service
useReviews → reviewService → api service
useDishVotes → api service
useUserProfile → userProfileService → api service
useUserRanking → rankingService → api service
useAnalytics → analyticsService → api service
useGeolocation → None

# Service Dependencies
analyticsService → api service
googleMapsService → api service
googlePlaces → api service
rankingService → api service
restaurantService → api service
reviewService → api service
userProfileService → api service
userService → api service
photoUploadService → api service
databaseService → postgresService → api service
mockDataService → None
social-media-service → api service

# Component Dependencies
RestaurantCard → restaurantService
RestaurantList → restaurantService
RestaurantHeader → restaurantService
RestaurantInfo → restaurantService
RestaurantMenu → restaurantService
RestaurantReviews → reviewService
RestaurantLocation → googleMapsService
SimilarRestaurants → restaurantService
DishHeader → restaurantService
DishIngredients → restaurantService
DishReviews → reviewService
DishVoting → api service
SimilarDishes → restaurantService
SearchResults → restaurantService
SearchFilters → None
SignInForm → cognitoAuthService
SignUpForm → cognitoAuthService
ProfileHeader → userProfileService
ProfileTabs → userProfileService
UserReviews → reviewService
UserFavorites → userProfileService
ExploreMap → googleMapsService
NearbyRestaurants → googleMapsService, restaurantService

# Infrastructure Dependencies
Lambda Functions → AWS SDK
API Gateway → Lambda Functions
Aurora Serverless → Prisma ORM
Outbox Pattern → EventBridge → Lambda Functions
Cognito → API Gateway Authorizers
```

## Comprehensive Migration Audit Summary

### Total Items by Category

| Category               | Total Items | Completed | In Progress | Not Started | Completion % |
| ---------------------- | ----------- | --------- | ----------- | ----------- | ------------ |
| **Applications**       | 3           | 1         | 2           | 0           | 33%          |
| **Hooks**              | 14          | 1         | 0           | 13          | 7%           |
| **Services**           | 16          | 1         | 1           | 14          | 6%           |
| **Contexts**           | 2           | 2         | 0           | 0           | 100%         |
| **Utils**              | 20          | 0         | 0           | 20          | 0%           |
| **UI Components**      | 40          | 2         | 0           | 38          | 5%           |
| **Feature Components** | 66          | 12        | 0           | 54          | 18%          |
| **API Routes**         | 48          | 0         | 1           | 47          | 2%           |
| **Pages**              | 56          | 15        | 0           | 41          | 27%          |
| **Config**             | 16          | 1         | 0           | 15          | 6%           |
| **Types**              | 8           | 0         | 0           | 8           | 0%           |
| **Infrastructure**     | 18          | 0         | 0           | 18          | 0%           |
| **Overall**            | 307         | 35        | 4           | 268         | 11%          |

### Key Findings

1. **Documentation Accuracy**: The previous migration documentation underestimated the total number of components to be migrated. The actual count is 307 items compared to the previously estimated 246 items.

2. **Missing Categories**: The previous documentation did not include dedicated sections for Types and Infrastructure components, which are critical parts of the application.

3. **API Routes**: The API routes section has been significantly expanded from 17 to 48 items, providing a more accurate representation of the backend functionality that needs to be migrated.

4. **Pages**: The pages section has been expanded from 4 to 56 items, reflecting the full scope of the application's user interface.

5. **Feature Components**: The feature components section has been expanded from 59 to 66 items, capturing additional components found in the original codebase.

### Priority Recommendations

Based on the comprehensive audit, the following components should be prioritized for migration:

1. **Core Services**: Complete the migration of `cognitoAuthService` which is currently in progress, as it's a dependency for many other components.

2. **Utility Functions**: Migrate the utility functions next, as they are dependencies for many services and components.

3. **UI Components**: Focus on migrating the UI components library, as these are building blocks for feature components.

4. **API Routes**: Prioritize the authentication-related API routes, which are currently in progress.

5. **Infrastructure Components**: Begin planning the migration of infrastructure components, particularly those related to AWS integration.

### Recommended Next Steps

1. Complete the migration of `cognitoAuthService` and related authentication API routes.
2. Begin migrating utility functions, starting with those that have the fewest dependencies.
3. Migrate the UI component library to establish a foundation for feature components.
4. Update the migration plan to reflect the expanded scope and adjusted priorities.
5. Consider a phased approach to infrastructure migration, starting with core AWS services.

## Next Steps

### Web Application

1. ✅ Implement search functionality and search results page
2. ✅ Implement authentication pages (sign in, sign up)
3. ✅ Implement user profile page and related components
4. ✅ Implement collections pages and components
5. ✅ Implement explore page and map functionality
6. ✅ Implement social feed page
7. ✅ Implement competitions page
8. ✅ Implement dish detail page and components
9. ✅ Implement review submission page and form
10. ✅ Implement settings page and related components

### Backend Application (API Gateway & Lambda)

1. ✅ Create backend application structure
2. Implement tRPC integration with AWS API Gateway:
   - Configure tRPC server for API Gateway compatibility
   - Set up API Gateway proxy integration
   - Create Lambda handler for tRPC requests
   - Configure CORS for cross-origin requests
3. ✅ Implement health check endpoint
4. Implement AWS Lambda function handlers:
   - Create main tRPC handler function
   - Implement domain-specific Lambda functions
   - Set up shared middleware and utilities
5. Configure API Gateway:
   - Set up API Gateway routes and integrations
   - Configure request/response mappings
   - Set up custom domain and SSL certificates
6. Implement security features:
   - Configure Cognito User Pools and Identity Pools
   - Set up API Gateway authorizers
   - Implement JWT validation
   - Configure AWS WAF rules
7. Set up monitoring and logging:
   - Configure CloudWatch logs and metrics
   - Set up X-Ray for distributed tracing
   - Implement custom logging middleware
   - Create monitoring dashboards and alerts
8. Implement database integration:
   - Configure Aurora Serverless v2 PostgreSQL
   - Set up Prisma ORM with connection pooling
   - Implement Outbox pattern for event processing
   - Configure database backup and recovery

### Documentation Site

1. ✅ Create documentation site structure
2. Implement documentation pages for UI components
3. Implement documentation pages for API endpoints
4. Implement documentation pages for authentication
5. Implement documentation pages for deployment

### Shared Packages

8. ✅ Create UI component library package structure
9. Migrate shared UI components to the UI library
10. ✅ Create utilities package and migrate utility functions
11. Create API client package for backend integration
12. ✅ Create database package with Prisma ORM for Aurora Serverless v2 PostgreSQL
13. Implement Outbox pattern for reliable event processing:
    - Create outbox table in database schema
    - Implement transaction management to write to both primary and outbox tables
    - Create Lambda function to process outbox events
    - Set up event processing and retry mechanisms
    - Implement idempotent event handlers
14. ✅ Create tRPC package for type-safe API:
    - Configure tRPC server with API Gateway integration
    - Set up tRPC routers for different domains
    - Implement tRPC procedures with proper input validation
    - Create Lambda handler for tRPC requests
    - Configure tRPC client for frontend integration
15. ✅ Create shared TypeScript types package
16. ✅ Create shared configuration package
17. ✅ Create hooks package and migrate custom React hooks
18. ✅ Create services package and migrate service modules
19. ✅ Create TypeScript config package
20. ✅ Create ESLint config package
21. ✅ Begin TypeScript conversion with context providers and type definitions (paused)
22. Migrate core utilities and services from original repository
23. Migrate hooks and UI components from original repository
24. Migrate feature components from original repository
25. Migrate API routes from original repository
26. Migrate pages from original repository
27. Resume TypeScript conversion after achieving 100% functional migration

### Authentication and Route Protection

14. ✅ Implement collection creation page (/collections/create)
15. ✅ Implement collection editing page (/collections/edit/[id])
16. ✅ Integrate with Amazon Cognito for authentication
17. ✅ Implement server-side authentication API routes
18. ✅ Implement proper token validation and refresh mechanism
19. Add API route protection for backend endpoints
20. Add session timeout handling

## Backend Components to Migrate

### tRPC Routers (API Gateway Integration)

- **userRouter**: User management endpoints ✅
- **restaurantRouter**: Restaurant data endpoints
- **reviewRouter**: Review management endpoints
- **collectionRouter**: Collection management endpoints
- **searchRouter**: Search functionality endpoints
- **authRouter**: Authentication endpoints
- **profileRouter**: User profile endpoints
- **adminRouter**: Admin functionality endpoints

### AWS Lambda Functions

- **apiGatewayHandler**: Main API Gateway handler for tRPC requests
- **authorizerFunction**: Custom authorizer for API Gateway
- **outboxProcessor**: Process outbox events for reliable messaging
- **imageProcessor**: Process and optimize uploaded images
- **notificationSender**: Send notifications to users
- **scheduledTasks**: Handle scheduled maintenance tasks

### Middleware

- **authMiddleware**: Authentication middleware with Cognito integration ✅
- **loggingMiddleware**: CloudWatch logging middleware
- **errorHandlingMiddleware**: Error handling middleware
- **validationMiddleware**: Request validation middleware
- **corsMiddleware**: CORS configuration middleware ✅

## Authentication and Route Protection

### Current Implementation

- ✅ Basic middleware for route protection
- ✅ AuthContext for managing authentication state
- ✅ Amazon Cognito authentication with server-side API routes
- ✅ HttpOnly cookies for secure token storage
- ✅ Token refresh mechanism
- ✅ Protected routes defined in middleware.js

### Missing Components

- [x] Collection creation page (/collections/create)
- [x] Collection editing page (/collections/edit/[id])
- [x] Integration with Amazon Cognito authentication
- [x] Server-side authentication API routes (/api/auth/\*)
- [x] Proper token validation and refresh mechanism
- [ ] API route protection for backend endpoints
- [ ] Session timeout handling

## Testing Checklist

### Frontend Testing

- [ ] Verify all pages render correctly
- [ ] Test responsive design on different screen sizes
- [ ] Verify all links work correctly
- [ ] Test form submissions
- [ ] Verify authentication flows
- [ ] Test accessibility with screen readers
- [ ] Verify performance metrics

### Backend Testing

- [ ] Test API endpoints with Postman/Insomnia
- [ ] Verify database connections and queries
- [ ] Test authentication and authorization
- [ ] Verify error handling and logging
- [ ] Test rate limiting and security features
- [ ] Verify data validation
- [ ] Test integration with external services (AWS Cognito, etc.)

### Integration Testing

- [ ] Test frontend-backend communication
- [ ] Verify end-to-end user flows
- [ ] Test data consistency across services
- [ ] Verify error handling between services

## Deployment Checklist

### Frontend Deployment (AWS ECS Docker)

- [ ] Create Docker container for Next.js application
- [ ] Configure ECS task definitions and service
- [ ] Set up AWS Application Load Balancer
- [ ] Configure auto-scaling policies
- [ ] Set up CI/CD pipeline with AWS CodePipeline
- [ ] Configure environment variables in AWS Parameter Store/Secrets Manager
- [ ] Set up CloudFront CDN for static assets
- [ ] Configure Route 53 for domain management
- [ ] Implement blue/green deployment strategy

### Backend Deployment (AWS API Gateway & Lambda)

- [ ] Configure API Gateway with tRPC integration
- [ ] Set up Lambda functions for API handlers
- [ ] Configure Cognito User Pools and Identity Pools
- [ ] Set up Aurora Serverless v2 PostgreSQL database
- [ ] Implement Outbox pattern with Lambda consumers
- [ ] Configure environment variables in AWS Parameter Store/Secrets Manager
- [ ] Set up CI/CD pipeline with AWS CodePipeline
- [ ] Configure CloudWatch for monitoring and logging
- [ ] Set up AWS X-Ray for distributed tracing
- [ ] Implement database backup and recovery procedures
- [ ] Configure AWS WAF for API security
- [ ] Set up custom domain for API Gateway
- [ ] Implement infrastructure as code using AWS CDK or Terraform
