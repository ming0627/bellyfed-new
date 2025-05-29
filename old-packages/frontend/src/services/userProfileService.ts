import { CognitoUserData } from '../hooks/useCognitoUser';
import { ApiService } from './api';
import { updateUserEvent } from '@/utils/events';

export class UserProfileService {
  private static readonly BASE_PATH = '/proxy/user';

  /**
   * Get the current user's profile
   * @returns The user profile data
   */
  static async getCurrentUserProfile(): Promise<CognitoUserData> {
    return ApiService.get<CognitoUserData>(`${this.BASE_PATH}/profile`);
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
      const response = await ApiService.put<CognitoUserData>(
        `${this.BASE_PATH}/update-profile`,
        userData,
      );

      // Return the response
      return response;
    } catch (error: unknown) {
      console.error('Error updating user profile:', error);

      // Check for SQS-related errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
        // If it's an SQS error, still try to update the profile in Cognito
        console.log('Falling back to direct API update due to SQS error');
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
   * @param 'user-123' The user ID
   * @returns The user profile data
   */
  static async getUserProfileById(userId: string): Promise<CognitoUserData> {
    return ApiService.get<CognitoUserData>(
      `${this.BASE_PATH}/profile/${userId}`,
    );
  }

  /**
   * Get the current user's preferences
   * @returns The user preferences
   */
  static async getUserPreferences(): Promise<Record<string, unknown>> {
    const userData = await this.getCurrentUserProfile();
    return userData.preferences || {};
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
    return ApiService.get<CognitoUserData[]>(`${this.BASE_PATH}/followers`);
  }

  /**
   * Get the users the current user is following
   * @returns The users the current user is following
   */
  static async getUserFollowing(): Promise<CognitoUserData[]> {
    return ApiService.get<CognitoUserData[]>(`${this.BASE_PATH}/following`);
  }

  /**
   * Follow a user
   * @param userId The user ID to follow
   */
  static async followUser(userId: string): Promise<void> {
    // Updated to use the new endpoint path structure
    return ApiService.post(`${this.BASE_PATH}/follow`, {
      targetUserId: userId,
    });
  }

  /**
   * Unfollow a user
   * @param userId The user ID to unfollow
   */
  static async unfollowUser(userId: string): Promise<void> {
    // Updated to use the new endpoint path structure
    return ApiService.delete(
      `${this.BASE_PATH}/unfollow?targetUserId=${userId}`,
    );
  }
}
