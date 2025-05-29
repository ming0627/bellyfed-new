import { Context } from 'aws-lambda';
import { tracing } from './tracing';
import { errorHandler } from './errorHandler';
import { inputValidation } from './validation';
import { apiGatewayErrorHandler } from './specialized/apiGateway';
import { eventBridgeErrorHandler } from './specialized/eventBridge';
import { sqsErrorHandler } from './specialized/sqs';

// Common types
export interface ExtendedContext extends Context {
    traceId?: string;
}

// Re-export middlewares
export {
    tracing,
    errorHandler,
    inputValidation,
    apiGatewayErrorHandler,
    eventBridgeErrorHandler,
    sqsErrorHandler,
};

// Middleware composition helpers
export const createApiGatewayHandler = (handler: unknown, schema?: any) => {
    const middy = require('@middy/core');
    return middy(handler).use(tracing()).use(inputValidation(schema)).use(apiGatewayErrorHandler());
};

export const createEventBridgeHandler = (handler: unknown, schema?: any) => {
    const middy = require('@middy/core');
    return middy(handler)
        .use(tracing())
        .use(inputValidation(schema))
        .use(eventBridgeErrorHandler());
};

export const createSqsHandler = (handler: unknown, schema?: any) => {
    const middy = require('@middy/core');
    return middy(handler).use(tracing()).use(inputValidation(schema)).use(sqsErrorHandler());
};
