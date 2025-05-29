// Typesense Dish Search Lambda Function
// Provides an API for searching dishes using Typesense

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getTypesenseClient } from '../shared/typesense-client';

// Main handler function
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received dish search request');
    console.log('Event:', JSON.stringify(event));

    try {
        // Get query parameters
        const {
            q,
            dish_type,
            restaurant_id,
            tags,
            price_min,
            price_max,
            per_page = '20',
            page = '1',
        } = event.queryStringParameters || {};

        // Build filter expression
        const filterExpressions: string[] = [];

        if (dish_type) {
            filterExpressions.push(`dish_type:=${dish_type}`);
        }

        if (restaurant_id) {
            filterExpressions.push(`restaurant_id:=${restaurant_id}`);
        }

        if (tags) {
            // Handle comma-separated tags
            const tagList = tags.split(',').map((tag) => tag.trim());
            if (tagList.length > 0) {
                const tagFilter = tagList.map((tag) => `tags:=${tag}`).join(' || ');
                filterExpressions.push(`(${tagFilter})`);
            }
        }

        if (price_min && price_max) {
            filterExpressions.push(`price:>=${price_min} && price:<=${price_max}`);
        } else if (price_min) {
            filterExpressions.push(`price:>=${price_min}`);
        } else if (price_max) {
            filterExpressions.push(`price:<=${price_max}`);
        }

        // Only show available dishes by default
        filterExpressions.push('is_available:=true');

        const filterBy = filterExpressions.join(' && ');

        // Get Typesense client
        const client = await getTypesenseClient();

        // Build search parameters
        const searchParams: Record<string, unknown> = {
            q: q || '',
            query_by: 'name,description,tags',
            filter_by: filterBy,
            sort_by: q ? '_text_match:desc,average_rank:desc' : 'average_rank:desc',
            per_page: parseInt(per_page),
            page: parseInt(page),
        };

        // If no query is provided, sort by average rank
        if (!q) {
            searchParams.sort_by = 'average_rank:desc';
        }

        console.log('Search parameters:', searchParams);

        // Perform search
        const results = await client.collections('dishes').documents().search(searchParams);

        console.log(`Found ${results.found} dishes`);

        // Return results
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            },
            body: JSON.stringify(results),
        };
    } catch (error: unknown) {
        console.error('Error searching dishes:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            },
            body: JSON.stringify({
                message: 'Error searching dishes',
                error: error instanceof Error ? error.message : String(error),
            }),
        };
    }
};
