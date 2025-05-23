/**
 * Main tRPC Router
 *
 * This file combines all service routers into a single app router.
 */

import { router } from './trpc.js';
import { userProfileRouter } from './services/user-profile/router.js';
import { dbInitRouter } from './services/db-init/router.js';
import { analyticsProcessorRouter } from './services/analytics-processor/router.js';
import { analyticsServiceRouter } from './services/analytics-service/router.js';
import { cognitoCustomMessageRouter } from './services/cognito-custom-message/router.js';
import { cognitoPostConfirmationRouter } from './services/cognito-post-confirmation/router.js';
import { dlqProcessorRouter } from './services/dlq-processor/router.js';
import { eventProcessorRouter } from './services/event-processor/router.js';
import { googleMapsIntegrationRouter } from './services/google-maps-integration/router.js';
import { processUserSignupRouter } from './services/process-user-signup/router.js';
import { queryProcessorRouter } from './services/query-processor/router.js';
import { restaurantProcessorRouter } from './services/restaurant-processor/router.js';
import { restaurantQueryRouter } from './services/restaurant-query/router.js';
import { reviewProcessorRouter } from './services/review-processor/router.js';
import { reviewQueryRouter } from './services/review-query/router.js';
import { typesenseDishSearchRouter } from './services/typesense-dish-search/router.js';
import { typesenseDishSyncRouter } from './services/typesense-dish-sync/router.js';
import { userAccountProcessorRouter } from './services/user-account-processor/router.js';
import { writeProcessorRouter } from './services/write-processor/router.js';

export const appRouter = router({
  userProfile: userProfileRouter,
  dbInit: dbInitRouter,
  analyticsProcessor: analyticsProcessorRouter,
  analyticsService: analyticsServiceRouter,
  cognitoCustomMessage: cognitoCustomMessageRouter,
  cognitoPostConfirmation: cognitoPostConfirmationRouter,
  dlqProcessor: dlqProcessorRouter,
  eventProcessor: eventProcessorRouter,
  googleMapsIntegration: googleMapsIntegrationRouter,
  processUserSignup: processUserSignupRouter,
  queryProcessor: queryProcessorRouter,
  restaurantProcessor: restaurantProcessorRouter,
  restaurantQuery: restaurantQueryRouter,
  reviewProcessor: reviewProcessorRouter,
  reviewQuery: reviewQueryRouter,
  typesenseDishSearch: typesenseDishSearchRouter,
  typesenseDishSync: typesenseDishSyncRouter,
  userAccountProcessor: userAccountProcessorRouter,
  writeProcessor: writeProcessorRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
