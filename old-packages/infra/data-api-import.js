/**
 * Script to import Nasi Lemak restaurants using the AWS RDS Data API
 */

const { RDSDataClient, ExecuteStatementCommand } = require('@aws-sdk/client-rds-data');
const _fs = require('fs'); // Unused but kept for potential future use
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize RDS Data API client
const rdsClient = new RDSDataClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Database configuration
const dbConfig = {
    resourceArn: process.env.DB_CLUSTER_ARN,
    secretArn: process.env.DB_SECRET_ARN,
    database: process.env.DB_NAME,
};

// Restaurant data
const restaurants = [
    {
        id: 'ChIJgXRNMy03zDERO_mVRtzZabo',
        name: 'NASI LEMAK UNCLE BOB',
        address: 'Jalan Alor, Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
        latitude: 3.1446941,
        longitude: 101.7075598,
        phone: '019-980 5930',
        website: null,
        rating: 4.6,
        price_level: 2,
        country_code: 'my',
    },
    {
        id: 'ChIJAV9dnJNJzDERq-f77ZzXSvo',
        name: '100 Years Nasi Lemak Kuala Lumpur',
        address: '10, Jalan Galloway, Bukit Bintang, 50150 Kuala Lumpur, Malaysia',
        latitude: 3.1430657,
        longitude: 101.7053061,
        phone: '011-1060 9158',
        website: null,
        rating: 4.8,
        price_level: 2,
        country_code: 'my',
    },
    {
        id: 'ChIJp4iAqFJJzDER4wNGpsJ_y1k',
        name: 'Nalé The Nasi Lemak Company',
        address: 'Lot 1.36.00, Level 1, Pavilion Damansara Heights, 50490 Kuala Lumpur, Malaysia',
        latitude: 3.1471396,
        longitude: 101.6632362,
        phone: '014-688 8223',
        website: 'http://www.thenale.com/',
        rating: 4.8,
        price_level: 3,
        country_code: 'my',
    },
    {
        id: 'ChIJo4rIfjpJzDERdEXXqM934f8',
        name: 'Nasi Lemak Viral Jalan Seri Penchala',
        address: 'Jalan Seri Penchala, Kampung Sungai Penchala, 60000 Kuala Lumpur, Malaysia',
        latitude: 3.1624738,
        longitude: 101.6228273,
        phone: '017-260 2210',
        website: null,
        rating: 5.0,
        price_level: 1,
        country_code: 'my',
    },
    {
        id: 'ChIJR2pYcbtJzDER0SD5ciswtyI',
        name: 'Nasi Lemak Padu Merindu MekSu',
        address: '6, Jalan Telawi 5, Bangsar, 59100 Kuala Lumpur, Malaysia',
        latitude: 3.1327664,
        longitude: 101.6720322,
        phone: '017-371 4363',
        website: null,
        rating: 4.6,
        price_level: 2,
        country_code: 'my',
    },
];

// Function to check if restaurants table exists
async function checkRestaurantsTable() {
    try {
        console.log('Checking if restaurants table exists...');

        const command = new ExecuteStatementCommand({
            ...dbConfig,
            sql: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'restaurants'
        );
      `,
            includeResultMetadata: true,
        });

        const response = await rdsClient.send(command);

        // Parse the response
        const exists = response.records[0][0].booleanValue;

        if (!exists) {
            console.log('Restaurants table does not exist. Creating table...');
            await createRestaurantsTable();
        } else {
            console.log('Restaurants table already exists.');
        }

        return exists;
    } catch (error) {
        console.error('Error checking restaurants table:', error);
        throw error;
    }
}

// Function to create restaurants table
async function createRestaurantsTable() {
    try {
        console.log('Creating restaurants table...');

        const command = new ExecuteStatementCommand({
            ...dbConfig,
            sql: `
        CREATE TABLE IF NOT EXISTS restaurants (
          restaurant_id VARCHAR(36) PRIMARY KEY,
          google_place_id VARCHAR(255) UNIQUE,
          name VARCHAR(255) NOT NULL,
          address TEXT,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          phone VARCHAR(50),
          website VARCHAR(255),
          rating DECIMAL(2, 1),
          price_level INT,
          photo_reference TEXT,
          country_code VARCHAR(10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
        });

        await rdsClient.send(command);
        console.log('Restaurants table created successfully.');
    } catch (error) {
        console.error('Error creating restaurants table:', error);
        throw error;
    }
}

// Function to check if restaurants already exist
async function checkRestaurantsExist() {
    try {
        console.log('Checking if restaurants already exist...');

        const command = new ExecuteStatementCommand({
            ...dbConfig,
            sql: 'SELECT COUNT(*) FROM restaurants;',
            includeResultMetadata: true,
        });

        const response = await rdsClient.send(command);

        // Parse the response
        const count = parseInt(response.records[0][0].longValue);

        console.log(`Found ${count} restaurants in the database.`);
        return count;
    } catch (error) {
        console.error('Error checking restaurants count:', error);
        throw error;
    }
}

// Function to import restaurants
async function importRestaurants() {
    try {
        // Check if table exists
        await checkRestaurantsTable();

        // Check if restaurants already exist
        const count = await checkRestaurantsExist();

        if (count > 0) {
            console.log('Restaurants already exist in the database. Skipping import.');
            return;
        }

        console.log('Importing restaurants...');

        // Import each restaurant
        for (const restaurant of restaurants) {
            const restaurantId = require('crypto').randomUUID();

            console.log(`Importing restaurant: ${restaurant.name} (${restaurantId})`);

            const command = new ExecuteStatementCommand({
                ...dbConfig,
                sql: `
          INSERT INTO restaurants (
            restaurant_id,
            google_place_id,
            name,
            address,
            latitude,
            longitude,
            phone,
            website,
            rating,
            price_level,
            country_code,
            created_at,
            updated_at
          ) VALUES (
            :restaurant_id,
            :google_place_id,
            :name,
            :address,
            :latitude,
            :longitude,
            :phone,
            :website,
            :rating,
            :price_level,
            :country_code,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (google_place_id) DO NOTHING;
        `,
                parameters: [
                    { name: 'restaurant_id', value: { stringValue: restaurantId } },
                    { name: 'google_place_id', value: { stringValue: restaurant.id } },
                    { name: 'name', value: { stringValue: restaurant.name } },
                    { name: 'address', value: { stringValue: restaurant.address } },
                    { name: 'latitude', value: { doubleValue: restaurant.latitude } },
                    { name: 'longitude', value: { doubleValue: restaurant.longitude } },
                    { name: 'phone', value: { stringValue: restaurant.phone } },
                    {
                        name: 'website',
                        value: restaurant.website
                            ? { stringValue: restaurant.website }
                            : { isNull: true },
                    },
                    { name: 'rating', value: { doubleValue: restaurant.rating } },
                    { name: 'price_level', value: { longValue: restaurant.price_level } },
                    { name: 'country_code', value: { stringValue: restaurant.country_code } },
                ],
            });

            await rdsClient.send(command);
            console.log(`Restaurant ${restaurant.name} imported successfully.`);
        }

        console.log('All restaurants imported successfully.');

        // Verify import
        const finalCount = await checkRestaurantsExist();
        console.log(`Verified ${finalCount} restaurants in the database.`);
    } catch (error) {
        console.error('Error importing restaurants:', error);
        throw error;
    }
}

// Run the import function
importRestaurants().catch(console.error);
