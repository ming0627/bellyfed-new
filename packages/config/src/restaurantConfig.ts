/**
 * Restaurant configuration constants
 * These constants are used throughout the application for restaurant-related features
 */

export const CUISINE_TYPES = [
  'Japanese',
  'Chinese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Indian',
  'Italian',
  'French',
  'American',
  'Mexican',
  'Mediterranean',
  'Middle Eastern',
  'Vegetarian',
  'Seafood',
  'Fusion',
] as const;

export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];
export type PriceRange = (typeof PRICE_RANGES)[number];

export const PRICE_RANGE_DESCRIPTIONS = {
  $: 'Under $25',
  $$: '$25-$50',
  $$$: '$51-$100',
  $$$$: 'Over $100',
} as const;

/**
 * Get description for a price range
 */
export function getPriceRangeDescription(priceRange: PriceRange): string {
  return PRICE_RANGE_DESCRIPTIONS[priceRange] || 'Unknown price range';
}

/**
 * Check if a string is a valid cuisine type
 */
export function isValidCuisineType(cuisine: string): cuisine is CuisineType {
  return CUISINE_TYPES.includes(cuisine as CuisineType);
}

/**
 * Check if a string is a valid price range
 */
export function isValidPriceRange(priceRange: string): priceRange is PriceRange {
  return PRICE_RANGES.includes(priceRange as PriceRange);
}
