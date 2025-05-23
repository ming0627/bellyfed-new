/**
 * Review Processor Router
 * 
 * This file defines the tRPC router for review processor operations.
 * It exposes endpoints for creating and updating reviews.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  createReview,
  updateReview,
  processBatch,
  type ReviewEvent,
  type SQSEvent,
  type ProcessedRecord,
} from './index.js';

// Define Zod schema for review event
const reviewEventSchema = z.object({
  reviewId: z.string(),
  restaurantId: z.string(),
  userId: z.string(),
  rating: z.number().min(0).max(5),
  text: z.string().optional(),
  visitStatus: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  updatedBy: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Define Zod schema for SQS message attributes
const sqsMessageAttributesSchema = z.record(z.object({
  dataType: z.string(),
  stringValue: z.string().optional(),
  binaryValue: z.string().optional(),
}));

// Define Zod schema for SQS record
const sqsRecordSchema = z.object({
  messageId: z.string(),
  receiptHandle: z.string(),
  body: z.string(),
  attributes: z.record(z.string()),
  messageAttributes: sqsMessageAttributesSchema,
  md5OfBody: z.string(),
  eventSource: z.string(),
  eventSourceARN: z.string(),
  awsRegion: z.string(),
});

// Define Zod schema for SQS event
const sqsEventSchema = z.object({
  Records: z.array(sqsRecordSchema),
});

export const reviewProcessorRouter = router({
  // Create a new review
  createReview: protectedProcedure
    .input(reviewEventSchema)
    .mutation(async ({ input }) => {
      return createReview(input as ReviewEvent);
    }),

  // Update an existing review
  updateReview: protectedProcedure
    .input(reviewEventSchema)
    .mutation(async ({ input }) => {
      return updateReview(input as ReviewEvent);
    }),

  // Process a batch of review events
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      return processBatch(input as SQSEvent);
    }),

  // Get review processing status
  getProcessingStatus: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { reviewId } = input;
      
      // Get the latest event for this review
      const latestEvent = await ctx.prisma.analyticsEvent.findFirst({
        where: {
          type: 'review_processor',
          properties: {
            path: ['reviewId'],
            equals: reviewId,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      
      if (!latestEvent) {
        return {
          reviewId,
          status: 'UNKNOWN',
          lastUpdated: null,
        };
      }
      
      return {
        reviewId,
        status: latestEvent.status,
        action: latestEvent.action,
        lastUpdated: latestEvent.timestamp,
        details: latestEvent.properties,
      };
    }),

  // Get all review processing events
  getProcessingEvents: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { reviewId, limit = 10, offset = 0 } = input;
      
      // Get all events for this review
      const events = await ctx.prisma.analyticsEvent.findMany({
        where: {
          type: 'review_processor',
          properties: {
            path: ['reviewId'],
            equals: reviewId,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        skip: offset,
      });
      
      // Get total count
      const total = await ctx.prisma.analyticsEvent.count({
        where: {
          type: 'review_processor',
          properties: {
            path: ['reviewId'],
            equals: reviewId,
          },
        },
      });
      
      return {
        events: events.map(event => ({
          id: event.id,
          action: event.action,
          status: event.status,
          timestamp: event.timestamp,
          details: event.properties,
        })),
        total,
      };
    }),

  // Get reviews by restaurant ID
  getReviewsByRestaurantId: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { restaurantId, limit = 10, offset = 0 } = input;
      
      // Get reviews for this restaurant
      const reviews = await ctx.prisma.review.findMany({
        where: {
          restaurantId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true,
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
      const total = await ctx.prisma.review.count({
        where: {
          restaurantId,
        },
      });
      
      return {
        reviews,
        total,
      };
    }),

  // Get reviews by user ID
  getReviewsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId, limit = 10, offset = 0 } = input;
      
      // Get reviews by this user
      const reviews = await ctx.prisma.review.findMany({
        where: {
          userId,
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              photos: {
                take: 1,
              },
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
      const total = await ctx.prisma.review.count({
        where: {
          userId,
        },
      });
      
      return {
        reviews,
        total,
      };
    }),
});
