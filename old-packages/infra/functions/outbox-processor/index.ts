/**
 * Outbox Processor Lambda Function
 *
 * This Lambda function processes outbox events from the database and publishes them to EventBridge.
 * It implements the outbox pattern for reliable event delivery from Next.js Server Actions to AWS.
 */

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const eventBridgeClient = new EventBridgeClient({});
const secretsClient = new SecretsManagerClient({});
const rdsDataClient = new RDSDataClient({});

// Environment variables
const DB_SECRET_ARN = process.env.DB_SECRET_ARN;
const DB_CLUSTER_ARN = process.env.DB_CLUSTER_ARN;
const DB_NAME = process.env.DB_NAME;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'default';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');

// Event source mapping for different event types
const EVENT_SOURCE_MAPPING: Record<string, string> = {
    IMPORT_JOB_CREATED: 'bellyfed.import',
    IMPORT_JOB_UPDATED: 'bellyfed.import',
    IMPORT_JOB_COMPLETED: 'bellyfed.import',
    IMPORT_JOB_FAILED: 'bellyfed.import',
    IMPORT_BATCH_CREATED: 'bellyfed.import',
    IMPORT_BATCH_COMPLETED: 'bellyfed.import',
    IMPORT_BATCH_FAILED: 'bellyfed.import',
    RESTAURANT_IMPORTED: 'bellyfed.import',
    DISH_IMPORTED: 'bellyfed.import',
};

// Interface for outbox events
interface OutboxEvent {
    id: string;
    aggregateId: string;
    eventType: string;
    payload: string;
    status: string;
    createdAt: string;
}

/**
 * Lambda handler function
 */
export const handler = async (event: any, context: Context) => {
    console.log('Starting outbox processor with request ID:', context.awsRequestId);

    try {
        // Get database credentials
        const dbCredentials = await getDbCredentials();

        // Get pending outbox events
        const pendingEvents = await getPendingOutboxEvents(dbCredentials);
        console.log(`Found ${pendingEvents.length} pending outbox events`);

        if (pendingEvents.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'No pending outbox events found' }),
            };
        }

        // Process events in batches
        const results = [];
        for (let i = 0; i < pendingEvents.length; i += BATCH_SIZE) {
            const batch = pendingEvents.slice(i, i + BATCH_SIZE);
            const batchResults = await processBatch(batch, dbCredentials);
            results.push(...batchResults);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Outbox events processed',
                processed: results.length,
                results,
            }),
        };
    } catch (error) {
        console.error('Error processing outbox events:', error);
        throw error;
    }
};

/**
 * Get database credentials from Secrets Manager
 */
async function getDbCredentials() {
    if (!DB_SECRET_ARN) {
        throw new Error('DB_SECRET_ARN environment variable is required');
    }

    const command = new GetSecretValueCommand({
        SecretId: DB_SECRET_ARN,
    });

    const response = await secretsClient.send(command);

    if (!response.SecretString) {
        throw new Error('Failed to retrieve database credentials');
    }

    return JSON.parse(response.SecretString);
}

/**
 * Get pending outbox events from the database
 */
async function getPendingOutboxEvents(_dbCredentials: any) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    const sql = `
    SELECT id, aggregate_id, event_type, payload, status, created_at
    FROM outbox_events
    WHERE status = 'PENDING'
    ORDER BY created_at ASC
    LIMIT :limit
  `;

    const params = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql,
        parameters: [{ name: 'limit', value: { longValue: BATCH_SIZE } }],
    };

    const command = new ExecuteStatementCommand(params);
    const result = await rdsDataClient.send(command);

    return parseQueryResult(result);
}

/**
 * Parse query result into OutboxEvent objects
 */
function parseQueryResult(result: any): OutboxEvent[] {
    if (!result.records) {
        return [];
    }

    return result.records.map((record: any) => {
        return {
            id: record[0].stringValue,
            aggregateId: record[1].stringValue,
            eventType: record[2].stringValue,
            payload: record[3].stringValue,
            status: record[4].stringValue,
            createdAt: record[5].stringValue,
        };
    });
}

/**
 * Process a batch of outbox events
 */
async function processBatch(events: OutboxEvent[], _dbCredentials: any) {
    const results = [];

    for (const event of events) {
        try {
            // Mark event as processing
            await updateEventStatus(event.id, 'PROCESSING');

            // Send event to EventBridge
            await sendToEventBridge(event);

            // Mark event as processed
            await updateEventStatus(event.id, 'PROCESSED');

            results.push({
                eventId: event.id,
                status: 'PROCESSED',
            });
        } catch (error) {
            console.error(`Error processing event ${event.id}:`, error);

            // Mark event as failed
            await updateEventStatus(event.id, 'FAILED');

            results.push({
                eventId: event.id,
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}

/**
 * Update outbox event status in the database
 */
async function updateEventStatus(eventId: string, status: string) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    const now = new Date().toISOString();
    let sql = `
    UPDATE outbox_events
    SET status = :status, updated_at = :updatedAt
  `;

    const parameters = [
        { name: 'status', value: { stringValue: status } },
        { name: 'updatedAt', value: { stringValue: now } },
        { name: 'id', value: { stringValue: eventId } },
    ];

    if (status === 'PROCESSED') {
        sql += `, processed_at = :processedAt`;
        parameters.push({ name: 'processedAt', value: { stringValue: now } });
    }

    sql += ` WHERE id = :id`;

    const params = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql,
        parameters,
    };

    const command = new ExecuteStatementCommand(params);
    await rdsDataClient.send(command);
}

/**
 * Send event to EventBridge
 */
async function sendToEventBridge(event: OutboxEvent) {
    const payload = JSON.parse(event.payload);
    const source = EVENT_SOURCE_MAPPING[event.eventType] || 'bellyfed.default';

    const command = new PutEventsCommand({
        Entries: [
            {
                EventBusName: EVENT_BUS_NAME,
                Source: source,
                DetailType: event.eventType,
                Detail: JSON.stringify({
                    ...payload,
                    metadata: {
                        outboxEventId: event.id,
                        aggregateId: event.aggregateId,
                        timestamp: event.createdAt,
                        traceId: uuidv4(),
                    },
                }),
            },
        ],
    });

    const result = await eventBridgeClient.send(command);

    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        throw new Error(`Failed to send event to EventBridge: ${JSON.stringify(result.Entries)}`);
    }

    return result;
}
