/**
 * Database Initialization Router
 * 
 * This file defines the tRPC router for database initialization operations.
 */

import { router, protectedProcedure } from '../../trpc.js';
import {
  initializeDatabase,
  checkDatabaseConnection,
  getDatabaseStatus,
} from './index.js';

export const dbInitRouter = router({
  // Initialize database
  initialize: protectedProcedure.mutation(async () => {
    return initializeDatabase();
  }),

  // Check database connection
  checkConnection: protectedProcedure.query(async () => {
    return checkDatabaseConnection();
  }),

  // Get database status
  getStatus: protectedProcedure.query(async () => {
    return getDatabaseStatus();
  }),
});
