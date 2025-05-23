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

// Competitions Components
export * from './competitions/index.js';

// Dish Components
export * from './dish/DishRanking.js';

// Dish Restaurants Components
export * from './dish-restaurants/index.js';

// Dishes Components
export * from './dishes/DishHeader.js';
export * from './dishes/DishIngredients.js';
export * from './dishes/DishReviews.js';
export * from './dishes/SimilarDishes.js';

// Explore Components
export * from './explore/ExploreMap.js';
export * from './explore/NearbyRestaurants.js';

// Homepage Components
export { default as Homepage } from './homepage.js';
export * from './homepage/Collections.js';
export * from './homepage/FeaturedRestaurants.js';
export * from './homepage/PremiumBanner.js';
export * from './homepage/TopCritics.js';
export * from './homepage/TopFoodies.js';
export * from './homepage/TopRatedDishes.js';

// Layout Components
export * from './layout/CountrySelector.js';
export * from './layout/Footer.js';
export * from './layout/Header.js';
export * from './layout/Layout.js';

// My Foodie Leaderboard Components
export * from './my-foodie-leaderboard/index.js';

// Premium Components
export * from './premium/index.js';

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
export * from './rankings/RankingCard.js';
export * from './rankings/RankingDialog.js';

// Restaurant Components
export * from './restaurant/ReviewCard.js';

// Restaurant Management Components
export * from './restaurant-management/index.js';

// Restaurants Components
export * from './restaurants/RestaurantCard.js';
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
export * from './ui/index.js';

// Utility Components
export { default as AuthStateManager } from './AuthStateManager.js';
export { default as AuthStateManagerWrapper } from './AuthStateManagerWrapper.js';
export { default as FormField } from './FormField.js';
export { default as ProtectedRoute } from './ProtectedRoute.js';
export { default as SearchAndFilter } from './SearchAndFilter.js';
