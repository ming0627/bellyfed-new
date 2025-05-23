/**
 * Review Query Router
 * 
 * This file defines the tRPC router for review query operations.
 * It exposes endpoints for querying review data.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  getReviewById,
  getReviewsByRestaurantId,
  getReviewsByUserId,
} from './index.js';

export const reviewQueryRouter = router({
  // Get review by ID
  getReviewById: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getReviewById(input.reviewId);
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
    .query(async ({ input }) => {
      return getReviewsByRestaurantId({
        restaurantId: input.restaurantId,
        limit: input.limit,
        offset: input.offset,
      });
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
    .query(async ({ input }) => {
      return getReviewsByUserId({
        userId: input.userId,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  // Get recent reviews
  getRecentReviews: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit = 10, offset = 0 } = input;
      
      // Get recent reviews
      const reviews = await ctx.prisma.review.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });
      
      // Get total count
      const totalCount = await ctx.prisma.review.count();
      
      return {
        reviews,
        totalCount,
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
    .query(async ({ input, ctx }) => {
      const { limit = 10, offset = 0 } = input;
      
      // Get top-rated reviews
      const reviews = await ctx.prisma.review.findMany({
        where: {
          rating: {
            gte: 4.0,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          rating: 'desc',
        },
        take: limit,
        skip: offset,
      });
      
      // Get total count
      const totalCount = await ctx.prisma.review.count({
        where: {
          rating: {
            gte: 4.0,
          },
        },
      });
      
      return {
        reviews,
        totalCount,
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
    .query(async ({ input, ctx }) => {
      const { rating, limit = 10, offset = 0 } = input;
      
      // Get reviews by rating
      const reviews = await ctx.prisma.review.findMany({
        where: {
          rating: {
            gte: rating,
            lt: rating + 1,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });
      
      // Get total count
      const totalCount = await ctx.prisma.review.count({
        where: {
          rating: {
            gte: rating,
            lt: rating + 1,
          },
        },
      });
      
      return {
        reviews,
        totalCount,
      };
    }),
});
