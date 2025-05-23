/**
 * User Profile Router
 * 
 * This file defines the tRPC router for user profile operations.
 * It exposes endpoints for getting and updating user profiles,
 * as well as managing follower relationships.
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
} from './index.js';

export const userProfileRouter = router({
  // Get current user profile
  getCurrentProfile: protectedProcedure.query(async ({ ctx }) => {
    return getUserProfile(ctx.user.id);
  }),

  // Update current user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        avatarUrl: z.string().optional(),
        countryCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return updateUserProfile(ctx.user.id, input);
    }),

  // Get current user's followers
  getFollowers: protectedProcedure.query(async ({ ctx }) => {
    return getUserFollowers(ctx.user.id);
  }),

  // Get users the current user is following
  getFollowing: protectedProcedure.query(async ({ ctx }) => {
    return getUserFollowing(ctx.user.id);
  }),

  // Follow a user
  followUser: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return followUser(ctx.user.id, input.targetUserId);
    }),

  // Unfollow a user
  unfollowUser: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return unfollowUser(ctx.user.id, input.targetUserId);
    }),
});
