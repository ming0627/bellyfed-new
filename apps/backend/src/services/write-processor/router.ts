/**
 * Write Processor Router
 * 
 * This file defines the tRPC router for write processor operations.
 * It exposes endpoints for processing write operations to DynamoDB.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../../trpc.js';
import {
  processBatch,
  processWriteOperation,
  writeItem,
  updateItem,
  deleteItem,
  type WriteData,
  type SQSEvent,
} from './index.js';

// Define Zod schema for write data
const writeDataSchema = z.object({
  table: z.string(),
  item: z.record(z.unknown()).optional(),
  key: z.record(z.unknown()).optional(),
  updateExpression: z.string().optional(),
  expressionAttributeValues: z.record(z.unknown()).optional(),
  expressionAttributeNames: z.record(z.string()).optional(),
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

export const writeProcessorRouter = router({
  // Process a batch of write operations
  processBatch: publicProcedure
    .input(sqsEventSchema)
    .mutation(async ({ input }) => {
      return processBatch(input as SQSEvent);
    }),

  // Process a single write operation
  processWriteOperation: protectedProcedure
    .input(
      z.object({
        action: z.enum(['WRITE', 'UPDATE', 'DELETE']),
        data: writeDataSchema,
      })
    )
    .mutation(async ({ input }) => {
      return processWriteOperation(input.action, input.data as WriteData);
    }),

  // Write an item to DynamoDB
  writeItem: protectedProcedure
    .input(
      z.object({
        table: z.string(),
        item: z.record(z.unknown()),
      })
    )
    .mutation(async ({ input }) => {
      return writeItem(input.table, input.item);
    }),

  // Update an item in DynamoDB
  updateItem: protectedProcedure
    .input(
      z.object({
        table: z.string(),
        key: z.record(z.unknown()),
        updateExpression: z.string(),
        expressionAttributeValues: z.record(z.unknown()).optional(),
        expressionAttributeNames: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return updateItem(
        input.table,
        input.key,
        input.updateExpression,
        input.expressionAttributeValues,
        input.expressionAttributeNames
      );
    }),

  // Delete an item from DynamoDB
  deleteItem: protectedProcedure
    .input(
      z.object({
        table: z.string(),
        key: z.record(z.unknown()),
      })
    )
    .mutation(async ({ input }) => {
      return deleteItem(input.table, input.key);
    }),

  // Batch write items to DynamoDB
  batchWriteItems: protectedProcedure
    .input(
      z.object({
        table: z.string(),
        items: z.array(z.record(z.unknown())),
      })
    )
    .mutation(async ({ input }) => {
      const results = [];
      
      for (const item of input.items) {
        const result = await writeItem(input.table, item);
        results.push(result);
      }
      
      return {
        count: results.length,
        results,
      };
    }),

  // Batch delete items from DynamoDB
  batchDeleteItems: protectedProcedure
    .input(
      z.object({
        table: z.string(),
        keys: z.array(z.record(z.unknown())),
      })
    )
    .mutation(async ({ input }) => {
      const results = [];
      
      for (const key of input.keys) {
        const result = await deleteItem(input.table, key);
        results.push(result);
      }
      
      return {
        count: results.length,
        results,
      };
    }),
});
