/**
 * User Service
 * Handles operations related to user management
 */

import { User } from '@bellyfed/types/user.js';
import { Post as SocialPost, PostedBy } from './socialMediaService.js';
import { Review } from '@bellyfed/types/review.js';
import { ApiService } from './api.js';
import { mockDataService } from './mockDataService.js';

/**
 * User Preferences interface
 * Represents user preferences
 */
export interface UserPreferences {
  theme?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showLocation?: boolean;
  };
  [key: string]: unknown;
}

/**
 * User Service class
 * Provides methods for managing users
 */
export class UserService {
  private readonly BASE_PATH = '/api/users';
  private readonly IS_DEV = process.env.NODE_ENV === 'development';
  private readonly USE_MOCK_DATA = true; // Toggle this to use mock data in development

  /**
   * Get current user
   * @returns The current user
   */
  async getCurrentUser(): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUser');
      return mockDataService.getCurrentUser();
    }
    return ApiService.get<User>(`${this.BASE_PATH}/current`);
  }

  /**
   * Get user by ID
   * @param userId The user ID
   * @returns The user
   */
  async getUserById(userId: string): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserById: ${userId}`);
      return mockDataService.getUserById(userId);
    }
    return ApiService.get<User>(`${this.BASE_PATH}/${userId}`);
  }

  /**
   * Update user
   * @param userId The user ID
   * @param userData The user data to update
   * @returns The updated user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for updateUser: ${userId}`, userData);
      // Return the mock user with updated fields
      const user = mockDataService.getUserById(userId);
      return { ...user, ...userData, updatedAt: new Date().toISOString() };
    }
    return ApiService.put<User>(`${this.BASE_PATH}/${userId}`, userData);
  }

  /**
   * Update current user
   * @param userData The user data to update
   * @returns The updated user
   */
  async updateCurrentUser(userData: Partial<User>): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updateCurrentUser', userData);
      // Return the mock current user with updated fields
      const user = mockDataService.getCurrentUser();
      return { ...user, ...userData, updatedAt: new Date().toISOString() };
    }
    return ApiService.put<User>(`${this.BASE_PATH}/current`, userData);
  }

  /**
   * Get user followers
   * @param userId The user ID
   * @returns The user's followers
   */
  async getUserFollowers(userId: string): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserFollowers: ${userId}`);
      return mockDataService.getUserFollowers();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/${userId}/followers`);
  }

  /**
   * Get user following
   * @param userId The user ID
   * @returns The users the user is following
   */
  async getUserFollowing(userId: string): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserFollowing: ${userId}`);
      return mockDataService.getUserFollowing();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/${userId}/following`);
  }

  /**
   * Get current user followers
   * @returns The current user's followers
   */
  async getCurrentUserFollowers(): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserFollowers');
      return mockDataService.getUserFollowers();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/current/followers`);
  }

  /**
   * Get current user following
   * @returns The users the current user is following
   */
  async getCurrentUserFollowing(): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserFollowing');
      return mockDataService.getUserFollowing();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/current/following`);
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
   * Update user preferences
   * @param preferences The user preferences to update
   */
  async updatePreferences(preferences: UserPreferences): Promise<void> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updatePreferences', preferences);
      return Promise.resolve();
    }
    return ApiService.put(`${this.BASE_PATH}/current/preferences`, preferences);
  }

  /**
   * Search users
   * @param query The search query
   * @returns The matching users
   */
  async searchUsers(query: string): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for searchUsers: ${query}`);
      // Return a filtered subset of mock users based on the query
      const mockUsers = [
        mockDataService.getCurrentUser(),
        mockDataService.getUserById('user-1'),
        ...mockDataService.getUserFollowers().slice(0, 3),
      ];
      return mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()),
      );
    }
    const searchParams = new URLSearchParams({ query });
    return ApiService.get<User[]>(
      `${this.BASE_PATH}/search?${searchParams.toString()}`,
    );
  }

  /**
   * Get user preferences
   * @returns The user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
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
    return ApiService.get<UserPreferences>(
      `${this.BASE_PATH}/current/preferences`,
    );
  }

  /**
   * Update user preferences
   * @param preferences The user preferences to update
   * @returns The updated user preferences
   */
  async updateUserPreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updateUserPreferences', preferences);
      const currentPrefs = await this.getUserPreferences();
      return { ...currentPrefs, ...preferences };
    }
    return ApiService.put<UserPreferences>(
      `${this.BASE_PATH}/current/preferences`,
      preferences,
    );
  }

  /**
   * Get user posts
   * @param userId The user ID
   * @returns The user's posts
   */
  async getUserPosts(userId: string): Promise<any[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserPosts: ${userId}`);
      return mockDataService.getUserPosts();
    }
    return ApiService.get<any[]>(`${this.BASE_PATH}/${userId}/posts`);
  }

  /**
   * Get user reviews
   * @param userId The user ID
   * @returns The user's reviews
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserReviews: ${userId}`);
      return mockDataService.getUserReviews();
    }
    // Updated to use the new endpoint path structure
    return ApiService.get<Review[]>(
      `${this.BASE_PATH}/by-user/reviews?userId=${userId}`,
    );
  }
}

// Export a singleton instance
export const userService = new UserService();
