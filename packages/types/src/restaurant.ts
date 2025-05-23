/**
 * Restaurant types for Bellyfed application
 * These types align with the database schema and Google Maps API responses
 */

/**
 * Restaurant photo from database or Google Maps API
 */
export interface RestaurantPhoto {
  photoId: string;
  restaurantId: string;
  photoUrl: string;
  photoReference?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

/**
 * Restaurant opening hours
 */
export interface RestaurantHours {
  hourId: string;
  restaurantId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string; // Format: "HH:MM:SS"
  closeTime: string; // Format: "HH:MM:SS"
  createdAt: string;
  updatedAt: string;
}

/**
 * Restaurant from database
 */
export interface Restaurant {
  restaurantId: string;
  googlePlaceId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  priceLevel?: number; // 0-4, where 0 = free, 4 = expensive
  photoReference?: string;
  countryCode: string;
  createdAt: string;
  updatedAt: string;
  photos?: RestaurantPhoto[];
  hours?: RestaurantHours[];
}

/**
 * Restaurant search parameters
 */
export interface RestaurantSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  openNow?: boolean;
  countryCode?: string;
  limit?: number;
  offset?: number;
  nextPageToken?: string;
}

/**
 * Restaurant search response
 */
export interface RestaurantSearchResponse {
  restaurants: Restaurant[];
  totalCount: number;
  nextPageToken?: string;
}

/**
 * Google Maps Place result
 */
export interface GoogleMapsPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  international_phone_number?: string;
  website?: string;
  rating?: number;
  price_level?: number;
  photos?: GoogleMapsPhoto[];
  opening_hours?: {
    periods: GoogleMapsOpeningPeriod[];
    weekday_text: string[];
  };
}

/**
 * Google Maps Photo
 */
export interface GoogleMapsPhoto {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions: string[];
}

/**
 * Google Maps Opening Period
 */
export interface GoogleMapsOpeningPeriod {
  open: {
    day: number;
    time: string; // Format: "HHMM"
  };
  close: {
    day: number;
    time: string; // Format: "HHMM"
  };
}

/**
 * Restaurant with dishes
 */
export interface RestaurantWithDishes extends Restaurant {
  dishes?: {
    dishId: string;
    name: string;
    slug: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    isVegetarian?: boolean;
    spicyLevel?: number;
    price?: number;
  }[];
}

/**
 * Helper functions for restaurant data
 */

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[dayOfWeek] || '';
}

/**
 * Format time from "HH:MM:SS" to "HH:MM AM/PM"
 */
export function formatTime(time: string): string {
  if (!time) return '';

  try {
    const [hours, minutes] = time.split(':');
    if (!hours) return time;

    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
  } catch (error: unknown) {
    return time;
  }
}

/**
 * Format price level to $ symbols
 */
export function formatPriceLevel(priceLevel?: number): string {
  if (priceLevel === undefined || priceLevel === null)
    return 'Price not available';

  switch (priceLevel) {
    case 0:
      return 'Free';
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return 'Price not available';
  }
}

/**
 * Get formatted opening hours text
 */
export function getFormattedOpeningHours(hours?: RestaurantHours[]): string[] {
  if (!hours || hours.length === 0) return ['Opening hours not available'];

  // Sort hours by day of week
  const sortedHours = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Group consecutive days with the same hours
  const groupedHours: {
    days: number[];
    openTime: string;
    closeTime: string;
  }[] = [];

  for (const hour of sortedHours) {
    const lastGroup = groupedHours[groupedHours.length - 1];

    if (
      lastGroup &&
      lastGroup.openTime === hour.openTime &&
      lastGroup.closeTime === hour.closeTime &&
      lastGroup.days[lastGroup.days.length - 1] === hour.dayOfWeek - 1
    ) {
      // Add to existing group if consecutive day with same hours
      lastGroup.days.push(hour.dayOfWeek);
    } else {
      // Create new group
      groupedHours.push({
        days: [hour.dayOfWeek],
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      });
    }
  }

  // Format each group
  return groupedHours.map((group) => {
    const firstDay = group.days[0];
    const lastDay = group.days[group.days.length - 1];

    const daysText =
      group.days.length === 1
        ? getDayName(firstDay !== undefined ? firstDay : 0)
        : `${getDayName(firstDay !== undefined ? firstDay : 0)} - ${getDayName(lastDay !== undefined ? lastDay : 0)}`;

    return `${daysText}: ${formatTime(group.openTime)} - ${formatTime(group.closeTime)}`;
  });
}
