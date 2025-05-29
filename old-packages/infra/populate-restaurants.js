/**
 * Script to populate the restaurants table with Nasi Lemak restaurants from Kuala Lumpur
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables from .env.local in the project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Sample restaurants data from Google Maps
const restaurants = [
    {
        name: 'NASI LEMAK UNCLE BOB',
        address:
            'Jalan Alor, Bukit Bintang, 55100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        postal_code: '55100',
        latitude: 3.1446941,
        longitude: 101.7075598,
        phone: '019-980 5930',
        website: null,
        hours: JSON.stringify({
            monday: 'Open 24 hours',
            tuesday: 'Open 24 hours',
            wednesday: 'Open 24 hours',
            thursday: 'Open 24 hours',
            friday: 'Open 24 hours',
            saturday: 'Open 24 hours',
            sunday: 'Open 24 hours',
        }),
        cuisine_type: ['Malaysian', 'Nasi Lemak'],
        price_range: 2,
        google_place_id: 'ChIJgXRNMy03zDERO_mVRtzZabo',
        rating: 4.6,
    },
    {
        name: '100 Years Nasi Lemak Kuala Lumpur',
        address:
            '10, Jalan Galloway, Bukit Bintang, 50150 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        postal_code: '50150',
        latitude: 3.1430657,
        longitude: 101.7053061,
        phone: '011-1060 9158',
        website: null,
        hours: JSON.stringify({
            monday: '9:00 AM – 12:00 AM',
            tuesday: '9:00 AM – 12:00 AM',
            wednesday: '9:00 AM – 12:00 AM',
            thursday: '9:00 AM – 12:00 AM',
            friday: '9:00 AM – 12:00 AM',
            saturday: '9:00 AM – 12:00 AM',
            sunday: '9:00 AM – 12:00 AM',
        }),
        cuisine_type: ['Malaysian', 'Nasi Lemak'],
        price_range: 2,
        google_place_id: 'ChIJAV9dnJNJzDERq-f77ZzXSvo',
        rating: 4.8,
    },
    {
        name: 'Nalé The Nasi Lemak Company',
        address:
            'Lot 1.36.00, Level, 1, Pavilion Damansara Heights Rd, Pusat Bandar Damansara, 50490 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        postal_code: '50490',
        latitude: 3.1471396,
        longitude: 101.6632362,
        phone: '014-688 8223',
        website: 'http://www.thenale.com/',
        hours: JSON.stringify({
            monday: '10:00 AM – 10:00 PM',
            tuesday: '10:00 AM – 10:00 PM',
            wednesday: '10:00 AM – 10:00 PM',
            thursday: '10:00 AM – 10:00 PM',
            friday: '10:00 AM – 10:00 PM',
            saturday: '10:00 AM – 10:00 PM',
            sunday: '10:00 AM – 10:00 PM',
        }),
        cuisine_type: ['Malaysian', 'Nasi Lemak'],
        price_range: 3,
        google_place_id: 'ChIJp4iAqFJJzDER4wNGpsJ_y1k',
        rating: 4.8,
    },
    {
        name: 'Nasi Lemak Viral Jalan Seri Penchala',
        address:
            'Jalan Seri Penchala, Kampung Sungai Penchala, 60000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        postal_code: '60000',
        latitude: 3.1624738,
        longitude: 101.6228273,
        phone: '017-260 2210',
        website: null,
        hours: JSON.stringify({
            monday: '5:00 PM – 1:00 AM',
            tuesday: '5:00 PM – 1:00 AM',
            wednesday: '5:00 PM – 1:00 AM',
            thursday: '5:00 PM – 1:00 AM',
            friday: '9:00 AM – 5:00 PM',
            saturday: '9:00 AM – 5:00 PM',
            sunday: 'Closed',
        }),
        cuisine_type: ['Malaysian', 'Nasi Lemak'],
        price_range: 1,
        google_place_id: 'ChIJo4rIfjpJzDERdEXXqM934f8',
        rating: 5.0,
    },
    {
        name: 'Nasi Lemak Padu Merindu MekSu',
        address:
            '6, Jalan Telawi 5, Bangsar, 59100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        postal_code: '59100',
        latitude: 3.1327664,
        longitude: 101.6720322,
        phone: '017-371 4363',
        website: null,
        hours: JSON.stringify({
            monday: 'Closed',
            tuesday: '7:00 PM – 1:00 AM',
            wednesday: '7:00 PM – 1:00 AM',
            thursday: '7:00 PM – 1:00 AM',
            friday: '7:00 PM – 1:00 AM',
            saturday: '7:00 PM – 1:00 AM',
            sunday: '7:00 PM – 1:00 AM',
        }),
        cuisine_type: ['Malaysian', 'Nasi Lemak'],
        price_range: 2,
        google_place_id: 'ChIJR2pYcbtJzDER0SD5ciswtyI',
        rating: 4.6,
    },
];

// Function to check if restaurants table exists and create it if it doesn't
async function ensureRestaurantsTable() {
    try {
        // Check if restaurants table exists
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'restaurants'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            console.log('Creating restaurants table...');
            await pool.query(`
        CREATE TABLE restaurants (
          restaurant_id UUID PRIMARY KEY,
          google_place_id VARCHAR(255) UNIQUE,
          name VARCHAR(255) NOT NULL,
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          country VARCHAR(100),
          postal_code VARCHAR(20),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          phone VARCHAR(20),
          website VARCHAR(255),
          hours JSONB,
          cuisine_type VARCHAR(100)[],
          price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
          rating DECIMAL(2, 1),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_restaurants_location ON restaurants(city, state, country);
        CREATE INDEX idx_restaurants_cuisine ON restaurants USING GIN (cuisine_type);
        CREATE INDEX idx_restaurants_geo ON restaurants(latitude, longitude);
      `);
            console.log('Restaurants table created successfully');
        } else {
            console.log('Restaurants table already exists');
        }
    } catch (error) {
        console.error('Error ensuring restaurants table:', error);
        throw error;
    }
}

// Function to populate restaurants
async function populateRestaurants() {
    try {
        console.log('Ensuring restaurants table exists...');
        await ensureRestaurantsTable();

        console.log('Checking if restaurants already exist...');
        const countResult = await pool.query('SELECT COUNT(*) FROM restaurants');
        const count = parseInt(countResult.rows[0].count);

        if (count > 0) {
            console.log(`Found ${count} restaurants in the database. Skipping population.`);
            return;
        }

        console.log('Populating restaurants...');
        for (const restaurant of restaurants) {
            const restaurantId = uuidv4();
            console.log(`Inserting restaurant: ${restaurant.name} (${restaurantId})`);

            await pool.query(
                `INSERT INTO restaurants (
          restaurant_id, google_place_id, name, address, city, state, country,
          postal_code, latitude, longitude, phone, website, hours, cuisine_type,
          price_range, rating, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                [
                    restaurantId,
                    restaurant.google_place_id,
                    restaurant.name,
                    restaurant.address,
                    restaurant.city,
                    restaurant.state,
                    restaurant.country,
                    restaurant.postal_code,
                    restaurant.latitude,
                    restaurant.longitude,
                    restaurant.phone,
                    restaurant.website,
                    restaurant.hours,
                    restaurant.cuisine_type,
                    restaurant.price_range,
                    restaurant.rating,
                    new Date(),
                    new Date(),
                ]
            );
        }

        console.log('Restaurants populated successfully');
    } catch (error) {
        console.error('Error populating restaurants:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the function
populateRestaurants().catch(console.error);
