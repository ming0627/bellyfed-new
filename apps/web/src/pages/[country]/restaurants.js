import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout.js';
import RestaurantList from '../../components/restaurants/RestaurantList.js';
import { useCountry } from '../../contexts/index.js';
import { LucideClientIcon } from '../../components/ui/lucide-icon.js';

// Mock restaurant data - in a real app, this would come from an API
const mockRestaurants = [
  {
    id: '1',
    name: 'Nasi Lemak House',
    description: 'Authentic Malaysian cuisine specializing in Nasi Lemak',
    address: {
      street: '123 Jalan Bukit Bintang',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      latitude: 3.1478,
      longitude: 101.7068,
    },
    hours: {
      monday: '08:00-22:00',
      tuesday: '08:00-22:00',
      wednesday: '08:00-22:00',
      thursday: '08:00-22:00',
      friday: '08:00-23:00',
      saturday: '08:00-23:00',
      sunday: '09:00-21:00',
    },
    cuisineTypes: ['Malaysian', 'Halal'],
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 256,
    isFeatured: true,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Sushi Sensation',
    description: 'Premium Japanese sushi and sashimi restaurant',
    address: {
      street: '45 Jalan Sultan Ismail',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50250',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      latitude: 3.1516,
      longitude: 101.7092,
    },
    hours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-23:00',
      saturday: '11:00-23:00',
      sunday: '12:00-21:00',
    },
    cuisineTypes: ['Japanese', 'Seafood'],
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 189,
    isFeatured: true,
    isVerified: true,
    isNew: true,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Taco Temple',
    description: 'Authentic Mexican street food with a modern twist',
    address: {
      street: '78 Jalan Petaling',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50000',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      latitude: 3.1435,
      longitude: 101.6984,
    },
    hours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-23:00',
      saturday: '11:00-23:00',
      sunday: '12:00-21:00',
    },
    cuisineTypes: ['Mexican', 'Fusion'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 142,
    isFeatured: true,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Char Kuey Teow Corner',
    description: 'Famous for authentic Penang-style Char Kuey Teow',
    address: {
      street: '56 Jalan Alor',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      latitude: 3.1456,
      longitude: 101.7075,
    },
    hours: {
      monday: '16:00-00:00',
      tuesday: '16:00-00:00',
      wednesday: '16:00-00:00',
      thursday: '16:00-00:00',
      friday: '16:00-01:00',
      saturday: '16:00-01:00',
      sunday: '16:00-00:00',
    },
    cuisineTypes: ['Malaysian', 'Street Food'],
    priceRange: '$',
    rating: 4.6,
    reviewCount: 178,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1590759668628-05b0fc34bb70?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Curry House',
    description: 'Authentic Indian curries and tandoori specialties',
    address: {
      street: '23 Jalan Masjid India',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50100',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      latitude: 3.1523,
      longitude: 101.6976,
    },
    hours: {
      monday: '10:00-22:00',
      tuesday: '10:00-22:00',
      wednesday: '10:00-22:00',
      thursday: '10:00-22:00',
      friday: '10:00-23:00',
      saturday: '10:00-23:00',
      sunday: '10:00-22:00',
    },
    cuisineTypes: ['Indian', 'Vegetarian'],
    priceRange: '$$',
    rating: 4.4,
    reviewCount: 156,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Dim Sum Palace',
    description: 'Traditional Hong Kong-style dim sum in an elegant setting',
    address: {
      street: '88 Jalan Pudu',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '55100',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      latitude: 3.1389,
      longitude: 101.7156,
    },
    hours: {
      monday: '07:00-15:00',
      tuesday: '07:00-15:00',
      wednesday: '07:00-15:00',
      thursday: '07:00-15:00',
      friday: '07:00-15:00',
      saturday: '07:00-16:00',
      sunday: '07:00-16:00',
    },
    cuisineTypes: ['Chinese', 'Dim Sum'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 203,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&h=400&fit=crop',
  },
];

/**
 * RestaurantsPage component for displaying a list of restaurants with search and filtering
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function RestaurantsPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Update search query from URL parameters
  useEffect(() => {
    if (router.isReady && router.query.q) {
      setSearchQuery(router.query.q);
    }
    if (router.isReady && router.query.location) {
      setLocationQuery(router.query.location);
    }
  }, [router.isReady, router.query]);

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Fetch restaurants data
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants', currentCountry?.code, searchQuery, locationQuery],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the search parameters
      // For now, we'll just filter the mock data
      let filtered = [...mockRestaurants];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(restaurant => 
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.description?.toLowerCase().includes(query) ||
          restaurant.cuisineTypes?.some(cuisine => cuisine.toLowerCase().includes(query))
        );
      }
      
      if (locationQuery) {
        const location = locationQuery.toLowerCase();
        filtered = filtered.filter(restaurant => 
          restaurant.address.city.toLowerCase().includes(location) ||
          restaurant.address.state.toLowerCase().includes(location) ||
          restaurant.address.street.toLowerCase().includes(location)
        );
      }
      
      return filtered;
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });

  // Handle search form submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    router.push({
      pathname: router.pathname,
      query: { ...router.query, ...Object.fromEntries(params) },
    }, undefined, { shallow: true });
  }, [searchQuery, locationQuery, router]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((restaurantId) => {
    setFavorites(prev => {
      if (prev.includes(restaurantId)) {
        return prev.filter(id => id !== restaurantId);
      } else {
        return [...prev, restaurantId];
      }
    });
  }, []);

  // Add favorite status to restaurants
  const restaurantsWithFavorites = React.useMemo(() => {
    if (!restaurants) return [];
    
    return restaurants.map(restaurant => ({
      ...restaurant,
      isFavorite: favorites.includes(restaurant.id),
    }));
  }, [restaurants, favorites]);

  return (
    <Layout
      title="Restaurants"
      description="Discover the best restaurants around you"
    >
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Discover Restaurants in {currentCountry?.name || 'Your Area'}
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <LucideClientIcon
                  icon={Search}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines, dishes..."
                  className="w-full pl-10 pr-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-1 relative">
                <LucideClientIcon
                  icon={MapPin}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Location (city, area, street...)"
                  className="w-full pl-10 pr-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="bg-white text-orange-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <RestaurantList
          restaurants={restaurantsWithFavorites}
          getCountryLink={getCountryLink}
          isLoading={isLoading}
          onFavoriteToggle={handleFavoriteToggle}
          showFilters={true}
        />
      </div>
    </Layout>
  );
}
