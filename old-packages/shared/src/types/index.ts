// Common types shared between frontend and backend

/**
 * Environment type
 */
export type Environment = 'dev' | 'test' | 'qa' | 'prod';

/**
 * Restaurant type
 */
export interface Restaurant {
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
 * Dish type
 */
export interface Dish {
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
 * User type
 */
export interface User {
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
 * Review type
 */
export interface Review {
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
