/**
 * Utility types for Bellyfed application
 * These types are used across the application for utility functions
 */

import { NextApiRequest } from 'next';
import { User } from './user.js';

/**
 * Authenticated request interface extending NextApiRequest
 */
export interface AuthenticatedRequest extends NextApiRequest {
  /**
   * Authenticated user
   */
  user?: User;
}

/**
 * Token payload interface for JWT tokens
 */
export interface TokenPayload {
  /**
   * Subject (user ID)
   */
  sub: string;

  /**
   * User email
   */
  email: string;

  /**
   * Cognito username
   */
  'cognito:username'?: string;

  /**
   * User name
   */
  name?: string;

  /**
   * Additional claims
   */
  [key: string]: unknown;
}

/**
 * Tokens interface for authentication tokens
 */
export interface Tokens {
  /**
   * Access token
   */
  accessToken: string | null;

  /**
   * ID token
   */
  idToken: string | null;

  /**
   * Refresh token
   */
  refreshToken: string | null;
}

/**
 * App environment type
 */
export type AppEnvironment = 'development' | 'test' | 'production';

/**
 * Locale type
 */
export type Locale = 'en' | 'ms' | 'zh' | 'ta';

/**
 * Country code type
 */
export type CountryCode = 'MY' | 'SG' | 'ID' | 'TH' | 'VN' | 'PH';

/**
 * Currency code type
 */
export type CurrencyCode = 'MYR' | 'SGD' | 'IDR' | 'THB' | 'VND' | 'PHP';

/**
 * Date string type (ISO 8601 format)
 */
export type DateString = string;

/**
 * Time string type (HH:MM format)
 */
export type TimeString = `${number}:${number}`;

/**
 * Coordinates interface
 */
export interface Coordinates {
  /**
   * Latitude
   */
  latitude: number;

  /**
   * Longitude
   */
  longitude: number;
}

/**
 * Address interface
 */
export interface Address {
  /**
   * Street address
   */
  street: string;

  /**
   * City
   */
  city: string;

  /**
   * State or province
   */
  state: string;

  /**
   * Country
   */
  country: string;

  /**
   * Postal code
   */
  postalCode: string;

  /**
   * Coordinates
   */
  coordinates?: Coordinates;
}

/**
 * S3 object interface
 */
export interface S3Object {
  /**
   * S3 bucket name
   */
  bucket: string;

  /**
   * AWS region
   */
  region: string;

  /**
   * S3 object key
   */
  key: string;
}

/**
 * Contact information interface
 */
export interface ContactInfo {
  /**
   * Phone number
   */
  phone?: string;

  /**
   * Email address
   */
  email?: string;

  /**
   * Website URL
   */
  website?: string;

  /**
   * Physical address
   */
  address?: string;
}
