/**
 * Components Index
 *
 * Main export file for all application components.
 * Organized by category for easy importing and discovery.
 */

// Admin Components
export * from './admin/index.js';

// AI Center Components
export * from './ai-center/index.js';

// Analytics Components
export * from './analytics/index.js';

// Authentication Components
export * from './auth/SignInForm.js';
export * from './auth/SignUpForm.js';
export * from './auth/ClientOnlyAuth.js';

// Collections Components
export * from './collections/CollectionCard.js';
export * from './collections/CollectionForm.js';
export * from './collections/CollectionList.js';

// Charts Components
export * from './charts/index.js';

// Dialogs Components
export * from './dialogs/index.js';

// Feed Components
export * from './feed/index.js';

// Location Components
export * from './location/index.js';

// Statistics Components
export * from './statistics/index.js';

// Chat Components
export * from './chat/index.js';

// Date Picker Components
export * from './date-picker/index.js';

// User Profile Components
export * from './user-profile/index.js';

// Notifications Components
export * from './notifications/index.js';

// Search Components
export * from './search/index.js';

// Filters Components
export * from './filters/index.js';

// Maps Components
export * from './maps/index.js';

// Social Components
export * from './social/index.js';

// Reviews Components
export * from './reviews/index.js';

// Comments Components
export * from './comments/index.js';

// Forms Components
export * from './forms/index.js';

// Gallery Components
export * from './gallery/index.js';

// Modals Components
export * from './modals/index.js';

// Tables Components
export * from './tables/index.js';

// Booking Components
export * from './booking/index.js';

// Payment Components
export * from './payment/index.js';

// Dashboard Components
export * from './dashboard/index.js';

// Cards Components
export * from './cards/index.js';

// Widgets Components
export * from './widgets/index.js';

// Navigation Components
export * from './navigation/index.js';

// Layout Components
export * from './layout/index.js';

// Media Components
export * from './media/index.js';

// Feedback Components
export * from './feedback/index.js';

// Progress Components
export * from './progress/index.js';

// Alerts Components
export * from './alerts/index.js';

// Tooltips Components
export * from './tooltips/index.js';

// Tabs Components
export * from './tabs/index.js';

// Accordion Components
export * from './accordion/index.js';

// Carousel Components
export * from './carousel/index.js';

// Dropdowns Components
export * from './dropdowns/index.js';

// Skeleton Components
export * from './skeleton/index.js';

// Badges Components
export * from './badges/index.js';

// Empty State Components
export * from './empty/index.js';

// Steps Components
export * from './steps/index.js';

// Competitions Components
export * from './competitions/index.js';

// Dish Components
export * from './dish/index.js';

// Dish Restaurants Components
export * from './dish-restaurants/index.js';

// Dishes Components
// Note: DishCard uses default export only to prevent dual export conflicts
export { default as DishCard } from './dishes/DishCard.js';
export { default as DishHeader } from './dishes/DishHeader.js';
export { default as DishIngredients } from './dishes/DishIngredients.js';
export { default as DishReviews } from './dishes/DishReviews.js';
export { default as SimilarDishes } from './dishes/SimilarDishes.js';

// Explore Components
export * from './explore/ExploreMap.js';
export * from './explore/NearbyRestaurants.js';

// Homepage Components
export { default as Homepage } from './homepage.js';
export { default as ActivityFeed } from './homepage/ActivityFeed.js';
export { default as Collections } from './homepage/Collections.js';
export { default as FeaturedContent } from './homepage/FeaturedContent.js';
export { default as FeaturedRestaurants } from './homepage/FeaturedRestaurants.js';
export { default as HomepageNavigation } from './homepage/Navigation.js';
export { default as PremiumBanner } from './homepage/PremiumBanner.js';
export { default as TopCritics } from './homepage/TopCritics.js';
export { default as TopFoodies } from './homepage/TopFoodies.js';
export { default as TopRatedDishes } from './homepage/TopRatedDishes.js';

// Layout Components
export * from './layout/CountrySelector.js';
export * from './layout/Footer.js';
export * from './layout/Header.js';
export * from './layout/Layout.js';

// My Foodie Leaderboard Components
export * from './my-foodie-leaderboard/index.js';

// Premium Components
export * from './premium/index.js';

// Ranking Components
export * from './ranking/index.js';

// Profile Components
export * from './profile/ProfileHeader.js';
export * from './profile/ProfileTabs.js';
export * from './profile/RankingsTab.js';
export * from './profile/ReviewFilters.js';
export * from './profile/ReviewItem.js';
export * from './profile/ReviewsTab.js';
export * from './profile/UserFavorites.js';
export * from './profile/UserReviews.js';

// Rankings Components
export * from './rankings/index.js';

// Restaurant Components
export * from './restaurant/index.js';

// Restaurant Management Components
export * from './restaurant-management/index.js';

// Restaurants Components
export { default as RestaurantCard } from './restaurants/RestaurantCard.js';
export * from './restaurants/RestaurantList.js';
export * from './restaurants/detail/RestaurantHeader.js';
export * from './restaurants/detail/RestaurantInfo.js';
export * from './restaurants/detail/RestaurantLocation.js';
export * from './restaurants/detail/RestaurantMenu.js';
export * from './restaurants/detail/RestaurantReviews.js';
export * from './restaurants/detail/SimilarRestaurants.js';

// Reviews Components
export * from './reviews/ReviewForm.js';

// Search Components
export * from './search/SearchFilters.js';
export * from './search/SearchResults.js';

// Settings Components
export * from './settings/AccountSettings.js';
export * from './settings/NotificationSettings.js';

// UI Components
export * from '@bellyfed/ui';

// Utility Components
export { default as AuthStateManager } from './AuthStateManager.js';
export { default as AuthStateManagerWrapper } from './AuthStateManagerWrapper.js';
export { default as FormField } from './FormField.js';
export { default as ProtectedRoute } from './ProtectedRoute.js';
export { default as SearchAndFilter } from './SearchAndFilter.js';
