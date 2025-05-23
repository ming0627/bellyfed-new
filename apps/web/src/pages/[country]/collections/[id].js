import React, { useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Utensils,
  MapPin,
  Clock,
  ChevronLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  Edit,
} from 'lucide-react';
import Layout from '../../../components/layout/Layout.js';
import RestaurantCard from '../../../components/restaurants/RestaurantCard.js';
import CollectionCard from '../../../components/collections/CollectionCard.js';
import { LucideClientIcon } from '../../../components/ui/lucide-icon.js';
import { useCountry, useAuth } from '../../../contexts/index.js';

// Mock data for a collection
const mockCollection = {
  id: '1',
  title: 'Best Nasi Lemak in Kuala Lumpur',
  description:
    "Discover the most authentic and delicious Nasi Lemak dishes in Kuala Lumpur, from traditional street food stalls to upscale restaurants. This collection features establishments known for their perfectly cooked rice, flavorful sambal, and crispy fried chicken or other accompaniments that make Nasi Lemak Malaysia's beloved national dish.",
  imageUrl:
    'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=1200&h=600&fit=crop',
  restaurantCount: 12,
  location: 'Kuala Lumpur',
  curator: 'Sarah Chen',
  curatorImage:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
  createdAt: '2023-03-15T00:00:00Z',
  updatedAt: '2023-05-20T00:00:00Z',
  isFeatured: true,
  isNew: false,
  viewCount: 1245,
  saveCount: 87,
  restaurants: [
    {
      id: '1',
      name: 'Village Park Restaurant',
      imageUrl:
        'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 324,
      cuisine: 'Malaysian',
      priceRange: '$$',
      location: 'Damansara, Kuala Lumpur',
      distance: '3.2 km',
      isOpen: true,
      isVerified: true,
      description:
        'Famous for their signature Nasi Lemak with crispy fried chicken. Often crowded during peak hours.',
    },
    {
      id: '2',
      name: 'Nasi Lemak Antarabangsa',
      imageUrl:
        'https://images.unsplash.com/photo-1626509653291-0d0162a9f664?q=80&w=600&h=400&fit=crop',
      rating: 4.6,
      reviewCount: 256,
      cuisine: 'Malaysian',
      priceRange: '$',
      location: 'Kampung Baru, Kuala Lumpur',
      distance: '1.8 km',
      isOpen: true,
      isVerified: false,
      description:
        'A local favorite serving authentic Nasi Lemak 24 hours a day. Known for their spicy sambal.',
    },
    {
      id: '3',
      name: 'Ali, Muthu & Ah Hock',
      imageUrl:
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&h=400&fit=crop',
      rating: 4.5,
      reviewCount: 189,
      cuisine: 'Malaysian',
      priceRange: '$$',
      location: 'Bangsar, Kuala Lumpur',
      distance: '4.5 km',
      isOpen: false,
      isVerified: true,
      description:
        'Modern kopitiam serving a variety of Malaysian dishes including their popular Nasi Lemak with Rendang.',
    },
    {
      id: '4',
      name: 'Nasi Lemak Tanglin',
      imageUrl:
        'https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=600&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 210,
      cuisine: 'Malaysian',
      priceRange: '$',
      location: 'Tanglin, Kuala Lumpur',
      distance: '2.3 km',
      isOpen: true,
      isVerified: false,
      description:
        'One of the oldest Nasi Lemak stalls in KL, operating since 1948. Known for their rich coconut rice.',
    },
  ],
  relatedCollections: [
    {
      id: '2',
      title: 'Hidden Gems in Kuala Lumpur',
      description:
        'Explore the lesser-known culinary treasures of Kuala Lumpur, featuring local favorites that tourists often miss.',
      imageUrl:
        'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&h=400&fit=crop',
      restaurantCount: 8,
      location: 'Kuala Lumpur',
      curator: 'Mike Wong',
      createdAt: '2023-04-10T00:00:00Z',
      updatedAt: '2023-06-05T00:00:00Z',
      isFeatured: false,
      isNew: true,
    },
    {
      id: '4',
      title: 'Vegetarian Delights in Kuala Lumpur',
      description:
        'The best vegetarian and vegan-friendly restaurants in Kuala Lumpur, offering delicious plant-based options.',
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&h=400&fit=crop',
      restaurantCount: 15,
      location: 'Kuala Lumpur',
      curator: 'Sarah Lee',
      createdAt: '2023-01-05T00:00:00Z',
      updatedAt: '2023-03-10T00:00:00Z',
      isFeatured: false,
      isNew: false,
    },
  ],
};

/**
 * CollectionDetailPage component for displaying a specific collection
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function CollectionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentCountry, isInitialized } = useCountry();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = React.useState(false);

  // Function to generate country-specific links
  const getCountryLink = useCallback(
    path => {
      if (!isInitialized || !currentCountry?.code) return path;
      return `/${currentCountry.code}${path}`;
    },
    [currentCountry, isInitialized],
  );

  // Fetch collection data
  const {
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collection', id, currentCountry?.code],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the collection ID
      return Promise.resolve(mockCollection);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized and ID is available
    enabled: !!isInitialized && !!id,
  });

  // Format date for display
  const formatDate = dateString => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Toggle save collection
  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, this would call an API to save/unsave the collection
  };

  // Share collection
  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator
        .share({
          title: collection.title,
          text: collection.description,
          url: window.location.href,
        })
        .catch(err => {
          console.error('Error sharing:', err);
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('Share URL copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout
        title="Loading Collection"
        description="Loading collection details"
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
  if (error || !collection) {
    return (
      <Layout
        title="Collection Not Found"
        description="The requested collection could not be found"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Collection Not Found
              </h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                The collection you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <Link
                href={getCountryLink('/collections')}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors inline-block"
              >
                Browse All Collections
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${collection.title} | Collections`}
      description={collection.description}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={getCountryLink('/collections')}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <LucideClientIcon
              icon={ChevronLeft}
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            Back to Collections
          </Link>
        </div>

        {/* Collection Header */}
        <div className="relative mb-8">
          {/* Collection Cover Image */}
          <div className="relative h-64 md:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700">
            {collection.imageUrl && (
              <Image
                src={collection.imageUrl}
                alt={collection.title}
                layout="fill"
                objectFit="cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                {collection.title}
              </h1>

              <div className="flex flex-wrap gap-y-2 text-white/80 text-sm">
                <div className="flex items-center mr-4">
                  <LucideClientIcon
                    icon={Utensils}
                    className="w-4 h-4 mr-1.5"
                    aria-hidden="true"
                  />
                  <span>
                    {collection.restaurantCount}{' '}
                    {collection.restaurantCount === 1
                      ? 'Restaurant'
                      : 'Restaurants'}
                  </span>
                </div>

                {collection.location && (
                  <div className="flex items-center mr-4">
                    <LucideClientIcon
                      icon={MapPin}
                      className="w-4 h-4 mr-1.5"
                      aria-hidden="true"
                    />
                    <span>{collection.location}</span>
                  </div>
                )}

                {collection.updatedAt && (
                  <div className="flex items-center">
                    <LucideClientIcon
                      icon={Clock}
                      className="w-4 h-4 mr-1.5"
                      aria-hidden="true"
                    />
                    <span>Updated {formatDate(collection.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Collection Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            {/* Curator Info */}
            <div className="flex items-center">
              {collection.curatorImage && (
                <div className="flex-shrink-0 mr-3">
                  <Image
                    src={collection.curatorImage}
                    alt={collection.curator}
                    width={40}
                    height={40}
                    objectFit="cover"
                    className="rounded-full"
                    loading="lazy"
                  />
                </div>
              )}

              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Curated by
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {collection.curator}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Link
                  href={getCountryLink(`/collections/edit/${id}`)}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  <LucideClientIcon
                    icon={Edit}
                    className="w-4 h-4 mr-1.5"
                    aria-hidden="true"
                  />
                  Edit Collection
                </Link>
              )}

              <button
                onClick={handleToggleSave}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isSaved
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <LucideClientIcon
                  icon={isSaved ? BookmarkCheck : Bookmark}
                  className="w-4 h-4 mr-1.5"
                  aria-hidden="true"
                />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <LucideClientIcon
                  icon={Share2}
                  className="w-4 h-4 mr-1.5"
                  aria-hidden="true"
                />
                Share
              </button>
            </div>
          </div>

          {/* Collection Description */}
          {collection.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About This Collection
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {collection.description}
              </p>
            </div>
          )}
        </div>

        {/* Restaurants in Collection */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Restaurants in This Collection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.restaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                imageUrl={restaurant.imageUrl}
                rating={restaurant.rating}
                reviewCount={restaurant.reviewCount}
                cuisine={restaurant.cuisine}
                priceRange={restaurant.priceRange}
                location={restaurant.location}
                distance={restaurant.distance}
                isOpen={restaurant.isOpen}
                isVerified={restaurant.isVerified}
                description={restaurant.description}
                onToggleFavorite={() => {}}
                getCountryLink={getCountryLink}
              />
            ))}
          </div>
        </div>

        {/* Related Collections */}
        {collection.relatedCollections &&
          collection.relatedCollections.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Related Collections
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collection.relatedCollections.map(relatedCollection => (
                  <CollectionCard
                    key={relatedCollection.id}
                    id={relatedCollection.id}
                    title={relatedCollection.title}
                    description={relatedCollection.description}
                    imageUrl={relatedCollection.imageUrl}
                    restaurantCount={relatedCollection.restaurantCount}
                    location={relatedCollection.location}
                    curator={relatedCollection.curator}
                    updatedAt={
                      relatedCollection.updatedAt || relatedCollection.createdAt
                    }
                    isFeatured={relatedCollection.isFeatured}
                    isNew={relatedCollection.isNew}
                    getCountryLink={getCountryLink}
                    variant="horizontal"
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [], // No pre-rendered paths
    fallback: true, // Generate pages on-demand
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
      id: params.id,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
