/**
 * Database Schema Definitions
 * 
 * This file contains the database schema definitions migrated from
 * the original Lambda function.
 */

import { Prisma } from '@prisma/client';

// User schema
export const userSchema = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    bio: true,
    location: true,
    countryCode: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        dishRankings: true,
        followers: true,
        following: true,
      },
    },
  },
});

export type UserWithStats = Prisma.UserGetPayload<typeof userSchema> & {
  stats: {
    totalRankings: number;
    followers: number;
    following: number;
  };
};

// User follower schema
export const userFollowerSchema = Prisma.validator<Prisma.UserFollowerDefaultArgs>()({
  select: {
    id: true,
    followerId: true,
    followedId: true,
    createdAt: true,
    follower: {
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        countryCode: true,
        avatarUrl: true,
      },
    },
    followed: {
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        countryCode: true,
        avatarUrl: true,
      },
    },
  },
});

export type UserFollowerWithUsers = Prisma.UserFollowerGetPayload<typeof userFollowerSchema>;

// Dish ranking schema
export const dishRankingSchema = Prisma.validator<Prisma.DishRankingDefaultArgs>()({
  select: {
    id: true,
    userId: true,
    dishId: true,
    rating: true,
    review: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
  },
});

export type DishRankingWithUser = Prisma.DishRankingGetPayload<typeof dishRankingSchema>;

// SQL queries for database initialization
export const initializationQueries = [
  // Create users table
  `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    country_code VARCHAR(10),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  `,
  
  // Create user_followers table
  `
  CREATE TABLE IF NOT EXISTS user_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, followed_id)
  );
  CREATE INDEX IF NOT EXISTS user_followers_follower_id_idx ON user_followers(follower_id);
  CREATE INDEX IF NOT EXISTS user_followers_followed_id_idx ON user_followers(followed_id);
  `,
  
  // Create dish_rankings table
  `
  CREATE TABLE IF NOT EXISTS dish_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dish_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, dish_id)
  );
  CREATE INDEX IF NOT EXISTS dish_rankings_user_id_idx ON dish_rankings(user_id);
  CREATE INDEX IF NOT EXISTS dish_rankings_dish_id_idx ON dish_rankings(dish_id);
  `,
];
