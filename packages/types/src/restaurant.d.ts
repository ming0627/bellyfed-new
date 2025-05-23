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
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
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
    priceLevel?: number;
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
    radius?: number;
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
        time: string;
    };
    close: {
        day: number;
        time: string;
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
export declare function getDayName(dayOfWeek: number): string;
/**
 * Format time from "HH:MM:SS" to "HH:MM AM/PM"
 */
export declare function formatTime(time: string): string;
/**
 * Format price level to $ symbols
 */
export declare function formatPriceLevel(priceLevel?: number): string;
/**
 * Get formatted opening hours text
 */
export declare function getFormattedOpeningHours(hours?: RestaurantHours[]): string[];
//# sourceMappingURL=restaurant.d.ts.map