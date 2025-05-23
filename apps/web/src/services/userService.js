/**
 * User Service
 * This service provides methods for interacting with user data
 */

import { ApiService } from './api.js';
import { MockDataService } from './mockDataService.js';

export class UserService {
  static BASE_PATH = '/users';
  static IS_DEV = process.env.NODE_ENV === 'development';
  static USE_MOCK_DATA = true; // Toggle this to use mock data in development

  /**
   * Get the current user
   * @returns {Promise<Object>} A promise that resolves to the current user
   */
  static async getCurrentUser() {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUser');
      return MockDataService.getCurrentUser();
    }
    return ApiService.get(`${this.BASE_PATH}/current`);
  }

  /**
   * Get a user by ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} A promise that resolves to the user
   */
  static async getUserById(userId) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserById: ${userId}`);
      return MockDataService.getUserById('user-123');
    }
    return ApiService.get(`${this.BASE_PATH}/${userId}`);
  }

  /**
   * Update a user
   * @param {string} userId - The user ID
   * @param {Object} userData - The user data to update
   * @returns {Promise<Object>} A promise that resolves to the updated user
   */
  static async updateUser(userId, userData) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for updateUser: ${userId}`, userData);
      // Return the mock user with updated fields
      const user = MockDataService.getUserById('user-123');
      return { ...user, ...userData, updatedAt: new Date().toISOString() };
    }
    return ApiService.put(`${this.BASE_PATH}/${userId}`, userData);
  }

  /**
   * Update the current user
   * @param {Object} userData - The user data to update
   * @returns {Promise<Object>} A promise that resolves to the updated user
   */
  static async updateCurrentUser(userData) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updateCurrentUser', userData);
      // Return the mock current user with updated fields
      const user = MockDataService.getCurrentUser();
      return { ...user, ...userData, updatedAt: new Date().toISOString() };
    }
    return ApiService.put(`${this.BASE_PATH}/current`, userData);
  }

  /**
   * Get a user's followers
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} A promise that resolves to the user's followers
   */
  static async getUserFollowers(userId) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserFollowers: ${userId}`);
      return MockDataService.getUserFollowers();
    }
    return ApiService.get(`${this.BASE_PATH}/${userId}/followers`);
  }

  /**
   * Get users that a user is following
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} A promise that resolves to the users the user is following
   */
  static async getUserFollowing(userId) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserFollowing: ${userId}`);
      return MockDataService.getUserFollowing();
    }
    return ApiService.get(`${this.BASE_PATH}/${userId}/following`);
  }

  /**
   * Get the current user's followers
   * @returns {Promise<Array>} A promise that resolves to the current user's followers
   */
  static async getCurrentUserFollowers() {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserFollowers');
      return MockDataService.getUserFollowers();
    }
    return ApiService.get(`${this.BASE_PATH}/current/followers`);
  }

  /**
   * Get users that the current user is following
   * @returns {Promise<Array>} A promise that resolves to the users the current user is following
   */
  static async getCurrentUserFollowing() {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserFollowing');
      return MockDataService.getUserFollowing();
    }
    return ApiService.get(`${this.BASE_PATH}/current/following`);
  }

  /**
   * Follow a user
   * @param {string} userId - The user ID to follow
   * @returns {Promise<void>} A promise that resolves when the user is followed
   */
  static async followUser(userId) {
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
   * @param {string} userId - The user ID to unfollow
   * @returns {Promise<void>} A promise that resolves when the user is unfollowed
   */
  static async unfollowUser(userId) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for unfollowUser: ${userId}`);
      return Promise.resolve();
    }
    // Updated to use the new endpoint path structure
    return ApiService.delete(
      `${this.BASE_PATH}/unfollow?targetUserId=${userId}`
    );
  }

  /**
   * Update user preferences
   * @param {Object} preferences - The preferences to update
   * @returns {Promise<void>} A promise that resolves when the preferences are updated
   */
  static async updatePreferences(preferences) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updatePreferences', preferences);
      return Promise.resolve();
    }
    return ApiService.put(`${this.BASE_PATH}/current/preferences`, preferences);
  }

  /**
   * Search for users
   * @param {string} query - The search query
   * @returns {Promise<Array>} A promise that resolves to the search results
   */
  static async searchUsers(query) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for searchUsers: ${query}`);
      // Return a filtered subset of mock users based on the query
      const mockUsers = [
        MockDataService.getCurrentUser(),
        MockDataService.getUserById('user-1'),
        ...MockDataService.getUserFollowers().slice(0, 3),
      ];
      return mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
    }
    const searchParams = new URLSearchParams({ query });
    return ApiService.get(
      `${this.BASE_PATH}/search?${searchParams.toString()}`
    );
  }

  /**
   * Get user preferences
   * @returns {Promise<Object>} A promise that resolves to the user preferences
   */
  static async getUserPreferences() {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getUserPreferences');
      return {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: true,
        },
      };
    }
    return ApiService.get(`${this.BASE_PATH}/current/preferences`);
  }

  /**
   * Update user preferences
   * @param {Object} preferences - The preferences to update
   * @returns {Promise<Object>} A promise that resolves to the updated preferences
   */
  static async updateUserPreferences(preferences) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updateUserPreferences', preferences);
      const currentPrefs = await this.getUserPreferences();
      return { ...currentPrefs, ...preferences };
    }
    return ApiService.put(
      `${this.BASE_PATH}/current/preferences`,
      preferences
    );
  }

  /**
   * Get a user's posts
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} A promise that resolves to the user's posts
   */
  static async getUserPosts(userId) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserPosts: ${userId}`);
      return MockDataService.getUserPosts();
    }
    return ApiService.get(`${this.BASE_PATH}/${userId}/posts`);
  }

  /**
   * Get a user's reviews
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} A promise that resolves to the user's reviews
   */
  static async getUserReviews(userId) {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserReviews: ${userId}`);
      return MockDataService.getUserReviews();
    }
    // Updated to use the new endpoint path structure
    return ApiService.get(
      `${this.BASE_PATH}/by-user/reviews?userId=${userId}`
    );
  }
}
