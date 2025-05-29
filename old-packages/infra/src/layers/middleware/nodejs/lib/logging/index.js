/**
 * Centralized logging module for Lambda functions
 *
 * This module exports a logger instance and middleware for Lambda functions
 * that provides structured logging with consistent format across all functions.
 *
 * Usage:
 *
 * 1. Basic logging:
 * ```
 * import { logger } from '/opt/nodejs/lib/logging';
 *
 * logger.info('This is an info message');
 * logger.error('This is an error message', new Error('Something went wrong'));
 * ```
 *
 * 2. With middleware:
 * ```
 * import { logger } from '/opt/nodejs/lib/logging';
 *
 * export const handler = logger.middleware(async (event, context) => {
 *   // Your handler code here
 *   return { statusCode: 200, body: 'Success' };
 * });
 * ```
 */

import { Logger, logger, LOG_LEVELS } from './logger.js';

export { Logger, logger, LOG_LEVELS };
