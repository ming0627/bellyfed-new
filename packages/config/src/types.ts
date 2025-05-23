/**
 * Configuration types
 * This file contains type definitions for configuration-related data structures
 */

import { EstablishmentType, DayOfWeek, ServiceType } from '@bellyfed/types';

/**
 * Query categories for food and restaurant searches
 */
export interface ConfigQueryCategories {
  /**
   * Types of cuisine or food styles
   */
  cuisineTypes?: string[];

  /**
   * Location information
   */
  location?: {
    city?: string;
    country?: string;
    address?: string;
  };

  /**
   * Specific dish type
   */
  dishType?: string;

  /**
   * Dietary options and preferences
   */
  dietaryOptions?: {
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isHalal?: boolean;
    isKosher?: boolean;
  };

  /**
   * Type of establishment
   */
  establishmentType?: EstablishmentType;

  /**
   * Ambiance and atmosphere features
   */
  ambiance?: string[];

  /**
   * Operating hours information
   */
  schedule?: {
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
  };

  /**
   * Price range indicator
   */
  priceRange?: string;

  /**
   * Available facilities
   */
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

  /**
   * Special services and their availability
   */
  services?: {
    type: ServiceType;
    available: boolean;
    details?: string;
  }[];
}
