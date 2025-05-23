/**
 * Analytics Processor Lambda Function
 * 
 * Processes analytics events from various sources and aggregates data for reporting.
 * Handles user engagement tracking, restaurant performance metrics, and system analytics.
 * 
 * Features:
 * - Event processing from EventBridge
 * - Data aggregation and storage
 * - Real-time analytics updates
 * - Error handling and retry logic
 * - Performance monitoring
 */

import { EventBridgeEvent, Context } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

// Types
interface AnalyticsEvent {
  eventType: string
  userId?: string
  restaurantId?: string
  dishId?: string
  timestamp: string
  metadata: Record<string, any>
  sessionId?: string
  userAgent?: string
  ipAddress?: string
}

interface AggregatedMetrics {
  totalEvents: number
  uniqueUsers: number
  topRestaurants: Array<{ id: string; count: number }>
  topDishes: Array<{ id: string; count: number }>
  eventsByType: Record<string, number>
  hourlyDistribution: Record<string, number>
}

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
})
const docClient = DynamoDBDocumentClient.from(dynamoClient)

// Environment variables
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || 'bellyfed-analytics'
const AGGREGATES_TABLE = process.env.AGGREGATES_TABLE || 'bellyfed-analytics-aggregates'

/**
 * Main Lambda handler for processing analytics events
 */
export const handler = async (
  event: EventBridgeEvent<string, AnalyticsEvent>,
  context: Context
): Promise<void> => {
  console.log('Processing analytics event:', JSON.stringify(event, null, 2))

  try {
    const analyticsEvent = event.detail
    
    // Validate event data
    if (!analyticsEvent.eventType || !analyticsEvent.timestamp) {
      throw new Error('Invalid analytics event: missing required fields')
    }

    // Process the event
    await Promise.all([
      storeRawEvent(analyticsEvent),
      updateAggregates(analyticsEvent),
      updateRealTimeMetrics(analyticsEvent)
    ])

    console.log('Analytics event processed successfully')
  } catch (error) {
    console.error('Error processing analytics event:', error)
    throw error
  }
}

/**
 * Store raw analytics event for detailed analysis
 */
async function storeRawEvent(event: AnalyticsEvent): Promise<void> {
  const eventId = `${event.eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const item = {
    eventId,
    eventType: event.eventType,
    userId: event.userId,
    restaurantId: event.restaurantId,
    dishId: event.dishId,
    timestamp: event.timestamp,
    metadata: event.metadata,
    sessionId: event.sessionId,
    userAgent: event.userAgent,
    ipAddress: event.ipAddress,
    ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
  }

  await docClient.send(new PutCommand({
    TableName: ANALYTICS_TABLE,
    Item: item
  }))

  console.log('Raw event stored:', eventId)
}

/**
 * Update aggregated metrics
 */
async function updateAggregates(event: AnalyticsEvent): Promise<void> {
  const date = new Date(event.timestamp).toISOString().split('T')[0] // YYYY-MM-DD
  const hour = new Date(event.timestamp).getHours()
  
  // Update daily aggregates
  await updateDailyAggregates(date, event)
  
  // Update hourly aggregates
  await updateHourlyAggregates(date, hour, event)
  
  // Update entity-specific aggregates
  if (event.restaurantId) {
    await updateRestaurantAggregates(event.restaurantId, event)
  }
  
  if (event.dishId) {
    await updateDishAggregates(event.dishId, event)
  }
  
  if (event.userId) {
    await updateUserAggregates(event.userId, event)
  }
}

/**
 * Update daily aggregates
 */
async function updateDailyAggregates(date: string, event: AnalyticsEvent): Promise<void> {
  const aggregateId = `daily_${date}`
  
  const updateParams = {
    TableName: AGGREGATES_TABLE,
    Key: { aggregateId },
    UpdateExpression: `
      ADD totalEvents :inc, 
          eventsByType.#eventType :inc
      SET #date = :date,
          lastUpdated = :timestamp
    `,
    ExpressionAttributeNames: {
      '#eventType': event.eventType,
      '#date': 'date'
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':date': date,
      ':timestamp': event.timestamp
    }
  }

  // Add unique user tracking
  if (event.userId) {
    updateParams.UpdateExpression += ', uniqueUsers = if_not_exists(uniqueUsers, :emptySet)'
    updateParams.UpdateExpression += ' ADD uniqueUsers :userId'
    updateParams.ExpressionAttributeValues[':emptySet'] = new Set()
    updateParams.ExpressionAttributeValues[':userId'] = new Set([event.userId])
  }

  await docClient.send(new UpdateCommand(updateParams))
}

/**
 * Update hourly aggregates
 */
async function updateHourlyAggregates(date: string, hour: number, event: AnalyticsEvent): Promise<void> {
  const aggregateId = `hourly_${date}_${hour.toString().padStart(2, '0')}`
  
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: { aggregateId },
    UpdateExpression: `
      ADD totalEvents :inc,
          eventsByType.#eventType :inc
      SET #date = :date,
          #hour = :hour,
          lastUpdated = :timestamp
    `,
    ExpressionAttributeNames: {
      '#eventType': event.eventType,
      '#date': 'date',
      '#hour': 'hour'
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':date': date,
      ':hour': hour,
      ':timestamp': event.timestamp
    }
  }))
}

/**
 * Update restaurant-specific aggregates
 */
async function updateRestaurantAggregates(restaurantId: string, event: AnalyticsEvent): Promise<void> {
  const aggregateId = `restaurant_${restaurantId}`
  
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: { aggregateId },
    UpdateExpression: `
      ADD totalEvents :inc,
          eventsByType.#eventType :inc
      SET restaurantId = :restaurantId,
          lastUpdated = :timestamp
    `,
    ExpressionAttributeNames: {
      '#eventType': event.eventType
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':restaurantId': restaurantId,
      ':timestamp': event.timestamp
    }
  }))
}

/**
 * Update dish-specific aggregates
 */
async function updateDishAggregates(dishId: string, event: AnalyticsEvent): Promise<void> {
  const aggregateId = `dish_${dishId}`
  
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: { aggregateId },
    UpdateExpression: `
      ADD totalEvents :inc,
          eventsByType.#eventType :inc
      SET dishId = :dishId,
          lastUpdated = :timestamp
    `,
    ExpressionAttributeNames: {
      '#eventType': event.eventType
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':dishId': dishId,
      ':timestamp': event.timestamp
    }
  }))
}

/**
 * Update user-specific aggregates
 */
async function updateUserAggregates(userId: string, event: AnalyticsEvent): Promise<void> {
  const aggregateId = `user_${userId}`
  
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: { aggregateId },
    UpdateExpression: `
      ADD totalEvents :inc,
          eventsByType.#eventType :inc
      SET userId = :userId,
          lastUpdated = :timestamp
    `,
    ExpressionAttributeNames: {
      '#eventType': event.eventType
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':userId': userId,
      ':timestamp': event.timestamp
    }
  }))
}

/**
 * Update real-time metrics for dashboards
 */
async function updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
  const now = new Date()
  const currentMinute = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const aggregateId = `realtime_${now.toISOString().split('T')[0]}_${currentMinute}`
  
  await docClient.send(new UpdateCommand({
    TableName: AGGREGATES_TABLE,
    Key: { aggregateId },
    UpdateExpression: `
      ADD totalEvents :inc,
          eventsByType.#eventType :inc
      SET #timestamp = :timestamp,
          ttl = :ttl
    `,
    ExpressionAttributeNames: {
      '#eventType': event.eventType,
      '#timestamp': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':timestamp': event.timestamp,
      ':ttl': Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours TTL for real-time data
    }
  }))
}

/**
 * Get aggregated metrics for a date range
 */
export async function getAggregatedMetrics(
  startDate: string,
  endDate: string,
  aggregateType: 'daily' | 'hourly' = 'daily'
): Promise<AggregatedMetrics> {
  const results = await docClient.send(new QueryCommand({
    TableName: AGGREGATES_TABLE,
    KeyConditionExpression: 'aggregateId BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':start': `${aggregateType}_${startDate}`,
      ':end': `${aggregateType}_${endDate}Z`
    }
  }))

  // Aggregate the results
  const metrics: AggregatedMetrics = {
    totalEvents: 0,
    uniqueUsers: 0,
    topRestaurants: [],
    topDishes: [],
    eventsByType: {},
    hourlyDistribution: {}
  }

  results.Items?.forEach(item => {
    metrics.totalEvents += item.totalEvents || 0
    
    if (item.eventsByType) {
      Object.entries(item.eventsByType).forEach(([eventType, count]) => {
        metrics.eventsByType[eventType] = (metrics.eventsByType[eventType] || 0) + (count as number)
      })
    }
    
    if (item.uniqueUsers) {
      metrics.uniqueUsers += (item.uniqueUsers as Set<string>).size
    }
  })

  return metrics
}
