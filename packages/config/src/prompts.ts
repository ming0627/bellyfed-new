/**
 * AI prompt templates
 * This file contains prompt templates for AI-powered features
 */

import { DayOfWeek, EstablishmentType, ServiceType } from '@bellyfed/types';
import { matchEstablishmentType } from './typeMatchers.js';

/**
 * Query categories for food and restaurant searches
 */
export interface PromptsQueryCategories {
  cuisineTypes?: string[];
  location?: {
    city?: string;
    country?: string;
    address?: string;
  };
  dishType?: string;
  dietaryOptions?: {
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isHalal?: boolean;
    isKosher?: boolean;
  };
  establishmentType?: EstablishmentType;
  ambiance?: string[];
  schedule?: {
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
  };
  priceRange?: string;
  facilities?: {
    parking?: {
      available: boolean;
      details?: string;
    };
    wifi?: {
      available: boolean;
      details?: string;
    };
    seating?: {
      capacity?: number;
      details?: string;
    };
  };
  services?: {
    type: string;
    available: boolean;
    details?: string;
  }[];
}

/**
 * Generate a prompt for food query analysis
 * @param text The user's food query text
 * @returns A prompt for OpenAI to analyze the food query
 */
export const generateFoodQueryPrompt = (text: string): string => {
  return `Analyze and extract structured information from food and restaurant related queries. Consider various aspects like cuisine, location, timing, ambiance, and special features.

Categories to identify:
- cuisineTypes: Types of cuisine or food styles
- location: City, country, and address information (IMPORTANT: For malls, include the full mall name)
- dishType: Specific dish names
- dietaryOptions: Dietary preferences (vegetarian, gluten-free, halal, kosher)
- establishmentType: Type of establishment (RESTAURANT, FOOD_COURT_STALL, FOOD_TRUCK, POP_UP_STALL, GHOST_KITCHEN)
- ambiance: Atmosphere and setting features (rooftop, beachfront, romantic, etc.)
- schedule: Operating hours information (day, time, recurring status)
- priceRange: Price level indicators (cheap, expensive, fine dining, etc.)
- facilities: Available facilities (parking, wifi, seating)
- services: Special services and their availability

Format the response as JSON:
{
  "keywords": ["all", "relevant", "keywords"],
  "relevantTerms": {
    "cuisineTypes": ["identified", "cuisine", "types"],
    "location": {
      "city": "city name",
      "country": "country name",
      "address": "full location name (e.g., 'Mid Valley Megamall' not just 'midvalley')"
    },
    "dishType": "specific dish if mentioned",
    "dietaryOptions": {
      "isVegetarian": true/false,
      "isGlutenFree": true/false,
      "isHalal": true/false,
      "isKosher": true/false
    },
    "establishmentType": "RESTAURANT",
    "ambiance": ["ambiance", "features"],
    "schedule": {
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "22:00",
      "isRecurring": true
    },
    "priceRange": "price category",
    "facilities": {
      "parking": {
        "available": true,
        "details": "Free parking available"
      },
      "wifi": {
        "available": true,
        "details": "Free high-speed wifi"
      },
      "seating": {
        "capacity": 50,
        "details": "Indoor and outdoor seating"
      }
    },
    "services": [
      {
        "type": "service type",
        "available": true,
        "details": "service details"
      }
    ]
  }
}

Examples:
1. Query: "best chicken rice in midvalley"
Response:
{
  "keywords": ["best", "chicken rice", "midvalley"],
  "relevantTerms": {
    "cuisineTypes": ["Chinese", "Malaysian"],
    "location": {
      "city": "Kuala Lumpur",
      "country": "Malaysia",
      "address": "Mid Valley Megamall"
    },
    "dishType": "chicken rice",
    "establishmentType": "RESTAURANT"
  }
}

2. Query: "halal food near klcc"
Response:
{
  "keywords": ["halal", "food", "klcc"],
  "relevantTerms": {
    "cuisineTypes": [],
    "location": {
      "city": "Kuala Lumpur",
      "country": "Malaysia",
      "address": "Suria KLCC"
    },
    "dietaryOptions": {
      "isHalal": true
    },
    "establishmentType": "RESTAURANT"
  }
}

Analyze this query: "${text}"`;
};

/**
 * OpenAI response interface
 */
interface OpenAIResponse {
  relevantTerms?: {
    establishmentType?: string;
    facilities?: {
      seating?: {
        details?: string;
      };
    };
    services?: Array<{
      type: string;
      available: boolean;
      details?: string;
    }>;
    [key: string]: unknown;
  };
}

/**
 * Process the OpenAI response to standardize establishment types and services
 * @param response The raw OpenAI response
 * @returns The processed OpenAI response
 */
export const processOpenAIResponse = (
  response: OpenAIResponse,
): OpenAIResponse => {
  if (!response?.relevantTerms) {
    return response;
  }

  const terms = response.relevantTerms;

  // Match establishment type
  if (terms.establishmentType) {
    terms.establishmentType =
      matchEstablishmentType(terms.establishmentType) ||
      terms.establishmentType;
  }

  // Match services
  if (terms.facilities?.seating?.details?.toLowerCase().includes('outdoor')) {
    if (!terms.services) {
      terms.services = [];
    }
    terms.services.push({
      type: ServiceType.OUTDOOR_SEATING,
      available: true,
      details: terms.facilities.seating.details,
    });
  }

  return {
    ...response,
    relevantTerms: terms,
  };
};
