import { GooglePlacesService } from '../services/googlePlaces';
import { OpenAIService } from '../services/openai';
import { CuisineType, EstablishmentType, ServiceType } from '../types';

type SynonymMap = Record<string, string[]>;

// Helper function to normalize strings for comparison
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

// Helper function to find best match from enum
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
    if (
      normalizedValue.includes(normalizedInput) ||
      normalizedInput.includes(normalizedValue)
    ) {
      const score =
        Math.min(normalizedValue.length, normalizedInput.length) /
        Math.max(normalizedValue.length, normalizedInput.length);
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = key;
      }
    }
  }

  if (bestMatch && bestMatchScore > 0.5) {
    return enumObj[bestMatch] as T[keyof T];
  }

  return undefined;
}

// Synonyms for ServiceType
const serviceTypeSynonyms: SynonymMap = {
  [ServiceType.OUTDOOR_SEATING]: [
    'outdoor seat',
    'outdoor seating',
    'outside seating',
    'outside seat',
    'alfresco',
    'alfresco dining',
    'open air',
    'open-air',
    'kaki lima', // Five-foot way dining
    'outdoor kopitiam',
  ],
  [ServiceType.DINE_IN]: [
    'dine in',
    'makan sini', // Eat here (Malay)
    'makan dalam', // Eat inside (Malay)
    'dining in',
    'eat in',
    'indoor dining',
    'indoor seating',
    'kopitiam',
  ],
  [ServiceType.TAKEOUT]: [
    'takeout',
    'take out',
    'take away',
    'takeaway',
    'to go',
    'tapau', // Malaysian/Singaporean term for takeaway
    'bungkus', // Wrap (Malay)
    'dabao', // Chinese dialect term for takeaway
  ],
  [ServiceType.DELIVERY]: [
    'delivery',
    'food delivery',
    'home delivery',
    'deliver',
    'hantar', // Deliver (Malay)
    'antar', // Deliver (Indonesian)
    'grabfood',
    'foodpanda',
  ],
  [ServiceType.DRIVE_THRU]: [
    'drive thru',
    'drive through',
    'drive-thru',
    'drive-through',
    'pandu lalu', // Drive through (Malay)
  ],
  [ServiceType.CATERING]: [
    'catering',
    'cater',
    'event catering',
    'food catering',
    'katering', // Malay spelling
    'kenduri', // Malay feast/catering
    'majlis', // Event/function (Malay)
  ],
  [ServiceType.RESERVATION]: [
    'reservation',
    'reserve',
    'book table',
    'booking',
    'tempah', // Reserve (Malay)
    'tempahan', // Reservation (Malay)
  ],
  [ServiceType.ONLINE_ORDERING]: [
    'online order',
    'online ordering',
    'web order',
    'app order',
    'mobile order',
    'order online',
    'pesan online', // Order online (Malay)
  ],
  [ServiceType.PRIVATE_DINING]: [
    'private dining',
    'private room',
    'private area',
    'vip room',
    'bilik vip', // VIP room (Malay)
    'bilik khas', // Special room (Malay)
  ],
  [ServiceType.BUFFET]: [
    'buffet',
    'all you can eat',
    'self service',
    'self-service',
    'hidang sendiri', // Self-service (Malay)
    'makan sepuas-puasnya', // All you can eat (Malay)
  ],
};

// Synonyms for EstablishmentType
const establishmentTypeSynonyms: SynonymMap = {
  [EstablishmentType.RESTAURANT]: [
    'restaurant',
    'eatery',
    'dining',
    'bistro',
    'cafe',
    'diner',
    'cafeteria',
    'restoran', // Restaurant (Malay)
    'kedai makan', // Eating shop (Malay)
    'warung', // Small restaurant (Malay/Indonesian)
    'kopitiam', // Coffee shop (Hokkien)
    'mamak', // Indian Muslim restaurant
    'nasi kandar', // Indian Muslim rice restaurant
    'char chan teng', // Hong Kong style cafe
  ],
  [EstablishmentType.FOOD_COURT_STALL]: [
    'food court',
    'food court stall',
    'food stall',
    'hawker stall',
    'court stall',
    'medan selera', // Food court (Malay)
    'pusat penjaja', // Hawker center (Malay)
    'gerai', // Stall (Malay)
    'warung', // Stall (Malay/Indonesian)
    'kedai', // Shop/stall (Malay)
    'pasar malam stall', // Night market stall
    'hawker center',
  ],
  [EstablishmentType.FOOD_TRUCK]: [
    'food truck',
    'food van',
    'mobile food',
    'truck food',
    'trak makanan', // Food truck (Malay)
    'kereta makanan', // Food car (Malay)
    'van makanan', // Food van (Malay)
  ],
  [EstablishmentType.POP_UP_STALL]: [
    'pop up',
    'pop-up',
    'popup',
    'temporary stall',
    'pop up stall',
    'gerai sementara', // Temporary stall (Malay)
    'kedai sementara', // Temporary shop (Malay)
    'pasar malam', // Night market
    'bazar ramadan', // Ramadan bazaar
  ],
  [EstablishmentType.GHOST_KITCHEN]: [
    'ghost kitchen',
    'cloud kitchen',
    'virtual kitchen',
    'dark kitchen',
    'dapur maya', // Virtual kitchen (Malay)
    'dapur awan', // Cloud kitchen (Malay)
    'dapur hantu', // Ghost kitchen (Malay)
  ],
};

// Synonyms for CuisineType
const cuisineTypeSynonyms: SynonymMap = {
  [CuisineType.MALAYSIAN]: [
    'malaysian',
    'malay',
    'melayu',
    'nasi lemak',
    'rendang',
    'satay',
    'roti canai',
    'nasi goreng',
    'char kuey teow',
  ],
  [CuisineType.CHINESE]: [
    'chinese',
    'cina',
    'dim sum',
    'yum cha',
    'wonton',
    'char siew',
    'siew yoke',
    'bak kut teh',
  ],
  [CuisineType.INDIAN]: [
    'indian',
    'india',
    'mamak',
    'nasi kandar',
    'roti',
    'thosai',
    'tandoori',
    'briyani',
  ],
  [CuisineType.THAI]: ['thai', 'tomyam', 'pad thai', 'green curry', 'siam'],
  [CuisineType.JAPANESE]: [
    'japanese',
    'jepun',
    'sushi',
    'ramen',
    'udon',
    'tempura',
    'donburi',
  ],
  [CuisineType.KOREAN]: [
    'korean',
    'korea',
    'kimchi',
    'bibimbap',
    'korean bbq',
    'korean fried chicken',
    'tteokbokki',
  ],
  [CuisineType.WESTERN]: [
    'western',
    'barat',
    'steak',
    'pasta',
    'burger',
    'fish and chips',
    'pizza',
  ],
  [CuisineType.FUSION]: [
    'fusion',
    'asian fusion',
    'modern asian',
    'contemporary asian',
    'fusion food',
  ],
};

// Cache for API responses
const locationCache: Map<
  string,
  {
    location?: string;
    locationType?: string;
    district?: string;
    area?: string;
    address?: string;
    fullAddress?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    timestamp: number;
  }
> = new Map();

// Cache for cuisine matching
const cuisineMatchCache: Map<
  string,
  {
    cuisineType: string;
    timestamp: number;
  }
> = new Map();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to match region
const matchRegion = async (
  input: string,
): Promise<
  | {
      location?: string;
      locationType?: string;
      district?: string;
      area?: string;
      address?: string;
      fullAddress?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    }
  | undefined
> => {
  if (!input) return undefined;

  const normalizedInput = normalizeString(input);

  // Check cache
  const cached = locationCache.get(normalizedInput);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      location: cached.location,
      locationType: cached.locationType,
      district: cached.district,
      area: cached.area,
      address: cached.address,
      fullAddress: cached.fullAddress,
      coordinates: cached.coordinates,
    };
  }

  try {
    // First, try to extract location from food query
    const keywords = await OpenAIService.extractKeywords(input);
    let locationQuery =
      keywords.relevantTerms?.location?.address ||
      keywords.relevantTerms?.location?.city ||
      keywords.location;

    // If no specific address found, try Google Places with the location part
    if (!locationQuery) {
      const regionInfo = await OpenAIService.identifyRegion(input);
      if (
        regionInfo.confidence > 0.7 &&
        regionInfo.context?.landmarks?.length
      ) {
        locationQuery = regionInfo.context.landmarks[0];
      } else if (regionInfo.confidence > 0.7 && regionInfo.context?.area) {
        locationQuery = regionInfo.context.area;
      }
    }

    // If still no location found, try with the original input
    if (!locationQuery) {
      locationQuery = input;
    }

    // Get place details from Google Places
    const placeDetails =
      await GooglePlacesService.searchLocation(locationQuery);
    if (!placeDetails) return undefined;

    // Cache the result
    locationCache.set(normalizedInput, {
      ...placeDetails,
      timestamp: Date.now(),
    });

    return placeDetails;
  } catch (error: unknown) {
    console.error('Error matching region:', error);
    return undefined;
  }
};

// Helper functions to match types
const matchServiceType = (input: string): ServiceType | undefined => {
  return findBestMatch(input, ServiceType, serviceTypeSynonyms);
};

const matchEstablishmentType = (
  input: string,
): EstablishmentType | undefined => {
  return findBestMatch(input, EstablishmentType, establishmentTypeSynonyms);
};

// Helper function to match cuisine type using OpenAI
const matchCuisineType = async (
  input: string,
): Promise<CuisineType | undefined> => {
  const normalizedInput = normalizeString(input);

  // First check exact matches in synonyms
  const exactMatch = findBestMatch(input, CuisineType, cuisineTypeSynonyms);
  if (exactMatch) return exactMatch;

  // Check cache
  const cached = cuisineMatchCache.get(normalizedInput);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.cuisineType as CuisineType | undefined;
  }

  try {
    const result = await OpenAIService.identifyCuisineAndDish(input);

    if (result.confidence > 0.7 && result.cuisineType) {
      // Cache the result
      cuisineMatchCache.set(normalizedInput, {
        cuisineType: result.cuisineType,
        timestamp: Date.now(),
      });

      // Convert OpenAI's response to CuisineType
      const matchedType = findBestMatch(
        result.cuisineType,
        CuisineType,
        cuisineTypeSynonyms,
      );
      return matchedType;
    }
  } catch (error: unknown) {
    console.error('Error matching cuisine type:', error);
  }

  // Fallback to direct enum matching if OpenAI fails
  return findBestMatch(input, CuisineType, cuisineTypeSynonyms);
};

export {
  cuisineTypeSynonyms,
  establishmentTypeSynonyms,
  matchCuisineType,
  matchEstablishmentType,
  matchRegion,
  matchServiceType,
  serviceTypeSynonyms,
};
