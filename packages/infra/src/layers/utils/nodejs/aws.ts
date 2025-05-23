/**
 * AWS utilities for Lambda functions
 * This module provides utilities for interacting with AWS services
 */

import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { ExecuteStatementCommand, RDSDataClient, SqlParameter } from '@aws-sdk/client-rds-data';
// import { SNSClient } from '@aws-sdk/client-sns';
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

/**
 * Create AWS clients
 */
export const createClients = () => {
  // Create AWS clients
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);
  const eventBridgeClient = new EventBridgeClient({});
  const rdsDataClient = new RDSDataClient({});

  return {
    dynamoClient,
    docClient,
    eventBridgeClient,
    rdsDataClient,
  };
};

// Create default clients
const { docClient, eventBridgeClient, rdsDataClient } = createClients();

/**
 * DynamoDB error class
 */
export class DynamoDBError extends Error {
  /**
   * Create a new DynamoDB error
   * @param message Error message
   * @param _cause Underlying cause
   */
  constructor(
    message: string,
    public readonly _cause?: Error
  ) {
    super(message);
    this.name = 'DynamoDBError';

    // This is needed to make instanceof work correctly with TypeScript
    Object.setPrototypeOf(this, DynamoDBError.prototype);
  }
}

/**
 * EventBridge error class
 */
export class EventBridgeError extends Error {
  /**
   * Create a new EventBridge error
   * @param message Error message
   * @param _cause Underlying cause
   */
  constructor(
    message: string,
    public readonly _cause?: Error
  ) {
    super(message);
    this.name = 'EventBridgeError';

    // This is needed to make instanceof work correctly with TypeScript
    Object.setPrototypeOf(this, EventBridgeError.prototype);
  }
}

/**
 * RDS error class
 */
export class RDSError extends Error {
  /**
   * Create a new RDS error
   * @param message Error message
   * @param _cause Underlying cause
   */
  constructor(
    message: string,
    public readonly _cause?: Error
  ) {
    super(message);
    this.name = 'RDSError';

    // This is needed to make instanceof work correctly with TypeScript
    Object.setPrototypeOf(this, RDSError.prototype);
  }
}

/**
 * Event data interface
 */
export interface EventData {
  /**
   * Event type
   */
  eventType: string;

  /**
   * Event source
   */
  source: string;

  /**
   * Event detail
   */
  detail: any;

  /**
   * Event timestamp (ISO 8601 format)
   */
  timestamp?: string;

  /**
   * Request ID for tracing
   */
  requestId?: string;
}

/**
 * Send an event to EventBridge
 * @param event Event data
 * @param eventBusName EventBridge event bus name
 * @param retries Number of retries
 * @returns Promise that resolves when the event is sent
 */
export const sendEvent = async (
  event: EventData,
  eventBusName: string,
  retries = 3
): Promise<void> => {
  let lastError: Error | undefined;

  // Retry logic
  for (let i = 0; i < retries; i++) {
    try {
      // Create event entry
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

      // Send event
      const result = await eventBridgeClient.send(new PutEventsCommand({ Entries: [entry] }));

      // Check for failed entries
      if (result.FailedEntryCount && result.FailedEntryCount > 0) {
        throw new EventBridgeError('Failed to send event to EventBridge');
      }

      return;
    } catch (error: unknown) {
      lastError = error as Error;

      // If this is the last retry, throw the error
      if (i === retries - 1) {
        throw new EventBridgeError('Failed to send event', lastError);
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
};

/**
 * DynamoDB query parameters interface
 */
export interface DynamoDBQueryParams {
  /**
   * Table name
   */
  TableName: string;

  /**
   * Index name
   */
  IndexName?: string;

  /**
   * Key condition expression
   */
  KeyConditionExpression: string;

  /**
   * Filter expression
   */
  FilterExpression?: string;

  /**
   * Expression attribute values
   */
  ExpressionAttributeValues: Record<string, unknown>;

  /**
   * Expression attribute names
   */
  ExpressionAttributeNames?: Record<string, string>;

  /**
   * Maximum number of items to return
   */
  Limit?: number;

  /**
   * Whether to scan forward
   */
  ScanIndexForward?: boolean;

  /**
   * Exclusive start key for pagination
   */
  ExclusiveStartKey?: Record<string, unknown>;

  /**
   * Projection expression
   */
  ProjectionExpression?: string;

  /**
   * Whether to use consistent read
   */
  ConsistentRead?: boolean;
}

/**
 * DynamoDB batch write parameters interface
 */
export interface BatchWriteParams {
  /**
   * Table name
   */
  tableName: string;

  /**
   * Items to write
   */
  items: Record<string, unknown>[];

  /**
   * Operation type
   */
  operation: 'put' | 'delete';
}

/**
 * DynamoDB transaction item interface
 */
export interface TransactionItem {
  /**
   * Transaction type
   */
  type: 'put' | 'update' | 'delete' | 'condition';

  /**
   * Table name
   */
  tableName: string;

  /**
   * Item key
   */
  key?: Record<string, unknown>;

  /**
   * Item to put
   */
  item?: Record<string, unknown>;

  /**
   * Condition expression
   */
  conditionExpression?: string;

  /**
   * Update expression
   */
  updateExpression?: string;

  /**
   * Expression attribute values
   */
  expressionAttributeValues?: Record<string, unknown>;

  /**
   * Expression attribute names
   */
  expressionAttributeNames?: Record<string, string>;
}

/**
 * DynamoDB operations
 */
export const dynamoOperations = {
  /**
   * Get an item from DynamoDB
   * @param tableName Table name
   * @param key Item key
   * @returns Item or null if not found
   */
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

  /**
   * Query items from DynamoDB
   * @param params Query parameters
   * @returns Array of items
   */
  async query<T>(params: DynamoDBQueryParams): Promise<T[]> {
    try {
      const response = await docClient.send(new QueryCommand(params));
      return (response.Items || []) as T[];
    } catch (error: unknown) {
      throw new DynamoDBError('Failed to query items', error as Error);
    }
  },

  /**
   * Put an item in DynamoDB
   * @param tableName Table name
   * @param item Item to put
   * @param conditionExpression Condition expression
   * @returns Promise that resolves when the item is put
   */
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

  /**
   * Update an item in DynamoDB
   * @param tableName Table name
   * @param key Item key
   * @param updateExpression Update expression
   * @param expressionAttributeValues Expression attribute values
   * @param conditionExpression Condition expression
   * @returns Promise that resolves when the item is updated
   */
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

  /**
   * Delete an item from DynamoDB
   * @param tableName Table name
   * @param key Item key
   * @param conditionExpression Condition expression
   * @returns Promise that resolves when the item is deleted
   */
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

  /**
   * Batch write items to DynamoDB
   * @param params Batch write parameters
   * @returns Promise that resolves when the items are written
   */
  async batchWrite(params: BatchWriteParams[]): Promise<void> {
    try {
      // Create request items object
      const requestItems: Record<string, any[]> = {};

      // Process each batch write parameter
      params.forEach(param => {
        // Create batch requests for this table
        const batchRequests = param.items.map(item => {
          if (param.operation === 'put') {
            return {
              PutRequest: {
                Item: item,
              },
            };
          } else {
            return {
              DeleteRequest: {
                Key: item,
              },
            };
          }
        });

        // Add batch requests to request items
        if (!requestItems[param.tableName]) {
          requestItems[param.tableName] = [];
        }

        // Now we can safely push to the array
        const tableItems = requestItems[param.tableName];
        if (tableItems) {
          tableItems.push(...batchRequests);
        }
      });

      // Send batch write command
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: requestItems,
        })
      );
    } catch (error: unknown) {
      throw new DynamoDBError('Failed to batch write items', error as Error);
    }
  },

  /**
   * Execute a transaction in DynamoDB
   * @param items Transaction items
   * @returns Promise that resolves when the transaction is executed
   */
  async executeTransaction(items: TransactionItem[]): Promise<void> {
    try {
      // Create transaction items
      const transactItems = items.map(item => {
        if (item.type === 'put') {
          return {
            Put: {
              TableName: item.tableName,
              Item: item.item,
              ConditionExpression: item.conditionExpression,
            },
          };
        } else if (item.type === 'update') {
          return {
            Update: {
              TableName: item.tableName,
              Key: item.key,
              UpdateExpression: item.updateExpression,
              ConditionExpression: item.conditionExpression,
              ExpressionAttributeValues: item.expressionAttributeValues,
              ExpressionAttributeNames: item.expressionAttributeNames,
            },
          };
        } else if (item.type === 'delete') {
          return {
            Delete: {
              TableName: item.tableName,
              Key: item.key,
              ConditionExpression: item.conditionExpression,
            },
          };
        } else if (item.type === 'condition') {
          return {
            ConditionCheck: {
              TableName: item.tableName,
              Key: item.key,
              ConditionExpression: item.conditionExpression,
              ExpressionAttributeValues: item.expressionAttributeValues,
              ExpressionAttributeNames: item.expressionAttributeNames,
            },
          };
        }

        throw new Error(`Invalid transaction item type: ${item.type}`);
      });

      // Send transaction command
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        })
      );
    } catch (error: unknown) {
      throw new DynamoDBError('Failed to execute transaction', error as Error);
    }
  },
};

/**
 * RDS operations
 */
export const rdsOperations = {
  /**
   * Execute a SQL statement
   * @param resourceArn RDS resource ARN
   * @param secretArn Secrets Manager ARN
   * @param sql SQL statement
   * @param parameters SQL parameters
   * @returns Query result
   */
  async executeStatement(
    resourceArn: string,
    secretArn: string,
    sql: string,
    parameters?: SqlParameter[]
  ): Promise<any> {
    try {
      const response = await rdsDataClient.send(
        new ExecuteStatementCommand({
          resourceArn,
          secretArn,
          sql,
          parameters,
        })
      );

      return response;
    } catch (error: unknown) {
      throw new RDSError('Failed to execute SQL statement', error as Error);
    }
  },
};
