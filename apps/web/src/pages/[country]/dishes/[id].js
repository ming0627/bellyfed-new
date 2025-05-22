import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout.js';
import DishHeader from '../../../components/dishes/DishHeader.js';
import DishIngredients from '../../../components/dishes/DishIngredients.js';
import DishReviews from '../../../components/dishes/DishReviews.js';
import SimilarDishes from '../../../components/dishes/SimilarDishes.js';
import { useCountry } from '../../../contexts/index.js';
import { LucideClientIcon } from '../../../components/ui/lucide-icon.js';

// Mock dish data - in a real app, this would come from an API
import { mockDishDetail, mockSimilarDishes } from '../../../data/mockDishDetail.js';

/**
 * DishDetailPage component for displaying detailed information about a dish
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function DishDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentCountry, isInitialized } = useCountry();

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Fetch dish data
  const { data: dish, isLoading: isDishLoading, error: dishError } = useQuery({
    queryKey: ['dish', id],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the dish ID
      // For now, we'll just return the mock data
      return Promise.resolve(mockDishDetail);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when ID is available
    enabled: !!id,
  });

  // Fetch similar dishes
  const { data: similarDishes, isLoading: isSimilarDishesLoading } = useQuery({
    queryKey: ['similarDishes', id, dish?.categories],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the dish categories
      // For now, we'll just return the mock data
      return Promise.resolve(mockSimilarDishes);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when dish data is available
    enabled: !!dish,
  });

  // Show loading state
  if (isDishLoading) {
    return (
      <Layout
        title="Loading Dish"
        description="Loading dish details"
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
  if (dishError) {
    return (
      <Layout
        title="Error"
        description="Error loading dish details"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dish</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the dish details. Please try again later.
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
      title={dish.name}
      description={dish.description}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Dish Header */}
            <DishHeader
              dish={dish}
              getCountryLink={getCountryLink}
            />
            
            {/* Dish Ingredients */}
            <DishIngredients
              dish={dish}
            />
            
            {/* Dish Reviews */}
            <DishReviews
              dish={dish}
              getCountryLink={getCountryLink}
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Similar Dishes */}
            <SimilarDishes
              categories={dish.categories}
              currentDishId={dish.id}
              getCountryLink={getCountryLink}
              similarDishes={similarDishes}
              isLoading={isSimilarDishesLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  // In a real app, you would fetch all dish IDs from an API
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
  // In a real app, you would fetch the dish data from an API
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
