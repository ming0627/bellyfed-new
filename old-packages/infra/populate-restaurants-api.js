/**
 * Script to populate the restaurants table with Nasi Lemak restaurants from Kuala Lumpur
 * using the admin API endpoint
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

// API base URL - use environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Nasi Lemak restaurants data from Google Maps
const restaurants = [
    {
        id: 'ChIJgXRNMy03zDERO_mVRtzZabo',
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
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 100,
    },
    {
        id: 'ChIJAV9dnJNJzDERq-f77ZzXSvo',
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
        priceLevel: 2,
        rating: 4.8,
        reviewCount: 120,
    },
    {
        id: 'ChIJp4iAqFJJzDER4wNGpsJ_y1k',
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
        priceLevel: 3,
        rating: 4.8,
        reviewCount: 150,
    },
    {
        id: 'ChIJo4rIfjpJzDERdEXXqM934f8',
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
        priceLevel: 1,
        rating: 5.0,
        reviewCount: 80,
    },
    {
        id: 'ChIJR2pYcbtJzDER0SD5ciswtyI',
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
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 90,
    },
];

// Function to import restaurants using the admin API
async function importRestaurants() {
    try {
        console.log('Importing restaurants via API...');

        // Call the admin API endpoint to import restaurants
        const response = await axios.post(
            `${API_BASE_URL}/api/admin/restaurants/import`,
            {
                restaurants,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // Add any required authentication headers here
                    Authorization: `Bearer ${process.env.API_TOKEN || ''}`,
                },
            }
        );

        console.log('API Response:', response.data);
        console.log(`Successfully imported ${response.data.imported} restaurants.`);

        // Save the response to a file for reference
        const outputPath = path.join(__dirname, 'import-results.json');
        fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
        console.log(`Results saved to ${outputPath}`);

        return response.data;
    } catch (error) {
        console.error('Error importing restaurants via API:', error.message);
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
        throw error;
    }
}

// Alternative function to create a direct SQL script for manual execution
function generateSqlScript() {
    try {
        console.log('Generating SQL script for manual execution...');

        let sqlScript = `
-- SQL Script to insert Nasi Lemak restaurants from Kuala Lumpur
-- Generated on ${new Date().toISOString()}

-- Ensure the restaurants table exists
CREATE TABLE IF NOT EXISTS restaurants (
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

-- Insert restaurants
`;

        // Add INSERT statements for each restaurant
        restaurants.forEach((restaurant) => {
            const restaurantId = uuidv4();
            sqlScript += `
INSERT INTO restaurants (
  restaurant_id, google_place_id, name, address, city, state, country,
  postal_code, latitude, longitude, phone, website, cuisine_type,
  price_range, rating, created_at, updated_at
) VALUES (
  '${restaurantId}', 
  '${restaurant.id}', 
  '${restaurant.name.replace(/'/g, "''")}', 
  '${restaurant.address.replace(/'/g, "''")}', 
  '${restaurant.city.replace(/'/g, "''")}', 
  '${restaurant.state.replace(/'/g, "''")}', 
  '${restaurant.country.replace(/'/g, "''")}',
  '${restaurant.postal_code}', 
  ${restaurant.latitude}, 
  ${restaurant.longitude}, 
  '${restaurant.phone || ''}', 
  ${restaurant.website ? `'${restaurant.website}'` : 'NULL'}, 
  ARRAY['Malaysian', 'Nasi Lemak']::VARCHAR(100)[], 
  ${restaurant.priceLevel}, 
  ${restaurant.rating},
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
) ON CONFLICT (google_place_id) DO NOTHING;
`;
        });

        // Save the SQL script to a file
        const outputPath = path.join(__dirname, 'import-restaurants.sql');
        fs.writeFileSync(outputPath, sqlScript);
        console.log(`SQL script saved to ${outputPath}`);

        return sqlScript;
    } catch (error) {
        console.error('Error generating SQL script:', error.message);
        throw error;
    }
}

// Run the import function or generate SQL script based on command line argument
const args = process.argv.slice(2);
if (args[0] === '--sql') {
    generateSqlScript();
} else {
    importRestaurants().catch(console.error);
}
