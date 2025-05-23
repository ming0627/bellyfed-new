/**
 * Dead Letter Queue (DLQ) Processor Router
 * 
 * This file defines the tRPC router for DLQ processor operations.
 * It exposes endpoints for processing DLQ messages and retrieving
 * processing results.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  processDLQMessage,
  processDLQBatch,
  type DLQMessage,
  type SQSEvent,
  type ProcessedMessage,
} from './index.js';

// Define Zod schema for DLQ message
const dlqMessageSchema = z.object({
  source: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    stack: z.string().optional(),
  }).optional(),
  metadata: z.object({
    retryCount: z.number().optional(),
    originalMessageId: z.string().optional(),
    timestamp: z.string().optional(),
  }).optional(),
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

export const dlqProcessorRouter = router({
  // Process a single DLQ message
  processMessage: protectedProcedure
    .input(dlqMessageSchema)
    .mutation(async ({ input }) => {
      return processDLQMessage(input as DLQMessage);
    }),

  // Process a batch of DLQ messages
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      return processDLQBatch(input as SQSEvent);
    }),

  // Get DLQ processing results
  getProcessingResults: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        source: z.string().optional(),
        type: z.string().optional(),
        status: z.enum(['SUCCESS', 'FAILURE']).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get processing results from the database
      const { startDate, endDate, source, type, status, limit = 50, offset = 0 } = input;

      // Build the where clause
      const where: any = {
        type: 'dlq_message',
      };

      if (source) where.source = source;
      if (type) where.action = type;
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
          messageId: (event.properties as any).messageId || event.id,
          source: event.source,
          type: event.action,
          status: event.status,
          timestamp: event.timestamp.toISOString(),
          data: (event.properties as any).message?.data || {},
          error: (event.properties as any).message?.error,
        })),
        total,
      };
    }),
});
