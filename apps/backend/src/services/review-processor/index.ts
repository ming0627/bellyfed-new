/**
 * Review Processor Service
 * 
 * This service processes restaurant review creation and update events.
 * It provides functionality to:
 * - Create new reviews
 * - Update existing reviews
 * - Process review events from various sources
 * - Update restaurant ratings based on reviews
 * - Send completion events
 * 
 * The service uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the review event interface
export interface ReviewEvent {
  reviewId: string;
  restaurantId: string;
  userId: string;
  rating: number;
  text?: string;
  visitStatus?: string;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

// Define the SQS record interface
export interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: Record<string, string>;
  messageAttributes: Record<string, {
    dataType: string;
    stringValue?: string;
    binaryValue?: string;
  }>;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

// Define the SQS event interface
export interface SQSEvent {
  Records: SQSRecord[];
}

// Define the processed record interface
export interface ProcessedRecord {
  messageId: string;
  status: 'SUCCESS' | 'FAILURE';
  operation: 'create' | 'update';
  reviewId: string;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Process a batch of review events from SQS
 */
export const processBatch = async (event: SQSEvent): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  console.log('Processing review events:', JSON.stringify(event));

  const results: ProcessedRecord[] = [];
  
  // Process records in parallel with a limit of 5 concurrent operations
  for (let i = 0; i < event.Records.length; i += 5) {
    const batch = event.Records.slice(i, i + 5);
    const batchResults = await Promise.allSettled(
      batch.map(async (record) => {
        try {
          // Parse the message body
          const message = JSON.parse(record.body);
          const eventType = message.detail_type || message.detailType;
          const reviewData = message.detail as ReviewEvent;

          let result;
          if (eventType === 'ReviewCreated') {
            result = await createReview(reviewData);
            return {
              messageId: record.messageId,
              status: 'SUCCESS' as const,
              operation: 'create' as const,
              reviewId: reviewData.reviewId,
            };
          } else if (eventType === 'ReviewUpdated') {
            result = await updateReview(reviewData);
            return {
              messageId: record.messageId,
              status: 'SUCCESS' as const,
              operation: 'update' as const,
              reviewId: reviewData.reviewId,
            };
          } else {
            throw new Error(`Unsupported event type: ${eventType}`);
          }
        } catch (error) {
          console.error('Error processing record:', record.messageId, error);
          return {
            messageId: record.messageId,
            status: 'FAILURE' as const,
            operation: 'create' as const, // Default to create if we can't determine
            reviewId: 'unknown',
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: error instanceof TRPCError ? error.code : 'INTERNAL_SERVER_ERROR',
            },
          };
        }
      })
    );
    
    // Extract results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          messageId: 'unknown',
          status: 'FAILURE',
          operation: 'create',
          reviewId: 'unknown',
          error: {
            message: result.reason?.message || 'Unknown error',
          },
        });
      }
    }
  }

  // Check for any failures
  const failures = results.filter((r) => r.status === 'FAILURE');
  if (failures.length > 0) {
    console.error(`${failures.length} records failed processing`);
  }

  console.log(`Successfully processed ${results.length - failures.length} out of ${results.length} records`);
  
  // Return failed records for retry
  return {
    batchItemFailures: failures.map((failure) => ({
      itemIdentifier: failure.messageId,
    })),
  };
};

/**
 * Create a new review
 */
export const createReview = async (reviewData: ReviewEvent): Promise<any> => {
  console.log('Creating review:', reviewData);
  
  try {
    // Validate review data
    if (
      !reviewData.reviewId ||
      !reviewData.restaurantId ||
      !reviewData.userId ||
      reviewData.rating === undefined
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing required fields for review creation',
      });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewId: reviewData.reviewId,
      },
    });

    if (existingReview) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `Review with ID ${reviewData.reviewId} already exists`,
      });
    }

    // Create review in database
    const review = await prisma.review.create({
      data: {
        id: uuidv4(),
        reviewId: reviewData.reviewId,
        restaurantId: reviewData.restaurantId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        text: reviewData.text || null,
        visitStatus: reviewData.visitStatus || 'VISITED',
        createdAt: new Date(reviewData.createdAt),
        updatedAt: new Date(reviewData.createdAt),
      },
    });

    console.log('Review created successfully:', review);

    // Update restaurant rating
    await updateRestaurantRating(reviewData.restaurantId);

    // Send completion event
    await sendCompletionEvent('ReviewCreationCompleted', review);

    return review;
  } catch (error) {
    console.error('Error creating review:', error);
    
    // Send failure event
    await sendCompletionEvent('ReviewCreationFailed', {
      reviewId: reviewData.reviewId,
      restaurantId: reviewData.restaurantId,
      userId: reviewData.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (reviewData: ReviewEvent): Promise<any> => {
  console.log('Updating review:', reviewData.reviewId);
  
  try {
    // Validate review data
    if (!reviewData.reviewId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing required fields for review update',
      });
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewId: reviewData.reviewId,
      },
    });

    if (!existingReview) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Review with ID ${reviewData.reviewId} not found`,
      });
    }

    // Update review in database
    const review = await prisma.review.update({
      where: {
        reviewId: reviewData.reviewId,
      },
      data: {
        rating: reviewData.rating !== undefined ? reviewData.rating : existingReview.rating,
        text: reviewData.text !== undefined ? reviewData.text : existingReview.text,
        visitStatus: reviewData.visitStatus || existingReview.visitStatus,
        updatedAt: reviewData.updatedAt ? new Date(reviewData.updatedAt) : new Date(),
      },
    });

    console.log('Review updated successfully:', review);

    // Update restaurant rating
    await updateRestaurantRating(review.restaurantId);

    // Send completion event
    await sendCompletionEvent('ReviewUpdateCompleted', review);

    return review;
  } catch (error) {
    console.error('Error updating review:', error);
    
    // Send failure event
    await sendCompletionEvent('ReviewUpdateFailed', {
      reviewId: reviewData.reviewId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update restaurant rating based on reviews
 */
const updateRestaurantRating = async (restaurantId: string): Promise<void> => {
  try {
    // Get all reviews for the restaurant
    const reviews = await prisma.review.findMany({
      where: {
        restaurantId,
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      console.log(`No reviews found for restaurant ${restaurantId}`);
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update restaurant rating
    await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        rating: averageRating,
      },
    });

    console.log(`Updated rating for restaurant ${restaurantId} to ${averageRating}`);
  } catch (error) {
    console.error(`Error updating restaurant rating for ${restaurantId}:`, error);
    // Don't throw here to avoid failing the main function
  }
};

/**
 * Send a completion event
 */
const sendCompletionEvent = async (eventType: string, data: any): Promise<void> => {
  try {
    // In a real implementation, this would send an event to EventBridge
    // For now, we'll just log the event
    console.log(`Sending ${eventType} event:`, data);
    
    // Store the event in the database for tracking
    await prisma.analyticsEvent.create({
      data: {
        id: uuidv4(),
        type: 'review_processor',
        action: eventType,
        timestamp: new Date(),
        userId: data.userId || 'system',
        source: 'bellyfed.review',
        status: eventType.includes('Failed') ? 'FAILURE' : 'SUCCESS',
        eventCategory: 'REVIEW_EVENT',
        properties: data as any,
      },
    });
  } catch (error) {
    console.error(`Error sending ${eventType} event:`, error);
    // Don't throw here to avoid failing the main function
  }
};
