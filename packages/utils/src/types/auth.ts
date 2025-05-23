/**
 * Authentication Type Definitions
 *
 * This file contains type definitions for authentication-related components
 * and utilities that are used across the application.
 */

import { NextApiRequest } from 'next';

/**
 * User interface
 * Represents a user in the application
 */
export interface User {
  /**
   * User ID (usually the Cognito sub)
   */
  id: string;

  /**
   * Username (usually the Cognito username or email)
   */
  username: string;

  /**
   * Email address
   */
  email: string;

  /**
   * Full name
   */
  name?: string;

  /**
   * Nickname or display name
   */
  nickname?: string;

  /**
   * Phone number
   */
  phone?: string;

  /**
   * User's location
   */
  location?: string;

  /**
   * User's bio or description
   */
  bio?: string;

  /**
   * User's interests
   */
  interests?: string[];

  /**
   * Whether the email is verified
   */
  email_verified?: boolean;

  /**
   * When the user was created
   */
  created_at?: string;

  /**
   * When the user was last updated
   */
  updated_at?: string;

  /**
   * Cognito ID (usually the same as id/sub)
   */
  cognito_id?: string;

  /**
   * User statistics
   */
  stats?: {
    /**
     * Number of reviews
     */
    reviews?: number;

    /**
     * Number of followers
     */
    followers?: number;

    /**
     * Number of users being followed
     */
    following?: number;

    /**
     * Number of cities visited
     */
    cities?: number;
  };
}

/**
 * Authenticated request interface
 * Extends NextApiRequest to include the authenticated user
 */
export interface AuthenticatedRequest extends NextApiRequest {
  /**
   * The authenticated user
   */
  user?: User;
}

/**
 * Token payload interface
 * Represents the payload of a JWT token
 */
export interface TokenPayload {
  /**
   * Subject (user ID)
   */
  sub: string;

  /**
   * Email address
   */
  email: string;

  /**
   * Cognito username
   */
  'cognito:username'?: string;

  /**
   * Full name
   */
  name?: string;

  /**
   * Additional properties
   */
  [key: string]: unknown;
}

/**
 * Tokens interface
 * Represents the authentication tokens
 */
export interface Tokens {
  /**
   * Access token for API calls
   */
  accessToken: string | null;

  /**
   * ID token containing user information
   */
  idToken: string | null;

  /**
   * Refresh token for getting new access and ID tokens
   */
  refreshToken: string | null;
}

/**
 * Authentication state interface
 * Represents the current authentication state
 */
export interface AuthState {
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the authentication state is loading
   */
  isLoading: boolean;

  /**
   * The authenticated user
   */
  user: User | null;

  /**
   * Authentication tokens
   */
  tokens: Tokens;

  /**
   * Authentication error
   */
  error: string | null;
}

/**
 * Authentication context interface
 * Represents the authentication context provided to components
 */
export interface AuthContextType extends AuthState {
  /**
   * Sign in with email and password
   */
  signIn: (email: string, password: string) => Promise<void>;

  /**
   * Sign out
   */
  signOut: () => Promise<void>;

  /**
   * Sign up with email, password, and optional attributes
   */
  signUp: (
    email: string,
    password: string,
    attributes?: Record<string, string>
  ) => Promise<void>;

  /**
   * Confirm sign up with verification code
   */
  confirmSignUp: (email: string, code: string) => Promise<void>;

  /**
   * Resend verification code
   */
  resendVerificationCode: (email: string) => Promise<void>;

  /**
   * Forgot password
   */
  forgotPassword: (email: string) => Promise<void>;

  /**
   * Reset password with verification code
   */
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;

  /**
   * Update user attributes
   */
  updateUserAttributes: (attributes: Partial<User>) => Promise<void>;

  /**
   * Refresh authentication tokens
   */
  refreshTokens: () => Promise<void>;
}
