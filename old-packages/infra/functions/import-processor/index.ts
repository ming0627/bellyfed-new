import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    BatchWriteCommand,
    BatchWriteCommandInput,
    DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { SQSEvent, SQSRecord } from 'aws-lambda';

// Constants
const BATCH_SIZE = 25;
const DEFAULT_RANKING = { category: 'GENERAL', totalScore: 0, reviewCount: 0 };

// Define interfaces
interface ImportMessage {
    type: string;
    payload: RestaurantData;
    source?: string;
    timestamp?: string;
}

interface RestaurantData {
    id: string;
    name: string;
    rating?: {
        category: string;
        totalScore: number;
        reviewCount: number;
    };
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Lambda handler for processing SQS import events
 * @param event SQS event containing restaurant data
 */
export const handler = async (event: SQSEvent): Promise<{ statusCode: number; body: string }> => {
    console.log('Processing SQS batch of size:', event.Records.length);

    try {
        await Promise.all(event.Records.map(processRecord));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Import processed successfully' }),
        };
    } catch (error: unknown) {
        console.error('Error processing import:', error);
        throw error;
    }
};

/**
 * Process a single SQS record
 * @param record SQS record containing restaurant data
 */
async function processRecord(record: SQSRecord): Promise<void> {
    console.log('Processing record:', record.messageId);

    try {
        const message = validateMessage(record);
        const tableName = getTableName();

        await processImport({
            table: tableName,
            items: [message.payload],
        });

        console.log('Successfully processed record:', record.messageId);
    } catch (error: unknown) {
        console.error('Error processing record:', record.messageId, error);
        throw error;
    }
}

/**
 * Validate and parse SQS message
 * @param record SQS record to validate
 * @returns Parsed message data
 */
function validateMessage(record: SQSRecord): ImportMessage {
    const message = JSON.parse(record.body);

    if (!message.type || !message.payload) {
        throw new Error('Invalid message format - missing type or payload');
    }

    if (message.type !== 'restaurant') {
        throw new Error('Skipping non-restaurant import event');
    }

    return message;
}

/**
 * Get DynamoDB table name from environment
 * @returns Table name
 */
function getTableName(): string {
    const tableName = process.env.ESTABLISHMENTS_TABLE;
    if (!tableName) {
        throw new Error('ESTABLISHMENTS_TABLE environment variable is not set');
    }
    return tableName;
}

/**
 * Process import data by writing to DynamoDB
 * @param data Import data containing table name and items
 */
async function processImport(data: { table: string; items: RestaurantData[] }): Promise<void> {
    const { table, items } = data;

    if (!table || !items || !Array.isArray(items)) {
        throw new Error('Invalid import data format');
    }

    // Process items in batches
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        await writeBatchToDynamoDB(table, batch);
    }
}

/**
 * Write a batch of items to DynamoDB
 * @param table Table name
 * @param batch Items to write
 */
async function writeBatchToDynamoDB(table: string, batch: RestaurantData[]): Promise<void> {
    const formattedBatch = batch.map(formatItemForDynamoDB);

    const batchWriteParams: BatchWriteCommandInput = {
        RequestItems: {
            [table]: formattedBatch.map((item) => ({
                PutRequest: { Item: item },
            })),
        },
    };

    try {
        console.log(`Writing batch of ${batch.length} items to ${table}`);
        await docClient.send(new BatchWriteCommand(batchWriteParams));
        console.log('Batch write successful');
    } catch (error: unknown) {
        console.error('Error writing batch:', error);
        throw error;
    }
}

/**
 * Format an item for DynamoDB storage
 * @param item Restaurant data to format
 * @returns Formatted item
 */
function formatItemForDynamoDB(item: RestaurantData): RestaurantData {
    // Ensure required fields are present
    if (!item.id || !item.name) {
        throw new Error('Item missing required fields: id, name');
    }

    return {
        ...item,
        rating: item.rating || DEFAULT_RANKING,
        images: Array.isArray(item.images) ? item.images : [],
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
    };
}
