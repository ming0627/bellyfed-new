import { CognitoUserData } from '@bellyfed/types';
import { updateUserEvent } from '@bellyfed/utils';

/**
 * Service for managing user profiles
 */
export class UserProfileService {
  private static readonly BASE_PATH = '/api/user';

  /**
   * Get the current user's profile
   * @returns The user profile data
   */
  static async getCurrentUserProfile(): Promise<CognitoUserData> {
    try {
      const response = await fetch(`${this.BASE_PATH}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user profile');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update the current user's profile
   * @param userData The user data to update
   * @returns The updated user profile
   */
  static async updateUserProfile(
    userData: Partial<CognitoUserData>,
  ): Promise<CognitoUserData> {
    try {
      // First, get the current user profile to have the complete data
      const currentProfile = await this.getCurrentUserProfile();

      // Prepare the event data
      const eventData = {
        userId: currentProfile.id,
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      // Send the event to SQS
      console.log('Sending user update event to SQS');
      await updateUserEvent(eventData);
      console.log('User update event sent successfully');

      // Call the API to update the profile in Cognito
      const response = await fetch(`${this.BASE_PATH}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user profile');
      }

      // Return the response
      return await response.json();
    } catch (error: unknown) {
      console.error('Error updating user profile:', error);

      // Check for SQS-related errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
        // If it's an SQS error, still try to update the profile in Cognito
        console.log('Falling back to direct API update due to SQS error');
        const response = await fetch(`${this.BASE_PATH}/update-profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user profile');
        }

        return await response.json();
      }

      throw error;
    }
  }

  /**
   * Get a user's profile by ID
   * @param userId The user ID
   * @returns The user profile data
   */
  static async getUserProfileById(userId: string): Promise<CognitoUserData> {
    try {
      const response = await fetch(`${this.BASE_PATH}/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user profile');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error(`Error getting user profile for ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get the current user's preferences
   * @returns The user preferences
   */
  static async getUserPreferences(): Promise<Record<string, unknown>> {
    try {
      const userData = await this.getCurrentUserProfile();
      return userData.preferences || {};
    } catch (error: unknown) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Update the current user's preferences
   * @param preferences The preferences to update
   * @returns The updated user profile
   */
  static async updateUserPreferences(
    preferences: Record<string, unknown>,
  ): Promise<CognitoUserData> {
    try {
      const userData = await this.getCurrentUserProfile();

      // Prepare the updated user data with new preferences
      const updatedUserData = {
        ...userData,
        preferences: {
          ...(userData.preferences || {}),
          ...preferences,
        },
      };

      // Use the updateUserProfile method which now sends events
      return this.updateUserProfile(updatedUserData);
    } catch (error: unknown) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get the current user's followers
   * @returns The user's followers
   */
  static async getUserFollowers(): Promise<CognitoUserData[]> {
    try {
      const response = await fetch(`${this.BASE_PATH}/followers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user followers');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error getting user followers:', error);
      throw error;
    }
  }

  /**
   * Get the users the current user is following
   * @returns The users the current user is following
   */
  static async getUserFollowing(): Promise<CognitoUserData[]> {
    try {
      const response = await fetch(`${this.BASE_PATH}/following`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user following');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error getting user following:', error);
      throw error;
    }
  }

  /**
   * Follow a user
   * @param userId The user ID to follow
   */
  static async followUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_PATH}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: userId }),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to follow user');
      }
    } catch (error: unknown) {
      console.error(`Error following user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unfollow a user
   * @param userId The user ID to unfollow
   */
  static async unfollowUser(userId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.BASE_PATH}/unfollow?targetUserId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unfollow user');
      }
    } catch (error: unknown) {
      console.error(`Error unfollowing user ${userId}:`, error);
      throw error;
    }
  }
}
