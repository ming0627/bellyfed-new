/**
 * Cognito Authentication Service
 * Handles authentication with AWS Cognito via server-side API endpoints
 */

// Environment variables should be set during build
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1';

// Use the standardized environment variable
const CLIENT_ID =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '3qmr0b7s247e2c7ogaopih1kgd';

// Throw an error if CLIENT_ID is not set - this will prevent empty client ID issues
if (!CLIENT_ID) {
  throw new Error(
    'Cognito Client ID is not set. Please check your environment variables.',
  );
}

/**
 * Cognito Authentication Service
 * Provides methods for interacting with AWS Cognito
 */
export const cognitoAuthService = {
  /**
   * Sign in with username and password
   * @param username The username
   * @param password The password
   * @returns The sign-in result
   */
  signIn: async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
        credentials: 'include', // Important: to include cookies in the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      return {
        isSignedIn: data.isAuthenticated,
        username: data.username || username,
      };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  /**
   * Sign up a new user
   * @param username The username
   * @param password The password
   * @param email The email
   * @param nickname The nickname (optional)
   * @returns The sign-up result
   */
  signUp: async (
    username: string,
    password: string,
    email: string,
    nickname?: string,
  ) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          nickname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return {
        userConfirmed: data.userConfirmed,
        userSub: data.userSub,
      };
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  /**
   * Confirm sign up with verification code
   * @param username The username
   * @param code The verification code
   * @returns Whether the confirmation was successful
   */
  confirmSignUp: async (username: string, code: string) => {
    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Confirmation failed');
      }

      return true;
    } catch (error: unknown) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  },

  /**
   * Resend confirmation code
   * @param username The username
   * @returns Whether the code was resent successfully
   */
  resendConfirmationCode: async (username: string) => {
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend code');
      }

      return true;
    } catch (error: unknown) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  },

  /**
   * Forgot password
   * @param username The username
   * @returns Whether the password reset was initiated successfully
   */
  forgotPassword: async (username: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate password reset');
      }

      return true;
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Confirm forgot password with new password and code
   * @param username The username
   * @param code The verification code
   * @param newPassword The new password
   * @returns Whether the password was reset successfully
   */
  confirmForgotPassword: async (
    username: string,
    code: string,
    newPassword: string,
  ) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          code,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      return true;
    } catch (error: unknown) {
      console.error('Confirm forgot password error:', error);
      throw error;
    }
  },

  /**
   * Sign out
   * @returns Whether the sign-out was successful
   */
  signOut: async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout failed:', await response.text());
      }

      return true;
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      return true;
    }
  },

  /**
   * Refresh tokens
   * @returns Whether the tokens were refreshed successfully
   */
  refreshTokens: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Token refresh failed', await response.text());
        return false;
      }

      const data = await response.json();
      return data.isAuthenticated;
    } catch (error: unknown) {
      console.error('Token refresh error:', error);
      return false;
    }
  },

  /**
   * Get current authentication status
   * @returns The authentication status
   */
  getAuthStatus: async () => {
    try {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Auth status check failed', await response.text());
        return { isAuthenticated: false };
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error checking auth status:', error);
      return { isAuthenticated: false };
    }
  },

  /**
   * Check if the user is authenticated
   * @returns Whether the user is authenticated
   */
  isAuthenticated: async () => {
    try {
      const { isAuthenticated } = await cognitoAuthService.getAuthStatus();
      return isAuthenticated;
    } catch (error: unknown) {
      console.error('Error checking if authenticated:', error);
      return false;
    }
  },

  /**
   * Get current session
   * @returns The current session
   */
  getCurrentSession: () => {
    // This is a synchronous function that returns a session object
    // The actual authentication check is done server-side
    return {
      isSignedIn: true, // Always return true and let the server decide
      idToken: 'server-side-token',
      accessToken: 'server-side-token',
      user: null,
    };
  },

  /**
   * Get current user
   * @returns The current user
   */
  getCurrentUser: async () => {
    try {
      const { isAuthenticated, user } =
        await cognitoAuthService.getAuthStatus();

      if (!isAuthenticated || !user) {
        return null;
      }

      return {
        username: user.username || user.email,
        attributes: {
          sub: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
        },
      };
    } catch (error: unknown) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

export default cognitoAuthService;
