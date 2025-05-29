import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import axios from 'axios';

const secretsManager = new SecretsManager({});

interface PlaceDetails {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    rating?: number;
    price_level?: number;
    opening_hours?: {
        periods: Array<{
            open: { day: number; time: string };
            close: { day: number; time: string };
        }>;
        weekday_text: string[];
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    types?: string[];
    business_status?: string;
}

interface TransformedPlaceDetails {
    name: string;
    description: string;
    cuisineTypes: string[];
    priceRange: string;
    isCurrentlyOperating: boolean;
    locations: Array<{
        info: {
            address: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
        coordinates: {
            latitude: number;
            longitude: number;
        };
    }>;
    schedules: {
        [key: string]: {
            open: string;
            close: string;
        };
    };
    contact: {
        phone?: string;
        internationalPhone?: string;
        website?: string;
    };
    facilities: {
        hasParking?: boolean;
        hasWifi?: boolean;
        isWheelchairAccessible?: boolean;
        hasDelivery?: boolean;
        hasTakeout?: boolean;
    };
    rating?: number;
    images: string[];
    googlePlaceId: string;
}

export const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
    try {
        // Get Google Maps API Key from Secrets Manager
        const secretResponse = await secretsManager.getSecretValue({
            SecretId: process.env.GOOGLE_MAPS_API_KEY_SECRET_ARN!,
        });

        if (!secretResponse.SecretString) {
            throw new Error('Failed to retrieve Google Maps API Key');
        }

        const secretData = JSON.parse(secretResponse.SecretString);
        const apiKey = secretData[process.env.GOOGLE_MAPS_API_KEY_SECRET_KEY!];

        if (!apiKey) {
            throw new Error('Google Maps API Key not found in secret');
        }

        // Make request to Google Places API
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,rating,price_level,opening_hours,photos,types,business_status`
        );

        if (response.data.status !== 'OK') {
            throw new Error(`Google Places API error: ${response.data.status}`);
        }

        return response.data.result;
    } catch (error: unknown) {
        console.error('Error fetching place details:', error);
        throw error;
    }
};

export const transformPlaceDetails = (details: PlaceDetails): TransformedPlaceDetails => {
    // Extract address components
    const addressParts = details.formatted_address.split(',').map((part) => part.trim());
    const postalCode = addressParts[addressParts.length - 1].match(/\d+/)?.[0] || '';
    const country = addressParts[addressParts.length - 1].replace(postalCode, '').trim();
    const state = addressParts[addressParts.length - 2] || '';
    const city = addressParts[addressParts.length - 3] || '';
    const streetAddress = addressParts.slice(0, -3).join(', ');

    // Transform schedules
    const schedules: { [key: string]: { open: string; close: string } } = {};
    if (details.opening_hours?.periods) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        details.opening_hours.periods.forEach((period) => {
            const day = days[period.open.day];
            schedules[day] = {
                open: `${period.open.time.slice(0, 2)}:${period.open.time.slice(2)}`,
                close: `${period.close.time.slice(0, 2)}:${period.close.time.slice(2)}`,
            };
        });
    }

    // Transform types to cuisine types
    const cuisineTypes = (details.types || [])
        .filter(
            (type) =>
                type.includes('food') || type.includes('restaurant') || type.includes('cuisine')
        )
        .map((type) => type.replace(/_/g, ' '));

    // Transform price level to string
    const priceRanges = ['Budget', 'Affordable', 'Moderate', 'Expensive', 'Luxury'];
    const priceRange =
        details.price_level !== undefined ? priceRanges[details.price_level] : 'Not specified';

    return {
        name: details.name,
        description: `${details.name} is located in ${city}, ${state}. ${
            details.rating ? `It has a rating of ${details.rating} stars. ` : ''
        }${details.price_level ? `Price range: ${priceRange}.` : ''}`,
        cuisineTypes,
        priceRange,
        isCurrentlyOperating: details.business_status === 'OPERATIONAL',
        locations: [
            {
                info: {
                    address: streetAddress,
                    city,
                    state,
                    country,
                    postalCode,
                },
                coordinates: {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                },
            },
        ],
        schedules,
        contact: {
            phone: details.formatted_phone_number,
            internationalPhone: details.international_phone_number,
            website: details.website,
        },
        facilities: {
            hasParking: details.types?.includes('parking'),
            hasWifi: details.types?.includes('wifi'),
            isWheelchairAccessible: details.types?.includes('wheelchair_accessible'),
            hasDelivery: details.types?.includes('delivery'),
            hasTakeout: details.types?.includes('takeout'),
        },
        rating: details.rating,
        images: (details.photos || []).map(
            (photo) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}`
        ),
        googlePlaceId: details.place_id,
    };
};
