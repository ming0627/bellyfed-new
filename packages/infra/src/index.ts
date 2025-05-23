/**
 * Infrastructure package
 *
 * This package provides infrastructure components for AWS Lambda functions,
 * including middleware, error handling, and utilities.
 */

// Export middleware
export * from './layers/middleware/nodejs/middlewares/index.js';

// Export middleware utilities
export * from './layers/middleware/nodejs/utils/eventBridge.js';
export * from './layers/middleware/nodejs/utils/sqs.js';

// Export event utilities
// Re-export with different names to avoid conflicts
import {
  processEvent,
  validateStandardEvent,
  sendToEventBridge as sendEventToEventBridge
} from './layers/nodejs/event-utils/index.js';
import type { StandardEvent as EventUtilsStandardEvent } from './layers/nodejs/event-utils/index.js';

export {
  processEvent,
  validateStandardEvent,
  sendEventToEventBridge
};
export type { EventUtilsStandardEvent };

// Export utility functions
export * from './layers/utils/nodejs/errors.js';
export * from './layers/utils/nodejs/aws.js';
export * from './layers/utils/nodejs/event-handler.js';
export * from './layers/utils/nodejs/google.js';
export * from './layers/utils/nodejs/types/index.js';

// Export health check endpoint
export { default as healthHandler } from './pages/health.js';
