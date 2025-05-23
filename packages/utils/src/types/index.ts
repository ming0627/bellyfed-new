// Export all types from this file
// This file will be expanded as we migrate types from the existing project

// Export Next.js types
export * from './next.js';

// Export authentication types
export * from './auth.js';

// API response type
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};
