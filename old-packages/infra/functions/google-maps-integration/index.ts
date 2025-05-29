// Google Maps API Integration Lambda function
import axios from 'axios';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const secretsManager = new SecretsManagerClient();
const rdsData = new RDSDataClient();

// Cache for API key to avoid fetching it multiple times
let apiKeyCache: string | null = null;

// Type definitions
interface Restaurant {
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry?: {
        location?: {
            lat?: number;
            lng?: number;
        };
    };
    international_phone_number?: string;
    website?: string;
    rating?: number;
    price_level?: number;
    photos?: Photo[];
    opening_hours?: {
        periods?: Period[];
    };
}

interface Photo {
    photo_reference: string;
    width: number;
    height: number;
}

interface Period {
    open?: {
        day: number;
        time: string;
    };
    close?: {
        day: number;
        time: string;
    };
}

interface LambdaEvent {
    action: string;
    placeId?: string;
    query?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    countryCode: string;
}

/**
 * Get Google Maps API key from Secrets Manager
 * @returns {Promise<string>} The API key
 */
async function getGoogleMapsApiKey(): Promise<string> {
    if (apiKeyCache) {
        return apiKeyCache;
    }

    const secretName = process.env.GOOGLE_MAPS_API_KEY_SECRET_NAME;
    if (!secretName) {
        throw new Error('Missing GOOGLE_MAPS_API_KEY_SECRET_NAME environment variable');
    }

    const command = new GetSecretValueCommand({
        SecretId: secretName,
    });

    const response = await secretsManager.send(command);
    const secretValue = JSON.parse(response.SecretString || '{}');
    apiKeyCache = secretValue.apiKey;

    if (!apiKeyCache) {
        throw new Error('API key not found in secret');
    }

    return apiKeyCache;
}

/**
 * Search for restaurants using Google Places API
 * @param {string} query - Search query
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} radius - Search radius in meters
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise<Array>} List of restaurants
 */
async function searchRestaurants(
    query: string,
    latitude: number,
    longitude: number,
    radius: number | undefined,
    apiKey: string
): Promise<Restaurant[]> {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = {
        location: `${latitude},${longitude}`,
        radius: radius || 1000,
        type: 'restaurant',
        keyword: query,
        key: apiKey,
    };

    const response = await axios.get(url, { params });
    return response.data.results;
}

/**
 * Get restaurant details using Google Places API
 * @param {string} placeId - Google Place ID
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise<Object>} Restaurant details
 */
async function getRestaurantDetails(placeId: string, apiKey: string): Promise<Restaurant> {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,international_phone_number,website,rating,price_level,photos,opening_hours',
        key: apiKey,
    };

    const response = await axios.get(url, { params });
    return response.data.result;
}

/**
 * Save restaurant to database
 * @param {Object} restaurant - Restaurant data
 * @param {string} countryCode - Country code
 * @param {string} dbSecretArn - ARN of the database secret
 * @param {string} dbClusterArn - ARN of the database cluster
 * @param {string} dbName - Name of the database
 * @returns {Promise<string>} Restaurant ID
 */
async function saveRestaurantToDatabase(
    restaurant: Restaurant,
    countryCode: string,
    dbSecretArn: string,
    dbClusterArn: string,
    dbName: string
): Promise<string> {
    const restaurantId = uuidv4();

    // Prepare SQL statement
    const sql = `
    INSERT INTO restaurants (
      restaurant_id, google_place_id, name, address, latitude, longitude,
      phone, website, rating, price_level, country_code
    ) VALUES (
      :restaurant_id, :google_place_id, :name, :address, :latitude, :longitude,
      :phone, :website, :rating, :price_level, :country_code
    )
    ON CONFLICT (google_place_id)
    DO UPDATE SET
      name = :name,
      address = :address,
      latitude = :latitude,
      longitude = :longitude,
      phone = :phone,
      website = :website,
      rating = :rating,
      price_level = :price_level,
      country_code = :country_code,
      updated_at = CURRENT_TIMESTAMP
    RETURNING restaurant_id
  `;

    // Prepare parameters
    const parameters = [
        { name: 'restaurant_id', value: { stringValue: restaurantId } },
        { name: 'google_place_id', value: { stringValue: restaurant.place_id } },
        { name: 'name', value: { stringValue: restaurant.name } },
        { name: 'address', value: { stringValue: restaurant.formatted_address || '' } },
        { name: 'latitude', value: { doubleValue: restaurant.geometry?.location?.lat || 0 } },
        { name: 'longitude', value: { doubleValue: restaurant.geometry?.location?.lng || 0 } },
        { name: 'phone', value: { stringValue: restaurant.international_phone_number || '' } },
        { name: 'website', value: { stringValue: restaurant.website || '' } },
        { name: 'rating', value: { doubleValue: restaurant.rating || 0 } },
        { name: 'price_level', value: { longValue: restaurant.price_level || 0 } },
        { name: 'country_code', value: { stringValue: countryCode } },
    ];

    // Execute SQL statement
    const command = new ExecuteStatementCommand({
        secretArn: dbSecretArn,
        resourceArn: dbClusterArn,
        database: dbName,
        sql,
        parameters,
    });

    const result = await rdsData.send(command);

    // If restaurant already exists, get its ID from the result
    if (result.records && result.records.length > 0) {
        return result.records[0][0].stringValue || restaurantId;
    }

    return restaurantId;
}

/**
 * Save restaurant photos to database
 * @param {string} restaurantId - Restaurant ID
 * @param {Array} photos - List of photos
 * @param {string} apiKey - Google Maps API key
 * @param {string} dbSecretArn - ARN of the database secret
 * @param {string} dbClusterArn - ARN of the database cluster
 * @param {string} dbName - Name of the database
 * @returns {Promise<void>}
 */
async function saveRestaurantPhotos(
    restaurantId: string,
    photos: Photo[],
    apiKey: string,
    dbSecretArn: string,
    dbClusterArn: string,
    dbName: string
): Promise<void> {
    if (!photos || photos.length === 0) {
        return;
    }

    // Delete existing photos
    const deleteSql = `
    DELETE FROM restaurant_photos
    WHERE restaurant_id = :restaurant_id
  `;

    const deleteCommand = new ExecuteStatementCommand({
        secretArn: dbSecretArn,
        resourceArn: dbClusterArn,
        database: dbName,
        sql: deleteSql,
        parameters: [{ name: 'restaurant_id', value: { stringValue: restaurantId } }],
    });

    await rdsData.send(deleteCommand);

    // Insert new photos
    for (const photo of photos) {
        const photoId = uuidv4();
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${photo.width}&photoreference=${photo.photo_reference}&key=${apiKey}`;

        const insertSql = `
      INSERT INTO restaurant_photos (
        photo_id, restaurant_id, photo_url, photo_reference, width, height
      ) VALUES (
        :photo_id, :restaurant_id, :photo_url, :photo_reference, :width, :height
      )
    `;

        const insertCommand = new ExecuteStatementCommand({
            secretArn: dbSecretArn,
            resourceArn: dbClusterArn,
            database: dbName,
            sql: insertSql,
            parameters: [
                { name: 'photo_id', value: { stringValue: photoId } },
                { name: 'restaurant_id', value: { stringValue: restaurantId } },
                { name: 'photo_url', value: { stringValue: photoUrl } },
                { name: 'photo_reference', value: { stringValue: photo.photo_reference } },
                { name: 'width', value: { longValue: photo.width } },
                { name: 'height', value: { longValue: photo.height } },
            ],
        });

        await rdsData.send(insertCommand);
    }
}

/**
 * Save restaurant hours to database
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} openingHours - Opening hours data
 * @param {string} dbSecretArn - ARN of the database secret
 * @param {string} dbClusterArn - ARN of the database cluster
 * @param {string} dbName - Name of the database
 * @returns {Promise<void>}
 */
async function saveRestaurantHours(
    restaurantId: string,
    openingHours: { periods?: Period[] },
    dbSecretArn: string,
    dbClusterArn: string,
    dbName: string
): Promise<void> {
    if (!openingHours || !openingHours.periods) {
        return;
    }

    // Delete existing hours
    const deleteSql = `
    DELETE FROM restaurant_hours
    WHERE restaurant_id = :restaurant_id
  `;

    const deleteCommand = new ExecuteStatementCommand({
        secretArn: dbSecretArn,
        resourceArn: dbClusterArn,
        database: dbName,
        sql: deleteSql,
        parameters: [{ name: 'restaurant_id', value: { stringValue: restaurantId } }],
    });

    await rdsData.send(deleteCommand);

    // Insert new hours
    for (const period of openingHours.periods) {
        if (!period.open || !period.close) {
            continue;
        }

        const hourId = uuidv4();
        const dayOfWeek = period.open.day;
        const openTime =
            period.open.time.substring(0, 2) + ':' + period.open.time.substring(2, 4) + ':00';
        const closeTime =
            period.close.time.substring(0, 2) + ':' + period.close.time.substring(2, 4) + ':00';

        const insertSql = `
      INSERT INTO restaurant_hours (
        hour_id, restaurant_id, day_of_week, open_time, close_time
      ) VALUES (
        :hour_id, :restaurant_id, :day_of_week, :open_time, :close_time
      )
    `;

        const insertCommand = new ExecuteStatementCommand({
            secretArn: dbSecretArn,
            resourceArn: dbClusterArn,
            database: dbName,
            sql: insertSql,
            parameters: [
                { name: 'hour_id', value: { stringValue: hourId } },
                { name: 'restaurant_id', value: { stringValue: restaurantId } },
                { name: 'day_of_week', value: { longValue: dayOfWeek } },
                { name: 'open_time', value: { stringValue: openTime } },
                { name: 'close_time', value: { stringValue: closeTime } },
            ],
        });

        await rdsData.send(insertCommand);
    }
}

/**
 * Lambda handler
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} Lambda response
 */
export const handler = async (event: LambdaEvent): Promise<Record<string, unknown>> => {
    try {
        // Get environment variables
        const dbSecretArn = process.env.DB_SECRET_ARN;
        const dbClusterArn = process.env.DB_CLUSTER_ARN;
        const dbName = process.env.DB_NAME;

        if (!dbSecretArn || !dbClusterArn || !dbName) {
            throw new Error('Missing required environment variables');
        }

        // Get API key
        const apiKey = await getGoogleMapsApiKey();

        // Get parameters from event
        const { action, placeId, query, latitude, longitude, radius, countryCode } = event;

        if (!action) {
            throw new Error('Missing action parameter');
        }

        if (!countryCode) {
            throw new Error('Missing countryCode parameter');
        }

        let result;

        // Handle different actions
        switch (action) {
            case 'search':
                if (!query || !latitude || !longitude) {
                    throw new Error('Missing required parameters for search action');
                }

                result = await searchRestaurants(query, latitude, longitude, radius, apiKey);
                break;

            case 'getDetails': {
                if (!placeId) {
                    throw new Error('Missing placeId parameter for getDetails action');
                }

                const restaurantDetails = await getRestaurantDetails(placeId, apiKey);
                const restaurantId = await saveRestaurantToDatabase(
                    restaurantDetails,
                    countryCode,
                    dbSecretArn,
                    dbClusterArn,
                    dbName
                );

                if (restaurantDetails.photos) {
                    await saveRestaurantPhotos(
                        restaurantId,
                        restaurantDetails.photos,
                        apiKey,
                        dbSecretArn,
                        dbClusterArn,
                        dbName
                    );
                }

                if (restaurantDetails.opening_hours) {
                    await saveRestaurantHours(
                        restaurantId,
                        restaurantDetails.opening_hours,
                        dbSecretArn,
                        dbClusterArn,
                        dbName
                    );
                }

                result = {
                    restaurantId,
                    ...restaurantDetails,
                };
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error: unknown) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error instanceof Error ? error.message : 'An unknown error occurred',
            }),
        };
    }
};
