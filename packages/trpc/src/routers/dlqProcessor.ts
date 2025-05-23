/**
 * Dead Letter Queue (DLQ) Processor Router
 * 
 * This file defines the tRPC router for DLQ processor operations.
 * It's a wrapper around the backend DLQ processor service.
 */

import { z } from 'zod';
import { router } from '../trpc.js';
import { privateProcedure, publicProcedure } from '../procedures/index.js';

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
  processMessage: privateProcedure
    .input(dlqMessageSchema)
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return {
        messageId: 'mock-message-id',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      };
    }),

  // Process a batch of DLQ messages
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      // This will be implemented in the backend service
      return {
        batchItemFailures: [],
      };
    }),

  // Get DLQ processing results
  getProcessingResults: privateProcedure
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
    .query(async ({ input }) => {
      // This will be implemented in the backend service
      return {
        results: [],
        total: 0,
      };
    }),
});
