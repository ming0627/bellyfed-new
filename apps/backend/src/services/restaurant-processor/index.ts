/**
 * Restaurant Processor Service
 * 
 * This service processes restaurant creation and update events.
 * It provides functionality to:
 * - Create new restaurants
 * - Update existing restaurants
 * - Process restaurant events from various sources
 * - Send completion events
 * 
 * The service uses Prisma ORM for database operations.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the restaurant event interface
export interface RestaurantEvent {
  restaurantId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  email?: string;
  cuisineType?: string;
  priceRange: number;
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
  restaurantId: string;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Process a batch of restaurant events from SQS
 */
export const processBatch = async (event: SQSEvent): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  console.log('Processing restaurant events:', JSON.stringify(event));

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
          const restaurantData = message.detail as RestaurantEvent;

          let result;
          if (eventType === 'RestaurantCreated') {
            result = await createRestaurant(restaurantData);
            return {
              messageId: record.messageId,
              status: 'SUCCESS' as const,
              operation: 'create' as const,
              restaurantId: restaurantData.restaurantId,
            };
          } else if (eventType === 'RestaurantUpdated') {
            result = await updateRestaurant(restaurantData);
            return {
              messageId: record.messageId,
              status: 'SUCCESS' as const,
              operation: 'update' as const,
              restaurantId: restaurantData.restaurantId,
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
            restaurantId: 'unknown',
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
          restaurantId: 'unknown',
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
 * Create a new restaurant
 */
export const createRestaurant = async (restaurantData: RestaurantEvent): Promise<any> => {
  console.log('Creating restaurant:', restaurantData.name);
  
  try {
    // Validate restaurant data
    if (
      !restaurantData.name ||
      !restaurantData.address ||
      !restaurantData.city ||
      !restaurantData.country ||
      !restaurantData.countryCode
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing required fields for restaurant creation',
      });
    }

    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantData.restaurantId,
      },
    });

    if (existingRestaurant) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `Restaurant with ID ${restaurantData.restaurantId} already exists`,
      });
    }

    // Create restaurant in database
    const restaurant = await prisma.restaurant.create({
      data: {
        id: restaurantData.restaurantId,
        googlePlaceId: restaurantData.restaurantId, // Using restaurantId as googlePlaceId for now
        name: restaurantData.name,
        address: `${restaurantData.address}, ${restaurantData.city}, ${restaurantData.state || ''} ${restaurantData.postalCode || ''}`.trim(),
        latitude: restaurantData.latitude || 0,
        longitude: restaurantData.longitude || 0,
        phone: restaurantData.phone || '',
        website: restaurantData.website || '',
        rating: 0, // Default rating
        priceLevel: restaurantData.priceRange,
        countryCode: restaurantData.countryCode,
        createdAt: new Date(restaurantData.createdAt),
        updatedAt: new Date(restaurantData.createdAt),
      },
    });

    console.log('Restaurant created successfully:', restaurant);

    // Send completion event
    await sendCompletionEvent('RestaurantCreationCompleted', restaurant);

    return restaurant;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    
    // Send failure event
    await sendCompletionEvent('RestaurantCreationFailed', {
      id: restaurantData.restaurantId,
      name: restaurantData.name,
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
 * Update an existing restaurant
 */
export const updateRestaurant = async (restaurantData: RestaurantEvent): Promise<any> => {
  console.log('Updating restaurant:', restaurantData.restaurantId);
  
  try {
    // Validate restaurant data
    if (!restaurantData.restaurantId || !restaurantData.name) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing required fields for restaurant update',
      });
    }

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantData.restaurantId,
      },
    });

    if (!existingRestaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Restaurant with ID ${restaurantData.restaurantId} not found`,
      });
    }

    // Update restaurant in database
    const restaurant = await prisma.restaurant.update({
      where: {
        id: restaurantData.restaurantId,
      },
      data: {
        name: restaurantData.name,
        address: `${restaurantData.address}, ${restaurantData.city}, ${restaurantData.state || ''} ${restaurantData.postalCode || ''}`.trim(),
        latitude: restaurantData.latitude || existingRestaurant.latitude,
        longitude: restaurantData.longitude || existingRestaurant.longitude,
        phone: restaurantData.phone || existingRestaurant.phone,
        website: restaurantData.website || existingRestaurant.website,
        priceLevel: restaurantData.priceRange,
        countryCode: restaurantData.countryCode,
        updatedAt: restaurantData.updatedAt ? new Date(restaurantData.updatedAt) : new Date(),
      },
    });

    console.log('Restaurant updated successfully:', restaurant);

    // Send completion event
    await sendCompletionEvent('RestaurantUpdateCompleted', restaurant);

    return restaurant;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    
    // Send failure event
    await sendCompletionEvent('RestaurantUpdateFailed', {
      id: restaurantData.restaurantId,
      name: restaurantData.name,
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
        type: 'restaurant_processor',
        action: eventType,
        timestamp: new Date(),
        userId: data.createdBy || 'system',
        source: 'bellyfed.restaurant',
        status: eventType.includes('Failed') ? 'FAILURE' : 'SUCCESS',
        eventCategory: 'RESTAURANT_EVENT',
        properties: data as any,
      },
    });
  } catch (error) {
    console.error(`Error sending ${eventType} event:`, error);
    // Don't throw here to avoid failing the main function
  }
};
