/**
 * Bellyfed Backend Server
 *
 * This is the main entry point for the Bellyfed backend server.
 * It sets up an Express server with tRPC and handles API requests.
 */

import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router.js';
import { createContext } from './trpc.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());

// Health check endpoint
app.use('/health', (_, res) => {
  return res.json({ status: 'OK' });
});

// Set up tRPC middleware
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

export default app;
