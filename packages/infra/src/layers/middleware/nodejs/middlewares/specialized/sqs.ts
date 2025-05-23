/**
 * SQS specialized middleware for AWS Lambda functions
 * This middleware provides error handling and message processing for SQS events
 */

import { MiddlewareObj } from '@middy/core';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ApplicationError } from '../../../../utils/nodejs/errors.js';

/**
 * SQS error handler middleware
 * @returns Middleware object for SQS error handling
 */
export const sqsErrorHandler = (): MiddlewareObj<SQSEvent> => ({
  /**
   * Handle errors in SQS Lambda functions
   * @param request Middy request object
   */
  onError: async (request) => {
    const { error, context, event } = request;

    if (!error) {
      return;
    }

    // Extract message IDs for logging
    const messageIds = event.Records.map((record) => record.messageId);

    // Log the error with message context
    console.error('SQS Processing Error:', {
      error: error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
          }
        : error,
      messageIds,
      queueUrl: event.Records[0]?.eventSourceARN,
      recordCount: event.Records.length,
      traceId: context?.awsRequestId,
    });

    // For business logic errors, we might want to handle them differently
    if (error instanceof ApplicationError) {
      // Log additional details for application errors
      console.error('Application Error Details:', {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      });

      // Rethrow to allow AWS to handle the error (e.g., retry policy, DLQ)
      throw error;
    }

    // For system errors, let SQS retry based on the queue settings
    throw error;
  },
});

/**
 * SQS message validator middleware
 * @param validator Function to validate SQS messages
 * @returns Middleware object for SQS message validation
 */
export const sqsMessageValidator = (
  validator: (record: SQSRecord) => Promise<boolean> | boolean
): MiddlewareObj<SQSEvent> => ({
  /**
   * Validate SQS messages before processing
   * @param request Middy request object
   */
  before: async (request) => {
    const { event } = request;

    // Process each record
    for (const record of event.Records) {
      try {
        // Validate the record
        const isValid = await validator(record);

        if (!isValid) {
          throw new ApplicationError(
            `Invalid SQS message: ${record.messageId}`,
            400,
            'INVALID_MESSAGE'
          );
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          throw error;
        }

        throw new ApplicationError(
          `Error validating SQS message: ${record.messageId}`,
          400,
          'VALIDATION_ERROR',
          { error: error instanceof Error ? error.message : String(error) }
        );
      }
    }
  },
});

/**
 * SQS message parser middleware
 * @returns Middleware object for SQS message parsing
 */
export const sqsMessageParser = (): MiddlewareObj<SQSEvent> => ({
  /**
   * Parse SQS messages before processing
   * @param request Middy request object
   */
  before: async (request) => {
    const { event } = request;

    // Process each record
    for (let i = 0; i < event.Records.length; i++) {
      const record = event.Records[i];

      try {
        // Parse the message body if it's a JSON string
        if (record && record.body) {
          const parsedBody = JSON.parse(record.body);

          // Replace the body with the parsed object
          // We need to cast to any because the SQSRecord type expects body to be a string
          (event.Records[i] as any).parsedBody = parsedBody;
        }
      } catch (error) {
        if (record) {
          console.warn(`Failed to parse SQS message body for message ${record.messageId}:`, error);
        } else {
          console.warn(`Failed to parse SQS message body for record at index ${i}:`, error);
        }
        // Continue processing other messages
      }
    }
  },
});

/**
 * SQS batch processor middleware
 * @param processor Function to process each SQS record
 * @param options Processing options
 * @returns Middleware object for SQS batch processing
 */
export const sqsBatchProcessor = (
  processor: (record: SQSRecord) => Promise<void>,
  options: {
    stopOnError?: boolean;
    parallelProcessing?: boolean;
  } = {}
): MiddlewareObj<SQSEvent> => ({
  /**
   * Process SQS messages in batch
   * @param request Middy request object
   */
  before: async (request) => {
    const { event } = request;
    const { stopOnError = false, parallelProcessing = false } = options;

    // Track failed message IDs
    const failedMessageIds: string[] = [];

    try {
      if (parallelProcessing) {
        // Process all records in parallel
        const promises = event.Records.map(async (record) => {
          try {
            await processor(record);
          } catch (error) {
            failedMessageIds.push(record.messageId);
            console.error(`Error processing SQS message ${record.messageId}:`, error);

            if (stopOnError) {
              throw error;
            }
          }
        });

        await Promise.all(promises);
      } else {
        // Process records sequentially
        for (const record of event.Records) {
          try {
            await processor(record);
          } catch (error) {
            failedMessageIds.push(record.messageId);
            console.error(`Error processing SQS message ${record.messageId}:`, error);

            if (stopOnError) {
              throw error;
            }
          }
        }
      }

      // If any messages failed and we're not stopping on error, add them to the response
      if (failedMessageIds.length > 0) {
        request.response = {
          batchItemFailures: failedMessageIds.map(messageId => ({
            itemIdentifier: messageId
          }))
        };
      }
    } catch (error) {
      // If we're stopping on error, rethrow
      if (stopOnError) {
        throw error;
      }
    }
  },
});
