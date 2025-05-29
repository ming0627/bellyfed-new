import { ServiceType, EstablishmentType, DayOfWeek } from '../types';

export interface QueryCategories {
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
    type: ServiceType;
    available: boolean;
    details?: string;
  }[];
}
