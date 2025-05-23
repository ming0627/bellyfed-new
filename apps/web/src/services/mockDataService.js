/**
 * Mock data service for development
 * This service provides realistic mock data for UI development
 */

import { Interest } from '../types/user.js';

export class MockDataService {
  /**
   * Get mock user data
   */
  static getCurrentUser() {
    return {
      id: 'user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: {
        bucket: 'bellyfed-avatars',
        region: 'ap-southeast-1',
        key: '/bellyfed.png',
      },
      bio: 'Food enthusiast and culinary explorer. I love discovering new restaurants and sharing my experiences with others.',
      location: 'Kuala Lumpur, Malaysia',
      interests: [Interest.HALAL, Interest.ORGANIC, Interest.SUSTAINABLE],
      createdAt: '2023-01-15T08:30:00Z',
      updatedAt: '2024-03-20T14:45:00Z',
      points: 1250,
      achievements: this.getMockAchievements(),
      stats: {
        reviews: 42,
        followers: 128,
        following: 75,
        cities: 5,
      },
    };
  }

  /**
   * Get mock user by ID
   */
  static getUserById(userId) {
    // For demo purposes, return the same user regardless of ID
    return {
      id: userId,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: {
        bucket: 'bellyfed-avatars',
        region: 'ap-southeast-1',
        key: '/bellyfed.png',
      },
      bio: 'Passionate foodie with a love for Asian cuisine. Always on the hunt for the best local eats!',
      location: 'Singapore',
      interests: [Interest.VEGAN, Interest.GLUTEN_FREE],
      createdAt: '2023-02-10T10:15:00Z',
      updatedAt: '2024-03-18T09:30:00Z',
      points: 980,
      achievements: this.getMockAchievements().slice(0, 3),
      stats: {
        reviews: 36,
        followers: 95,
        following: 62,
        cities: 3,
      },
    };
  }

  /**
   * Get mock user followers
   */
  static getUserFollowers() {
    return Array(8)
      .fill(null)
      .map((_, index) => ({
        id: `follower-${index + 1}`,
        name: `Follower ${index + 1}`,
        email: `follower${index + 1}@example.com`,
        avatar: {
          bucket: 'bellyfed-avatars',
          region: 'ap-southeast-1',
          key: '/bellyfed.png',
        },
        location: index % 2 === 0 ? 'Kuala Lumpur, Malaysia' : 'Singapore',
        createdAt: '2023-03-15T08:30:00Z',
        updatedAt: '2024-02-20T14:45:00Z',
      }));
  }

  /**
   * Get mock user following
   */
  static getUserFollowing() {
    return Array(6)
      .fill(null)
      .map((_, index) => ({
        id: `following-${index + 1}`,
        name: `Following ${index + 1}`,
        email: `following${index + 1}@example.com`,
        avatar: {
          bucket: 'bellyfed-avatars',
          region: 'ap-southeast-1',
          key: '/bellyfed.png',
        },
        location: index % 2 === 0 ? 'Singapore' : 'Penang, Malaysia',
        createdAt: '2023-04-10T09:20:00Z',
        updatedAt: '2024-01-15T11:30:00Z',
      }));
  }

  /**
   * Get mock user posts
   */
  static getUserPosts() {
    return Array(12)
      .fill(null)
      .map((_, index) => ({
        id: `post-${index + 1}`,
        content: `This is a sample post #${index + 1} about a delicious meal I had today! The flavors were amazing and the presentation was beautiful.`,
        photos:
          index % 2 === 0
            ? [
                {
                  bucket: 'bellyfed-photos',
                  region: 'ap-southeast-1',
                  key: '/food-sample.jpg',
                },
              ]
            : undefined,
        hashtags: ['foodie', 'delicious', 'bellyfed'],
        location: index % 3 === 0 ? 'Kuala Lumpur, Malaysia' : 'Singapore',
        userId: 'user-123',
        createdAt: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
        updatedAt: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
        likeCount: Math.floor(Math.random() * 50),
        postedBy: 'USER',
      }));
  }

  /**
   * Get mock user reviews
   */
  static getUserReviews() {
    return Array(15)
      .fill(null)
      .map((_, index) => ({
        id: `review-${index + 1}`,
        content: `This is my review #${index + 1} for this restaurant. The food was ${index % 2 === 0 ? 'amazing' : 'good'} and the service was ${index % 3 === 0 ? 'excellent' : 'satisfactory'}.`,
        rating: (index % 5) + 1,
        photos:
          index % 2 === 0 ? [`/food-sample-${(index % 3) + 1}.jpg`] : [],
        establishmentId: `restaurant-${(index % 10) + 1}`,
        dishName: `Dish ${(index % 10) + 1}`,
        createdAt: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
        updatedAt: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
      }));
  }

  /**
   * Get mock achievements
   */
  static getMockAchievements() {
    return [
      {
        id: 'achievement-1',
        name: 'First Review',
        points: 10,
        dateEarned: '2023-02-15T10:30:00Z',
        category: 'Beginner',
        createdAt: '2023-02-15T10:30:00Z',
        updatedAt: '2023-02-15T10:30:00Z',
      },
      {
        id: 'achievement-2',
        name: 'Food Explorer',
        points: 50,
        dateEarned: '2023-04-20T14:15:00Z',
        category: 'Explorer',
        createdAt: '2023-04-20T14:15:00Z',
        updatedAt: '2023-04-20T14:15:00Z',
      },
      {
        id: 'achievement-3',
        name: 'Popular Reviewer',
        points: 100,
        dateEarned: '2023-07-10T09:45:00Z',
        category: 'Social',
        createdAt: '2023-07-10T09:45:00Z',
        updatedAt: '2023-07-10T09:45:00Z',
      },
      {
        id: 'achievement-4',
        name: 'Cuisine Expert',
        description: 'Reviewed 20 different dishes',
        points: 75,
        dateEarned: '2023-09-05T16:20:00Z',
        category: 'Expert',
        createdAt: '2023-09-05T16:20:00Z',
        updatedAt: '2023-09-05T16:20:00Z',
      },
      {
        id: 'achievement-5',
        name: 'Photo Enthusiast',
        description: 'Added photos to 15 reviews',
        points: 60,
        dateEarned: '2023-11-12T11:10:00Z',
        category: 'Content Creator',
        createdAt: '2023-11-12T11:10:00Z',
        updatedAt: '2023-11-12T11:10:00Z',
      },
    ];
  }
}
