import {
  CuisineType,
  PriceRange,
  Amenity,
  DietaryOption,
  PaymentMethod,
  Certification,
} from './config/restaurantConfig.js';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  district?: string;
  landmark?: string;
  formatted?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
}

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  holidays?: string;
  specialHours?: Array<{
    date: string;
    hours: string;
    description?: string;
  }>;
}

export interface Dish {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  dietaryOptions?: DietaryOption[];
  spicyLevel?: number;
  isSignature?: boolean;
  isAvailable?: boolean;
  rating?: number;
  reviewCount?: number;
  category?: string;
}

export interface RestaurantImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
  uploadedBy?: string;
  uploadDate?: string;
  tags?: string[];
}

export interface RestaurantRanking {
  totalScore: number;
  foodScore: number;
  serviceScore: number;
  ambienceScore: number;
  valueScore: number;
  cleanliness?: number;
}

export interface FoodEstablishment {
  id: string;
  name: string;
  description?: string;
  address: Address;
  location: GeoLocation;
  contact: ContactInfo;
  hours: BusinessHours;
  cuisineTypes?: CuisineType[];
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  featuredDishes?: Dish[];
  images?: RestaurantImage[];
  amenities?: Amenity[];
  dietaryOptions?: DietaryOption[];
  paymentMethods?: PaymentMethod[];
  certifications?: Certification[];
  ranking?: RestaurantRanking;
  isFeatured?: boolean;
  isVerified?: boolean;
  establishedYear?: number;
  owner?: {
    name: string;
    bio?: string;
    imageUrl?: string;
  };
  tags?: string[];
  lastUpdated?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
  badges?: string[];
  favoriteRestaurants?: string[];
  favoriteCuisines?: CuisineType[];
  dietaryPreferences?: DietaryOption[];
  isVerified: boolean;
  role: 'user' | 'critic' | 'owner' | 'admin';
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  rating: number;
  title?: string;
  content: string;
  visitDate: string;
  createdAt: string;
  updatedAt?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  likes: number;
  comments: number;
  isVerifiedVisit: boolean;
  dishRatings?: Array<{
    dishId: string;
    dishName: string;
    rating: number;
    comment?: string;
  }>;
  categoryRatings?: {
    food: number;
    service: number;
    ambience: number;
    value: number;
    cleanliness?: number;
  };
  tags?: string[];
  helpfulCount: number;
  reportCount: number;
  status: 'published' | 'pending' | 'rejected' | 'removed';
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  restaurantCount: number;
  isPublic: boolean;
  isFeatured?: boolean;
  tags?: string[];
  restaurants?: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    rating?: number;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  content: string;
  relatedId?: string;
  relatedType?: 'review' | 'restaurant' | 'user' | 'collection';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface SearchFilters {
  query?: string;
  location?: string;
  cuisineTypes?: CuisineType[];
  priceRange?: PriceRange[];
  rating?: number;
  openNow?: boolean;
  features?: string[];
  sortBy?: 'relevance' | 'rating' | 'reviews' | 'distance' | 'newest';
  page?: number;
  limit?: number;
}
