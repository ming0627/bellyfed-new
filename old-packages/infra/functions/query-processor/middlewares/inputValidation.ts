import { MiddlewareObj } from '@middy/core';
import { Context } from 'aws-lambda';
import { ApplicationError } from '../errors';

export interface InputValidationEvent {
    Records?: Array<{
        body: string;
        messageId: string;
        messageAttributes: Record<string, unknown>;
    }>;
}

interface ParsedRecord {
    data: {
        table: string;
        operation: string;
    };
}

const inputValidation = (): MiddlewareObj<InputValidationEvent, unknown, Error, Context> => ({
    before: async (request) => {
        const { event } = request;

        // Validate SQS event structure
        if (!event.Records || !Array.isArray(event.Records)) {
            throw new ApplicationError('Invalid event structure: Records array is required', 400);
        }

        // Validate each record
        event.Records.forEach((record, index) => {
            if (!record.body) {
                throw new ApplicationError(
                    `Invalid record at index ${index}: body is required`,
                    400
                );
            }

            try {
                const parsed = JSON.parse(record.body) as ParsedRecord;
                if (!parsed.data || !parsed.data.table || !parsed.data.operation) {
                    throw new ApplicationError(
                        `Invalid record at index ${index}: data.table and data.operation are required`,
                        400
                    );
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Invalid JSON format';
                throw new ApplicationError(
                    `Invalid JSON in record at index ${index}: ${message}`,
                    400
                );
            }
        });
    },
});

export default inputValidation;
