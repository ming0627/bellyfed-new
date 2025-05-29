import {
    ConditionalCheckFailedException,
    DynamoDBClient,
    ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { ExecuteStatementCommand, RDSDataClient, SqlParameter } from '@aws-sdk/client-rds-data';
import { SNSClient } from '@aws-sdk/client-sns';
import {
    BatchWriteCommand,
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    TransactWriteCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk';
import { AnalyticsEventDetail } from './types/event-types';

// Define legacy interface for BatchWriteParams to maintain compatibility
interface LegacyBatchWriteParams {
    tableName: string;
    items: Record<string, unknown>[];
    operation: 'put' | 'delete';
}

// Create and instrument AWS clients
const eventBridgeClient = captureAWSv3Client(new EventBridgeClient({}));
const dynamoClient = captureAWSv3Client(new DynamoDBClient({}));
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const rdsDataClient = captureAWSv3Client(new RDSDataClient({}));
const snsClient = captureAWSv3Client(new SNSClient({}));

// Error types
export class DynamoDBError extends Error {
    constructor(
        message: string,
        public readonly _cause?: Error
    ) {
        super(message);
        this.name = 'DynamoDBError';
    }
}

export class EventBridgeError extends Error {
    constructor(
        message: string,
        public readonly _cause?: Error
    ) {
        super(message);
        this.name = 'EventBridgeError';
    }
}

export class RDSError extends Error {
    constructor(
        message: string,
        public readonly _cause?: Error
    ) {
        super(message);
        this.name = 'RDSError';
    }
}

export interface EventData {
    eventType: string;
    source: string;
    detail: AnalyticsEventDetail | any;
    timestamp?: string;
    requestId?: string;
}

// Enhanced sendEvent with retries and better error handling
export const sendEvent = async (
    event: EventData,
    eventBusName: string,
    retries = 3
): Promise<void> => {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            const entry = {
                EventBusName: eventBusName,
                Source: event.source,
                DetailType: event.eventType,
                Detail: JSON.stringify({
                    ...event.detail,
                    timestamp: event.timestamp || new Date().toISOString(),
                    requestId: event.requestId,
                }),
                Time: new Date(),
            };

            await eventBridgeClient.send(new PutEventsCommand({ Entries: [entry] }));
            return;
        } catch (error: unknown) {
            lastError = error as Error;
            if (i === retries - 1) throw new EventBridgeError('Failed to send event', lastError);
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
        }
    }
};

// Legacy DynamoDB operations - kept for backward compatibility
// Will be replaced with RDS operations in future updates
export interface LegacyDynamoDBQueryParams {
    TableName: string;
    IndexName?: string;
    KeyConditionExpression: string;
    FilterExpression?: string;
    ExpressionAttributeValues: Record<string, unknown>;
    ExpressionAttributeNames?: Record<string, string>;
    Limit?: number;
    ScanIndexForward?: boolean;
    ExclusiveStartKey?: Record<string, unknown>;
    ProjectionExpression?: string;
    ConsistentRead?: boolean;
}

export interface LegacyTransactionItem {
    type: 'put' | 'update' | 'delete' | 'condition';
    tableName: string;
    key?: Record<string, unknown>;
    item?: Record<string, unknown>;
    conditionExpression?: string;
    updateExpression?: string;
    expressionAttributeValues?: Record<string, unknown>;
    expressionAttributeNames?: Record<string, string>;
}

// Comprehensive DynamoDB operations
export const dynamoOperations = {
    async get<T>(tableName: string, key: Record<string, unknown>): Promise<T | null> {
        try {
            const response = await docClient.send(
                new GetCommand({
                    TableName: tableName,
                    Key: key,
                })
            );
            return (response.Item as T) || null;
        } catch (error: unknown) {
            if (error instanceof ResourceNotFoundException) {
                return null;
            }
            throw new DynamoDBError('Failed to get item', error as Error);
        }
    },

    async query<T>(params: LegacyDynamoDBQueryParams): Promise<T[]> {
        try {
            const response = await docClient.send(
                new QueryCommand({
                    ...params,
                    TableName: params.TableName,
                    IndexName: params.IndexName,
                    KeyConditionExpression: params.KeyConditionExpression,
                    FilterExpression: params.FilterExpression,
                    ExpressionAttributeValues: params.ExpressionAttributeValues,
                    ExpressionAttributeNames: params.ExpressionAttributeNames,
                    Limit: params.Limit,
                    ScanIndexForward: params.ScanIndexForward,
                    ExclusiveStartKey: params.ExclusiveStartKey,
                    ProjectionExpression: params.ProjectionExpression,
                    ConsistentRead: params.ConsistentRead,
                })
            );
            return (response.Items || []) as T[];
        } catch (error: unknown) {
            throw new DynamoDBError('Failed to query items', error as Error);
        }
    },

    async put(
        tableName: string,
        item: Record<string, unknown>,
        conditionExpression?: string
    ): Promise<void> {
        try {
            await docClient.send(
                new PutCommand({
                    TableName: tableName,
                    Item: item,
                    ConditionExpression: conditionExpression,
                })
            );
        } catch (error: unknown) {
            if (error instanceof ConditionalCheckFailedException) {
                throw new DynamoDBError('Condition check failed for put operation', error);
            }
            throw new DynamoDBError('Failed to put item', error as Error);
        }
    },

    async update(
        tableName: string,
        key: Record<string, unknown>,
        updateExpression: string,
        expressionAttributeValues: Record<string, unknown>,
        conditionExpression?: string
    ): Promise<void> {
        try {
            await docClient.send(
                new UpdateCommand({
                    TableName: tableName,
                    Key: key,
                    UpdateExpression: updateExpression,
                    ExpressionAttributeValues: expressionAttributeValues,
                    ConditionExpression: conditionExpression,
                })
            );
        } catch (error: unknown) {
            if (error instanceof ConditionalCheckFailedException) {
                throw new DynamoDBError('Condition check failed for update operation', error);
            }
            throw new DynamoDBError('Failed to update item', error as Error);
        }
    },

    async delete(
        tableName: string,
        key: Record<string, unknown>,
        conditionExpression?: string
    ): Promise<void> {
        try {
            await docClient.send(
                new DeleteCommand({
                    TableName: tableName,
                    Key: key,
                    ConditionExpression: conditionExpression,
                })
            );
        } catch (error: unknown) {
            if (error instanceof ConditionalCheckFailedException) {
                throw new DynamoDBError('Condition check failed for delete operation', error);
            }
            throw new DynamoDBError('Failed to delete item', error as Error);
        }
    },

    async batchWrite(params: LegacyBatchWriteParams): Promise<void> {
        try {
            const { tableName, items, operation } = params;
            const dynamoOperation = operation === 'delete' ? 'Delete' : 'Put';

            // Split items into chunks of 25 (DynamoDB BatchWrite limit)
            const itemChunks = [];
            for (let i = 0; i < items.length; i += 25) {
                itemChunks.push(items.slice(i, i + 25));
            }

            for (const chunk of itemChunks) {
                const batchParams = {
                    RequestItems: {
                        [tableName]: chunk.map((item: Record<string, unknown>) => {
                            if (dynamoOperation === 'Delete') {
                                return { DeleteRequest: { Key: item } };
                            }
                            return { PutRequest: { Item: item } };
                        }),
                    },
                };

                await docClient.send(new BatchWriteCommand(batchParams));
            }
        } catch (error: unknown) {
            throw new DynamoDBError('Failed to perform batch write operation', error as Error);
        }
    },

    async transactWrite(items: LegacyTransactionItem[]): Promise<void> {
        try {
            const transactItems = items.map((item) => {
                switch (item.type) {
                    case 'put':
                        return {
                            Put: {
                                TableName: item.tableName,
                                Item: item.item!,
                                ConditionExpression: item.conditionExpression,
                            },
                        };
                    case 'update':
                        return {
                            Update: {
                                TableName: item.tableName,
                                Key: item.key!,
                                UpdateExpression: item.updateExpression,
                                ConditionExpression: item.conditionExpression,
                                ExpressionAttributeValues: item.expressionAttributeValues,
                                ExpressionAttributeNames: item.expressionAttributeNames,
                            },
                        };
                    case 'delete':
                        return {
                            Delete: {
                                TableName: item.tableName,
                                Key: item.key!,
                                ConditionExpression: item.conditionExpression,
                            },
                        };
                    case 'condition':
                        return {
                            ConditionCheck: {
                                TableName: item.tableName,
                                Key: item.key!,
                                ConditionExpression: item.conditionExpression,
                            },
                        };
                    default:
                        throw new Error(`Unsupported transaction type: ${item.type}`);
                }
            });

            await docClient.send(
                new TransactWriteCommand({
                    TransactItems: transactItems,
                })
            );
        } catch (error: unknown) {
            throw new DynamoDBError('Failed to perform transaction', error as Error);
        }
    },
};

// Parameter types for RDS operations
export interface RDSQueryParams {
    resourceArn: string;
    secretArn: string;
    sql: string;
    parameters?: SqlParameter[];
    database?: string;
    schema?: string;
    transactionId?: string;
}

export interface RDSTransaction {
    resourceArn: string;
    secretArn: string;
    database?: string;
    schema?: string;
}

// RDS Data API operations
export const rdsOperations = {
    async executeQuery<T>(params: RDSQueryParams): Promise<T[]> {
        try {
            const response = await rdsDataClient.send(
                new ExecuteStatementCommand({
                    resourceArn: params.resourceArn,
                    secretArn: params.secretArn,
                    sql: params.sql,
                    parameters: params.parameters,
                    database: params.database,
                    schema: params.schema,
                    transactionId: params.transactionId,
                    includeResultMetadata: true,
                })
            );

            if (!response.records) {
                return [] as T[];
            }

            // Convert RDS Data API records to objects
            const records = response.records;
            const columnMetadata = response.columnMetadata || [];

            return records.map((record) => {
                const item: Record<string, unknown> = {};
                record.forEach((field, index) => {
                    const columnName = columnMetadata[index]?.name || `column${index}`;

                    // Extract the field value based on its data type
                    let value = null;
                    if (field.stringValue !== undefined) value = field.stringValue;
                    else if (field.longValue !== undefined) value = field.longValue;
                    else if (field.doubleValue !== undefined) value = field.doubleValue;
                    else if (field.booleanValue !== undefined) value = field.booleanValue;
                    else if (field.blobValue !== undefined) value = field.blobValue;
                    else if (field.isNull !== undefined && field.isNull) value = null;

                    item[columnName] = value;
                });
                return item as T;
            });
        } catch (error: unknown) {
            throw new RDSError(`Failed to execute query: ${params.sql}`, error as Error);
        }
    },

    async executeStatement(params: RDSQueryParams): Promise<number> {
        try {
            const response = await rdsDataClient.send(
                new ExecuteStatementCommand({
                    resourceArn: params.resourceArn,
                    secretArn: params.secretArn,
                    sql: params.sql,
                    parameters: params.parameters,
                    database: params.database,
                    schema: params.schema,
                    transactionId: params.transactionId,
                })
            );

            return response.numberOfRecordsUpdated || 0;
        } catch (error: unknown) {
            throw new RDSError(`Failed to execute statement: ${params.sql}`, error as Error);
        }
    },

    // Helper functions for common operations
    async findById<T>(
        params: RDSQueryParams & {
            tableName: string;
            idColumn: string;
            id: string | number;
        }
    ): Promise<T | null> {
        const sql = `SELECT * FROM ${params.tableName} WHERE ${params.idColumn} = :id`;
        const parameters = [{ name: 'id', value: { stringValue: String(params.id) } }];

        const results = await this.executeQuery<T>({
            ...params,
            sql,
            parameters,
        });

        return results.length > 0 ? results[0] : null;
    },

    async insert(
        params: RDSQueryParams & {
            tableName: string;
            item: Record<string, unknown>;
        }
    ): Promise<number> {
        const columns = Object.keys(params.item);
        const placeholders = columns.map((col) => `:${col}`).join(', ');
        const sql = `INSERT INTO ${params.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

        const parameters = Object.entries(params.item).map(([key, value]) => ({
            name: key,
            value: this.convertToSqlParameter(value),
        }));

        return this.executeStatement({
            ...params,
            sql,
            parameters,
        });
    },

    async update(
        params: RDSQueryParams & {
            tableName: string;
            item: Record<string, unknown>;
            idColumn: string;
        }
    ): Promise<number> {
        const idValue = params.item[params.idColumn];
        if (!idValue) {
            throw new RDSError(`ID column ${params.idColumn} not found in item`);
        }

        const setExpressions = Object.keys(params.item)
            .filter((key) => key !== params.idColumn)
            .map((key) => `${key} = :${key}`)
            .join(', ');

        const sql = `UPDATE ${params.tableName} SET ${setExpressions} WHERE ${params.idColumn} = :${params.idColumn}`;

        const parameters = Object.entries(params.item).map(([key, value]) => ({
            name: key,
            value: this.convertToSqlParameter(value),
        }));

        return this.executeStatement({
            ...params,
            sql,
            parameters,
        });
    },

    async delete(
        params: RDSQueryParams & {
            tableName: string;
            idColumn: string;
            id: string | number;
        }
    ): Promise<number> {
        const sql = `DELETE FROM ${params.tableName} WHERE ${params.idColumn} = :id`;
        const parameters = [{ name: 'id', value: { stringValue: String(params.id) } }];

        return this.executeStatement({
            ...params,
            sql,
            parameters,
        });
    },

    // Helper to convert JS values to SQL parameter values
    convertToSqlParameter(value: unknown): SqlParameter['value'] {
        if (value === null || value === undefined) {
            return { isNull: true };
        } else if (typeof value === 'string') {
            return { stringValue: value };
        } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                return { longValue: value };
            } else {
                return { doubleValue: value };
            }
        } else if (typeof value === 'boolean') {
            return { booleanValue: value };
        } else if (value instanceof Buffer || value instanceof Uint8Array) {
            return { blobValue: value };
        } else if (value instanceof Date) {
            return { stringValue: value.toISOString() };
        } else if (typeof value === 'object') {
            return { stringValue: JSON.stringify(value) };
        }

        // Default to string conversion for other types
        return { stringValue: String(value) };
    },
};

export { docClient, eventBridgeClient, rdsDataClient, snsClient };
