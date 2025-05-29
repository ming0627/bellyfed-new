/**
 * PostgreSQL Restaurant Import Script
 *
 * This script imports restaurant data from Google Maps API into PostgreSQL RDS:
 * 1. Searches for restaurants using Google Maps API
 * 2. Fetches detailed information for each restaurant
 * 3. Transforms the data to match the PostgreSQL schema
 * 4. Imports the data directly into PostgreSQL RDS
 *
 * Required Environment Variables (.env):
 * - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: Google Maps API key
 * - DATABASE_URL: PostgreSQL connection string
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from scripts/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate API key
if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  throw new Error(
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required in the environment variables',
  );
}

// Validate database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in the environment variables');
}

// Create PostgreSQL client if not in test mode
let pool;
if (!process.env.TEST_MODE || process.env.TEST_MODE !== 'true') {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

// Default configuration object for search parameters
const defaultConfig = {
  locations: [
    {
      name: 'Singapore',
      locationName: 'Singapore',
    },
  ],
  searchRadius: 10000, // 10km radius (only used when coordinates are provided)
  searchDish: 'Fried Rice',
  minReviews: 100,
  maxReviews: null,
  minRating: 3.5,
  maxResults: 20,
  searchType: 'restaurant',
  searchRegion: 'Singapore',
  searchQuery: (dish, location) => `best ${dish} in ${location}`, // Simplified query for better results
  testMode: process.env.TEST_MODE === 'true' || false,
};

// Helper function to map price level to price range string
function getPriceRange(priceLevel) {
  if (!priceLevel) return 1;
  return Math.min(Math.max(priceLevel, 1), 4);
}

// Helper function to format time from "0000" to "00:00"
function formatTime(hour, minute) {
  if (hour === undefined || minute === undefined) return null;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Helper function to map day number to day name
function getDayOfWeek(day) {
  const days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  return days[day];
}

// Helper function to parse address components
function parseAddressComponents(components) {
  if (!components) return {};

  const addressMap = {};

  components.forEach((component) => {
    if (component.types.includes('street_number')) {
      addressMap.streetNumber = component.longText;
    } else if (component.types.includes('route')) {
      addressMap.street = component.longText;
    } else if (component.types.includes('sublocality_level_1')) {
      addressMap.suburb = component.longText;
    } else if (component.types.includes('locality')) {
      addressMap.city = component.longText;
    } else if (component.types.includes('administrative_area_level_1')) {
      addressMap.state = component.longText;
    } else if (component.types.includes('country')) {
      addressMap.country = component.longText;
    } else if (component.types.includes('postal_code')) {
      addressMap.postalCode = component.longText;
    }
  });

  // Construct street address
  addressMap.streetAddress =
    addressMap.streetNumber && addressMap.street
      ? `${addressMap.streetNumber}, ${addressMap.street}`
      : addressMap.street || '';

  if (addressMap.suburb) {
    addressMap.streetAddress += `, ${addressMap.suburb}`;
  }

  return addressMap;
}

// Helper function to generate ID from restaurant name and location
function generateRestaurantId(details) {
  if (!details) return '';

  // Get restaurant name
  const name = details.displayName?.text || '';

  // Find sublocality from address components
  const sublocality =
    details.addressComponents?.find(
      (component) =>
        component.types.includes('neighborhood') &&
        component.types.includes('political'),
    ) ||
    details.addressComponents?.find((component) =>
      component.types.includes('route'),
    );

  const location = sublocality?.shortText || '';

  // Combine name and location, convert to lowercase and replace non-alphanumeric with dash
  const combined = `${name}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/-+/g, '-'); // Replace multiple dashes with single dash

  return combined;
}

async function fetchPlaceDetails(placeId) {
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': '*', // Request all available fields
        },
      },
    );

    // Save details with clear naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const detailsPath = path.join(
      __dirname,
      'data',
      'raw_api_responses',
      `2_details_${placeId}_${timestamp}.json`,
    );
    await fs.mkdir(path.join(__dirname, 'data', 'raw_api_responses'), {
      recursive: true,
    });
    await fs.writeFile(detailsPath, JSON.stringify(response.data, null, 2));
    console.log(`Saved place details (complete data) to ${detailsPath}`);

    return response.data;
  } catch (error) {
    if (error.response?.data) {
      console.error(
        'API Response:',
        JSON.stringify(error.response.data, null, 2),
      );
    }
    console.error('Error fetching place details:', error.message);
    throw error;
  }
}

async function searchNearbyPlaces(location, searchTerm, config) {
  const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    'X-Goog-FieldMask': '*', // Request all available fields
  };

  try {
    const requestBody = {
      textQuery: searchTerm,
      includedType: 'restaurant',
    };

    // Add location bias based on what's provided
    if (location.coordinates) {
      // Use circle bias if coordinates are provided
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.coordinates.lat,
            longitude: location.coordinates.lng,
          },
          radius: config.searchRadius,
        },
      };
    } else if (location.locationName) {
      // Use location name in the search query
      requestBody.textQuery = `${searchTerm} in ${location.locationName}`;
    }

    const response = await axios.post(searchUrl, requestBody, { headers });

    const places = response.data.places || [];
    console.log(
      `Found ${places.length} places for search term: ${searchTerm} in ${location.name}`,
    );

    // Filter places based on minimum reviews and rating
    return places.filter((place) => {
      const hasEnoughReviews = place.userRatingCount >= config.minReviews;
      const withinMaxReviews = config.maxReviews
        ? place.userRatingCount <= config.maxReviews
        : true;
      const hasMinRating = place.rating >= config.minRating;
      return hasEnoughReviews && withinMaxReviews && hasMinRating;
    });
  } catch (error) {
    console.error(
      'Error searching places:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

function transformPlaceToRestaurant(place, details) {
  // Save combined raw data
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const combinedPath = path.join(
    __dirname,
    'data',
    'raw_api_responses',
    `combined_${details.id}_${timestamp}.json`,
  );
  fs.writeFile(combinedPath, JSON.stringify({ place, details }, null, 2))
    .then(() => console.log(`Saved combined data to ${combinedPath}`))
    .catch((err) => console.error('Error saving combined data:', err));

  // Parse address components
  const addressInfo = parseAddressComponents(details.addressComponents);

  // Generate restaurant ID using the existing function
  const restaurantId = uuidv4(); // Use UUID for database primary key

  // Transform opening hours to schedules
  const schedules =
    details.regularOpeningHours?.periods?.map((period) => ({
      dayOfWeek: getDayOfWeek(period.open.day),
      startTime: `${period.open.hour.toString().padStart(2, '0')}:${period.open.minute.toString().padStart(2, '0')}`,
      endTime: `${period.close.hour.toString().padStart(2, '0')}:${period.close.minute.toString().padStart(2, '0')}`,
      isRecurring: true,
    })) || [];

  // Ensure the place is a restaurant
  if (!details.types.includes('restaurant')) {
    console.log(
      `Skipping place ${details.displayName.text} as it is not a restaurant`,
    );
    return null;
  }

  // Extract cuisine types from various sources
  const cuisineTypes = new Set();

  // Add types that are food-related
  details.types?.forEach((type) => {
    if (type.includes('food') || type.includes('cuisine')) {
      cuisineTypes.add(type.replace(/_/g, ' ').toLowerCase());
    }
  });

  // Add the search dish
  if (place.searchDish) {
    cuisineTypes.add(place.searchDish);
  }

  // Format hours as JSONB for PostgreSQL
  const hoursJson = {};
  schedules.forEach((schedule) => {
    hoursJson[schedule.dayOfWeek] = {
      open: schedule.startTime,
      close: schedule.endTime,
    };
  });

  return {
    restaurant_id: restaurantId,
    google_place_id: details.id,
    name: details.displayName.text,
    address: addressInfo.streetAddress,
    city: addressInfo.city,
    state: addressInfo.state,
    country: addressInfo.country,
    postal_code: addressInfo.postalCode,
    latitude: details.location?.latitude,
    longitude: details.location?.longitude,
    phone:
      details.internationalPhoneNumber ||
      details.nationalPhoneNumber ||
      details.phoneNumbers?.[0]?.number ||
      '',
    website: details.websiteUri || '',
    hours: JSON.stringify(hoursJson),
    cuisine_type: Array.from(cuisineTypes),
    price_range: getPriceRange(details.priceLevel),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function importRestaurantToPostgres(restaurant) {
  // In test mode, just return a mock restaurant ID
  if (process.env.TEST_MODE === 'true') {
    const restaurantId = restaurant.restaurant_id || uuidv4();
    console.log(
      `TEST MODE: Would import restaurant: ${restaurant.name} (${restaurantId})`,
    );
    return restaurantId;
  }

  if (!pool) {
    throw new Error(
      'Database pool not initialized. Make sure DATABASE_URL is set correctly.',
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if restaurant already exists
    const checkResult = await client.query(
      'SELECT restaurant_id FROM restaurants WHERE google_place_id = $1',
      [restaurant.google_place_id],
    );

    let restaurantId;

    if (checkResult.rows.length > 0) {
      // Update existing restaurant
      restaurantId = checkResult.rows[0].restaurant_id;
      console.log(
        `Updating existing restaurant: ${restaurant.name} (${restaurantId})`,
      );

      await client.query(
        `UPDATE restaurants SET
                name = $1, address = $2, city = $3, state = $4, country = $5,
                postal_code = $6, latitude = $7, longitude = $8, phone = $9,
                website = $10, hours = $11, cuisine_type = $12, price_range = $13,
                updated_at = $14
                WHERE restaurant_id = $15`,
        [
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
          new Date(),
          restaurantId,
        ],
      );
    } else {
      // Insert new restaurant
      restaurantId = restaurant.restaurant_id;
      console.log(
        `Inserting new restaurant: ${restaurant.name} (${restaurantId})`,
      );

      await client.query(
        `INSERT INTO restaurants (
                restaurant_id, google_place_id, name, address, city, state, country,
                postal_code, latitude, longitude, phone, website, hours, cuisine_type,
                price_range, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
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
          new Date(),
          new Date(),
        ],
      );
    }

    await client.query('COMMIT');
    return restaurantId;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error importing restaurant ${restaurant.name}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function fetchAndImportRestaurants(config = defaultConfig) {
  try {
    const restaurants = [];
    const importedRestaurants = [];
    let totalFound = 0;

    for (const location of config.locations) {
      console.log(`Searching for restaurants in ${location.name}...`);
      const searchQuery = config.searchQuery(config.searchDish, location.name);
      console.log(`Search query: ${searchQuery}`);

      const places = await searchNearbyPlaces(location, searchQuery, config);
      totalFound += places.length;

      // Add search dish to each place for reference
      places.forEach((place) => {
        place.searchDish = config.searchDish;
      });

      // Limit results if maxResults is specified
      const limitedPlaces = config.maxResults
        ? places.slice(0, config.maxResults)
        : places;

      console.log(
        `Processing ${limitedPlaces.length} restaurants (out of ${places.length} found)...`,
      );

      for (const place of limitedPlaces) {
        try {
          console.log(`Fetching details for ${place.displayName?.text}...`);
          const details = await fetchPlaceDetails(place.id);
          const restaurant = transformPlaceToRestaurant(place, details);

          if (restaurant) {
            restaurants.push(restaurant);

            // Import to PostgreSQL
            if (!config.testMode) {
              const restaurantId = await importRestaurantToPostgres(restaurant);
              importedRestaurants.push({
                id: restaurantId,
                name: restaurant.name,
                rating: details.rating,
                reviewCount: details.userRatingCount,
              });
            }
          }
        } catch (error) {
          console.error(`Error processing place ${place.id}:`, error.message);
        }
      }
    }

    // Save all restaurants to a single file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(
      __dirname,
      'data',
      'restaurants',
      `${config.searchDish.replace(/\s+/g, '_')}_${config.minReviews}reviews_${timestamp}.json`,
    );
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(restaurants, null, 2));
    console.log(`Saved ${restaurants.length} restaurants to ${outputPath}`);

    return {
      totalFound,
      processed: restaurants.length,
      imported: importedRestaurants.length,
      restaurants: importedRestaurants,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching and importing restaurants:', error.message);
    throw error;
  }
}

// Check if database tables exist and create them if they don't
async function ensureDatabaseTables() {
  // Skip database check in test mode
  if (process.env.TEST_MODE === 'true') {
    console.log('Running in TEST_MODE - skipping database table check');
    return;
  }

  if (!pool) {
    throw new Error(
      'Database pool not initialized. Make sure DATABASE_URL is set correctly.',
    );
  }

  const client = await pool.connect();
  try {
    // Check if restaurants table exists
    const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'restaurants'
            );
        `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating restaurants table...');
      await client.query(`
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

    // Check if dishes table exists
    const dishesCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'dishes'
            );
        `);

    if (!dishesCheck.rows[0].exists) {
      console.log('Creating dishes table...');
      await client.query(`
                CREATE TABLE dishes (
                    dish_id UUID PRIMARY KEY,
                    restaurant_id UUID REFERENCES restaurants(restaurant_id),
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10, 2),
                    image_url VARCHAR(255),
                    dish_type VARCHAR(100) NOT NULL,
                    tags VARCHAR(50)[],
                    is_seasonal BOOLEAN DEFAULT FALSE,
                    is_available BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX idx_dishes_restaurant ON dishes(restaurant_id);
                CREATE INDEX idx_dishes_type ON dishes(dish_type);
                CREATE INDEX idx_dishes_tags ON dishes USING GIN (tags);
            `);
      console.log('Dishes table created successfully');
    } else {
      console.log('Dishes table already exists');
    }
  } catch (error) {
    console.error('Error ensuring database tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Main function to run from command line
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const searchDish = args[0] || 'Fried Rice';
    const minReviews = parseInt(args[1]) || 100;
    const minRating = parseFloat(args[2]) || 3.5;
    const maxResults = parseInt(args[3]) || 20;

    console.log(
      `Searching for ${searchDish} restaurants with at least ${minReviews} reviews and ${minRating} rating...`,
    );

    // Ensure database tables exist
    await ensureDatabaseTables();

    // Run the import with custom config
    const config = {
      ...defaultConfig,
      searchDish,
      minReviews,
      minRating,
      maxResults,
    };

    const result = await fetchAndImportRestaurants(config);

    console.log('\nImport Summary:');
    console.log(`Total restaurants found: ${result.totalFound}`);
    console.log(`Restaurants processed: ${result.processed}`);
    console.log(`Restaurants imported to PostgreSQL: ${result.imported}`);
    console.log(`Import completed at: ${result.timestamp}`);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    // Close the database pool if it exists
    if (pool) {
      await pool.end();
    }
  }
}

// If running directly (not imported)
if (import.meta.url === new URL(import.meta.url).href) {
  main().catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

export { fetchAndImportRestaurants, ensureDatabaseTables };
