/**
 * Script to import Nasi Lemak restaurants from JSON file to PostgreSQL database
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Load environment variables from .env.local in the project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

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

// Function to import restaurants from JSON file
async function importRestaurantsFromJson() {
    try {
        console.log('Ensuring restaurants table exists...');
        await ensureRestaurantsTable();

        console.log('Checking if restaurants already exist...');
        const countResult = await pool.query('SELECT COUNT(*) FROM restaurants');
        const count = parseInt(countResult.rows[0].count);

        if (count > 0) {
            console.log(`Found ${count} restaurants in the database. Skipping import.`);
            return;
        }

        // Read restaurants from JSON file
        const jsonFilePath = path.join(__dirname, 'nasi_lemak_restaurants_kl.json');
        console.log(`Reading restaurants from ${jsonFilePath}...`);
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const restaurants = JSON.parse(jsonData);

        console.log(`Importing ${restaurants.length} restaurants...`);
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
                    JSON.stringify(restaurant.hours),
                    restaurant.cuisine_type,
                    restaurant.price_range,
                    restaurant.rating,
                    new Date(),
                    new Date(),
                ]
            );
        }

        console.log('Restaurants imported successfully');

        // Verify import
        const verifyResult = await pool.query('SELECT COUNT(*) FROM restaurants');
        const verifyCount = parseInt(verifyResult.rows[0].count);
        console.log(`Verified ${verifyCount} restaurants in the database.`);

        // Get a sample of restaurants
        const sampleResult = await pool.query('SELECT * FROM restaurants LIMIT 2');
        console.log('\nSample restaurants:');
        sampleResult.rows.forEach((row, index) => {
            console.log(`\n--- Restaurant ${index + 1} ---`);
            console.log(`ID: ${row.restaurant_id}`);
            console.log(`Name: ${row.name}`);
            console.log(`Address: ${row.address}`);
            console.log(`City: ${row.city}`);
            console.log(`Country: ${row.country}`);
            console.log(`Cuisine: ${row.cuisine_type}`);
        });
    } catch (error) {
        console.error('Error importing restaurants:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the function
importRestaurantsFromJson().catch(console.error);
