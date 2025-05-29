import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, EventData, sendEvent } from '@infra/utils/aws';
import { ApplicationError, handleError } from '@infra/utils/errors';
import { fetchPlaceDetails, transformPlaceDetails } from '@infra/utils/google';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const {
    RESTAURANT_TABLE,
    ANALYTICS_EVENT_BUS,
    GOOGLE_MAPS_API_KEY_SECRET_ARN,
    GOOGLE_MAPS_API_KEY_SECRET_KEY,
} = process.env;

// Validate environment variables at module initialization
if (
    !RESTAURANT_TABLE ||
    !ANALYTICS_EVENT_BUS ||
    !GOOGLE_MAPS_API_KEY_SECRET_ARN ||
    !GOOGLE_MAPS_API_KEY_SECRET_KEY
) {
    throw new Error('Required environment variables not set');
}

interface BasicPlaceDetails {
    placeId: string;
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    mainText: string;
    secondaryText?: string;
}

export const createEstablishment = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            throw new ApplicationError('Missing request body', 400);
        }

        console.log('Request body:', event.body);
        const basicDetails: BasicPlaceDetails = JSON.parse(event.body);
        console.log('Parsed basic details:', basicDetails);

        // Validate required fields
        const requiredFields: Array<keyof BasicPlaceDetails> = [
            'placeId',
            'name',
            'address',
            'location',
            'mainText',
        ];
        const missingFields = requiredFields.filter((field) => !basicDetails[field]);

        if (missingFields.length > 0) {
            throw new ApplicationError(`Missing required fields: ${missingFields.join(', ')}`, 400);
        }

        // Check if establishment already exists
        const queryResult = await (docClient as DynamoDBDocumentClient).send(
            new QueryCommand({
                TableName: RESTAURANT_TABLE,
                IndexName: 'GooglePlaceIdIndex',
                KeyConditionExpression: 'googlePlaceId = :googlePlaceId AND #type = :type',
                ExpressionAttributeNames: {
                    '#type': 'type',
                },
                ExpressionAttributeValues: {
                    ':googlePlaceId': basicDetails.placeId,
                    ':type': 'restaurant',
                },
            })
        );

        if (queryResult.Items && queryResult.Items.length > 0) {
            console.log('Establishment already exists:', queryResult.Items[0]);
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Establishment already exists',
                    data: queryResult.Items[0],
                }),
            };
        }

        console.log('Fetching place details for ID:', basicDetails.placeId);
        // Fetch additional details from Google Places API
        const placeDetails = await fetchPlaceDetails(basicDetails.placeId);
        console.log('Received place details:', placeDetails);

        const transformedDetails = transformPlaceDetails(placeDetails);
        console.log('Transformed details:', transformedDetails);

        const timestamp = new Date().toISOString();
        const mainLocation = transformedDetails.locations[0];

        // Create DynamoDB item
        const putCommand = new PutCommand({
            TableName: RESTAURANT_TABLE,
            Item: {
                id: basicDetails.placeId,
                type: 'restaurant',
                name: transformedDetails.name,
                description: transformedDetails.description,
                cuisineTypes: transformedDetails.cuisineTypes,
                priceRange: transformedDetails.priceRange,
                isCurrentlyOperating: transformedDetails.isCurrentlyOperating,
                locations: transformedDetails.locations,
                schedules: transformedDetails.schedules,
                contact: transformedDetails.contact,
                facilities: JSON.parse(JSON.stringify(transformedDetails.facilities)), // Remove undefined values
                rating: transformedDetails.rating,
                images: transformedDetails.images,
                mainText: basicDetails.mainText,
                secondaryText: basicDetails.secondaryText || '',
                googlePlaceId: transformedDetails.googlePlaceId,
                createdAt: timestamp,
                updatedAt: timestamp,
            },
            ReturnValues: 'ALL_OLD',
        });

        const response = await (docClient as DynamoDBDocumentClient).send(putCommand);
        console.log('DynamoDB response:', response);

        // Send analytics event
        const analyticsEvent: EventData = {
            eventType: 'ESTABLISHMENT_CREATE',
            source: 'establishment-writer',
            requestId: context.awsRequestId,
            detail: {
                placeId: basicDetails.placeId,
                name: transformedDetails.name,
                city: mainLocation.info.city,
                timestamp,
            },
        };

        await sendEvent(analyticsEvent, ANALYTICS_EVENT_BUS);

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Establishment created successfully',
                data: {
                    id: basicDetails.placeId,
                    type: 'restaurant',
                    name: transformedDetails.name,
                    description: transformedDetails.description,
                    cuisineTypes: transformedDetails.cuisineTypes,
                    priceRange: transformedDetails.priceRange,
                    isCurrentlyOperating: transformedDetails.isCurrentlyOperating,
                    locations: transformedDetails.locations,
                    schedules: transformedDetails.schedules,
                    contact: transformedDetails.contact,
                    facilities: JSON.parse(JSON.stringify(transformedDetails.facilities)), // Remove undefined values
                    rating: transformedDetails.rating,
                    images: transformedDetails.images,
                    mainText: basicDetails.mainText,
                    secondaryText: basicDetails.secondaryText || '',
                    googlePlaceId: transformedDetails.googlePlaceId,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                },
            }),
        };
    } catch (err: unknown) {
        console.error('Error in establishment writer:', err);
        if (err instanceof Error) {
            console.error('Error stack:', err.stack);
            if (err.name === 'ConditionalCheckFailedException') {
                return handleError(
                    new ApplicationError('Establishment already exists', 409),
                    context
                );
            }
            if (err instanceof SyntaxError) {
                return handleError(
                    new ApplicationError('Invalid JSON in request body', 400),
                    context
                );
            }
            if (err instanceof ApplicationError) {
                return handleError(err, context);
            }
        }
        return handleError(new ApplicationError('Internal server error', 500), context);
    }
};

export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        switch (event.httpMethod) {
            case 'POST':
                return await createEstablishment(event, context);
            default:
                throw new ApplicationError(`Method ${event.httpMethod} not allowed`, 405);
        }
    } catch (err: unknown) {
        if (err instanceof ApplicationError) {
            return handleError(err, context);
        }
        return handleError(new ApplicationError('Internal server error', 500), context);
    }
};
