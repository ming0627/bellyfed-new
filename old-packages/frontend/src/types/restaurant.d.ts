// Type declarations for restaurant types
declare module '@/types/restaurant' {
  export interface Restaurant {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
    website?: string;
    description?: string;
    photos?: string[];
    [key: string]: any;
  }

  export interface RestaurantWithDishes extends Restaurant {
    dishes: {
      id: string;
      name: string;
      description?: string;
      price?: number;
      photos?: string[];
      [key: string]: any;
    }[];
  }

  export interface RestaurantLocation {
    lat: number;
    lng: number;
  }

  export interface RestaurantHours {
    day: string;
    open: string;
    close: string;
  }

  export interface RestaurantReview {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    date: string;
    [key: string]: any;
  }
}
