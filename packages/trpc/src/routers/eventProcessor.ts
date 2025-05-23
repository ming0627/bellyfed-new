/**
 * Event Processor Router
 * 
 * This file defines the tRPC router for event processor operations.
 * It's a wrapper around the backend event processor service.
 */

import { z } from 'zod';
import { router } from '../trpc.js';
import { privateProcedure, publicProcedure } from '../procedures/index.js';

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
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return {
        eventId: input.event_id || 'mock-event-id',
        eventType: input.event_type,
        status: 'SUCCESS',
        processingTime: 0,
      };
    }),

  // Process a batch of events
  processBatch: publicProcedure
    .input(batchEventSchema)
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return input.map(event => ({
        eventId: event.event_id || 'mock-event-id',
        eventType: event.event_type,
        status: 'SUCCESS',
        processingTime: 0,
      }));
    }),

  // Get event processing results
  getProcessingResults: privateProcedure
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
    .query(async () => {
      // This will be implemented in the backend service
      return {
        results: [],
        total: 0,
      };
    }),
});
