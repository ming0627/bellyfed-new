import { TRPCError } from '@trpc/server';
import { t } from '../trpc.js';
import type { Context, AuthenticatedContext } from '../context.js';

const isAuthed = t.middleware(({ ctx, next }: { ctx: any; next: any }) => {
  // Explicitly type the context
  const context = ctx as Context;

  if (!context.req?.headers.authorization) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Mock user for now - in production this would decode the JWT token
  const user = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User'
  };

  return next({
    ctx: {
      ...ctx,
      user,
    } as AuthenticatedContext,
  });
});

export const privateProcedure = t.procedure.use(isAuthed);
