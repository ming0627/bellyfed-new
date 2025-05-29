'use server';

/**
 * Import System Server Actions
 *
 * This module provides Server Actions for the bulk data import system,
 * integrating with the outbox pattern for reliable event delivery.
 */

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../../lib/db/index.js';
import {
  createOutboxEvent,
  createOutboxEventInTransaction,
  ImportEventType,
} from '../../lib/outbox/index.js';
import { auth } from '../../lib/auth/index.js';
// Validation schemas
const importJobSchema = z.object({
  sourceId: z.string().uuid(),
  jobType: z.enum(['RESTAURANT', 'DISH', 'MENU']),
  parameters: z.record(z.any()).optional(),
  region: z.string().optional(),
  searchQuery: z.string().optional(),
});

const importBatchSchema = z.object({
  jobId: z.string().uuid(),
  batchNumber: z.number().int().positive(),
  itemCount: z.number().int().positive(),
});

const importDataSchema = z.object({
  jobId: z.string().uuid(),
  batchId: z.string().uuid(),
  data: z.array(z.record(z.any())),
});

/**
 * Creates a new import job
 *
 * @param formData - Form data containing import job details
 * @returns Result object with success status and job data or error
 */
export async function createImportJob(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Authentication required' };
  }

  const sourceId = formData.get('sourceId') as string;
  const jobType = formData.get('jobType') as string;
  const parametersJson = formData.get('parameters') as string;
  const region = formData.get('region') as string;
  const searchQuery = formData.get('searchQuery') as string;

  let parameters: Record<string, unknown>;
  try {
    parameters = parametersJson ? JSON.parse(parametersJson) : {};
  } catch (error) {
    return { error: 'Invalid parameters JSON' };
  }

  const validationResult = importJobSchema.safeParse({
    sourceId,
    jobType,
    parameters,
    region,
    searchQuery,
  });

  if (!validationResult.success) {
    return { error: validationResult.error.message };
  }

  try {
    // Create import job with transaction to ensure atomicity with outbox event
    const jobId = uuidv4();

    const result = await prisma.$transaction(async (tx: any) => {
      // Create the import job
      const job = await tx.importJob.create({
        data: {
          id: jobId,
          sourceId,
          userId: session.user.id,
          jobType,
          status: 'PENDING',
          parameters: parameters || {},
          region,
          searchQuery,
        },
      });

      // Create outbox event
      await createOutboxEventInTransaction(
        tx,
        ImportEventType.IMPORT_JOB_CREATED,
        {
          jobId: job.id,
          sourceId: job.sourceId,
          userId: job.userId,
          jobType: job.jobType,
          parameters: job.parameters,
        },
        job.id,
      );

      return job;
    });

    // Update UI
    revalidatePath('/admin/imports');

    return { success: true, job: result };
  } catch (error) {
    console.error('Failed to create import job:', error);
    return { error: 'Failed to create import job' };
  }
}

/**
 * Creates a new import batch for an existing job
 *
 * @param formData - Form data containing import batch details
 * @returns Result object with success status and batch data or error
 */
export async function createImportBatch(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Authentication required' };
  }

  const jobId = formData.get('jobId') as string;
  const batchNumber = parseInt(formData.get('batchNumber') as string);
  const itemCount = parseInt(formData.get('itemCount') as string);

  const validationResult = importBatchSchema.safeParse({
    jobId,
    batchNumber,
    itemCount,
  });

  if (!validationResult.success) {
    return { error: validationResult.error.message };
  }

  try {
    // Verify job exists and belongs to user
    const job = await prisma.importJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return { error: 'Import job not found' };
    }

    if (job.userId !== session.user.id) {
      return { error: 'Not authorized to access this import job' };
    }

    // Create import batch with transaction
    const batchId = uuidv4();

    const result = await prisma.$transaction(async (tx: any) => {
      // Create the import batch
      const batch = await tx.importBatch.create({
        data: {
          id: batchId,
          jobId,
          batchNumber,
          itemCount,
          status: 'PENDING',
        },
      });

      // Update job with total records
      await tx.importJob.update({
        where: { id: jobId },
        data: {
          totalRecords: {
            increment: itemCount,
          },
          status: 'IN_PROGRESS',
        },
      });

      // Create outbox event
      await createOutboxEventInTransaction(
        tx,
        ImportEventType.IMPORT_BATCH_CREATED,
        {
          batchId: batch.id,
          jobId: batch.jobId,
          batchNumber: batch.batchNumber,
          itemCount: batch.itemCount,
        },
        batch.id,
      );

      return batch;
    });

    // Update UI
    revalidatePath(`/admin/imports/${jobId}`);

    return { success: true, batch: result };
  } catch (error) {
    console.error('Failed to create import batch:', error);
    return { error: 'Failed to create import batch' };
  }
}

/**
 * Processes import data for a specific batch
 *
 * @param formData - Form data containing import data
 * @returns Result object with success status or error
 */
export async function processImportData(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Authentication required' };
  }

  const jobId = formData.get('jobId') as string;
  const batchId = formData.get('batchId') as string;
  const dataJson = formData.get('data') as string;

  let data;
  try {
    data = JSON.parse(dataJson);
  } catch (error) {
    return { error: 'Invalid data JSON' };
  }

  const validationResult = importDataSchema.safeParse({
    jobId,
    batchId,
    data,
  });

  if (!validationResult.success) {
    return { error: validationResult.error.message };
  }

  try {
    // Verify batch exists and belongs to user's job
    const batch = await prisma.importBatch.findUnique({
      where: { id: batchId },
      include: {
        importJob: true,
      },
    });

    if (!batch) {
      return { error: 'Import batch not found' };
    }

    if (batch.importJob.userId !== session.user.id) {
      return { error: 'Not authorized to access this import batch' };
    }

    // Create outbox event for data processing
    await createOutboxEvent(
      batch.importJob.jobType === 'RESTAURANT'
        ? ImportEventType.RESTAURANT_IMPORTED
        : ImportEventType.DISH_IMPORTED,
      {
        jobId,
        batchId,
        data,
      },
      batchId,
    );

    // Update UI
    revalidatePath(`/admin/imports/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to process import data:', error);
    return { error: 'Failed to process import data' };
  }
}

/**
 * Gets import job status
 *
 * @param jobId - Import job ID
 * @returns Result object with job data or error
 */
export async function getImportJobStatus(jobId: string) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Authentication required' };
  }

  try {
    const job = await prisma.importJob.findUnique({
      where: { id: jobId },
      include: {
        importBatches: true,
      },
    });

    if (!job) {
      return { error: 'Import job not found' };
    }

    if (job.userId !== session.user.id) {
      return { error: 'Not authorized to access this import job' };
    }

    return { success: true, job };
  } catch (error) {
    console.error('Failed to get import job status:', error);
    return { error: 'Failed to get import job status' };
  }
}
