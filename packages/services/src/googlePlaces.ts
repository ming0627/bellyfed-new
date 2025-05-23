/**
 * Google Places API service for location-based features
 */

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: AddressComponent[];
}

interface GeocodeResult {
  formatted_address: string;
  address_components: AddressComponent[];
}

interface LocationDetails {
  location: string;
  state: string;
  locationType: 'mall' | 'city' | 'district' | 'street' | 'landmark' | 'area';
  district?: string;
  area?: string;
  address: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export class GooglePlacesService {
  private static API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
  private static PLACE_SEARCH_URL =
    'https://maps.googleapis.com/maps/api/place/textsearch/json';
  private static PLACE_DETAILS_URL =
    'https://maps.googleapis.com/maps/api/place/details/json';
  private static GEOCODING_URL =
    'https://maps.googleapis.com/maps/api/geocode/json';

  // Malaysian coordinates boundaries
  private static MALAYSIA_BOUNDS = {
    north: 7.363417, // Northernmost point
    south: 0.855222, // Southernmost point
    east: 119.267502, // Easternmost point
    west: 99.643448, // Westernmost point,
  };

  private static isInMalaysia(lat: number, lng: number): boolean {
    return (
      lat >= this.MALAYSIA_BOUNDS.south &&
      lat <= this.MALAYSIA_BOUNDS.north &&
      lng >= this.MALAYSIA_BOUNDS.west &&
      lng <= this.MALAYSIA_BOUNDS.east
    );
  }

  private static determineLocationType(
    placeDetails: PlaceDetails,
  ): 'mall' | 'city' | 'district' | 'street' | 'landmark' | 'area' {
    const types = placeDetails.types;
    const name = placeDetails.name.toLowerCase();

    // Common mall keywords in Malaysia
    const mallKeywords = [
      'mall',
      'plaza',
      'megamall',
      'centre',
      'center',
      'shopping',
      'complex',
      'retail',
      'square',
    ];

    // Check if it's explicitly marked as a shopping mall
    if (types.includes('shopping_mall')) {
      return 'mall';
    }

    // Check common mall names
    if (mallKeywords.some((keyword) => name.includes(keyword))) {
      return 'mall';
    }

    // Check specific mall names (case-insensitive)
    const specificMalls = [
      'midvalley',
      'mid valley',
      'pavilion',
      'sunway pyramid',
      'suria klcc',
      'the gardens',
      'ioi city',
      'one utama',
      '1 utama',
      'paradigm',
      'tropicana gardens',
    ];

    if (specificMalls.some((mall) => name.includes(mall))) {
      return 'mall';
    }

    // Check for streets
    if (
      types.includes('route') ||
      name.includes('jalan') ||
      name.includes('lorong') ||
      name.includes('persiaran')
    ) {
      return 'street';
    }

    // Check for districts
    if (
      types.includes('sublocality') ||
      types.includes('neighborhood') ||
      name.includes('taman') ||
      name.startsWith('ss') ||
      name.startsWith('usj') ||
      name.includes('heights') ||
      name.includes('garden')
    ) {
      return 'district';
    }

    // Check for landmarks
    if (
      types.includes('point_of_interest') ||
      types.includes('establishment') ||
      types.includes('premise')
    ) {
      return 'landmark';
    }

    // Check for cities
    if (types.includes('locality') && types.includes('political')) {
      return 'city';
    }

    return 'area';
  }

  private static buildFullAddress(placeDetails: PlaceDetails): string {
    const components = placeDetails.address_components;
    const addressParts: string[] = [];

    // Get the premise or establishment name
    const premise = components.find(
      (c) => c.types.includes('premise') || c.types.includes('establishment'),
    );
    if (premise) {
      addressParts.push(premise.long_name);
    } else {
      addressParts.push(placeDetails.name);
    }

    // Get the street number if available
    const streetNumber = components.find((c) =>
      c.types.includes('street_number'),
    );
    if (streetNumber) {
      addressParts.push(streetNumber.long_name);
    }

    // Get the route/street name
    const route = components.find((c) => c.types.includes('route'));
    if (route) {
      addressParts.push(route.long_name);
    }

    // Get the sublocality (district/area)
    const sublocality = components.find(
      (c) =>
        c.types.includes('sublocality') || c.types.includes('neighborhood'),
    );
    if (sublocality) {
      addressParts.push(sublocality.long_name);
    }

    // Get the postal code
    const postalCode = components.find((c) => c.types.includes('postal_code'));
    if (postalCode) {
      addressParts.push(postalCode.long_name);
    }

    // Get the city
    const city = components.find((c) => c.types.includes('locality'));
    if (city) {
      addressParts.push(city.long_name);
    }

    // Get the state
    const state = components.find((c) =>
      c.types.includes('administrative_area_level_1'),
    );
    if (state) {
      addressParts.push(state.long_name);
    }

    // Add country
    const country = components.find((c) => c.types.includes('country'));
    if (country?.short_name === 'MY') {
      addressParts.push('Malaysia');
    }

    return addressParts.join(', ');
  }

  private static isValidMalaysianAddress(placeDetails: PlaceDetails): boolean {
    // Check if the country is Malaysia
    const country = placeDetails.address_components.find((c) =>
      c.types.includes('country'),
    );
    if (!country || country.short_name !== 'MY') {
      return false;
    }

    // Check if coordinates are within Malaysia
    const { lat, lng } = placeDetails.geometry.location;
    if (!this.isInMalaysia(lat, lng)) {
      return false;
    }

    return true;
  }

  private static extractLocationDetails(
    placeDetails: PlaceDetails,
  ): LocationDetails {
    const addressComponents = placeDetails.address_components;

    // Find the city/location
    const cityComponent = addressComponents.find(
      (component) =>
        component.types.includes('locality') ||
        component.types.includes('administrative_area_level_2'),
    );

    // Find the state
    const stateComponent = addressComponents.find((component) =>
      component.types.includes('administrative_area_level_1'),
    );

    // Find the district
    const districtComponent = addressComponents.find(
      (component) =>
        component.types.includes('sublocality_level_1') ||
        component.types.includes('neighborhood'),
    );

    // Find the area
    const areaComponent = addressComponents.find(
      (component) =>
        component.types.includes('sublocality_level_2') ||
        component.types.includes('route'),
    );

    const fullAddress = this.buildFullAddress(placeDetails);
    const state = stateComponent?.long_name || 'Unknown State';
    const city = cityComponent?.long_name || 'Unknown City';
    const location = `${city}, ${state}`;

    return {
      location,
      state,
      locationType: this.determineLocationType(placeDetails),
      district: districtComponent?.long_name,
      area: areaComponent?.long_name,
      address: placeDetails.formatted_address,
      fullAddress: fullAddress,
      coordinates: {
        lat: placeDetails.geometry.location.lat,
        lng: placeDetails.geometry.location.lng,
      },
    };
  }

  private static async getPlaceDetails(
    placeId: string,
  ): Promise<PlaceDetails | undefined> {
    try {
      const response = await fetch(
        `${this.PLACE_DETAILS_URL}?place_id=${placeId}&key=${this.API_KEY}&fields=name,formatted_address,geometry,address_components,types`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.result) {
        return undefined;
      }

      return data.result;
    } catch (error: unknown) {
      console.error('Error getting place details:', error);
      return undefined;
    }
  }

  private static async searchPlaceByQuery(
    query: string,
  ): Promise<string | undefined> {
    try {
      const params = new URLSearchParams({
        query: `${query} malaysia`,
        key: this.API_KEY,
        region: 'my',
        locationbias: `rectangle:${this.MALAYSIA_BOUNDS.south},${this.MALAYSIA_BOUNDS.west}|${this.MALAYSIA_BOUNDS.north},${this.MALAYSIA_BOUNDS.east}`,
      });

      const response = await fetch(`${this.PLACE_SEARCH_URL}?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.results?.length) {
        return undefined;
      }

      return data.results[0].place_id;
    } catch (error: unknown) {
      console.error('Error searching place:', error);
      return undefined;
    }
  }

  public static async searchLocation(
    query: string,
  ): Promise<LocationDetails | undefined> {
    try {
      console.log('\n=== Starting Location Search ===');
      console.log('Query:', query);

      // First, try to find the place ID
      const placeId = await this.searchPlaceByQuery(query);
      if (!placeId) {
        console.log('❌ No place ID found for query');
        return undefined;
      }
      console.log('✅ Found Place ID:', placeId);

      // Get detailed place information
      const placeDetails = await this.getPlaceDetails(placeId);
      if (!placeDetails) {
        console.log('❌ No place details found');
        return undefined;
      }
      console.log('✅ Initial Place Details:', {
        name: placeDetails.name,
        formatted_address: placeDetails.formatted_address,
        types: placeDetails.types,
        location: placeDetails.geometry.location,
      });

      // Verify it's a Malaysian address
      if (!this.isValidMalaysianAddress(placeDetails)) {
        console.log('❌ Not a valid Malaysian address');
        return undefined;
      }
      console.log('✅ Verified Malaysian address');

      // Get the initial location type
      const locationType = this.determineLocationType(placeDetails);
      console.log('📍 Location Type:', locationType);

      // For malls and landmarks, try to get more specific location details
      if (locationType === 'mall' || locationType === 'landmark') {
        console.log('🔍 Getting additional details for mall/landmark...');
        // Try to get more specific details using geocoding
        try {
          const params = new URLSearchParams({
            latlng: `${placeDetails.geometry.location.lat},${placeDetails.geometry.location.lng}`,
            key: this.API_KEY,
            result_type: 'street_address|premise',
            location_type: 'ROOFTOP|GEOMETRIC_CENTER',
            language: 'en',
          });

          const response = await fetch(`${this.GEOCODING_URL}?${params}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('📍 Geocoding Response:', {
            status: data.status,
            resultsCount: data.results?.length,
          });

          if (data.results?.length > 0) {
            // Merge the geocoding results with our place details
            const geocodeResult = data.results[0] as GeocodeResult;
            console.log('📍 Geocode Result:', {
              formatted_address: geocodeResult.formatted_address,
              components: geocodeResult.address_components.map((comp) => ({
                long_name: comp.long_name,
                types: comp.types,
              })),
            });

            const newComponents = geocodeResult.address_components.filter(
              (comp: AddressComponent) =>
                !placeDetails.address_components.some((existing) =>
                  existing.types.some((type) => comp.types.includes(type)),
                ),
            );

            console.log(
              '📍 New Address Components:',
              newComponents.map((comp) => ({
                long_name: comp.long_name,
                types: comp.types,
              })),
            );

            placeDetails.address_components = [
              ...placeDetails.address_components,
              ...newComponents,
            ];

            // Update formatted address if we got a more detailed one
            if (
              geocodeResult.formatted_address &&
              geocodeResult.formatted_address.length >
                placeDetails.formatted_address.length
            ) {
              console.log('📍 Updating formatted address:', {
                old: placeDetails.formatted_address,
                new: geocodeResult.formatted_address,
              });
              placeDetails.formatted_address = geocodeResult.formatted_address;
            }
          }
        } catch (error: unknown) {
          console.error('❌ Error getting additional location details:', error);
          // Continue with original place details if geocoding fails
        }
      }

      const finalDetails = this.extractLocationDetails(placeDetails);
      console.log('\n=== Final Location Details ===');
      console.log(JSON.stringify(finalDetails, null, 2));
      console.log('===============================\n');

      return finalDetails;
    } catch (error: unknown) {
      console.error('❌ Error searching location:', error);
      return undefined;
    }
  }
}
