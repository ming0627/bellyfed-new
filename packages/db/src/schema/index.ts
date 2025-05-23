/**
 * Database Schema
 *
 * This file exports database schema definitions and utilities
 * for working with the database.
 */

import { prisma } from '../index.js';
import { type Prisma } from '@prisma/client';
import { analyticsDb } from './analytics.js';
import { analyticsServiceDb } from './analytics-service.js';

// User schema types
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type UserOrderByWithRelationInput = Prisma.UserOrderByWithRelationInput;

// User follower schema types
export type UserFollowerCreateInput = Prisma.UserFollowerCreateInput;
export type UserFollowerWhereUniqueInput = Prisma.UserFollowerWhereUniqueInput;
export type UserFollowerWhereInput = Prisma.UserFollowerWhereInput;

// Dish ranking schema types
export type DishRankingCreateInput = Prisma.DishRankingCreateInput;
export type DishRankingUpdateInput = Prisma.DishRankingUpdateInput;
export type DishRankingWhereUniqueInput = Prisma.DishRankingWhereUniqueInput;
export type DishRankingWhereInput = Prisma.DishRankingWhereInput;

// Analytics event schema types
export type AnalyticsEventCreateInput = Prisma.AnalyticsEventCreateInput;
export type AnalyticsEventWhereInput = Prisma.AnalyticsEventWhereInput;
export type AnalyticsEventOrderByWithRelationInput = Prisma.AnalyticsEventOrderByWithRelationInput;

// Analytics view schema types
export type AnalyticsViewCreateInput = Prisma.AnalyticsViewCreateInput;
export type AnalyticsViewUpdateInput = Prisma.AnalyticsViewUpdateInput;
export type AnalyticsViewWhereUniqueInput = Prisma.AnalyticsViewWhereUniqueInput;
export type AnalyticsViewWhereInput = Prisma.AnalyticsViewWhereInput;

// Analytics viewer schema types
export type AnalyticsViewerCreateInput = Prisma.AnalyticsViewerCreateInput;
export type AnalyticsViewerWhereUniqueInput = Prisma.AnalyticsViewerWhereUniqueInput;
export type AnalyticsViewerWhereInput = Prisma.AnalyticsViewerWhereInput;

// Analytics engagement schema types
export type AnalyticsEngagementCreateInput = Prisma.AnalyticsEngagementCreateInput;
export type AnalyticsEngagementWhereInput = Prisma.AnalyticsEngagementWhereInput;

// Analytics engagement count schema types
export type AnalyticsEngagementCountCreateInput = Prisma.AnalyticsEngagementCountCreateInput;
export type AnalyticsEngagementCountUpdateInput = Prisma.AnalyticsEngagementCountUpdateInput;
export type AnalyticsEngagementCountWhereUniqueInput = Prisma.AnalyticsEngagementCountWhereUniqueInput;
export type AnalyticsEngagementCountWhereInput = Prisma.AnalyticsEngagementCountWhereInput;

// Analytics cache schema types
export type AnalyticsCacheCreateInput = Prisma.AnalyticsCacheCreateInput;
export type AnalyticsCacheUpdateInput = Prisma.AnalyticsCacheUpdateInput;
export type AnalyticsCacheWhereUniqueInput = Prisma.AnalyticsCacheWhereUniqueInput;

// Database operations
export const db = {
  // User operations
  user: {
    create: (data: UserCreateInput) => prisma.user.create({ data }),
    update: (id: string, data: UserUpdateInput) =>
      prisma.user.update({ where: { id }, data }),
    delete: (id: string) => prisma.user.delete({ where: { id } }),
    findUnique: (where: UserWhereUniqueInput) =>
      prisma.user.findUnique({ where }),
    findMany: (params: {
      where?: UserWhereInput;
      orderBy?: UserOrderByWithRelationInput;
      skip?: number;
      take?: number;
    }) => prisma.user.findMany(params),
  },

  // User follower operations
  userFollower: {
    create: (data: UserFollowerCreateInput) =>
      prisma.userFollower.create({ data }),
    delete: (followerId: string, followedId: string) =>
      prisma.userFollower.delete({
        where: { followerId_followedId: { followerId, followedId } }
      }),
    findUnique: (followerId: string, followedId: string) =>
      prisma.userFollower.findUnique({
        where: { followerId_followedId: { followerId, followedId } }
      }),
    findMany: (where: UserFollowerWhereInput) =>
      prisma.userFollower.findMany({ where }),
  },

  // Dish ranking operations
  dishRanking: {
    create: (data: DishRankingCreateInput) =>
      prisma.dishRanking.create({ data }),
    update: (userId: string, dishId: string, data: DishRankingUpdateInput) =>
      prisma.dishRanking.update({
        where: { userId_dishId: { userId, dishId } },
        data
      }),
    delete: (userId: string, dishId: string) =>
      prisma.dishRanking.delete({
        where: { userId_dishId: { userId, dishId } }
      }),
    findUnique: (userId: string, dishId: string) =>
      prisma.dishRanking.findUnique({
        where: { userId_dishId: { userId, dishId } }
      }),
    findMany: (where: DishRankingWhereInput) =>
      prisma.dishRanking.findMany({ where }),
  },

  // Analytics operations
  analytics: analyticsDb,

  // Analytics service operations
  analyticsService: analyticsServiceDb,
};
