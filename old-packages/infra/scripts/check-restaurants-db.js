/**
 * Script to check if there are restaurants in the PostgreSQL database
 *
 * This script connects to the PostgreSQL database and checks if there are any
 * restaurants in the 'restaurants' table.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local in the project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function checkRestaurants() {
    try {
        console.log('Connecting to PostgreSQL database...');
        console.log(`Connection string: ${process.env.DATABASE_URL ? 'Found' : 'Not found'}`);

        // Check if restaurants table exists
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'restaurants'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            console.log('The restaurants table does not exist in the database.');
            return;
        }

        // Count restaurants
        const countResult = await pool.query('SELECT COUNT(*) FROM restaurants');
        const count = parseInt(countResult.rows[0].count);

        console.log(`Found ${count} restaurants in the database.`);

        if (count > 0) {
            // Get a sample of restaurants
            const sampleResult = await pool.query('SELECT * FROM restaurants LIMIT 5');
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
        }
    } catch (error) {
        console.error('Error checking restaurants:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the function
checkRestaurants().catch(console.error);
