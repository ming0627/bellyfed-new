import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Utensils, MapPin, Award, Plus } from 'lucide-react';
import Layout from '../../components/layout/Layout.js';
import CollectionList from '../../components/collections/CollectionList.js';
import { LucideClientIcon } from '../../components/ui/lucide-icon.js';
import { useCountry, useAuth } from '../../contexts/index.js';

// Mock data for collections
const mockCollections = [
  {
    id: '1',
    title: 'Best Nasi Lemak in Kuala Lumpur',
    description: 'Discover the most authentic and delicious Nasi Lemak dishes in Kuala Lumpur, from traditional street food stalls to upscale restaurants.',
    imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
    restaurantCount: 12,
    location: 'Kuala Lumpur',
    curator: 'Sarah Chen',
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-05-20T00:00:00Z',
    isFeatured: true,
    isNew: false,
  },
  {
    id: '2',
    title: 'Hidden Gems in Penang',
    description: 'Explore the lesser-known culinary treasures of Penang, featuring local favorites that tourists often miss.',
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&h=400&fit=crop',
    restaurantCount: 8,
    location: 'Penang',
    curator: 'Mike Wong',
    createdAt: '2023-04-10T00:00:00Z',
    updatedAt: '2023-06-05T00:00:00Z',
    isFeatured: false,
    isNew: true,
  },
  {
    id: '3',
    title: 'Best Seafood Restaurants in Kota Kinabalu',
    description: 'The freshest seafood dishes from the best restaurants in Kota Kinabalu, Sabah.',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop',
    restaurantCount: 10,
    location: 'Kota Kinabalu',
    curator: 'David Chen',
    createdAt: '2023-02-20T00:00:00Z',
    updatedAt: '2023-04-15T00:00:00Z',
    isFeatured: true,
    isNew: false,
  },
  {
    id: '4',
    title: 'Vegetarian Delights in Kuala Lumpur',
    description: 'The best vegetarian and vegan-friendly restaurants in Kuala Lumpur, offering delicious plant-based options.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&h=400&fit=crop',
    restaurantCount: 15,
    location: 'Kuala Lumpur',
    curator: 'Sarah Lee',
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z',
    isFeatured: false,
    isNew: false,
  },
  {
    id: '5',
    title: 'Street Food Tour of Johor Bahru',
    description: 'A curated guide to the best street food stalls and hawker centers in Johor Bahru.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
    restaurantCount: 20,
    location: 'Johor Bahru',
    curator: 'Emily Wong',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z',
    isFeatured: true,
    isNew: true,
  },
  {
    id: '6',
    title: 'Best Dim Sum in Ipoh',
    description: 'Discover the finest dim sum restaurants in Ipoh, known for their authentic flavors and traditional techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&h=400&fit=crop',
    restaurantCount: 7,
    location: 'Ipoh',
    curator: 'John Smith',
    createdAt: '2023-04-25T00:00:00Z',
    updatedAt: '2023-05-30T00:00:00Z',
    isFeatured: false,
    isNew: false,
  },
];

// Featured collections for the hero section
const featuredCollections = mockCollections.filter(collection => collection.isFeatured).slice(0, 3);

/**
 * CollectionsPage component for displaying restaurant collections
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function CollectionsPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const { isAuthenticated } = useAuth();

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Fetch collections data
  const { data: collections, isLoading, error } = useQuery({
    queryKey: ['collections', currentCountry?.code],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the country code
      return Promise.resolve(mockCollections);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });

  // Show loading state
  if (isLoading) {
    return (
      <Layout
        title="Collections"
        description="Discover curated restaurant collections"
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
        title="Collections Error"
        description="Error loading collections"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Collections</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the collections. Please try again later.
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
      title="Restaurant Collections"
      description={`Discover curated restaurant collections in ${currentCountry?.name || 'your country'}`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurant Collections
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mb-8">
            Discover curated collections of the best restaurants, dishes, and culinary experiences in {currentCountry?.name || 'your country'}.
          </p>

          {/* Featured Collections */}
          {featuredCollections.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <LucideClientIcon icon={Award} className="w-5 h-5 text-orange-500 mr-2" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Featured Collections
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group cursor-pointer"
                    onClick={() => router.push(getCountryLink(`/collections/${collection.id}`))}
                  >
                    {/* Image */}
                    <div className="relative h-40">
                      {collection.imageUrl ? (
                        <img
                          src={collection.imageUrl}
                          alt={collection.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <LucideClientIcon
                            icon={Utensils}
                            className="w-8 h-8 text-gray-400 dark:text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80"></div>

                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                          {collection.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center mr-4">
                          <LucideClientIcon icon={Utensils} className="w-4 h-4 mr-1.5" aria-hidden="true" />
                          <span>{collection.restaurantCount} {collection.restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}</span>
                        </div>

                        {collection.location && (
                          <div className="flex items-center">
                            <LucideClientIcon icon={MapPin} className="w-4 h-4 mr-1.5" aria-hidden="true" />
                            <span>{collection.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Collections */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              All Collections
            </h2>

            {isAuthenticated && (
              <Link
                href={getCountryLink('/collections/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <LucideClientIcon icon={Plus} className="w-4 h-4 mr-2" aria-hidden="true" />
                Create Collection
              </Link>
            )}
          </div>

          <CollectionList
            collections={collections}
            getCountryLink={getCountryLink}
          />
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
