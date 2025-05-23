/**
 * tRPC Server Setup
 * 
 * This file sets up the tRPC server with authentication middleware
 * and defines the base router and procedure builders.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import superjson from 'superjson';

// Define the context type
export interface Context {
  user?: {
    id: string;
    email: string;
  };
}

// Create context for each request
export const createContext = ({ req, res }: CreateExpressContextOptions): Context => {
  // For now, we'll use a simple auth header check
  // In production, this would validate JWT tokens from Cognito
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {};
  }
  
  // In a real implementation, we would validate the token
  // and extract user information from it
  // This is a simplified example
  const token = authHeader.split(' ')[1];
  
  // Mock user for development
  // In production, this would come from token validation
  if (token === 'test-token') {
    return {
      user: {
        id: 'user-1',
        email: 'test@example.com',
      },
    };
  }
  
  return {};
};

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Protected procedure - only authenticated users can call this
export const protectedProcedure = t.procedure.use(isAuthed);
