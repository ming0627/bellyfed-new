/**
 * Outbox Pattern Implementation
 *
 * This module implements the outbox pattern for reliable event delivery from
 * Next.js Server Actions to AWS event-driven architecture.
 *
 * The outbox pattern ensures that database operations and event publishing
 * are performed atomically, preventing data inconsistencies.
 */

import { prisma } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

/**
 * Event status enum
 */
export enum OutboxEventStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

/**
 * Event type enum for import-related events
 */
export enum ImportEventType {
  IMPORT_JOB_CREATED = 'IMPORT_JOB_CREATED',
  IMPORT_JOB_UPDATED = 'IMPORT_JOB_UPDATED',
  IMPORT_JOB_COMPLETED = 'IMPORT_JOB_COMPLETED',
  IMPORT_JOB_FAILED = 'IMPORT_JOB_FAILED',
  IMPORT_BATCH_CREATED = 'IMPORT_BATCH_CREATED',
  IMPORT_BATCH_COMPLETED = 'IMPORT_BATCH_COMPLETED',
  IMPORT_BATCH_FAILED = 'IMPORT_BATCH_FAILED',
  RESTAURANT_IMPORTED = 'RESTAURANT_IMPORTED',
  DISH_IMPORTED = 'DISH_IMPORTED',
}

/**
 * Creates an outbox event for reliable event delivery
 *
 * @param type - Event type
 * @param payload - Event payload
 * @param aggregateId - ID of the aggregate entity (e.g., import job ID)
 * @returns The created outbox event
 */
export async function createOutboxEvent(
  type: string,
  payload: any,
  aggregateId: string,
) {
  return prisma.outboxEvent.create({
    data: {
      id: uuidv4(),
      aggregateId,
      eventType: type,
      payload: JSON.stringify(payload),
      status: OutboxEventStatus.PENDING,
      createdAt: new Date(),
    },
  });
}

/**
 * Creates an outbox event within a transaction
 *
 * @param tx - Prisma transaction
 * @param type - Event type
 * @param payload - Event payload
 * @param aggregateId - ID of the aggregate entity
 * @returns The created outbox event
 */
export async function createOutboxEventInTransaction(
  tx: PrismaClient,
  type: string,
  payload: any,
  aggregateId: string,
) {
  return tx.outboxEvent.create({
    data: {
      id: uuidv4(),
      aggregateId,
      eventType: type,
      payload: JSON.stringify(payload),
      status: OutboxEventStatus.PENDING,
      createdAt: new Date(),
    },
  });
}

/**
 * Retrieves pending outbox events
 *
 * @param limit - Maximum number of events to retrieve
 * @returns Array of pending outbox events
 */
export async function getPendingOutboxEvents(limit = 10) {
  return prisma.outboxEvent.findMany({
    where: {
      status: OutboxEventStatus.PENDING,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  });
}

/**
 * Marks an outbox event as processing
 *
 * @param id - Outbox event ID
 * @returns The updated outbox event
 */
export async function markOutboxEventAsProcessing(id: string) {
  return prisma.outboxEvent.update({
    where: { id },
    data: {
      status: OutboxEventStatus.PROCESSING,
      updatedAt: new Date(),
    },
  });
}

/**
 * Marks an outbox event as processed
 *
 * @param id - Outbox event ID
 * @returns The updated outbox event
 */
export async function markOutboxEventAsProcessed(id: string) {
  return prisma.outboxEvent.update({
    where: { id },
    data: {
      status: OutboxEventStatus.PROCESSED,
      processedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Marks an outbox event as failed
 *
 * @param id - Outbox event ID
 * @returns The updated outbox event
 */
export async function markOutboxEventAsFailed(id: string) {
  return prisma.outboxEvent.update({
    where: { id },
    data: {
      status: OutboxEventStatus.FAILED,
      updatedAt: new Date(),
    },
  });
}

/**
 * Deletes processed outbox events older than the specified retention period
 *
 * @param retentionDays - Number of days to retain processed events
 * @returns Number of deleted events
 */
export async function cleanupProcessedOutboxEvents(retentionDays = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.outboxEvent.deleteMany({
    where: {
      status: OutboxEventStatus.PROCESSED,
      processedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
