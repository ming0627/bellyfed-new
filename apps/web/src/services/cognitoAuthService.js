/**
 * Cognito Authentication Service
 *
 * This service handles authentication with AWS Cognito via server-side API endpoints.
 *
 * Security improvements:
 * - All authentication is handled server-side with HttpOnly cookies
 * - No client-side cookie or token management
 * - Protection against XSS attacks
 * - No LocalStorage use for sensitive data
 */

import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

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

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

// Authentication service
export const cognitoAuthService = {
  // Sign in with username and password - uses server API
  signIn: async (username, password) => {
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
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign up a new user
  signUp: async (
    username,
    password,
    email,
    nickname,
  ) => {
    try {
      // Create user attributes array
      const userAttributes = [
        {
          Name: 'email',
          Value: email,
        },
      ];

      // Add nickname attribute if provided
      if (nickname) {
        userAttributes.push({
          Name: 'nickname',
          Value: nickname,
        });
      }

      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: userAttributes,
      });

      const response = await cognitoClient.send(command);
      return {
        userConfirmed: response.UserConfirmed,
        userSub: response.UserSub,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Confirm sign up with verification code
  confirmSignUp: async (username, code) => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  },

  // Resend confirmation code
  resendConfirmationCode: async (username) => {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: CLIENT_ID,
        Username: username,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (username) => {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: username,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Confirm forgot password with new password and code
  confirmForgotPassword: async (
    username,
    code,
    newPassword,
  ) => {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Confirm forgot password error:', error);
      throw error;
    }
  },

  // Sign out - uses server API
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
    } catch (error) {
      console.error('Sign out error:', error);
      return true;
    }
  },

  // Refresh tokens - uses server API
  refreshTokens: async () => {
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
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  },

  // Get current authentication status - uses server API
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
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { isAuthenticated: false };
    }
  },

  // Legacy method for backward compatibility - uses server API check
  isAuthenticated: async () => {
    try {
      const { isAuthenticated } = await cognitoAuthService.getAuthStatus();
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking if authenticated:', error);
      return false;
    }
  },

  // Get current user - uses server API
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
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

export default cognitoAuthService;
