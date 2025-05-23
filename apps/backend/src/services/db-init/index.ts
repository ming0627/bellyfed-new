/**
 * Database Initialization Service
 * 
 * This service handles database initialization operations including:
 * - Creating database tables if they don't exist
 * - Setting up initial data
 * - Performing database migrations
 * 
 * It uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { initializationQueries } from '@bellyfed/db/schema/db-schema.js';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize database
export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Use Prisma's executeRaw to run SQL queries
    for (const query of initializationQueries) {
      await prisma.$executeRawUnsafe(query);
    }
    
    console.log('Database initialization completed successfully');
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database');
  }
};

// Check database connection
export const checkDatabaseConnection = async () => {
  try {
    // Simple query to check if database is accessible
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Database connection failed');
  }
};

// Get database status
export const getDatabaseStatus = async () => {
  try {
    // Check connection
    await checkDatabaseConnection();
    
    // Get table counts
    const userCount = await prisma.user.count();
    const userFollowerCount = await prisma.userFollower.count();
    const dishRankingCount = await prisma.dishRanking.count();
    
    return {
      success: true,
      status: 'online',
      tables: {
        users: userCount,
        userFollowers: userFollowerCount,
        dishRankings: dishRankingCount,
      },
    };
  } catch (error) {
    console.error('Error getting database status:', error);
    return {
      success: false,
      status: 'offline',
      error: (error as Error).message,
    };
  }
};
