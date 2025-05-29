import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { SQSEvent } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface WriteData {
    table: string;
    item: Record<string, unknown>;
    key?: Record<string, unknown>;
    updateExpression?: string;
    expressionAttributeValues?: Record<string, unknown>;
    expressionAttributeNames?: Record<string, string>;
}

export const handler = async (event: SQSEvent) => {
    try {
        const results = await Promise.all(
            event.Records.map(async (record) => {
                const { action, data } = JSON.parse(record.body);
                return await processWriteOperation(action, data);
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ results }),
        };
    } catch (error: unknown) {
        console.error('Error processing write operation:', error);
        throw error;
    }
};

async function processWriteOperation(action: string, data: WriteData) {
    const { table, item } = data;

    switch (action) {
        case 'WRITE':
            return await docClient.send(
                new PutCommand({
                    TableName: table,
                    Item: item,
                })
            );

        case 'UPDATE': {
            const { key, updateExpression, expressionAttributeValues, expressionAttributeNames } =
                data;
            return await docClient.send(
                new UpdateCommand({
                    TableName: table,
                    Key: key,
                    UpdateExpression: updateExpression,
                    ExpressionAttributeValues: expressionAttributeValues,
                    ExpressionAttributeNames: expressionAttributeNames,
                })
            );
        }

        case 'DELETE':
            return await docClient.send(
                new DeleteCommand({
                    TableName: table,
                    Key: data.key,
                })
            );

        default:
            throw new Error(`Unsupported action: ${action}`);
    }
}
