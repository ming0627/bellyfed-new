import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@bellyfed/trpc';
import { prisma } from '@bellyfed/db';
import type { NextApiRequest, NextApiResponse } from 'next';

// Create Next.js compatible context
const createContext = ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => ({
  prisma,
  req,
  res,
});

// Export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }: { path?: string; error: Error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
          );
        }
      : undefined,
});
