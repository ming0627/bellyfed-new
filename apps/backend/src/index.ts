import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '@bellyfed/trpc/router';
import { createContext } from '@bellyfed/trpc/context';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3002;

// Enable CORS for all routes
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

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

export default app;
