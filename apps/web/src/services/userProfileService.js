/**
 * User Profile Service
 * This service provides methods for interacting with user profile data
 */

import { ApiService } from './api.js';
import { updateUserEvent } from '../utils/events.js';

/**
 * User Profile Service class
 */
export class UserProfileService {
  static BASE_PATH = '/proxy/user';

  /**
   * Get the current user's profile
   * @returns {Promise<Object>} A promise that resolves to the user profile data
   */
  static async getCurrentUserProfile() {
    return ApiService.get(`${this.BASE_PATH}/profile`);
  }

  /**
   * Update the current user's profile
   * @param {Object} userData - The user data to update
   * @returns {Promise<Object>} A promise that resolves to the updated user profile
   */
  static async updateUserProfile(userData) {
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
      const response = await ApiService.put(
        `${this.BASE_PATH}/update-profile`,
        userData
      );

      // Return the response
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);

      // Check for SQS-related errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('SQS') || errorMessage.includes('queue')) {
        // If it's an SQS error, still try to update the profile in Cognito
        console.log('Falling back to direct API update due to SQS error');
        return ApiService.put(
          `${this.BASE_PATH}/update-profile`,
          userData
        );
      }

      throw error;
    }
  }

  /**
   * Get a user's profile by ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} A promise that resolves to the user profile data
   */
  static async getUserProfileById(userId) {
    return ApiService.get(
      `${this.BASE_PATH}/profile/${userId}`
    );
  }

  /**
   * Get the current user's preferences
   * @returns {Promise<Object>} A promise that resolves to the user preferences
   */
  static async getUserPreferences() {
    const userData = await this.getCurrentUserProfile();
    return userData.preferences || {};
  }

  /**
   * Update the current user's preferences
   * @param {Object} preferences - The preferences to update
   * @returns {Promise<Object>} A promise that resolves to the updated user profile
   */
  static async updateUserPreferences(preferences) {
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
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get the current user's followers
   * @returns {Promise<Array>} A promise that resolves to the user's followers
   */
  static async getUserFollowers() {
    return ApiService.get(`${this.BASE_PATH}/followers`);
  }

  /**
   * Get the users the current user is following
   * @returns {Promise<Array>} A promise that resolves to the users the current user is following
   */
  static async getUserFollowing() {
    return ApiService.get(`${this.BASE_PATH}/following`);
  }

  /**
   * Follow a user
   * @param {string} userId - The user ID to follow
   * @returns {Promise<void>} A promise that resolves when the user is followed
   */
  static async followUser(userId) {
    // Updated to use the new endpoint path structure
    return ApiService.post(`${this.BASE_PATH}/follow`, {
      targetUserId: userId,
    });
  }

  /**
   * Unfollow a user
   * @param {string} userId - The user ID to unfollow
   * @returns {Promise<void>} A promise that resolves when the user is unfollowed
   */
  static async unfollowUser(userId) {
    // Updated to use the new endpoint path structure
    return ApiService.delete(
      `${this.BASE_PATH}/unfollow?targetUserId=${userId}`
    );
  }
}
