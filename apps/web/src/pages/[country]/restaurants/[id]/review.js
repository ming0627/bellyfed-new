import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Layout from '../../../../components/layout/Layout.js';
import ReviewForm from '../../../../components/reviews/ReviewForm.js';
import { useCountry } from '../../../../contexts/index.js';
import { LucideClientIcon } from '../../../../components/ui/lucide-icon.js';

// Mock data for restaurant and dish
const mockRestaurantData = {
  id: '101',
  name: 'Nasi Lemak House',
  location: 'Kuala Lumpur',
  imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=200&h=200&fit=crop',
  rating: 4.5,
  reviewCount: 256,
  priceRange: '$$',
  cuisine: 'Malaysian',
  address: '123 Jalan Bukit Bintang, Kuala Lumpur, Malaysia',
  phone: '+60 3-1234 5678',
  website: 'https://nasilemakhouse.example.com',
  openingHours: [
    { day: 'Monday - Friday', hours: '10:00 AM - 10:00 PM' },
    { day: 'Saturday - Sunday', hours: '9:00 AM - 11:00 PM' },
  ],
};

const mockDishData = {
  id: '1',
  name: 'Nasi Lemak with Fried Chicken',
  description: 'Traditional Malaysian coconut rice served with crispy fried chicken, sambal, fried anchovies, peanuts, cucumber slices, and a boiled egg.',
  imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=200&h=200&fit=crop',
  price: 'RM 12.90',
  currency: 'RM',
  categories: ['Malaysian', 'Rice Dishes', 'Signature'],
  rating: 4.7,
  reviewCount: 256,
};

/**
 * ReviewSubmissionPage component for submitting reviews for restaurants and dishes
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function ReviewSubmissionPage() {
  const router = useRouter();
  const { id: restaurantId, dishId } = router.query;
  const { currentCountry, isInitialized } = useCountry();

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Fetch restaurant data
  const { data: restaurant, isLoading: isRestaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the restaurant ID
      // For now, we'll just return the mock data
      return Promise.resolve(mockRestaurantData);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when restaurant ID is available
    enabled: !!restaurantId,
  });

  // Fetch dish data if dishId is provided
  const { data: dish, isLoading: isDishLoading } = useQuery({
    queryKey: ['dish', dishId],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the dish ID
      // For now, we'll just return the mock data
      return Promise.resolve(mockDishData);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when dish ID is available
    enabled: !!dishId,
  });

  // Handle review submission
  const handleSubmitReview = (reviewData) => {
    // In a real app, this would call an API to submit the review
    console.log('Submitting review:', reviewData);
  };

  // Show loading state
  if (isRestaurantLoading) {
    return (
      <Layout
        title="Submit Review"
        description="Share your dining experience"
      >
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
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
  if (restaurantError) {
    return (
      <Layout
        title="Error"
        description="Error loading restaurant details"
      >
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Restaurant</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the restaurant details. Please try again later.
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
      title={`Review ${dish ? dish.name : restaurant.name}`}
      description={`Share your experience at ${restaurant.name}`}
    >
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <ReviewForm
          restaurant={restaurant}
          dish={dishId ? dish : null}
          getCountryLink={getCountryLink}
          onSubmit={handleSubmitReview}
        />
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  // In a real app, you would fetch all restaurant IDs from an API
  // For now, we'll just use the mock data
  const paths = [
    { params: { country: 'my', id: '101' } },
    { params: { country: 'sg', id: '101' } },
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
