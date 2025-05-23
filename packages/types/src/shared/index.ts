/**
 * Shared Types
 *
 * This module provides common type definitions that are shared between
 * frontend and backend components of the application.
 */

/**
 * Environment type
 */
export type Environment = 'dev' | 'test' | 'qa' | 'prod';

/**
 * Shared restaurant type
 * This is the original shared type from the shared package
 */
export interface SharedRestaurant {
  id: string;
  name: string;
  description?: string;
  cuisineTypes: string[];
  priceRange: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phoneNumber?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared dish type
 * This is the original shared type from the shared package
 */
export interface SharedDish {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared user type
 * This is the original shared type from the shared package
 */
export interface SharedUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared review type
 * This is the original shared type from the shared package
 */
export interface SharedReview {
  id: string;
  userId: string;
  restaurantId: string;
  dishId?: string;
  rating: number;
  comment?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination type
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}
