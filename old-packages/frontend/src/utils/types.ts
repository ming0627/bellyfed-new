import { NextApiRequest } from 'next';

// User type
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  nickname?: string;
  phone?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  cognito_id?: string;
  stats?: {
    reviews?: number;
    followers?: number;
    following?: number;
    cities?: number;
  };
}

// Extend NextApiRequest to include user
export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

// Token payload type
export interface TokenPayload {
  sub: string;
  email: string;
  'cognito:username'?: string;
  name?: string;
  [key: string]: unknown;
}

// Tokens type
export interface Tokens {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}
