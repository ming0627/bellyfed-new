import { router } from '../trpc.js';
import { publicProcedure } from '../procedures/index.js';
import { userRouter } from './user.js';

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
