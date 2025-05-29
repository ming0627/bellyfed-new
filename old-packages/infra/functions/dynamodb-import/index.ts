import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { FUNCTION_CONFIG } from './config.js';
import { ImportEvent, StandardEvent } from './types.js';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const eventBridgeClient = new EventBridgeClient({});
const cloudWatchClient = new CloudWatchClient({});

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;

// Use centralized configuration
const { BATCH_SIZE, MAX_RETRIES, RETRY_DELAY_MS, ALLOWED_TABLES, CLOUDWATCH_NAMESPACE } =
    FUNCTION_CONFIG;

if (!EVENT_BUS_NAME) {
    throw new Error('EVENT_BUS_NAME environment variable is not set');
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function publishMetrics(metricName: string, value: number, table: string): Promise<void> {
    try {
        await cloudWatchClient.send(
            new PutMetricDataCommand({
                Namespace: CLOUDWATCH_NAMESPACE,
                MetricData: [
                    {
                        MetricName: metricName,
                        Value: value,
                        Unit: 'Count',
                        Dimensions: [
                            {
                                Name: 'Table',
                                Value: table,
                            },
                        ],
                        Timestamp: new Date(),
                    },
                ],
            })
        );
    } catch (error: unknown) {
        console.error('Error publishing metrics:', error);
        // Don't throw error for metrics publishing
    }
}

async function sendEventToEventBridge(event: StandardEvent): Promise<void> {
    try {
        await eventBridgeClient.send(
            new PutEventsCommand({
                Entries: [
                    {
                        EventBusName: EVENT_BUS_NAME,
                        Detail: JSON.stringify(event),
                        DetailType: event.event_type,
                        Source: event.source,
                        Time: new Date(event.timestamp),
                    },
                ],
            })
        );
    } catch (error: unknown) {
        console.error('Error sending event to EventBridge:', error);
        // Don't throw error for event publishing
    }
}

async function processBatch(
    items: any[],
    table: string,
    batchId: string,
    traceId: string,
    correlationId: string,
    retryCount = 0
): Promise<{ successCount: number; failureCount: number }> {
    if (retryCount >= MAX_RETRIES) {
        console.error(`Max retries (${MAX_RETRIES}) reached for batch ${batchId}`);
        return { successCount: 0, failureCount: items.length };
    }

    const writeRequests = items.map((item) => ({
        PutRequest: {
            Item: {
                ...item,
                updatedAt: new Date().toISOString(),
                importId: correlationId,
                batchId,
            },
        },
    }));

    const params = {
        RequestItems: {
            [table]: writeRequests,
        },
    };

    try {
        const result = await docClient.send(new BatchWriteCommand(params));
        const unprocessedItems = result.UnprocessedItems?.[table]?.length || 0;
        const successCount = items.length - unprocessedItems;
        const failureCount = unprocessedItems;

        // If there are unprocessed items, wait and retry
        if (unprocessedItems > 0 && result.UnprocessedItems) {
            console.log(
                `Retrying ${unprocessedItems} items for batch ${batchId}, attempt ${retryCount + 1}`
            );
            await sleep(RETRY_DELAY_MS * Math.pow(2, retryCount));

            const retryResult = await processBatch(
                result.UnprocessedItems[table].map((req) => (req.PutRequest as any).Item),
                table,
                batchId,
                traceId,
                correlationId,
                retryCount + 1
            );

            return {
                successCount: successCount + retryResult.successCount,
                failureCount: retryResult.failureCount,
            };
        }

        return { successCount, failureCount };
    } catch (error: unknown) {
        console.error(`Error in processBatch (attempt ${retryCount + 1}):`, error);

        // If error is retryable, attempt retry
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying entire batch ${batchId}, attempt ${retryCount + 1}`);
            await sleep(RETRY_DELAY_MS * Math.pow(2, retryCount));
            return processBatch(items, table, batchId, traceId, correlationId, retryCount + 1);
        }

        return { successCount: 0, failureCount: items.length };
    }
}

export const handler: Handler = async (event: ImportEvent) => {
    const { table, items, batchId } = event.detail.payload;
    const importId = event.detail.correlation_id || uuidv4();
    const { trace_id: traceId } = event.detail;

    console.log(`Starting import for table ${table}, batch ${batchId}, importId ${importId}`);

    try {
        if (!ALLOWED_TABLES.includes(table)) {
            throw new Error(
                `Invalid table name: ${table}. Must be one of: ${ALLOWED_TABLES.join(', ')}`
            );
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items must be a non-empty array');
        }

        let totalSuccessCount = 0;
        let totalFailureCount = 0;
        const totalItems = items.length;

        // Process items in batches of BATCH_SIZE
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batchItems = items.slice(i, i + BATCH_SIZE);
            console.log(
                `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(items.length / BATCH_SIZE)}`
            );

            const { successCount, failureCount } = await processBatch(
                batchItems,
                table,
                batchId,
                traceId,
                importId
            );

            totalSuccessCount += successCount;
            totalFailureCount += failureCount;

            // Send progress event
            const progressEvent: StandardEvent = {
                event_id: uuidv4(),
                event_type: 'RESTAURANT_IMPORT_PROGRESS',
                trace_id: traceId,
                correlation_id: importId,
                timestamp: new Date().toISOString(),
                source: 'dynamodb-import',
                version: '1.0',
                status: 'PENDING',
                payload: {
                    operation: 'CREATE',
                    table,
                    batchId,
                    importId,
                    successCount: totalSuccessCount,
                    failureCount: totalFailureCount,
                    remainingItems: totalItems - (i + BATCH_SIZE),
                },
            };
            await sendEventToEventBridge(progressEvent);
        }

        // Publish metrics
        await publishMetrics('ImportSuccess', totalSuccessCount, table);
        if (totalFailureCount > 0) {
            await publishMetrics('ImportFailure', totalFailureCount, table);
        }

        // Send final event
        const finalEvent: StandardEvent = {
            event_id: uuidv4(),
            event_type: 'RESTAURANT_IMPORT_COMPLETED',
            trace_id: traceId,
            correlation_id: importId,
            timestamp: new Date().toISOString(),
            source: 'dynamodb-import',
            version: '1.0',
            status: totalFailureCount === 0 ? 'SUCCESS' : 'FAILED',
            payload: {
                operation: 'CREATE',
                table,
                batchId,
                importId,
                successCount: totalSuccessCount,
                failureCount: totalFailureCount,
                totalItems,
            },
        };
        await sendEventToEventBridge(finalEvent);

        console.log(
            `Import completed: ${totalSuccessCount} succeeded, ${totalFailureCount} failed`
        );

        if (totalFailureCount > 0) {
            throw new Error(
                `Import completed with ${totalFailureCount} failures out of ${totalItems} items`
            );
        }

        // Report metrics for the import operation using centralized configuration
        console.log(`Reporting metrics for the import operation`);
        await cloudWatchClient.send(
            new PutMetricDataCommand({
                Namespace: CLOUDWATCH_NAMESPACE,
                MetricData: [
                    {
                        MetricName: 'TotalRecordsImported',
                        Value: totalItems,
                        Unit: 'Count',
                    },
                    {
                        MetricName: 'ImportLatency',
                        Value: 0, // Assuming latency is not available in the current code
                        Unit: 'Milliseconds',
                    },
                ],
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Import completed successfully',
                importId,
                batchId,
                totalItems,
                successCount: totalSuccessCount,
                failureCount: totalFailureCount,
            }),
        };
    } catch (error: unknown) {
        console.error('Error in handler:', error);

        // Publish failure metric
        await publishMetrics('ImportFailure', items.length, table);

        // Send failure event
        const failureEvent: StandardEvent = {
            event_id: uuidv4(),
            event_type: 'RESTAURANT_IMPORT_FAILED',
            trace_id: traceId,
            correlation_id: importId,
            timestamp: new Date().toISOString(),
            source: 'dynamodb-import',
            version: '1.0',
            status: 'FAILED',
            payload: {
                operation: 'CREATE',
                table,
                batchId,
                importId,
                error: error instanceof Error ? error.message : 'Unknown error',
                totalItems: items.length,
            },
        };
        await sendEventToEventBridge(failureEvent);

        throw error; // Re-throw to trigger Lambda retry
    }
};
