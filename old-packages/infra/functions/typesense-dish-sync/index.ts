// Typesense Dish Sync Lambda Function
// Syncs dish data from PostgreSQL to Typesense

import { ExecuteStatementCommand, RDSDataClient } from '@aws-sdk/client-rds-data';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
// Typesense is imported by the typesense-client module
import { getTypesenseClient } from '../shared/typesense-client';
import { formatDishForTypesense, TYPESENSE_DISH_SCHEMA } from './typesense-dish-schema';

// Initialize AWS clients
const rdsClient = new RDSDataClient({});
// Renamed with underscore prefix to indicate it's not used
const _secretsClient = new SecretsManagerClient({});

// Environment variables
// Renamed with underscore prefix to indicate it's not used
const _ENVIRONMENT = process.env._ENVIRONMENT || 'dev';
const RDS_SECRET_ARN = process.env.RDS_SECRET_ARN || '';
const RDS_RESOURCE_ARN = process.env.RDS_RESOURCE_ARN || '';
const RDS_DATABASE = process.env.RDS_DATABASE || 'bellyfed';

// Function to ensure the dishes collection exists in Typesense
async function ensureCollection(client: any) {
    try {
        // Check if collection exists
        try {
            await client.collections('dishes').retrieve();
            console.log('Dishes collection already exists');
        } catch (error: unknown) {
            // Collection doesn't exist, create it
            console.log('Creating dishes collection');
            await client.collections().create(TYPESENSE_DISH_SCHEMA);
        }
    } catch (error: unknown) {
        console.error('Error ensuring collection exists:', error);
        throw error;
    }
}

// Function to get dishes with rankings from PostgreSQL
async function getDishesWithRankings() {
    try {
        // SQL query to get dishes with their average rankings
        const sql = `
      SELECT
        d.dish_id,
        d.restaurant_id,
        d.name,
        d.description,
        d.price,
        d.dish_type,
        d.tags,
        d.is_seasonal,
        d.is_available,
        d.created_at,
        r.name as restaurant_name,
        COALESCE(AVG(dr.rank), 0) as average_rank,
        COUNT(dr.ranking_id) as ranking_count
      FROM
        dishes d
      JOIN
        restaurants r ON d.restaurant_id = r.restaurant_id
      LEFT JOIN
        dish_rankings dr ON d.dish_id = dr.dish_id
      GROUP BY
        d.dish_id, d.restaurant_id, d.name, d.description, d.price,
        d.dish_type, d.tags, d.is_seasonal, d.is_available, d.created_at, r.name
    `;

        // Execute the query
        const result = await rdsClient.send(
            new ExecuteStatementCommand({
                resourceArn: RDS_RESOURCE_ARN,
                secretArn: RDS_SECRET_ARN,
                database: RDS_DATABASE,
                sql,
            })
        );

        // Process the results
        const dishes =
            result.records?.map((record) => {
                const dish: Record<string, unknown> = {};

                // Map column values to dish properties
                result.columnMetadata?.forEach((column, index) => {
                    const columnName = column.name;
                    const value = record[index];

                    if (columnName && value) {
                        // Handle different value types
                        if (value.stringValue !== undefined) dish[columnName] = value.stringValue;
                        else if (value.longValue !== undefined) dish[columnName] = value.longValue;
                        else if (value.doubleValue !== undefined)
                            dish[columnName] = value.doubleValue;
                        else if (value.booleanValue !== undefined)
                            dish[columnName] = value.booleanValue;
                        else if (value.arrayValue !== undefined) {
                            // Handle array values (like tags)
                            dish[columnName] = value.arrayValue.stringValues || [];
                        }
                    }
                });

                return dish;
            }) || [];

        console.log(`Retrieved ${dishes.length} dishes from PostgreSQL`);
        return dishes;
    } catch (error: unknown) {
        console.error('Error getting dishes from PostgreSQL:', error);
        throw error;
    }
}

// Main handler function
export const handler = async (event: Record<string, unknown>) => {
    console.log('Starting dish sync to Typesense');
    console.log('Event:', JSON.stringify(event));

    try {
        // Get Typesense client
        const client = await getTypesenseClient();

        // Ensure collection exists
        await ensureCollection(client);

        // Get dishes from PostgreSQL
        const dishes = await getDishesWithRankings();

        // Format dishes for Typesense
        const typesenseDishes = dishes.map(formatDishForTypesense);

        // Batch size for import
        const BATCH_SIZE = 100;

        // Import dishes in batches
        for (let i = 0; i < typesenseDishes.length; i += BATCH_SIZE) {
            const batch = typesenseDishes.slice(i, i + BATCH_SIZE);
            console.log(`Importing batch ${i / BATCH_SIZE + 1} (${batch.length} dishes)`);

            await client.collections('dishes').documents().import(batch, { action: 'upsert' });
        }

        console.log(`Successfully synced ${typesenseDishes.length} dishes to Typesense`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Dish sync completed successfully',
                syncedCount: typesenseDishes.length,
            }),
        };
    } catch (error: unknown) {
        console.error('Error syncing dishes to Typesense:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error syncing dishes to Typesense',
                error: error instanceof Error ? error.message : String(error),
            }),
        };
    }
};
