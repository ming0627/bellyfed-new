/**
 * Authentication related type definitions
 */

import { ReactNode } from 'react';
import { 
  AuthStatusResponse, 
  CognitoUser, 
  SignInResponse 
} from '@bellyfed/services/dist/auth/cognitoAuthService';

/**
 * User object representing an authenticated user
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  nickname?: string;
  profilePicture?: string;
}

/**
 * Credentials for signing in
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The authenticated user, if any */
  user: User | null;
  /** Whether authentication is currently loading */
  isLoading: boolean;
  /** Sign in with credentials */
  signIn: (credentials: SignInCredentials) => Promise<boolean>;
  /** Sign out the current user */
  signOut: () => Promise<boolean>;
  /** Check the current user's authentication status */
  checkUser: () => Promise<void>;
}

/**
 * Props for the AuthProvider component
 */
export interface AuthProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * Convert AuthStatusResponse to User
 */
export function mapAuthStatusToUser(authStatus: AuthStatusResponse): User | null {
  if (!authStatus.isAuthenticated || !authStatus.user) {
    return null;
  }

  return {
    id: authStatus.user.id,
    username: authStatus.user.username,
    email: authStatus.user.email,
    name: authStatus.user.name,
    nickname: authStatus.user.nickname,
  };
}

/**
 * Convert CognitoUser to User
 */
export function mapCognitoUserToUser(cognitoUser: CognitoUser): User {
  return {
    id: cognitoUser.attributes.sub,
    username: cognitoUser.username,
    email: cognitoUser.attributes.email,
    name: cognitoUser.attributes.name,
    nickname: cognitoUser.attributes.nickname,
  };
}
