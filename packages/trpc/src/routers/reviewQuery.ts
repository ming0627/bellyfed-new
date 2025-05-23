/**
 * Review Query Router
 * 
 * This file defines the tRPC router for review query operations.
 * It's a wrapper around the backend review query service.
 */

import { z } from 'zod';
import { router } from '../trpc.js';
import { privateProcedure, publicProcedure } from '../procedures/index.js';

export const reviewQueryRouter = router({
  // Get review by ID
  getReviewById: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      })
    )
    .query(async () => {
      // This will be implemented in the backend service
      return {
        id: '',
        reviewId: '',
        restaurantId: '',
        userId: '',
        rating: 0,
        text: '',
        visitStatus: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '',
          name: '',
          profileImageUrl: '',
        },
        restaurant: {
          id: '',
          name: '',
          address: '',
        },
      };
    }),

  // Get reviews for a restaurant
  getReviewsByRestaurantId: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async () => {
      // This will be implemented in the backend service
      return {
        reviews: [],
        totalCount: 0,
      };
    }),

  // Get reviews by a user
  getReviewsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async () => {
      // This will be implemented in the backend service
      return {
        reviews: [],
        totalCount: 0,
      };
    }),

  // Get recent reviews
  getRecentReviews: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async () => {
      // This will be implemented in the backend service
      return {
        reviews: [],
        totalCount: 0,
      };
    }),

  // Get top-rated reviews
  getTopRatedReviews: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async () => {
      // This will be implemented in the backend service
      return {
        reviews: [],
        totalCount: 0,
      };
    }),

  // Get reviews by rating
  getReviewsByRating: publicProcedure
    .input(
      z.object({
        rating: z.number().min(1).max(5),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async () => {
      // This will be implemented in the backend service
      return {
        reviews: [],
        totalCount: 0,
      };
    }),
});
