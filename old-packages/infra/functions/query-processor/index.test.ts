import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './index';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Restaurant Query Processor', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    describe('GET /restaurants/{id}', () => {
        it('should return a restaurant when found', async () => {
            const testRestaurant = {
                id: 'test-id-1',
                name: 'Test Restaurant',
                cuisineType: 'Japanese',
                priceRange: '$$',
            };

            ddbMock.on(GetCommand).resolves({
                Item: testRestaurant,
            });

            const event = {
                resource: '/restaurants/{id}',
                httpMethod: 'GET',
                pathParameters: { id: 'test-id-1' },
            } as unknown as APIGatewayProxyEvent;

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual(testRestaurant);
        });

        it('should return 404 when restaurant is not found', async () => {
            ddbMock.on(GetCommand).resolves({
                Item: undefined,
            });

            const event = {
                resource: '/restaurants/{id}',
                httpMethod: 'GET',
                pathParameters: { id: 'non-existent-id' },
            } as unknown as APIGatewayProxyEvent;

            const response = await handler(event);

            expect(response.statusCode).toBe(404);
            expect(JSON.parse(response.body)).toEqual({
                message: 'Restaurant not found',
            });
        });
    });

    describe('GET /restaurants/list', () => {
        it('should list restaurants with default parameters', async () => {
            const testRestaurants = [
                {
                    id: 'test-id-1',
                    name: 'Test Restaurant 1',
                    cuisineType: 'Japanese',
                },
                {
                    id: 'test-id-2',
                    name: 'Test Restaurant 2',
                    cuisineType: 'Italian',
                },
            ];

            ddbMock.on(ScanCommand).resolves({
                Items: testRestaurants,
                Count: 2,
                ScannedCount: 2,
            });

            const event = {
                resource: '/restaurants/list',
                httpMethod: 'GET',
                queryStringParameters: null,
            } as unknown as APIGatewayProxyEvent;

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.items).toEqual(testRestaurants);
            expect(body.count).toBe(2);
        });

        it('should filter restaurants by cuisine type', async () => {
            const testRestaurants = [
                {
                    id: 'test-id-1',
                    name: 'Test Restaurant 1',
                    cuisineType: 'Japanese',
                },
            ];

            ddbMock.on(ScanCommand).resolves({
                Items: testRestaurants,
                Count: 1,
                ScannedCount: 2,
            });

            const event = {
                resource: '/restaurants/list',
                httpMethod: 'GET',
                queryStringParameters: {
                    cuisineType: 'Japanese',
                },
            } as unknown as APIGatewayProxyEvent;

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.items).toEqual(testRestaurants);
            expect(body.count).toBe(1);
        });

        it('should handle pagination', async () => {
            const lastEvaluatedKey = { id: 'last-id' };
            const testRestaurants = [
                {
                    id: 'test-id-3',
                    name: 'Test Restaurant 3',
                    cuisineType: 'Thai',
                },
            ];

            ddbMock.on(ScanCommand).resolves({
                Items: testRestaurants,
                Count: 1,
                ScannedCount: 1,
                LastEvaluatedKey: lastEvaluatedKey,
            });

            const event = {
                resource: '/restaurants/list',
                httpMethod: 'GET',
                queryStringParameters: {
                    limit: '1',
                },
            } as unknown as APIGatewayProxyEvent;

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.items).toEqual(testRestaurants);
            expect(body.lastEvaluatedKey).toEqual(lastEvaluatedKey);
        });
    });
});
