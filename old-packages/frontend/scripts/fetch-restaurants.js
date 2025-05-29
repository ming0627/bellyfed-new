import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Configuration object for search parameters
const config = {
  locations: [
    {
      name: 'Singapore',
      locationName: 'Singapore',
    },
  ],
  searchRadius: 10000, // 10km radius (only used when coordinates are provided)
  searchDish: 'Nasi Lemak',
  minReviews: 100,
  maxReviews: null,
  searchType: 'restaurant',
  searchRegion: 'Singapore',
  searchQuery: (dish, location) => `best ${dish} in ${location}`, // Simplified query for better results
  testMode: process.env.TEST_MODE === 'true' || false,
  maxResults: process.env.MAX_RESULTS
    ? parseInt(process.env.MAX_RESULTS)
    : null,
};

// Helper function to map price level to price range string
function getPriceRange(priceLevel) {
  if (!priceLevel) return '$';
  switch (priceLevel) {
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return '$';
  }
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

async function searchNearbyPlaces(location, searchTerm) {
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

    // Filter places based on minimum reviews
    return places.filter((place) => {
      const hasEnoughReviews = place.userRatingCount >= config.minReviews;
      const withinMaxReviews = config.maxReviews
        ? place.userRatingCount <= config.maxReviews
        : true;
      return hasEnoughReviews && withinMaxReviews;
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
  const restaurantId = generateRestaurantId(details);

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
    if (type.includes('food')) {
      cuisineTypes.add(type.replace(/_/g, ' ').toLowerCase());
    }
  });

  // Add the search dish
  cuisineTypes.add(config.searchDish);

  return {
    id: restaurantId,
    googlePlaceId: details.id,
    name: details.displayName.text,
    type: 'restaurant',
    description: details.editorialSummary?.text || details.formattedAddress,
    cuisineTypes: Array.from(cuisineTypes),
    priceRange: getPriceRange(details.priceLevel),
    isCurrentlyOperating: true,
    locations: [
      {
        name: details.displayName.text,
        info: {
          address: addressInfo.streetAddress,
          city: addressInfo.city,
          state: addressInfo.state,
          country: addressInfo.country,
          postalCode: addressInfo.postalCode,
          coordinates: {
            latitude: details.location?.latitude,
            longitude: details.location?.longitude,
          },
        },
      },
    ],
    schedules,
    contact: {
      phone:
        details.internationalPhoneNumber ||
        details.nationalPhoneNumber ||
        details.phoneNumbers?.[0]?.number ||
        '',
      email: details.emailAddresses?.[0] || '',
      website: details.websiteUri || '',
    },
    facilities: {
      parking: details.parkingOptions
        ? {
            type: details.parkingOptions.type,
            available: true,
          }
        : undefined,
      wifi: details.hasWifi
        ? {
            available: true,
            type: 'FREE',
          }
        : undefined,
      seating: details.dineIn
        ? {
            available: true,
            type: 'INDOOR',
          }
        : undefined,
      payment: details.paymentOptions
        ? {
            methods: details.paymentOptions,
          }
        : undefined,
    },
    ranking: {
      type: 'GENERAL',
      totalScore: details.rating || 0,
      reviewCount: details.userRatingCount || 0,
      category: 'FOOD_AND_BEVERAGE',
    },
    photos:
      details.photos?.map((photo) => {
        // Remove the 'places/placeId/photos/' prefix from the photo reference
        const photoReference = photo.name.split('/photos/')[1];
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&maxheight=800&photo_reference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      }) || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function fetchRestaurants() {
  try {
    const restaurants = [];
    for (const location of config.locations) {
      console.log(`Searching for restaurants in ${location.name}...`);
      const places = await searchNearbyPlaces(
        location,
        config.searchQuery(config.searchDish, location.name),
      );

      for (const place of places) {
        try {
          console.log(`Fetching details for ${place.displayName?.text}...`);
          const details = await fetchPlaceDetails(place.id);
          const restaurant = transformPlaceToRestaurant(place, details);
          if (restaurant) {
            restaurants.push(restaurant);
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
      `nasi_lemak_100reviews_${timestamp}.json`,
    );
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(restaurants, null, 2));
    console.log(`Saved ${restaurants.length} restaurants to ${outputPath}`);
  } catch (error) {
    console.error('Error fetching restaurants:', error.message);
    throw error;
  }
}

// If running directly (not imported)
if (import.meta.url === new URL(import.meta.url).href) {
  fetchRestaurants().catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

export { fetchRestaurants };
