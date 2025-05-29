/**
 * Batch Processor Lambda Function
 *
 * This Lambda function processes import batches from EventBridge events.
 * It handles data validation, transformation, and database operations.
 */

import { EventBridgeEvent, SQSEvent, Context } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { RDSDataClient, ExecuteStatementCommand, SqlParameter } from '@aws-sdk/client-rds-data';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const secretsClient = new SecretsManagerClient({});
const rdsDataClient = new RDSDataClient({});
const eventBridgeClient = new EventBridgeClient({});

// Environment variables
const DB_SECRET_ARN = process.env.DB_SECRET_ARN;
const DB_CLUSTER_ARN = process.env.DB_CLUSTER_ARN;
const DB_NAME = process.env.DB_NAME;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'default';

// Interfaces
interface ImportEvent {
    jobId: string;
    batchId: string;
    data: any[];
    metadata?: {
        outboxEventId?: string;
        aggregateId?: string;
        timestamp?: string;
        traceId?: string;
    };
}

interface RestaurantData {
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    website?: string;
    email?: string;
    cuisineType?: string;
    priceRange?: string;
    openingHours?: any;
    features?: any;
    imageUrl?: string;
    logoUrl?: string;
    externalId: string;
    sourceId: string;
    rawData?: any;
}

interface DishData {
    name: string;
    description?: string;
    restaurantId: string;
    restaurantName: string;
    category?: string;
    imageUrl?: string;
    isVegetarian?: boolean;
    spicyLevel?: number;
    price?: number;
    countryCode?: string;
    externalId: string;
    sourceId: string;
    externalMenuId?: string;
    rawData?: any;
}

/**
 * Lambda handler function
 */
export const handler = async (
    event: SQSEvent | EventBridgeEvent<string, any>,
    context: Context
) => {
    console.log('Starting batch processor with request ID:', context.awsRequestId);

    try {
        // Parse event based on source
        let importEvent: ImportEvent;

        if ('Records' in event) {
            // SQS event
            const record = event.Records[0];
            importEvent = JSON.parse(record.body);
        } else {
            // EventBridge event
            importEvent = event.detail;
        }

        console.log('Processing import event:', {
            jobId: importEvent.jobId,
            batchId: importEvent.batchId,
            dataCount: importEvent.data.length,
        });

        // Get database credentials
        const dbCredentials = await getDbCredentials();

        // Get import batch and job details
        const { batch, job } = await getImportDetails(
            importEvent.jobId,
            importEvent.batchId,
            dbCredentials
        );

        if (batch.status !== 'PENDING') {
            console.log(
                `Batch ${importEvent.batchId} is already in status ${batch.status}, skipping processing`
            );
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Batch already processed with status: ${batch.status}`,
                }),
            };
        }

        // Update batch status to IN_PROGRESS
        await updateBatchStatus(importEvent.batchId, 'IN_PROGRESS', dbCredentials);

        // Process data based on job type
        let successCount = 0;
        let errorCount = 0;
        const errors: any[] = [];

        try {
            if (job.jobType === 'RESTAURANT') {
                const results = await processRestaurantData(
                    importEvent.data,
                    job.sourceId,
                    dbCredentials
                );
                successCount = results.successCount;
                errorCount = results.errorCount;
                errors.push(...results.errors);
            } else if (job.jobType === 'DISH') {
                const results = await processDishData(
                    importEvent.data,
                    job.sourceId,
                    dbCredentials
                );
                successCount = results.successCount;
                errorCount = results.errorCount;
                errors.push(...results.errors);
            } else {
                throw new Error(`Unsupported job type: ${job.jobType}`);
            }

            // Update batch status to COMPLETED
            await updateBatchStatus(
                importEvent.batchId,
                errorCount > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
                dbCredentials,
                errorCount > 0 ? { errors } : undefined
            );

            // Update job progress
            await updateJobProgress(importEvent.jobId, successCount, errorCount, dbCredentials);

            // Send batch completion event
            await sendBatchCompletionEvent(
                importEvent.jobId,
                importEvent.batchId,
                successCount,
                errorCount,
                errors.length > 0 ? errors : undefined
            );

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Batch processed successfully',
                    jobId: importEvent.jobId,
                    batchId: importEvent.batchId,
                    successCount,
                    errorCount,
                }),
            };
        } catch (error) {
            // Update batch status to FAILED
            await updateBatchStatus(importEvent.batchId, 'FAILED', dbCredentials, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            // Send batch failure event
            await sendBatchFailureEvent(
                importEvent.jobId,
                importEvent.batchId,
                error instanceof Error ? error.message : 'Unknown error'
            );

            throw error;
        }
    } catch (error) {
        console.error('Error processing batch:', error);
        throw error;
    }
};

/**
 * Get database credentials from Secrets Manager
 */
async function getDbCredentials() {
    if (!DB_SECRET_ARN) {
        throw new Error('DB_SECRET_ARN environment variable is required');
    }

    const command = new GetSecretValueCommand({
        SecretId: DB_SECRET_ARN,
    });

    const response = await secretsClient.send(command);

    if (!response.SecretString) {
        throw new Error('Failed to retrieve database credentials');
    }

    return JSON.parse(response.SecretString);
}

/**
 * Get import batch and job details
 */
async function getImportDetails(jobId: string, batchId: string, _dbCredentials: any) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    // Get batch details
    const batchSql = `
    SELECT id, job_id, batch_number, status, item_count
    FROM import_batches
    WHERE id = :batchId
  `;

    const batchParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: batchSql,
        parameters: [{ name: 'batchId', value: { stringValue: batchId } }],
    };

    const batchCommand = new ExecuteStatementCommand(batchParams);
    const batchResult = await rdsDataClient.send(batchCommand);

    if (!batchResult.records || batchResult.records.length === 0) {
        throw new Error(`Batch ${batchId} not found`);
    }

    const batchRecord = batchResult.records[0];
    const batch = {
        id: batchRecord[0].stringValue,
        jobId: batchRecord[1].stringValue,
        batchNumber: batchRecord[2].longValue,
        status: batchRecord[3].stringValue,
        itemCount: batchRecord[4].longValue,
    };

    // Get job details
    const jobSql = `
    SELECT id, source_id, job_type, status
    FROM import_jobs
    WHERE id = :jobId
  `;

    const jobParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: jobSql,
        parameters: [{ name: 'jobId', value: { stringValue: jobId } }],
    };

    const jobCommand = new ExecuteStatementCommand(jobParams);
    const jobResult = await rdsDataClient.send(jobCommand);

    if (!jobResult.records || jobResult.records.length === 0) {
        throw new Error(`Job ${jobId} not found`);
    }

    const jobRecord = jobResult.records[0];
    const job = {
        id: jobRecord[0].stringValue,
        sourceId: jobRecord[1].stringValue,
        jobType: jobRecord[2].stringValue,
        status: jobRecord[3].stringValue,
    };

    return { batch, job };
}

/**
 * Update batch status
 */
async function updateBatchStatus(
    batchId: string,
    status: string,
    _dbCredentials: any,
    errorDetails?: any
) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    const now = new Date().toISOString();
    const parameters: SqlParameter[] = [
        { name: 'status', value: { stringValue: status } },
        { name: 'updatedAt', value: { stringValue: now } },
        { name: 'batchId', value: { stringValue: batchId } },
    ];

    let sql = `
    UPDATE import_batches
    SET status = :status, updated_at = :updatedAt
  `;

    if (status === 'COMPLETED' || status === 'COMPLETED_WITH_ERRORS' || status === 'FAILED') {
        sql += `, completed_at = :completedAt`;
        parameters.push({ name: 'completedAt', value: { stringValue: now } });
    }

    if (errorDetails) {
        sql += `, error_details = :errorDetails`;
        parameters.push({
            name: 'errorDetails',
            value: { stringValue: JSON.stringify(errorDetails) },
        });
    }

    sql += ` WHERE id = :batchId`;

    const params = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql,
        parameters,
    };

    const command = new ExecuteStatementCommand(params);
    await rdsDataClient.send(command);
}

/**
 * Process restaurant data
 */
async function processRestaurantData(data: any[], sourceId: string, dbCredentials: any) {
    console.log(`Processing ${data.length} restaurant records`);

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (const item of data) {
        try {
            // Validate restaurant data
            if (!item.name || !item.externalId) {
                throw new Error('Restaurant data missing required fields: name and externalId');
            }

            // Generate a slug from the name
            const slug = item.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Create or update restaurant
            const restaurantId = await createOrUpdateRestaurant(
                {
                    ...item,
                    slug,
                    sourceId,
                },
                dbCredentials
            );

            // Create imported restaurant record
            await createImportedRestaurant(
                {
                    restaurantId,
                    sourceId,
                    externalId: item.externalId,
                    rawData: item.rawData || item,
                    confidenceScore: item.confidenceScore || 100,
                    matchMethod: item.matchMethod || 'EXACT',
                },
                dbCredentials
            );

            successCount++;
        } catch (error) {
            console.error(`Error processing restaurant:`, error);
            errorCount++;
            errors.push({
                item: item.externalId || 'unknown',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return { successCount, errorCount, errors };
}

/**
 * Create or update a restaurant
 */
async function createOrUpdateRestaurant(data: RestaurantData, _dbCredentials: any) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    // Check if restaurant with this external ID already exists
    const checkSql = `
    SELECT r.restaurant_id
    FROM restaurants r
    JOIN imported_restaurants ir ON r.restaurant_id = ir.restaurant_id
    WHERE ir.external_id = :externalId AND ir.source_id = :sourceId
  `;

    const checkParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: checkSql,
        parameters: [
            { name: 'externalId', value: { stringValue: data.externalId } },
            { name: 'sourceId', value: { stringValue: data.sourceId } },
        ],
    };

    const checkCommand = new ExecuteStatementCommand(checkParams);
    const checkResult = await rdsDataClient.send(checkCommand);

    let restaurantId: string;

    if (checkResult.records && checkResult.records.length > 0) {
        // Restaurant exists, update it
        restaurantId = checkResult.records[0][0].stringValue;

        const updateSql = `
      UPDATE restaurants
      SET
        name = :name,
        slug = :slug,
        description = COALESCE(:description, description),
        address = COALESCE(:address, address),
        city = COALESCE(:city, city),
        state = COALESCE(:state, state),
        postal_code = COALESCE(:postalCode, postal_code),
        country = COALESCE(:country, country),
        country_code = COALESCE(:countryCode, country_code),
        latitude = COALESCE(:latitude, latitude),
        longitude = COALESCE(:longitude, longitude),
        phone = COALESCE(:phone, phone),
        website = COALESCE(:website, website),
        email = COALESCE(:email, email),
        cuisine_type = COALESCE(:cuisineType, cuisine_type),
        price_range = COALESCE(:priceRange, price_range),
        opening_hours = COALESCE(:openingHours, opening_hours),
        features = COALESCE(:features, features),
        image_url = COALESCE(:imageUrl, image_url),
        logo_url = COALESCE(:logoUrl, logo_url),
        data_source = 'IMPORTED',
        external_source_count = external_source_count + 1,
        updated_at = :updatedAt
      WHERE restaurant_id = :restaurantId
    `;

        const updateParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: updateSql,
            parameters: [
                { name: 'name', value: { stringValue: data.name } },
                { name: 'slug', value: { stringValue: data.slug } },
                {
                    name: 'description',
                    value: data.description ? { stringValue: data.description } : { isNull: true },
                },
                {
                    name: 'address',
                    value: data.address ? { stringValue: data.address } : { isNull: true },
                },
                { name: 'city', value: data.city ? { stringValue: data.city } : { isNull: true } },
                {
                    name: 'state',
                    value: data.state ? { stringValue: data.state } : { isNull: true },
                },
                {
                    name: 'postalCode',
                    value: data.postalCode ? { stringValue: data.postalCode } : { isNull: true },
                },
                {
                    name: 'country',
                    value: data.country ? { stringValue: data.country } : { isNull: true },
                },
                {
                    name: 'countryCode',
                    value: data.countryCode ? { stringValue: data.countryCode } : { isNull: true },
                },
                {
                    name: 'latitude',
                    value: data.latitude ? { doubleValue: data.latitude } : { isNull: true },
                },
                {
                    name: 'longitude',
                    value: data.longitude ? { doubleValue: data.longitude } : { isNull: true },
                },
                {
                    name: 'phone',
                    value: data.phone ? { stringValue: data.phone } : { isNull: true },
                },
                {
                    name: 'website',
                    value: data.website ? { stringValue: data.website } : { isNull: true },
                },
                {
                    name: 'email',
                    value: data.email ? { stringValue: data.email } : { isNull: true },
                },
                {
                    name: 'cuisineType',
                    value: data.cuisineType ? { stringValue: data.cuisineType } : { isNull: true },
                },
                {
                    name: 'priceRange',
                    value: data.priceRange ? { stringValue: data.priceRange } : { isNull: true },
                },
                {
                    name: 'openingHours',
                    value: data.openingHours
                        ? { stringValue: JSON.stringify(data.openingHours) }
                        : { isNull: true },
                },
                {
                    name: 'features',
                    value: data.features
                        ? { stringValue: JSON.stringify(data.features) }
                        : { isNull: true },
                },
                {
                    name: 'imageUrl',
                    value: data.imageUrl ? { stringValue: data.imageUrl } : { isNull: true },
                },
                {
                    name: 'logoUrl',
                    value: data.logoUrl ? { stringValue: data.logoUrl } : { isNull: true },
                },
                { name: 'updatedAt', value: { stringValue: new Date().toISOString() } },
                { name: 'restaurantId', value: { stringValue: restaurantId } },
            ],
        };

        const updateCommand = new ExecuteStatementCommand(updateParams);
        await rdsDataClient.send(updateCommand);
    } else {
        // Restaurant doesn't exist, create it
        restaurantId = uuidv4();

        const insertSql = `
      INSERT INTO restaurants (
        restaurant_id, name, slug, description, address, city, state, postal_code,
        country, country_code, latitude, longitude, phone, website, email,
        cuisine_type, price_range, opening_hours, features, image_url, logo_url,
        data_source, external_source_count, created_at, updated_at
      ) VALUES (
        :restaurantId, :name, :slug, :description, :address, :city, :state, :postalCode,
        :country, :countryCode, :latitude, :longitude, :phone, :website, :email,
        :cuisineType, :priceRange, :openingHours, :features, :imageUrl, :logoUrl,
        'IMPORTED', 1, :createdAt, :updatedAt
      )
    `;

        const now = new Date().toISOString();
        const insertParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: insertSql,
            parameters: [
                { name: 'restaurantId', value: { stringValue: restaurantId } },
                { name: 'name', value: { stringValue: data.name } },
                { name: 'slug', value: { stringValue: data.slug } },
                {
                    name: 'description',
                    value: data.description ? { stringValue: data.description } : { isNull: true },
                },
                {
                    name: 'address',
                    value: data.address ? { stringValue: data.address } : { isNull: true },
                },
                { name: 'city', value: data.city ? { stringValue: data.city } : { isNull: true } },
                {
                    name: 'state',
                    value: data.state ? { stringValue: data.state } : { isNull: true },
                },
                {
                    name: 'postalCode',
                    value: data.postalCode ? { stringValue: data.postalCode } : { isNull: true },
                },
                {
                    name: 'country',
                    value: data.country ? { stringValue: data.country } : { isNull: true },
                },
                {
                    name: 'countryCode',
                    value: data.countryCode ? { stringValue: data.countryCode } : { isNull: true },
                },
                {
                    name: 'latitude',
                    value: data.latitude ? { doubleValue: data.latitude } : { isNull: true },
                },
                {
                    name: 'longitude',
                    value: data.longitude ? { doubleValue: data.longitude } : { isNull: true },
                },
                {
                    name: 'phone',
                    value: data.phone ? { stringValue: data.phone } : { isNull: true },
                },
                {
                    name: 'website',
                    value: data.website ? { stringValue: data.website } : { isNull: true },
                },
                {
                    name: 'email',
                    value: data.email ? { stringValue: data.email } : { isNull: true },
                },
                {
                    name: 'cuisineType',
                    value: data.cuisineType ? { stringValue: data.cuisineType } : { isNull: true },
                },
                {
                    name: 'priceRange',
                    value: data.priceRange ? { stringValue: data.priceRange } : { isNull: true },
                },
                {
                    name: 'openingHours',
                    value: data.openingHours
                        ? { stringValue: JSON.stringify(data.openingHours) }
                        : { isNull: true },
                },
                {
                    name: 'features',
                    value: data.features
                        ? { stringValue: JSON.stringify(data.features) }
                        : { isNull: true },
                },
                {
                    name: 'imageUrl',
                    value: data.imageUrl ? { stringValue: data.imageUrl } : { isNull: true },
                },
                {
                    name: 'logoUrl',
                    value: data.logoUrl ? { stringValue: data.logoUrl } : { isNull: true },
                },
                { name: 'createdAt', value: { stringValue: now } },
                { name: 'updatedAt', value: { stringValue: now } },
            ],
        };

        const insertCommand = new ExecuteStatementCommand(insertParams);
        await rdsDataClient.send(insertCommand);
    }

    return restaurantId;
}

/**
 * Create imported restaurant record
 */
async function createImportedRestaurant(data: any, _dbCredentials: any) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    // Check if imported restaurant record already exists
    const checkSql = `
    SELECT import_id
    FROM imported_restaurants
    WHERE restaurant_id = :restaurantId AND source_id = :sourceId
  `;

    const checkParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: checkSql,
        parameters: [
            { name: 'restaurantId', value: { stringValue: data.restaurantId } },
            { name: 'sourceId', value: { stringValue: data.sourceId } },
        ],
    };

    const checkCommand = new ExecuteStatementCommand(checkParams);
    const checkResult = await rdsDataClient.send(checkCommand);

    const now = new Date().toISOString();

    if (checkResult.records && checkResult.records.length > 0) {
        // Update existing record
        const importId = checkResult.records[0][0].stringValue;

        const updateSql = `
      UPDATE imported_restaurants
      SET
        external_id = :externalId,
        last_updated = :lastUpdated,
        raw_data = :rawData,
        status = 'ACTIVE',
        confidence_score = :confidenceScore,
        match_method = :matchMethod,
        updated_at = :updatedAt
      WHERE import_id = :importId
    `;

        const updateParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: updateSql,
            parameters: [
                { name: 'externalId', value: { stringValue: data.externalId } },
                { name: 'lastUpdated', value: { stringValue: now } },
                { name: 'rawData', value: { stringValue: JSON.stringify(data.rawData) } },
                { name: 'confidenceScore', value: { doubleValue: data.confidenceScore } },
                { name: 'matchMethod', value: { stringValue: data.matchMethod } },
                { name: 'updatedAt', value: { stringValue: now } },
                { name: 'importId', value: { stringValue: importId } },
            ],
        };

        const updateCommand = new ExecuteStatementCommand(updateParams);
        await rdsDataClient.send(updateCommand);
    } else {
        // Create new record
        const importId = uuidv4();

        const insertSql = `
      INSERT INTO imported_restaurants (
        import_id, restaurant_id, source_id, external_id, import_date,
        last_updated, raw_data, status, confidence_score, match_method,
        created_at, updated_at
      ) VALUES (
        :importId, :restaurantId, :sourceId, :externalId, :importDate,
        :lastUpdated, :rawData, 'ACTIVE', :confidenceScore, :matchMethod,
        :createdAt, :updatedAt
      )
    `;

        const insertParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: insertSql,
            parameters: [
                { name: 'importId', value: { stringValue: importId } },
                { name: 'restaurantId', value: { stringValue: data.restaurantId } },
                { name: 'sourceId', value: { stringValue: data.sourceId } },
                { name: 'externalId', value: { stringValue: data.externalId } },
                { name: 'importDate', value: { stringValue: now } },
                { name: 'lastUpdated', value: { stringValue: now } },
                { name: 'rawData', value: { stringValue: JSON.stringify(data.rawData) } },
                { name: 'confidenceScore', value: { doubleValue: data.confidenceScore } },
                { name: 'matchMethod', value: { stringValue: data.matchMethod } },
                { name: 'createdAt', value: { stringValue: now } },
                { name: 'updatedAt', value: { stringValue: now } },
            ],
        };

        const insertCommand = new ExecuteStatementCommand(insertParams);
        await rdsDataClient.send(insertCommand);
    }
}

/**
 * Process dish data
 */
async function processDishData(data: any[], sourceId: string, dbCredentials: any) {
    console.log(`Processing ${data.length} dish records`);

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (const item of data) {
        try {
            // Validate dish data
            if (!item.name || !item.restaurantId || !item.restaurantName || !item.externalId) {
                throw new Error(
                    'Dish data missing required fields: name, restaurantId, restaurantName, and externalId'
                );
            }

            // Generate a slug from the name
            const slug = item.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Create or update dish
            const dishId = await createOrUpdateDish(
                {
                    ...item,
                    slug,
                    sourceId,
                },
                dbCredentials
            );

            // Create imported dish record
            await createImportedDish(
                {
                    dishId,
                    restaurantId: item.restaurantId,
                    sourceId,
                    externalId: item.externalId,
                    externalMenuId: item.externalMenuId,
                    rawData: item.rawData || item,
                    confidenceScore: item.confidenceScore || 100,
                    matchMethod: item.matchMethod || 'EXACT',
                },
                dbCredentials
            );

            successCount++;
        } catch (error) {
            console.error(`Error processing dish:`, error);
            errorCount++;
            errors.push({
                item: item.externalId || 'unknown',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return { successCount, errorCount, errors };
}

/**
 * Create or update a dish
 */
async function createOrUpdateDish(data: DishData, _dbCredentials: any) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    // Check if dish with this external ID already exists
    const checkSql = `
    SELECT d.dish_id
    FROM dishes d
    JOIN imported_dishes id ON d.dish_id = id.dish_id
    WHERE id.external_id = :externalId AND id.source_id = :sourceId
  `;

    const checkParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: checkSql,
        parameters: [
            { name: 'externalId', value: { stringValue: data.externalId } },
            { name: 'sourceId', value: { stringValue: data.sourceId } },
        ],
    };

    const checkCommand = new ExecuteStatementCommand(checkParams);
    const checkResult = await rdsDataClient.send(checkCommand);

    let dishId: string;

    if (checkResult.records && checkResult.records.length > 0) {
        // Dish exists, update it
        dishId = checkResult.records[0][0].stringValue;

        const updateSql = `
      UPDATE dishes
      SET
        name = :name,
        slug = :slug,
        description = COALESCE(:description, description),
        restaurant_id = :restaurantId,
        restaurant_name = :restaurantName,
        category = COALESCE(:category, category),
        image_url = COALESCE(:imageUrl, image_url),
        is_vegetarian = COALESCE(:isVegetarian, is_vegetarian),
        spicy_level = COALESCE(:spicyLevel, spicy_level),
        price = COALESCE(:price, price),
        country_code = COALESCE(:countryCode, country_code),
        data_source = 'IMPORTED',
        external_source_count = external_source_count + 1,
        updated_at = :updatedAt
      WHERE dish_id = :dishId
    `;

        const updateParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: updateSql,
            parameters: [
                { name: 'name', value: { stringValue: data.name } },
                { name: 'slug', value: { stringValue: data.slug } },
                {
                    name: 'description',
                    value: data.description ? { stringValue: data.description } : { isNull: true },
                },
                { name: 'restaurantId', value: { stringValue: data.restaurantId } },
                { name: 'restaurantName', value: { stringValue: data.restaurantName } },
                {
                    name: 'category',
                    value: data.category ? { stringValue: data.category } : { isNull: true },
                },
                {
                    name: 'imageUrl',
                    value: data.imageUrl ? { stringValue: data.imageUrl } : { isNull: true },
                },
                {
                    name: 'isVegetarian',
                    value:
                        data.isVegetarian !== undefined
                            ? { booleanValue: data.isVegetarian }
                            : { isNull: true },
                },
                {
                    name: 'spicyLevel',
                    value:
                        data.spicyLevel !== undefined
                            ? { longValue: data.spicyLevel }
                            : { isNull: true },
                },
                {
                    name: 'price',
                    value:
                        data.price !== undefined ? { doubleValue: data.price } : { isNull: true },
                },
                {
                    name: 'countryCode',
                    value: data.countryCode ? { stringValue: data.countryCode } : { isNull: true },
                },
                { name: 'updatedAt', value: { stringValue: new Date().toISOString() } },
                { name: 'dishId', value: { stringValue: dishId } },
            ],
        };

        const updateCommand = new ExecuteStatementCommand(updateParams);
        await rdsDataClient.send(updateCommand);
    } else {
        // Dish doesn't exist, create it
        dishId = uuidv4();

        const insertSql = `
      INSERT INTO dishes (
        dish_id, name, slug, description, restaurant_id, restaurant_name,
        category, image_url, is_vegetarian, spicy_level, price, country_code,
        data_source, external_source_count, created_at, updated_at
      ) VALUES (
        :dishId, :name, :slug, :description, :restaurantId, :restaurantName,
        :category, :imageUrl, :isVegetarian, :spicyLevel, :price, :countryCode,
        'IMPORTED', 1, :createdAt, :updatedAt
      )
    `;

        const now = new Date().toISOString();
        const insertParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: insertSql,
            parameters: [
                { name: 'dishId', value: { stringValue: dishId } },
                { name: 'name', value: { stringValue: data.name } },
                { name: 'slug', value: { stringValue: data.slug } },
                {
                    name: 'description',
                    value: data.description ? { stringValue: data.description } : { isNull: true },
                },
                { name: 'restaurantId', value: { stringValue: data.restaurantId } },
                { name: 'restaurantName', value: { stringValue: data.restaurantName } },
                {
                    name: 'category',
                    value: data.category ? { stringValue: data.category } : { isNull: true },
                },
                {
                    name: 'imageUrl',
                    value: data.imageUrl ? { stringValue: data.imageUrl } : { isNull: true },
                },
                {
                    name: 'isVegetarian',
                    value:
                        data.isVegetarian !== undefined
                            ? { booleanValue: data.isVegetarian }
                            : { isNull: true },
                },
                {
                    name: 'spicyLevel',
                    value:
                        data.spicyLevel !== undefined
                            ? { longValue: data.spicyLevel }
                            : { isNull: true },
                },
                {
                    name: 'price',
                    value:
                        data.price !== undefined ? { doubleValue: data.price } : { isNull: true },
                },
                {
                    name: 'countryCode',
                    value: data.countryCode ? { stringValue: data.countryCode } : { isNull: true },
                },
                { name: 'createdAt', value: { stringValue: now } },
                { name: 'updatedAt', value: { stringValue: now } },
            ],
        };

        const insertCommand = new ExecuteStatementCommand(insertParams);
        await rdsDataClient.send(insertCommand);
    }

    return dishId;
}

/**
 * Create imported dish record
 */
async function createImportedDish(data: any, _dbCredentials: any) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    // Check if imported dish record already exists
    const checkSql = `
    SELECT import_id
    FROM imported_dishes
    WHERE dish_id = :dishId AND source_id = :sourceId
  `;

    const checkParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: checkSql,
        parameters: [
            { name: 'dishId', value: { stringValue: data.dishId } },
            { name: 'sourceId', value: { stringValue: data.sourceId } },
        ],
    };

    const checkCommand = new ExecuteStatementCommand(checkParams);
    const checkResult = await rdsDataClient.send(checkCommand);

    const now = new Date().toISOString();

    if (checkResult.records && checkResult.records.length > 0) {
        // Update existing record
        const importId = checkResult.records[0][0].stringValue;

        const updateSql = `
      UPDATE imported_dishes
      SET
        external_id = :externalId,
        external_menu_id = :externalMenuId,
        last_updated = :lastUpdated,
        raw_data = :rawData,
        status = 'ACTIVE',
        confidence_score = :confidenceScore,
        match_method = :matchMethod,
        updated_at = :updatedAt
      WHERE import_id = :importId
    `;

        const updateParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: updateSql,
            parameters: [
                { name: 'externalId', value: { stringValue: data.externalId } },
                {
                    name: 'externalMenuId',
                    value: data.externalMenuId
                        ? { stringValue: data.externalMenuId }
                        : { isNull: true },
                },
                { name: 'lastUpdated', value: { stringValue: now } },
                { name: 'rawData', value: { stringValue: JSON.stringify(data.rawData) } },
                { name: 'confidenceScore', value: { doubleValue: data.confidenceScore } },
                { name: 'matchMethod', value: { stringValue: data.matchMethod } },
                { name: 'updatedAt', value: { stringValue: now } },
                { name: 'importId', value: { stringValue: importId } },
            ],
        };

        const updateCommand = new ExecuteStatementCommand(updateParams);
        await rdsDataClient.send(updateCommand);
    } else {
        // Create new record
        const importId = uuidv4();

        const insertSql = `
      INSERT INTO imported_dishes (
        import_id, dish_id, restaurant_id, source_id, external_id, external_menu_id,
        import_date, last_updated, raw_data, status, confidence_score, match_method,
        created_at, updated_at
      ) VALUES (
        :importId, :dishId, :restaurantId, :sourceId, :externalId, :externalMenuId,
        :importDate, :lastUpdated, :rawData, 'ACTIVE', :confidenceScore, :matchMethod,
        :createdAt, :updatedAt
      )
    `;

        const insertParams = {
            resourceArn: DB_CLUSTER_ARN,
            secretArn: DB_SECRET_ARN,
            database: DB_NAME,
            sql: insertSql,
            parameters: [
                { name: 'importId', value: { stringValue: importId } },
                { name: 'dishId', value: { stringValue: data.dishId } },
                { name: 'restaurantId', value: { stringValue: data.restaurantId } },
                { name: 'sourceId', value: { stringValue: data.sourceId } },
                { name: 'externalId', value: { stringValue: data.externalId } },
                {
                    name: 'externalMenuId',
                    value: data.externalMenuId
                        ? { stringValue: data.externalMenuId }
                        : { isNull: true },
                },
                { name: 'importDate', value: { stringValue: now } },
                { name: 'lastUpdated', value: { stringValue: now } },
                { name: 'rawData', value: { stringValue: JSON.stringify(data.rawData) } },
                { name: 'confidenceScore', value: { doubleValue: data.confidenceScore } },
                { name: 'matchMethod', value: { stringValue: data.matchMethod } },
                { name: 'createdAt', value: { stringValue: now } },
                { name: 'updatedAt', value: { stringValue: now } },
            ],
        };

        const insertCommand = new ExecuteStatementCommand(insertParams);
        await rdsDataClient.send(insertCommand);
    }
}

/**
 * Update job progress
 */
async function updateJobProgress(
    jobId: string,
    successCount: number,
    errorCount: number,
    _dbCredentials: any
) {
    if (!DB_CLUSTER_ARN || !DB_NAME) {
        throw new Error('DB_CLUSTER_ARN and DB_NAME environment variables are required');
    }

    // Get current job status
    const jobSql = `
    SELECT status, processed_records, success_records, error_records, total_records
    FROM import_jobs
    WHERE job_id = :jobId
  `;

    const jobParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: jobSql,
        parameters: [{ name: 'jobId', value: { stringValue: jobId } }],
    };

    const jobCommand = new ExecuteStatementCommand(jobParams);
    const jobResult = await rdsDataClient.send(jobCommand);

    if (!jobResult.records || jobResult.records.length === 0) {
        throw new Error(`Job ${jobId} not found`);
    }

    const jobRecord = jobResult.records[0];
    const currentStatus = jobRecord[0].stringValue;
    const currentProcessed = jobRecord[1].longValue || 0;
    const currentSuccess = jobRecord[2].longValue || 0;
    const currentError = jobRecord[3].longValue || 0;
    const totalRecords = jobRecord[4].longValue || 0;

    // Calculate new values
    const newProcessed = currentProcessed + successCount + errorCount;
    const newSuccess = currentSuccess + successCount;
    const newError = currentError + errorCount;

    // Determine if job is complete
    let newStatus = currentStatus;
    let completedAt = null;

    if (newProcessed >= totalRecords) {
        newStatus = newError > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';
        completedAt = new Date().toISOString();
    }

    // Update job
    const updateSql = `
    UPDATE import_jobs
    SET
      processed_records = :processedRecords,
      success_records = :successRecords,
      error_records = :errorRecords,
      status = :status,
      updated_at = :updatedAt
      ${completedAt ? ', completed_at = :completedAt' : ''}
    WHERE job_id = :jobId
  `;

    const parameters: SqlParameter[] = [
        { name: 'processedRecords', value: { longValue: newProcessed } },
        { name: 'successRecords', value: { longValue: newSuccess } },
        { name: 'errorRecords', value: { longValue: newError } },
        { name: 'status', value: { stringValue: newStatus } },
        { name: 'updatedAt', value: { stringValue: new Date().toISOString() } },
        { name: 'jobId', value: { stringValue: jobId } },
    ];

    if (completedAt) {
        parameters.push({ name: 'completedAt', value: { stringValue: completedAt } });
    }

    const updateParams = {
        resourceArn: DB_CLUSTER_ARN,
        secretArn: DB_SECRET_ARN,
        database: DB_NAME,
        sql: updateSql,
        parameters,
    };

    const updateCommand = new ExecuteStatementCommand(updateParams);
    await rdsDataClient.send(updateCommand);
}

/**
 * Send batch completion event
 */
async function sendBatchCompletionEvent(
    jobId: string,
    batchId: string,
    successCount: number,
    errorCount: number,
    errors?: any[]
) {
    const command = new PutEventsCommand({
        Entries: [
            {
                EventBusName: EVENT_BUS_NAME,
                Source: 'bellyfed.import',
                DetailType: 'IMPORT_BATCH_COMPLETED',
                Detail: JSON.stringify({
                    jobId,
                    batchId,
                    successCount,
                    errorCount,
                    errors,
                    timestamp: new Date().toISOString(),
                    traceId: uuidv4(),
                }),
            },
        ],
    });

    return eventBridgeClient.send(command);
}

/**
 * Send batch failure event
 */
async function sendBatchFailureEvent(jobId: string, batchId: string, errorMessage: string) {
    const command = new PutEventsCommand({
        Entries: [
            {
                EventBusName: EVENT_BUS_NAME,
                Source: 'bellyfed.import',
                DetailType: 'IMPORT_BATCH_FAILED',
                Detail: JSON.stringify({
                    jobId,
                    batchId,
                    error: errorMessage,
                    timestamp: new Date().toISOString(),
                    traceId: uuidv4(),
                }),
            },
        ],
    });

    return eventBridgeClient.send(command);
}
