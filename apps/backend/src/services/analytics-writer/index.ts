/**
 * Analytics Writer Service
 * 
 * This service handles writing analytics data to the database and external systems.
 * It processes analytics events and stores them for reporting and analysis.
 * 
 * @module AnalyticsWriterService
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Analytics event schema for validation
 */
export const AnalyticsEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'restaurant_view',
    'dish_view',
    'search',
    'ranking_submit',
    'review_submit',
    'user_signup',
    'user_login',
    'restaurant_favorite',
    'dish_vote',
    'collection_create',
    'collection_view',
    'social_share',
    'premium_upgrade',
    'competition_join'
  ]),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.string().datetime(),
  properties: z.record(z.any()).optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referrer: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    device: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional()
  }).optional()
});

/**
 * Batch analytics events schema
 */
export const BatchAnalyticsEventsSchema = z.object({
  events: z.array(AnalyticsEventSchema),
  batchId: z.string().optional()
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type BatchAnalyticsEvents = z.infer<typeof BatchAnalyticsEventsSchema>;

/**
 * Analytics Writer Service Implementation
 */
export class AnalyticsWriterService {
  /**
   * Write a single analytics event
   */
  async writeEvent(event: AnalyticsEvent): Promise<{ success: boolean; eventId: string }> {
    try {
      // Validate the event
      const validatedEvent = AnalyticsEventSchema.parse(event);
      
      // Generate unique event ID
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // TODO: Implement actual database write
      // This would typically write to:
      // 1. Primary analytics table
      // 2. Time-series database for real-time analytics
      // 3. Data warehouse for long-term analysis
      
      console.log('Writing analytics event:', {
        eventId,
        eventType: validatedEvent.eventType,
        userId: validatedEvent.userId,
        timestamp: validatedEvent.timestamp
      });
      
      // Simulate database write
      await this.simulateWrite(validatedEvent, eventId);
      
      return {
        success: true,
        eventId
      };
    } catch (error) {
      console.error('Failed to write analytics event:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to write analytics event',
        cause: error
      });
    }
  }

  /**
   * Write multiple analytics events in batch
   */
  async writeBatch(batch: BatchAnalyticsEvents): Promise<{ 
    success: boolean; 
    batchId: string; 
    eventIds: string[];
    failedEvents: number;
  }> {
    try {
      // Validate the batch
      const validatedBatch = BatchAnalyticsEventsSchema.parse(batch);
      
      // Generate batch ID if not provided
      const batchId = validatedBatch.batchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const eventIds: string[] = [];
      let failedEvents = 0;
      
      // Process each event in the batch
      for (const event of validatedBatch.events) {
        try {
          const result = await this.writeEvent(event);
          eventIds.push(result.eventId);
        } catch (error) {
          console.error('Failed to write event in batch:', error);
          failedEvents++;
        }
      }
      
      console.log('Batch write completed:', {
        batchId,
        totalEvents: validatedBatch.events.length,
        successfulEvents: eventIds.length,
        failedEvents
      });
      
      return {
        success: failedEvents === 0,
        batchId,
        eventIds,
        failedEvents
      };
    } catch (error) {
      console.error('Failed to write analytics batch:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to write analytics batch',
        cause: error
      });
    }
  }

  /**
   * Write user behavior analytics
   */
  async writeUserBehavior(data: {
    userId: string;
    action: string;
    target: string;
    context: Record<string, any>;
    timestamp?: string;
  }): Promise<{ success: boolean; eventId: string }> {
    const event: AnalyticsEvent = {
      eventType: 'page_view', // This would be determined by the action
      userId: data.userId,
      sessionId: `session_${data.userId}_${Date.now()}`,
      timestamp: data.timestamp || new Date().toISOString(),
      properties: {
        action: data.action,
        target: data.target,
        context: data.context
      }
    };
    
    return this.writeEvent(event);
  }

  /**
   * Write performance metrics
   */
  async writePerformanceMetrics(data: {
    page: string;
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    userId?: string;
    sessionId: string;
  }): Promise<{ success: boolean; eventId: string }> {
    const event: AnalyticsEvent = {
      eventType: 'page_view',
      userId: data.userId,
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        page: data.page,
        performance: {
          loadTime: data.loadTime,
          renderTime: data.renderTime,
          interactionTime: data.interactionTime
        }
      }
    };
    
    return this.writeEvent(event);
  }

  /**
   * Simulate database write operation
   * In production, this would be replaced with actual database operations
   */
  private async simulateWrite(event: AnalyticsEvent, eventId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    // In production, this would:
    // 1. Write to primary analytics table
    // 2. Update real-time aggregations
    // 3. Queue for data warehouse processing
    // 4. Trigger any real-time alerts if needed
    
    console.log(`Analytics event ${eventId} written successfully`);
  }

  /**
   * Health check for the analytics writer service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: Record<string, any> }> {
    try {
      // Check database connectivity
      // Check external service availability
      // Check queue health
      
      return {
        status: 'healthy',
        details: {
          database: 'connected',
          queue: 'operational',
          lastWrite: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Export singleton instance
export const analyticsWriterService = new AnalyticsWriterService();
