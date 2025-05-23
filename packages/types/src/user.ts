/**
 * User profile data types
 */

/**
 * User interface
 * Represents a standard user profile
 */
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
  points?: number;
  achievements?: Record<string, unknown>[];
  stats?: {
    reviews?: number;
    followers?: number;
    following?: number;
    cities?: number;
  };
}

/**
 * Cognito user data interface
 * Represents a user profile with data from Cognito and additional profile information
 */
export interface CognitoUserData {
  id: string;
  username: string;
  email: string;
  name?: string;
  nickname?: string;
  location?: string;
  bio?: string;
  phone?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  preferences?: Record<string, unknown>;
  interests?: string[];
  stats?: {
    reviews: number;
    followers: number;
    following: number;
    cities: number;
  };
}

/**
 * User event types
 */
export enum UserEventType {
  REGISTERED = 'UserRegistered',
  UPDATED = 'UserUpdated',
  DELETED = 'UserDeleted',
}

/**
 * Event sources
 */
export enum EventSource {
  RESTAURANT = 'bellyfed.restaurant',
  REVIEW = 'bellyfed.review',
  USER = 'bellyfed.user',
}

/**
 * Standard event payload structure
 */
export interface EventPayload {
  eventId: string;
  eventType: string;
  source: string;
  timestamp: string;
  detail: Record<string, unknown>;
}
