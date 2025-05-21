import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../routers/index.js';
import { createContext } from '../context.js';


export const trpcExpress = createExpressMiddleware({
  router: appRouter,
  createContext: createContext,
})