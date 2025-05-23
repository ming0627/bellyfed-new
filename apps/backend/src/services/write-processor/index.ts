/**
 * Write Processor Service
 * 
 * This service processes write operations to DynamoDB:
 * - Write (Put) operations
 * - Update operations
 * - Delete operations
 * 
 * The service uses AWS SDK v3 for DynamoDB operations.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB clients
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Define write data interface
export interface WriteData {
  table: string;
  item?: Record<string, unknown>;
  key?: Record<string, unknown>;
  updateExpression?: string;
  expressionAttributeValues?: Record<string, unknown>;
  expressionAttributeNames?: Record<string, string>;
}

// Define SQS record interface
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

// Define SQS event interface
export interface SQSEvent {
  Records: SQSRecord[];
}

/**
 * Process a batch of write operations from SQS
 */
export const processBatch = async (event: SQSEvent): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  console.log('Processing write operations:', JSON.stringify(event));

  const results: any[] = [];
  const errors: any[] = [];

  // Process each record in the SQS batch
  for (const record of event.Records) {
    try {
      const { action, data } = JSON.parse(record.body);
      const result = await processWriteOperation(action, data);
      results.push({ messageId: record.messageId, result });
    } catch (recordError) {
      console.error(`Error processing record ${record.messageId}:`, recordError);
      errors.push({
        messageId: record.messageId,
        error: recordError instanceof Error ? recordError.message : 'Unknown error',
        stackTrace: recordError instanceof Error ? recordError.stack : undefined,
      });
    }
  }

  // If any records failed, log the summary
  if (errors.length > 0) {
    console.warn(
      `Processed ${results.length} records successfully, ${errors.length} records failed.`
    );
    console.warn('Failed records:', JSON.stringify(errors));
  }

  // Return failed records for retry
  return {
    batchItemFailures: errors.map((failure) => ({
      itemIdentifier: failure.messageId,
    })),
  };
};

/**
 * Process a single write operation
 */
export const processWriteOperation = async (action: string, data: WriteData): Promise<any> => {
  console.log(`Processing ${action} operation:`, data);

  try {
    // Validate input data
    validateWriteData(action, data);

    const { table } = data;

    switch (action) {
      case 'WRITE':
        return await writeItem(table, data.item!);

      case 'UPDATE':
        return await updateItem(
          table,
          data.key!,
          data.updateExpression!,
          data.expressionAttributeValues,
          data.expressionAttributeNames
        );

      case 'DELETE':
        return await deleteItem(table, data.key!);

      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unsupported action: ${action}`,
        });
    }
  } catch (error) {
    console.error(`Error processing ${action} operation:`, error);
    
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
 * Validate write data based on action
 */
function validateWriteData(action: string, data: WriteData): void {
  const { table } = data;

  if (!table) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Table name is required',
    });
  }

  switch (action) {
    case 'WRITE':
      if (!data.item || Object.keys(data.item).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Item is required for WRITE operation',
        });
      }
      break;

    case 'UPDATE':
      if (!data.key || Object.keys(data.key).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Key is required for UPDATE operation',
        });
      }
      if (!data.updateExpression) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'UpdateExpression is required for UPDATE operation',
        });
      }
      break;

    case 'DELETE':
      if (!data.key || Object.keys(data.key).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Key is required for DELETE operation',
        });
      }
      break;

    default:
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Unsupported action: ${action}`,
      });
  }
}

/**
 * Write an item to DynamoDB
 */
export const writeItem = async (table: string, item: Record<string, unknown>): Promise<any> => {
  console.log(`Writing item to ${table}:`, item);

  try {
    // Add id if not present
    if (!item.id) {
      item.id = uuidv4();
    }

    // Add timestamps if not present
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    if (!item.updatedAt) {
      item.updatedAt = new Date().toISOString();
    }

    const command = new PutCommand({
      TableName: table,
      Item: item,
    });

    const result = await docClient.send(command);
    console.log(`Successfully wrote item to ${table}:`, result);
    return { ...result, item };
  } catch (error) {
    console.error(`Error writing item to ${table}:`, error);
    throw error;
  }
};

/**
 * Update an item in DynamoDB
 */
export const updateItem = async (
  table: string,
  key: Record<string, unknown>,
  updateExpression: string,
  expressionAttributeValues?: Record<string, unknown>,
  expressionAttributeNames?: Record<string, string>
): Promise<any> => {
  console.log(`Updating item in ${table} with key:`, key);

  try {
    // Add updatedAt if not in expression
    let finalUpdateExpression = updateExpression;
    let finalExpressionAttributeValues = expressionAttributeValues || {};

    if (!updateExpression.includes('updatedAt')) {
      if (updateExpression.trim().startsWith('SET')) {
        finalUpdateExpression = `${updateExpression}, updatedAt = :updatedAt`;
      } else {
        finalUpdateExpression = `SET updatedAt = :updatedAt ${updateExpression}`;
      }
      finalExpressionAttributeValues = {
        ...finalExpressionAttributeValues,
        ':updatedAt': new Date().toISOString(),
      };
    }

    const command = new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: finalUpdateExpression,
      ExpressionAttributeValues: finalExpressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    console.log(`Successfully updated item in ${table}:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating item in ${table}:`, error);
    throw error;
  }
};

/**
 * Delete an item from DynamoDB
 */
export const deleteItem = async (table: string, key: Record<string, unknown>): Promise<any> => {
  console.log(`Deleting item from ${table} with key:`, key);

  try {
    const command = new DeleteCommand({
      TableName: table,
      Key: key,
      ReturnValues: 'ALL_OLD',
    });

    const result = await docClient.send(command);
    console.log(`Successfully deleted item from ${table}:`, result);
    return result;
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error);
    throw error;
  }
};
