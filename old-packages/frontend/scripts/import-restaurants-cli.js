#!/usr/bin/env node

/**
 * Command-line script to import restaurants from Google Maps to PostgreSQL
 *
 * Usage:
 *   node import-restaurants-cli.js [dish] [minReviews] [minRating] [maxResults]
 *
 * Example:
 *   node import-restaurants-cli.js "Fried Rice" 100 3.5 20
 */

import {
  fetchAndImportRestaurants,
  ensureDatabaseTables,
} from './import-to-postgres.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from scripts/.env
dotenv.config({ path: path.join(__dirname, '.env') });

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
      locations: [
        {
          name: 'Singapore',
          locationName: 'Singapore',
        },
      ],
      searchRadius: 10000,
      searchDish,
      minReviews,
      minRating,
      maxResults,
      searchType: 'restaurant',
      searchRegion: 'Singapore',
      searchQuery: (dish, location) => `best ${dish} in ${location}`,
      testMode: process.env.TEST_MODE === 'true' || false,
    };

    const result = await fetchAndImportRestaurants(config);

    console.log('\nImport Summary:');
    console.log(`Total restaurants found: ${result.totalFound}`);
    console.log(`Restaurants processed: ${result.processed}`);
    console.log(`Restaurants imported to PostgreSQL: ${result.imported}`);
    console.log(`Import completed at: ${result.timestamp}`);

    if (result.restaurants && result.restaurants.length > 0) {
      console.log('\nImported Restaurants:');
      result.restaurants.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name}`);
      });
    }
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
