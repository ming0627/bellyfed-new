import { router } from '../trpc.js';
import { publicProcedure } from '../procedures/index.js';
import { userRouter } from './user.js';
import { userProfileRouter } from './userProfile.js';
import { analyticsProcessorRouter } from './analyticsProcessor.js';
import { analyticsServiceRouter } from './analyticsService.js';
import { cognitoCustomMessageRouter } from './cognitoCustomMessage.js';
import { cognitoPostConfirmationRouter } from './cognitoPostConfirmation.js';
import { dlqProcessorRouter } from './dlqProcessor.js';
import { eventProcessorRouter } from './eventProcessor.js';
import { googleMapsIntegrationRouter } from './googleMapsIntegration.js';
import { processUserSignupRouter } from './processUserSignup.js';
import { queryProcessorRouter } from './queryProcessor.js';
import { restaurantProcessorRouter } from './restaurantProcessor.js';
import { restaurantQueryRouter } from './restaurantQuery.js';
import { reviewProcessorRouter } from './reviewProcessor.js';
import { reviewQueryRouter } from './reviewQuery.js';
import { typesenseDishSearchRouter } from './typesenseDishSearch.js';
import { typesenseDishSyncRouter } from './typesenseDishSync.js';
import { userAccountProcessorRouter } from './userAccountProcessor.js';
import { writeProcessorRouter } from './writeProcessor.js';

export const appRouter = router({
  user: userRouter,
  userProfile: userProfileRouter,
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

export type AppRouter = typeof appRouter;
