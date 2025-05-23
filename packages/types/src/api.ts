/**
 * API types for Bellyfed application
 * These types define the structure of API requests and responses
 */

/**
 * API Error class for handling API errors
 */
export class ApiError extends Error {
  /**
   * Create a new API error
   * @param message Error message
   * @param status HTTP status code
   * @param data Additional error data
   */
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Response interface for standardized API responses
 */
export interface ApiResponseWithStatus<T> {
  /**
   * Response data
   */
  data: T;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Optional response message
   */
  message?: string;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  /**
   * Page number (1-based)
   */
  page?: number;

  /**
   * Number of items per page
   */
  limit?: number;

  /**
   * Sort field
   */
  sortBy?: string;

  /**
   * Sort direction ('asc' or 'desc')
   */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Paginated response interface with additional navigation properties
 */
export interface PaginatedResponseWithNav<T> {
  /**
   * Array of items
   */
  items: T[];

  /**
   * Total number of items
   */
  total: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Whether there is a next page
   */
  hasNextPage: boolean;

  /**
   * Whether there is a previous page
   */
  hasPreviousPage: boolean;
}

/**
 * API Error response interface
 */
export interface ApiErrorResponse {
  /**
   * Error message
   */
  message: string;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error code
   */
  code?: string;

  /**
   * Additional error details
   */
  details?: Record<string, unknown>;
}

/**
 * Create a standardized API response
 * @param data Response data
 * @param status HTTP status code
 * @param message Optional response message
 * @returns Standardized API response
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): ApiResponseWithStatus<T> {
  return {
    data,
    status,
    message,
  };
}

/**
 * Create a standardized paginated response
 * @param items Array of items
 * @param total Total number of items
 * @param page Current page number
 * @param limit Number of items per page
 * @returns Standardized paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponseWithNav<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
