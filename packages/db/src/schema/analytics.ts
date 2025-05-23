/**
 * Analytics Database Schema
 * 
 * This file exports database schema definitions and utilities
 * for working with analytics data.
 */

import { prisma } from '../index.js';
import { type Prisma } from '@prisma/client';

// Analytics event schema types
export type AnalyticsEventCreateInput = Prisma.AnalyticsEventCreateInput;
export type AnalyticsEventWhereInput = Prisma.AnalyticsEventWhereInput;
export type AnalyticsEventOrderByWithRelationInput = Prisma.AnalyticsEventOrderByWithRelationInput;

// Analytics event categories
export enum AnalyticsEventCategory {
  USER_ACTION = 'USER_ACTION',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  AUTH_EVENT = 'AUTH_EVENT',
  QUERY = 'QUERY',
}

// Analytics event status
export enum AnalyticsEventStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

// Database operations
export const analyticsDb = {
  // Create a new analytics event
  create: (data: AnalyticsEventCreateInput) => 
    prisma.analyticsEvent.create({ data }),
  
  // Create multiple analytics events
  createMany: (data: Prisma.AnalyticsEventCreateManyInput[]) => 
    prisma.analyticsEvent.createMany({ data }),
  
  // Find analytics events
  findMany: (params: {
    where?: AnalyticsEventWhereInput;
    orderBy?: AnalyticsEventOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) => prisma.analyticsEvent.findMany(params),
  
  // Count analytics events
  count: (where: AnalyticsEventWhereInput) => 
    prisma.analyticsEvent.count({ where }),
  
  // Group analytics events
  groupBy: (params: {
    by: Prisma.AnalyticsEventScalarFieldEnum[];
    where?: AnalyticsEventWhereInput;
    _count?: boolean;
  }) => prisma.analyticsEvent.groupBy(params),
  
  // Get analytics events by user
  getByUser: (userId: string, limit: number = 50, offset: number = 0) => 
    prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
  
  // Get analytics events by type
  getByType: (type: string, limit: number = 50, offset: number = 0) => 
    prisma.analyticsEvent.findMany({
      where: { type },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
  
  // Get analytics events by category
  getByCategory: (category: AnalyticsEventCategory, limit: number = 50, offset: number = 0) => 
    prisma.analyticsEvent.findMany({
      where: { eventCategory: category },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
  
  // Get analytics events by date range
  getByDateRange: (startDate: Date, endDate: Date, limit: number = 50, offset: number = 0) => 
    prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
};
