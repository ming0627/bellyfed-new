import { ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { rdsClient, dbSecretArn, dbClusterArn, dbName } from './index';

// Helper function to execute SQL queries
export const executeQuery = async (sql: string, parameters: any[] = []): Promise<any> => {
    try {
        const params = {
            secretArn: dbSecretArn,
            resourceArn: dbClusterArn,
            database: dbName,
            sql,
            parameters: parameters.map((value, index) => ({
                name: `param${index + 1}`,
                value: {
                    stringValue: typeof value === 'string' ? value : JSON.stringify(value),
                },
            })),
        };

        const command = new ExecuteStatementCommand(params);
        const result = await rdsClient.send(command);
        return result;
    } catch (error: unknown) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
};

// Helper function to get dish ID from slug
export const getDishIdFromSlug = async (dishSlug: string): Promise<string> => {
    const sql = `
    SELECT dish_id FROM dishes WHERE slug = :param1
  `;
    const result = await executeQuery(sql, [dishSlug]);

    if (!result.records || result.records.length === 0) {
        throw new Error('Dish not found');
    }

    return result.records[0][0].stringValue;
};
