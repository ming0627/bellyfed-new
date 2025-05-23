/**
 * User Profile Service
 * Handles operations related to user profiles
 */

import { CognitoUserData, User } from '@bellyfed/types/user.js';
import { ApiService } from './api.js';
import { mockDataService } from './mockDataService.js';
import { sendEvent, EventSource, UserEventType } from '@bellyfed/utils';

/**
 * User Profile Service class
 * Provides methods for managing user profiles
 */
export class UserProfileService {
  private readonly BASE_PATH = '/api/user';
  private readonly IS_DEV = process.env.NODE_ENV === 'development';
  private readonly USE_MOCK_DATA = true; // Toggle this to use mock data in development

  /**
   * Get the current user's profile
   * @returns The user profile data
   */
  async getCurrentUserProfile(): Promise<CognitoUserData> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserProfile');
      return mockDataService.getCurrentUser() as CognitoUserData;
    }

    return ApiService.get<CognitoUserData>(`${this.BASE_PATH}/profile`);
  }

  /**
   * Update the current user's profile
   * @param userData The user data to update
   * @returns The updated user profile
   */
  async updateUserProfile(
    userData: Partial<CognitoUserData>,
  ): Promise<CognitoUserData> {
    try {
      // First, get the current user profile to have the complete data
      const currentProfile = await this.getCurrentUserProfile();

      // Prepare the event data
      const eventData = {
        userId: currentProfile.id,
        ...userData,
        updated_at: new Date().toISOString(),
      };

      // Send the event
      console.log('Sending user update event');
      await sendEvent(UserEventType.UPDATED, EventSource.USER, eventData);
      console.log('User update event sent successfully');

      if (this.IS_DEV && this.USE_MOCK_DATA) {
        console.log('Using mock data for updateUserProfile', userData);
        const mockUser = mockDataService.getCurrentUser() as CognitoUserData;
        return {
          ...mockUser,
          ...userData,
          updated_at: new Date().toISOString(),
        };
      }

      // Call the API to update the profile in Cognito
      const response = await ApiService.put<CognitoUserData>(
        `${this.BASE_PATH}/update-profile`,
        userData,
      );

      // Return the response
      return response;
    } catch (error: unknown) {
      console.error('Error updating user profile:', error);

      // Check for event-related errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('event') || errorMessage.includes('emit')) {
        // If it's an event error, still try to update the profile directly
        console.log('Falling back to direct API update due to event error');

        if (this.IS_DEV && this.USE_MOCK_DATA) {
          console.log('Using mock data for updateUserProfile (fallback)', userData);
          const mockUser = mockDataService.getCurrentUser() as CognitoUserData;
          return {
            ...mockUser,
            ...userData,
            updated_at: new Date().toISOString(),
          };
        }

        return ApiService.put<CognitoUserData>(
          `${this.BASE_PATH}/update-profile`,
          userData,
        );
      }

      throw error;
    }
  }

  /**
   * Get a user's profile by ID
   * @param userId The user ID
   * @returns The user profile data
   */
  async getUserProfileById(userId: string): Promise<CognitoUserData> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserProfileById: ${userId}`);
      return mockDataService.getUserById(userId) as CognitoUserData;
    }

    return ApiService.get<CognitoUserData>(
      `${this.BASE_PATH}/profile/${userId}`,
    );
  }

  /**
   * Get the current user's preferences
   * @returns The user preferences
   */
  async getUserPreferences(): Promise<Record<string, unknown>> {
    const userData = await this.getCurrentUserProfile();
    return userData.preferences || {};
  }

  /**
   * Update the current user's preferences
   * @param preferences The preferences to update
   * @returns The updated user profile
   */
  async updateUserPreferences(
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
  async getUserFollowers(): Promise<CognitoUserData[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getUserFollowers');
      return mockDataService.getUserFollowers() as CognitoUserData[];
    }

    return ApiService.get<CognitoUserData[]>(`${this.BASE_PATH}/followers`);
  }

  /**
   * Get the users the current user is following
   * @returns The users the current user is following
   */
  async getUserFollowing(): Promise<CognitoUserData[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getUserFollowing');
      return mockDataService.getUserFollowing() as CognitoUserData[];
    }

    return ApiService.get<CognitoUserData[]>(`${this.BASE_PATH}/following`);
  }

  /**
   * Follow a user
   * @param userId The user ID to follow
   */
  async followUser(userId: string): Promise<void> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for followUser: ${userId}`);
      return Promise.resolve();
    }

    // Updated to use the new endpoint path structure
    return ApiService.post(`${this.BASE_PATH}/follow`, {
      targetUserId: userId,
    });
  }

  /**
   * Unfollow a user
   * @param userId The user ID to unfollow
   */
  async unfollowUser(userId: string): Promise<void> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for unfollowUser: ${userId}`);
      return Promise.resolve();
    }

    // Updated to use the new endpoint path structure
    return ApiService.delete(
      `${this.BASE_PATH}/unfollow?targetUserId=${userId}`,
    );
  }

  /**
   * Search for users by name or email
   * @param query The search query
   * @returns The matching users
   */
  async searchUsers(query: string): Promise<CognitoUserData[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for searchUsers: ${query}`);
      const mockUsers = [
        mockDataService.getCurrentUser(),
        ...mockDataService.getUserFollowers().slice(0, 5),
      ] as CognitoUserData[];

      return mockUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
      );
    }

    return ApiService.get<CognitoUserData[]>(
      `${this.BASE_PATH}/search?query=${encodeURIComponent(query)}`
    );
  }

  /**
   * Get user statistics
   * @param userId The user ID (optional, defaults to current user)
   * @returns The user statistics
   */
  async getUserStats(userId?: string): Promise<{
    reviews: number;
    followers: number;
    following: number;
    cities: number;
  }> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserStats: ${userId || 'current'}`);
      return {
        reviews: Math.floor(Math.random() * 50),
        followers: Math.floor(Math.random() * 100),
        following: Math.floor(Math.random() * 100),
        cities: Math.floor(Math.random() * 20),
      };
    }

    const endpoint = userId
      ? `${this.BASE_PATH}/stats/${userId}`
      : `${this.BASE_PATH}/stats`;

    return ApiService.get<{
      reviews: number;
      followers: number;
      following: number;
      cities: number;
    }>(endpoint);
  }
}

// Export a singleton instance
export const userProfileService = new UserProfileService();
