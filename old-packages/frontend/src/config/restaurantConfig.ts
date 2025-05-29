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
