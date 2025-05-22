import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout.js';
import RestaurantHeader from '../../../components/restaurants/detail/RestaurantHeader.js';
import RestaurantInfo from '../../../components/restaurants/detail/RestaurantInfo.js';
import RestaurantMenu from '../../../components/restaurants/detail/RestaurantMenu.js';
import RestaurantReviews from '../../../components/restaurants/detail/RestaurantReviews.js';
import RestaurantLocation from '../../../components/restaurants/detail/RestaurantLocation.js';
import SimilarRestaurants from '../../../components/restaurants/detail/SimilarRestaurants.js';
import { useCountry } from '../../../contexts/index.js';
import { LucideClientIcon } from '../../../components/ui/lucide-icon.js';

// Mock restaurant data - in a real app, this would come from an API
import { mockRestaurantDetail } from '../../../data/mockRestaurantDetail.js';

/**
 * RestaurantDetailPage component for displaying detailed information about a restaurant
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function RestaurantDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentCountry, isInitialized } = useCountry();

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Fetch restaurant data
  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the restaurant ID
      // For now, we'll just return the mock data
      return Promise.resolve(mockRestaurantDetail);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when ID is available
    enabled: !!id,
  });

  // Loading state
  if (isLoading) {
    return (
      <Layout title="Loading Restaurant..." description="Loading restaurant details">
        <div className="flex items-center justify-center min-h-screen">
          <LucideClientIcon
            icon={Loader2}
            className="w-8 h-8 animate-spin text-orange-500"
            aria-label="Loading restaurant details"
          />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <Layout title="Restaurant Not Found" description="The restaurant you're looking for could not be found">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The restaurant you're looking for could not be found or may have been removed.
          </p>
          <button
            onClick={() => router.push(getCountryLink('/restaurants'))}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Browse All Restaurants
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={restaurant.name}
      description={restaurant.description || `${restaurant.name} - ${restaurant.cuisineTypes?.join(', ')}`}
    >
      {/* Restaurant Header */}
      <RestaurantHeader restaurant={restaurant} getCountryLink={getCountryLink} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Restaurant Info */}
            <RestaurantInfo restaurant={restaurant} />
            
            {/* Restaurant Menu */}
            <RestaurantMenu restaurant={restaurant} />
            
            {/* Restaurant Reviews */}
            <RestaurantReviews restaurant={restaurant} getCountryLink={getCountryLink} />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Restaurant Location */}
            <RestaurantLocation restaurant={restaurant} />
            
            {/* Similar Restaurants */}
            <SimilarRestaurants 
              cuisineTypes={restaurant.cuisineTypes} 
              currentRestaurantId={restaurant.id}
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
  // In a real app, you would fetch all restaurant IDs from an API
  // For now, we'll just use the mock data
  const paths = [
    { params: { country: 'my', id: '1' } },
    { params: { country: 'sg', id: '1' } },
  ];
  
  return {
    paths,
    fallback: true, // Generate pages for paths not returned by getStaticPaths
  };
}

export async function getStaticProps({ params }) {
  // In a real app, you would fetch the restaurant data from an API
  // For now, we'll just use the mock data
  
  return {
    props: {
      country: params.country,
      id: params.id,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
