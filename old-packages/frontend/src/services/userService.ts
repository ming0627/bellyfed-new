import { Post, Review, User } from '../types';
import { ApiService } from './api';
import { MockDataService } from './mockDataService';

interface UserPreferences {
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

export class UserService {
  private static readonly BASE_PATH = '/users';
  private static readonly IS_DEV = process.env.NODE_ENV === 'development';
  private static readonly USE_MOCK_DATA = true; // Toggle this to use mock data in development

  static async getCurrentUser(): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUser');
      return MockDataService.getCurrentUser();
    }
    return ApiService.get<User>(`${this.BASE_PATH}/current`);
  }

  static async getUserById(userId: string): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserById: ${userId}`);
      return MockDataService.getUserById('user-123');
    }
    return ApiService.get<User>(`${this.BASE_PATH}/${userId}`);
  }

  static async updateUser(
    userId: string,
    userData: Partial<User>,
  ): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for updateUser: ${userId}`, userData);
      // Return the mock user with updated fields
      const user = MockDataService.getUserById('user-123');
      return { ...user, ...userData, updatedAt: new Date().toISOString() };
    }
    return ApiService.put<User>(`${this.BASE_PATH}/${userId}`, userData);
  }

  static async updateCurrentUser(userData: Partial<User>): Promise<User> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updateCurrentUser', userData);
      // Return the mock current user with updated fields
      const user = MockDataService.getCurrentUser();
      return { ...user, ...userData, updatedAt: new Date().toISOString() };
    }
    return ApiService.put<User>(`${this.BASE_PATH}/current`, userData);
  }

  static async getUserFollowers(userId: string): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserFollowers: ${userId}`);
      return MockDataService.getUserFollowers();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/${userId}/followers`);
  }

  static async getUserFollowing(userId: string): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserFollowing: ${userId}`);
      return MockDataService.getUserFollowing();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/${userId}/following`);
  }

  static async getCurrentUserFollowers(): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserFollowers');
      return MockDataService.getUserFollowers();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/current/followers`);
  }

  static async getCurrentUserFollowing(): Promise<User[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for getCurrentUserFollowing');
      return MockDataService.getUserFollowing();
    }
    return ApiService.get<User[]>(`${this.BASE_PATH}/current/following`);
  }

  static async followUser(userId: string): Promise<void> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for followUser: ${userId}`);
      return Promise.resolve();
    }
    // Updated to use the new endpoint path structure
    return ApiService.post(`${this.BASE_PATH}/follow`, {
      targetUserId: 'user-123',
    });
  }

  static async unfollowUser(userId: string): Promise<void> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for unfollowUser: ${userId}`);
      return Promise.resolve();
    }
    // Updated to use the new endpoint path structure
    return ApiService.delete(
      `${this.BASE_PATH}/unfollow?targetUserId=${userId}`,
    );
  }

  static async updatePreferences(preferences: UserPreferences): Promise<void> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log('Using mock data for updatePreferences', preferences);
      return Promise.resolve();
    }
    return ApiService.put(`${this.BASE_PATH}/current/preferences`, preferences);
  }

  static async searchUsers(query: string): Promise<User[]> {
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
          user.email.toLowerCase().includes(query.toLowerCase()),
      );
    }
    const searchParams = new URLSearchParams({ query });
    return ApiService.get<User[]>(
      `${this.BASE_PATH}/search?${searchParams.toString()}`,
    );
  }

  static async getUserPreferences(): Promise<UserPreferences> {
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

  static async updateUserPreferences(
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

  static async getUserPosts(userId: string): Promise<Post[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserPosts: ${userId}`);
      return MockDataService.getUserPosts();
    }
    return ApiService.get<Post[]>(`${this.BASE_PATH}/${userId}/posts`);
  }

  static async getUserReviews(userId: string): Promise<Review[]> {
    if (this.IS_DEV && this.USE_MOCK_DATA) {
      console.log(`Using mock data for getUserReviews: ${userId}`);
      return MockDataService.getUserReviews();
    }
    // Updated to use the new endpoint path structure
    return ApiService.get<Review[]>(
      `${this.BASE_PATH}/by-user/reviews?userId=${userId}`,
    );
  }
}
