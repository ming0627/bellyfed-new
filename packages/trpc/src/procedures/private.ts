import { TRPCError } from '@trpc/server';
import { t } from '../trpc.js';
import type { Context } from '../context.js';

const isAuthed = t.middleware(({ ctx, next }: { ctx: any; next: any }) => {
  // Explicitly type the context
  const context = ctx as Context;

  if (!context.req?.headers.authorization) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
    },
  });
});

export const privateProcedure = t.procedure.use(isAuthed);
