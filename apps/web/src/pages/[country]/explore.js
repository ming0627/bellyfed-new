import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Compass } from 'lucide-react';
import Layout from '../../components/layout/Layout.js';
import ExploreMap from '../../components/explore/ExploreMap.js';
import NearbyRestaurants from '../../components/explore/NearbyRestaurants.js';
import { LucideClientIcon } from '../../components/ui/lucide-icon.js';
import { useCountry } from '../../contexts/index.js';

// Mock data for restaurants
const mockRestaurants = [
  {
    id: '1',
    name: 'Nasi Lemak House',
    description: 'Authentic Malaysian cuisine specializing in Nasi Lemak',
    imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=200&h=200&fit=crop',
    address: {
      street: '123 Jalan Bukit Bintang',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      lat: 3.1478,
      lng: 101.7068,
    },
    cuisineTypes: ['Malaysian', 'Halal'],
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 256,
    distance: '1.2 km',
    isOpen: true,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Satay Street',
    description: 'Famous for their juicy and flavorful satay skewers',
    imageUrl: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=200&h=200&fit=crop',
    address: {
      street: '45 Jalan Alor',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      lat: 3.1456,
      lng: 101.7082,
    },
    cuisineTypes: ['Malaysian', 'Street Food'],
    priceRange: '$',
    rating: 4.5,
    reviewCount: 189,
    distance: '1.5 km',
    isOpen: true,
    isVerified: false,
  },
  {
    id: '3',
    name: 'Laksa Delight',
    description: 'Specializing in various types of laksa from around Malaysia',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=200&h=200&fit=crop',
    address: {
      street: '78 Jalan Petaling',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50000',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      lat: 3.1435,
      lng: 101.6980,
    },
    cuisineTypes: ['Malaysian', 'Soup'],
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 210,
    distance: '2.3 km',
    isOpen: false,
    isVerified: true,
  },
  {
    id: '4',
    name: 'Roti Canai Corner',
    description: 'Serving the fluffiest roti canai with various curry options',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?q=80&w=200&h=200&fit=crop',
    address: {
      street: '12 Jalan Masjid India',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50100',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      lat: 3.1530,
      lng: 101.6970,
    },
    cuisineTypes: ['Malaysian', 'Indian'],
    priceRange: '$',
    rating: 4.4,
    reviewCount: 178,
    distance: '2.8 km',
    isOpen: true,
    isVerified: false,
  },
  {
    id: '5',
    name: 'Char Kuey Teow Wok',
    description: 'Authentic char kuey teow cooked over high heat in traditional woks',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=200&h=200&fit=crop',
    address: {
      street: '56 Jalan Imbi',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '55100',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      lat: 3.1420,
      lng: 101.7180,
    },
    cuisineTypes: ['Malaysian', 'Chinese'],
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 245,
    distance: '3.1 km',
    isOpen: true,
    isVerified: true,
  },
  {
    id: '6',
    name: 'Durian Dessert House',
    description: 'Specializing in durian-based desserts and pastries',
    imageUrl: 'https://images.unsplash.com/photo-1622542086073-346c1849d150?q=80&w=200&h=200&fit=crop',
    address: {
      street: '34 Jalan Sultan',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50000',
      country: 'Malaysia',
      countryCode: 'my',
    },
    location: {
      lat: 3.1390,
      lng: 101.6950,
    },
    cuisineTypes: ['Malaysian', 'Dessert'],
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 156,
    distance: '3.5 km',
    isOpen: false,
    isVerified: false,
  },
];

/**
 * ExplorePage component for discovering restaurants on a map
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function ExplorePage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  
  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);
  
  // Fetch restaurants data
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants', 'explore', currentCountry?.code],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the country code
      return Promise.resolve(mockRestaurants);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });
  
  // Handle restaurant selection
  const handleSelectRestaurant = useCallback((restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    
    // Scroll to the selected restaurant in the list
    const element = document.getElementById(`restaurant-${restaurantId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout
        title="Explore Restaurants"
        description="Discover restaurants near you on the map"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LucideClientIcon
              icon={Loader2}
              className="w-8 h-8 animate-spin text-orange-500"
              aria-label="Loading"
            />
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Layout
        title="Explore Error"
        description="Error loading explore data"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the explore data. Please try again later.
              </p>
              <button
                onClick={() => router.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title="Explore Restaurants"
      description={`Discover restaurants near you in ${currentCountry?.name || 'your area'}`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <LucideClientIcon icon={Compass} className="w-8 h-8 mr-3 text-orange-500" aria-hidden="true" />
            Explore Restaurants
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Discover restaurants near you in {currentCountry?.name || 'your area'}. Use the map to find restaurants by location or browse the list below.
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div>
            <ExploreMap
              restaurants={restaurants}
              onSelectRestaurant={handleSelectRestaurant}
              selectedRestaurantId={selectedRestaurantId}
              getCountryLink={getCountryLink}
            />
          </div>
          
          {/* Restaurant List Section */}
          <div>
            <NearbyRestaurants
              restaurants={restaurants}
              onSelectRestaurant={handleSelectRestaurant}
              selectedRestaurantId={selectedRestaurantId}
              getCountryLink={getCountryLink}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
    ],
    fallback: true, // Generate pages for paths not returned by getStaticPaths
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
