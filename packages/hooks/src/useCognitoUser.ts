import { useState, useEffect, useCallback } from 'react';
import { cognitoAuthService } from '@bellyfed/services';

/**
 * Interface for Cognito user attributes
 */
export interface CognitoUserAttributes {
  /**
   * User's unique identifier
   */
  sub: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's full name
   */
  name?: string;

  /**
   * User's nickname or preferred name
   */
  nickname?: string;

  /**
   * Any other attributes
   */
  [key: string]: string | undefined;
}

/**
 * Interface for Cognito user
 */
export interface CognitoUser {
  /**
   * User's username (often email)
   */
  username: string;

  /**
   * User's attributes
   */
  attributes: CognitoUserAttributes;
}

/**
 * Interface for Cognito authentication state
 */
export interface CognitoAuthState {
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the authentication state is being loaded
   */
  isLoading: boolean;

  /**
   * The current user, or null if not authenticated
   */
  user: CognitoUser | null;

  /**
   * Any error that occurred during authentication
   */
  error: Error | null;
}

/**
 * Interface for Cognito authentication methods
 */
export interface CognitoAuthMethods {
  /**
   * Sign in with username and password
   * @param username - The username
   * @param password - The password
   * @returns A promise that resolves when the sign-in is complete
   */
  signIn: (username: string, password: string) => Promise<void>;

  /**
   * Sign out
   * @returns A promise that resolves when the sign-out is complete
   */
  signOut: () => Promise<void>;

  /**
   * Sign up a new user
   * @param username - The username
   * @param password - The password
   * @param email - The email
   * @param nickname - The nickname (optional)
   * @returns A promise that resolves when the sign-up is complete
   */
  signUp: (username: string, password: string, email: string, nickname?: string) => Promise<void>;

  /**
   * Confirm sign up with verification code
   * @param username - The username
   * @param code - The verification code
   * @returns A promise that resolves when the confirmation is complete
   */
  confirmSignUp: (username: string, code: string) => Promise<void>;

  /**
   * Resend confirmation code
   * @param username - The username
   * @returns A promise that resolves when the code is resent
   */
  resendConfirmationCode: (username: string) => Promise<void>;

  /**
   * Forgot password
   * @param username - The username
   * @returns A promise that resolves when the password reset is initiated
   */
  forgotPassword: (username: string) => Promise<void>;

  /**
   * Confirm forgot password with new password and code
   * @param username - The username
   * @param code - The verification code
   * @param newPassword - The new password
   * @returns A promise that resolves when the password is reset
   */
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<void>;

  /**
   * Refresh the user data
   * @returns A promise that resolves when the user data is refreshed
   */
  refreshUser: () => Promise<void>;
}

/**
 * Hook for managing Cognito user authentication
 *
 * @returns Cognito authentication state and methods
 */
export function useCognitoUser(): CognitoAuthState & CognitoAuthMethods {
  const [state, setState] = useState<CognitoAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  /**
   * Fetch the current user and update the state
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const isAuthenticated = await cognitoAuthService.isAuthenticated();

      if (isAuthenticated) {
        const user = await cognitoAuthService.getCurrentUser();
        setState({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null,
        });
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error : new Error('Failed to fetch user'),
      });
    }
  }, []);

  /**
   * Sign in with username and password
   */
  const signIn = useCallback(async (username: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.signIn(username, password);

      // Fetch the current user after sign-in
      await fetchCurrentUser();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign in'),
      }));
      throw error;
    }
  }, [fetchCurrentUser]);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.signOut();

      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign out'),
      }));
      throw error;
    }
  }, []);

  /**
   * Sign up a new user
   */
  const signUp = useCallback(async (username: string, password: string, email: string, nickname?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.signUp(username, password, email, nickname);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign up'),
      }));
      throw error;
    }
  }, []);

  /**
   * Confirm sign up with verification code
   */
  const confirmSignUp = useCallback(async (username: string, code: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.confirmSignUp(username, code);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to confirm sign up'),
      }));
      throw error;
    }
  }, []);

  /**
   * Resend confirmation code
   */
  const resendConfirmationCode = useCallback(async (username: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.resendConfirmationCode(username);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to resend confirmation code'),
      }));
      throw error;
    }
  }, []);

  /**
   * Forgot password
   */
  const forgotPassword = useCallback(async (username: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.forgotPassword(username);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to initiate password reset'),
      }));
      throw error;
    }
  }, []);

  /**
   * Confirm forgot password with new password and code
   */
  const confirmForgotPassword = useCallback(async (username: string, code: string, newPassword: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await cognitoAuthService.confirmForgotPassword(username, code, newPassword);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to reset password'),
      }));
      throw error;
    }
  }, []);

  /**
   * Refresh the user data
   */
  const refreshUser = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Fetch the current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    ...state,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    refreshUser,
  };
}
