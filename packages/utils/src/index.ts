// Export all utility functions and types from this file
// This file will be expanded as we migrate utilities from the existing project

export * from './types/index.js';

// Placeholder for future utility functions
export const formatDate = (date: Date): string => {
  const parts = date.toISOString().split('T');
  return parts[0] || '';
};
