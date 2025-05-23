/**
 * Type matchers for standardizing user input
 * This file contains utility functions for matching user input to standardized types
 */

import { EstablishmentType, ServiceType } from '@bellyfed/types';

/**
 * Type for synonym mappings
 */
type SynonymMap = Record<string, string[]>;

/**
 * Helper function to normalize strings for comparison
 * @param str The string to normalize
 * @returns The normalized string
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Helper function to find the best match from an enum
 * @param input The input string to match
 * @param enumObj The enum object to match against
 * @param synonyms Optional synonym mappings
 * @returns The best matching enum value or undefined
 */
function findBestMatch<T extends { [key: string]: string }>(
  input: string,
  enumObj: T,
  synonyms: SynonymMap = {},
): T[keyof T] | undefined {
  if (!input) return undefined;

  const normalizedInput = normalizeString(input);

  // First, check exact matches in the enum
  for (const [key, value] of Object.entries(enumObj)) {
    if (normalizeString(value) === normalizedInput) {
      return enumObj[key] as T[keyof T];
    }
  }

  // Then, check synonyms if provided
  for (const [enumValue, synonymList] of Object.entries(synonyms)) {
    if (
      synonymList.some(
        (synonym) => normalizeString(synonym) === normalizedInput,
      )
    ) {
      const key = Object.entries(enumObj).find(
        ([, val]) => val === enumValue,
      )?.[0];
      if (key) {
        return enumObj[key] as T[keyof T];
      }
    }
  }

  // If no exact match found, look for partial matches in enum values
  let bestMatch: string | undefined;
  let bestMatchScore = 0;

  for (const [key, value] of Object.entries(enumObj)) {
    const normalizedValue = normalizeString(value);
    
    // Check if the normalized value contains the input or vice versa
    if (normalizedValue.includes(normalizedInput) || normalizedInput.includes(normalizedValue)) {
      const score = Math.min(normalizedValue.length, normalizedInput.length) / 
                   Math.max(normalizedValue.length, normalizedInput.length);
      
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = key;
      }
    }
  }

  // Also check synonyms for partial matches
  for (const [enumValue, synonymList] of Object.entries(synonyms)) {
    for (const synonym of synonymList) {
      const normalizedSynonym = normalizeString(synonym);
      
      if (normalizedSynonym.includes(normalizedInput) || normalizedInput.includes(normalizedSynonym)) {
        const score = Math.min(normalizedSynonym.length, normalizedInput.length) / 
                     Math.max(normalizedSynonym.length, normalizedInput.length);
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          const key = Object.entries(enumObj).find(
            ([, val]) => val === enumValue,
          )?.[0];
          if (key) {
            bestMatch = key;
          }
        }
      }
    }
  }

  // Return the best match if it's a good enough match (score > 0.5)
  if (bestMatch && bestMatchScore > 0.5) {
    return enumObj[bestMatch] as T[keyof T];
  }

  return undefined;
}

/**
 * Establishment type synonyms
 */
const ESTABLISHMENT_TYPE_SYNONYMS: SynonymMap = {
  [EstablishmentType.RESTAURANT]: [
    'restaurant', 'eatery', 'dining', 'bistro', 'cafe', 'diner',
    'cafeteria', 'brasserie', 'steakhouse', 'grill', 'pizzeria',
  ],
  [EstablishmentType.FOOD_COURT_STALL]: [
    'food court', 'food stall', 'hawker', 'hawker stall', 'food court stall',
    'food center', 'food centre', 'hawker center', 'hawker centre',
  ],
  [EstablishmentType.FOOD_TRUCK]: [
    'food truck', 'mobile food', 'street food', 'food van', 'mobile kitchen',
  ],
  [EstablishmentType.POP_UP_STALL]: [
    'pop up', 'popup', 'temporary', 'pop-up', 'pop up stall', 'popup stall',
    'temporary stall', 'pop-up stall', 'temporary restaurant',
  ],
  [EstablishmentType.GHOST_KITCHEN]: [
    'ghost kitchen', 'virtual kitchen', 'cloud kitchen', 'dark kitchen',
    'delivery only', 'virtual restaurant', 'delivery kitchen',
  ],
};

/**
 * Service type synonyms
 */
const SERVICE_TYPE_SYNONYMS: SynonymMap = {
  [ServiceType.DINE_IN]: [
    'dine in', 'dining in', 'eat in', 'sit down', 'table service',
    'restaurant service', 'indoor dining', 'indoor seating',
  ],
  [ServiceType.TAKEAWAY]: [
    'takeaway', 'take away', 'take out', 'takeout', 'to go', 'carry out',
    'pick up', 'pickup', 'self collect', 'self collection',
  ],
  [ServiceType.DELIVERY]: [
    'delivery', 'food delivery', 'home delivery', 'deliver', 'delivered',
    'door delivery', 'doorstep delivery',
  ],
  [ServiceType.DRIVE_THRU]: [
    'drive thru', 'drive through', 'drive-thru', 'drive-through',
    'car service', 'car pickup',
  ],
  [ServiceType.OUTDOOR_SEATING]: [
    'outdoor seating', 'outdoor dining', 'alfresco', 'al fresco',
    'patio seating', 'patio dining', 'garden seating', 'terrace seating',
    'terrace dining', 'rooftop seating', 'rooftop dining',
  ],
  [ServiceType.RESERVATIONS]: [
    'reservations', 'reservation', 'book table', 'booking', 'table booking',
    'reserve', 'reserve table', 'table reservation',
  ],
  [ServiceType.CATERING]: [
    'catering', 'cater', 'event catering', 'party catering', 'food catering',
    'catering service', 'bulk order', 'large order',
  ],
  [ServiceType.PRIVATE_DINING]: [
    'private dining', 'private room', 'private area', 'vip room',
    'exclusive dining', 'private party', 'private event',
  ],
};

/**
 * Match establishment type from user input
 * @param input The user input to match
 * @returns The matched establishment type or undefined
 */
export function matchEstablishmentType(
  input: string,
): EstablishmentType | undefined {
  return findBestMatch(input, EstablishmentType, ESTABLISHMENT_TYPE_SYNONYMS);
}

/**
 * Match service type from user input
 * @param input The user input to match
 * @returns The matched service type or undefined
 */
export function matchServiceType(input: string): ServiceType | undefined {
  return findBestMatch(input, ServiceType, SERVICE_TYPE_SYNONYMS);
}
