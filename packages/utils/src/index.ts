// Export all utility functions and types from this file
// This file will be expanded as we migrate utilities from the existing project

export * from './types/index.js';
export * from './imageCompression.js';
export * from './auth.js';
export * from './countryRouteHelpers.js';
export * from './events.js';

// Utility functions
export const formatDate = (date: Date): string => {
  const parts = date.toISOString().split('T');
  return parts[0] || '';
};
