/**
 * Mock Data Service
 * Provides mock data for development and testing
 */

import { Review, VisitStatus } from '@bellyfed/types/review.js';
import { Restaurant } from '@bellyfed/types/restaurant.js';
import { User } from '@bellyfed/types/user.js';

/**
 * Interest enum
 * Defines user interests
 */
export enum Interest {
  HALAL = 'HALAL',
  ORGANIC = 'ORGANIC',
  SUSTAINABLE = 'SUSTAINABLE',
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
}

/**
 * Achievement interface
 * Represents a user achievement
 */
export interface Achievement {
  id: string;
  name: string;
  description?: string;
  points: number;
  dateEarned: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Post interface
 * Represents a social media post
 */
export interface Post {
  id: string;
  content: string;
  photos?: {
    bucket: string;
    region: string;
    key: string;
  }[];
  hashtags: string[];
  location?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  postedBy: 'USER' | 'SYSTEM';
}

/**
 * Mock Data Service class
 * Provides methods for generating mock data
 */
export class MockDataService {
  /**
   * Get mock current user
   * @returns The mock current user
   */
  static getCurrentUser(): User {
    return {
      id: 'user-123',
      username: 'johndoe',
      email: 'john.doe@example.com',
      name: 'John Doe',
      avatar: '/images/avatars/default.png',
      bio: 'Food enthusiast and culinary explorer. I love discovering new restaurants and sharing my experiences with others.',
      location: 'Kuala Lumpur, Malaysia',
      interests: [Interest.HALAL, Interest.ORGANIC, Interest.SUSTAINABLE],
      createdAt: '2023-01-15T08:30:00Z',
      updatedAt: '2024-03-20T14:45:00Z',
      points: 1250,
      achievements: this.getMockAchievements() as unknown as Record<string, unknown>[],
      stats: {
        reviews: 42,
        followers: 128,
        following: 75,
        cities: 5,
      },
    } as User;
  }

  /**
   * Get mock user by ID
   * @param userId The user ID
   * @returns The mock user
   */
  static getUserById(userId: string): User {
    // For demo purposes, return the same user regardless of ID
    return {
      id: userId,
      username: 'janesmith',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      avatar: '/images/avatars/default-female.png',
      bio: 'Passionate foodie with a love for Asian cuisine. Always on the hunt for the best local eats!',
      location: 'Singapore',
      interests: [Interest.VEGAN, Interest.GLUTEN_FREE],
      createdAt: '2023-02-10T10:15:00Z',
      updatedAt: '2024-03-18T09:30:00Z',
      points: 980,
      achievements: this.getMockAchievements().slice(0, 3) as unknown as Record<string, unknown>[],
      stats: {
        reviews: 36,
        followers: 95,
        following: 62,
        cities: 3,
      },
    } as User;
  }

  /**
   * Get mock user followers
   * @returns The mock user followers
   */
  static getUserFollowers(): User[] {
    return Array(8)
      .fill(null)
      .map(
        (_, index) =>
          ({
            id: `follower-${index + 1}`,
            username: `follower${index + 1}`,
            name: `Follower ${index + 1}`,
            email: `follower${index + 1}@example.com`,
            avatar: '/images/avatars/default.png',
            location: index % 2 === 0 ? 'Kuala Lumpur, Malaysia' : 'Singapore',
            createdAt: '2023-03-15T08:30:00Z',
            updatedAt: '2024-02-20T14:45:00Z',
          }) as User,
      );
  }

  /**
   * Get mock user following
   * @returns The mock user following
   */
  static getUserFollowing(): User[] {
    return Array(6)
      .fill(null)
      .map(
        (_, index) =>
          ({
            id: `following-${index + 1}`,
            username: `following${index + 1}`,
            name: `Following ${index + 1}`,
            email: `following${index + 1}@example.com`,
            avatar: '/images/avatars/default.png',
            location: index % 2 === 0 ? 'Singapore' : 'Penang, Malaysia',
            createdAt: '2023-04-10T09:20:00Z',
            updatedAt: '2024-01-15T11:30:00Z',
          }) as User,
      );
  }

  /**
   * Get mock user posts
   * @returns The mock user posts
   */
  static getUserPosts(): Post[] {
    return Array(12)
      .fill(null)
      .map(
        (_, index) =>
          ({
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
          }) as Post,
      );
  }

  /**
   * Get mock user reviews
   * @returns The mock user reviews
   */
  static getUserReviews(): Review[] {
    return Array(15)
      .fill(null)
      .map(
        (_, index) =>
          ({
            id: `review-${index + 1}`,
            authorId: 'user-123',
            authorName: 'John Doe',
            restaurantId: `restaurant-${(index % 10) + 1}`,
            restaurantName: `Restaurant ${(index % 10) + 1}`,
            dishId: `dish-${(index % 10) + 1}`,
            dishName: `Dish ${(index % 10) + 1}`,
            comment: `This is my review #${index + 1} for this restaurant. The food was ${index % 2 === 0 ? 'amazing' : 'good'} and the service was ${index % 3 === 0 ? 'excellent' : 'satisfactory'}.`,
            notes: `Additional notes for review #${index + 1}.`,
            visitStatus: index % 3 === 0 ? VisitStatus.ACCEPTABLE :
                         index % 3 === 1 ? VisitStatus.NEEDS_IMPROVEMENT :
                         VisitStatus.DISAPPOINTING,
            photos: index % 2 === 0 ? [`/food-sample-${(index % 3) + 1}.jpg`] : [],
            rank: index % 6 === 0 ? 1 :
                  index % 6 === 1 ? 2 :
                  index % 6 === 2 ? 3 :
                  index % 6 === 3 ? 4 :
                  index % 6 === 4 ? 5 : undefined,
            visitDate: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
            createdAt: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
            updatedAt: `2024-0${(index % 3) + 1}-${(index % 28) + 1}T${index % 24}:${index % 60}:00Z`,
            likes: Math.floor(Math.random() * 20),
            isLiked: index % 3 === 0,
          }) as Review,
      );
  }

  /**
   * Get mock restaurants
   * @returns The mock restaurants
   */
  static getRestaurants(): Restaurant[] {
    return Array(10)
      .fill(null)
      .map(
        (_, index) => {
          const restaurant: Restaurant = {
            restaurantId: `restaurant-${index + 1}`,
            name: `Restaurant ${index + 1}`,
            address: `${index + 1} Main Street, City`,
            phone: `+1-555-${index + 100}-${index + 1000}`,
            website: `https://restaurant${index + 1}.example.com`,
            rating: 3.5 + (index % 2),
            priceLevel: (index % 4) + 1,
            latitude: 3.1390 + index * 0.01,
            longitude: 101.6869 + index * 0.01,
            countryCode: 'MY',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            googlePlaceId: `place-${index + 1}`,
            photos: [
              {
                photoId: `photo-${index + 1}`,
                restaurantId: `restaurant-${index + 1}`,
                photoUrl: `/restaurant-${index + 1}.jpg`,
                width: 800,
                height: 600,
                createdAt: new Date().toISOString(),
              },
            ],
            hours: [
              {
                hourId: `hour-${index}-0`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 0, // Sunday
                openTime: '10:00:00',
                closeTime: '21:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                hourId: `hour-${index}-1`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 1, // Monday
                openTime: '09:00:00',
                closeTime: '22:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                hourId: `hour-${index}-2`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 2, // Tuesday
                openTime: '09:00:00',
                closeTime: '22:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                hourId: `hour-${index}-3`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 3, // Wednesday
                openTime: '09:00:00',
                closeTime: '22:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                hourId: `hour-${index}-4`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 4, // Thursday
                openTime: '09:00:00',
                closeTime: '22:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                hourId: `hour-${index}-5`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 5, // Friday
                openTime: '09:00:00',
                closeTime: '23:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                hourId: `hour-${index}-6`,
                restaurantId: `restaurant-${index + 1}`,
                dayOfWeek: 6, // Saturday
                openTime: '10:00:00',
                closeTime: '23:00:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };
          return restaurant;
        }
      );
  }

  /**
   * Get mock achievements
   * @returns The mock achievements
   * @private
   */
  private static getMockAchievements(): Achievement[] {
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

// Export a singleton instance
export const mockDataService = MockDataService;
