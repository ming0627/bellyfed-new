/**
 * Event Processor Router
 * 
 * This file defines the tRPC router for event processor operations.
 * It exposes endpoints for processing events and retrieving
 * processing results.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  processEvent,
  processBatch,
  type ProcessedEvent,
} from './index.js';

// Define Zod schema for base event
const baseEventSchema = z.object({
  event_id: z.string().optional(),
  timestamp: z.string().optional(),
  event_type: z.string(),
  source: z.string(),
  version: z.string().optional(),
  trace_id: z.string().optional(),
  user_id: z.string().optional(),
  status: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Define Zod schema for batch processing
const batchEventSchema = z.array(baseEventSchema);

export const eventProcessorRouter = router({
  // Process a single event
  processEvent: publicProcedure
    .input(baseEventSchema)
    .mutation(async ({ input, ctx }) => {
      // Fill in optional fields with default values
      const event = {
        event_id: input.event_id || crypto.randomUUID(),
        timestamp: input.timestamp || new Date().toISOString(),
        event_type: input.event_type,
        source: input.source,
        version: input.version || 'v1.0',
        trace_id: input.trace_id || crypto.randomUUID(),
        user_id: input.user_id || ctx.user?.id || 'anonymous',
        status: input.status || 'processing',
        payload: input.payload,
        metadata: {
          ...input.metadata,
          requestId: ctx.requestId,
          userAgent: ctx.userAgent,
        },
      };

      return processEvent(event);
    }),

  // Process a batch of events
  processBatch: publicProcedure
    .input(batchEventSchema)
    .mutation(async ({ input, ctx }) => {
      // Fill in optional fields with default values for each event
      const events = input.map(event => ({
        event_id: event.event_id || crypto.randomUUID(),
        timestamp: event.timestamp || new Date().toISOString(),
        event_type: event.event_type,
        source: event.source,
        version: event.version || 'v1.0',
        trace_id: event.trace_id || crypto.randomUUID(),
        user_id: event.user_id || ctx.user?.id || 'anonymous',
        status: event.status || 'processing',
        payload: event.payload,
        metadata: {
          ...event.metadata,
          requestId: ctx.requestId,
          userAgent: ctx.userAgent,
        },
      }));

      return processBatch(events);
    }),

  // Get event processing results
  getProcessingResults: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        eventType: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(['SUCCESS', 'FAILURE']).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get processing results from the database
      const { startDate, endDate, eventType, source, status, limit = 50, offset = 0 } = input;

      // Build the where clause
      const where: any = {
        type: 'event_processor',
      };

      if (eventType) where.action = eventType;
      if (source) where.source = source;
      if (status) where.status = status;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      // Get the total count
      const total = await ctx.prisma.analyticsEvent.count({ where });

      // Get the events
      const events = await ctx.prisma.analyticsEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });

      return {
        results: events.map((event) => ({
          eventId: event.id,
          eventType: event.action,
          source: event.source,
          status: event.status,
          timestamp: event.timestamp.toISOString(),
          payload: (event.properties as any)?.event?.payload || {},
          error: event.status === 'FAILURE' ? (event.properties as any)?.error : undefined,
        })),
        total,
      };
    }),
});
