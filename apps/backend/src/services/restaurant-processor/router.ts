/**
 * Restaurant Processor Router
 *
 * This file defines the tRPC router for restaurant processor operations.
 * It exposes endpoints for creating and updating restaurants.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  createRestaurant,
  updateRestaurant,
  processBatch,
  type RestaurantEvent,
  type SQSEvent,
  type ProcessedRecord,
} from './index.js';

// Define Zod schema for restaurant event
const restaurantEventSchema = z.object({
  restaurantId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  countryCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  cuisineType: z.string().optional(),
  priceRange: z.number(),
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

export const restaurantProcessorRouter = router({
  // Create a new restaurant
  createRestaurant: protectedProcedure
    .input(restaurantEventSchema)
    .mutation(async ({ input }) => {
      return createRestaurant(input as RestaurantEvent);
    }),

  // Update an existing restaurant
  updateRestaurant: protectedProcedure
    .input(restaurantEventSchema)
    .mutation(async ({ input }) => {
      return updateRestaurant(input as RestaurantEvent);
    }),

  // Process a batch of restaurant events
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      return processBatch(input as SQSEvent);
    }),

  // Get restaurant processing status
  getProcessingStatus: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { restaurantId } = input;

      // Get the latest event for this restaurant
      const latestEvent = await ctx.prisma.analyticsEvent.findFirst({
        where: {
          type: 'restaurant_processor',
          properties: {
            path: ['id'],
            equals: restaurantId,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!latestEvent) {
        return {
          restaurantId,
          status: 'UNKNOWN',
          lastUpdated: null,
        };
      }

      return {
        restaurantId,
        status: latestEvent.status,
        action: latestEvent.action,
        lastUpdated: latestEvent.timestamp,
        details: latestEvent.properties,
      };
    }),

  // Get all restaurant processing events
  getProcessingEvents: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { restaurantId, limit = 10, offset = 0 } = input;

      // Get all events for this restaurant
      const events = await ctx.prisma.analyticsEvent.findMany({
        where: {
          type: 'restaurant_processor',
          properties: {
            path: ['id'],
            equals: restaurantId,
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
          type: 'restaurant_processor',
          properties: {
            path: ['id'],
            equals: restaurantId,
          },
        },
      });

      return {
        events: events.map((event: any) => ({
          id: event.id,
          action: event.action,
          status: event.status,
          timestamp: event.timestamp,
          details: event.properties,
        })),
        total,
      };
    }),
});
