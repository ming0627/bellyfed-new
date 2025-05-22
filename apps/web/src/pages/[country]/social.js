import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, MessageSquare, Heart, Share2, Filter, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout.js';
import { useCountry } from '../../contexts/index.js';
import { LucideClientIcon } from '../../components/ui/lucide-icon.js';
import Link from 'next/link';

// Mock data for social feed
const mockSocialFeed = [
  {
    id: '1',
    type: 'review',
    user: {
      id: '101',
      name: 'Sarah Chen',
      username: 'sarahc',
      profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
      badge: '🏆 Elite',
    },
    restaurant: {
      id: '201',
      name: 'Nasi Lemak House',
      location: 'Kuala Lumpur',
      imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=200&h=200&fit=crop',
    },
    content: 'Just had the most amazing Nasi Lemak! The sambal was perfectly spicy and the chicken was so crispy. Definitely coming back for more!',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=500&h=300&fit=crop',
    ],
    likes: 42,
    comments: 8,
    shares: 3,
    timestamp: '2023-08-15T08:30:00Z',
    isLiked: false,
  },
  {
    id: '2',
    type: 'dish',
    user: {
      id: '102',
      name: 'Mike Wong',
      username: 'mikew',
      profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
      badge: '⭐ Pro',
    },
    restaurant: {
      id: '202',
      name: 'Char Kuey Teow Wok',
      location: 'Penang',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=200&h=200&fit=crop',
    },
    dish: {
      id: '301',
      name: 'Char Kuey Teow',
      price: 'RM 8.50',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500&h=300&fit=crop',
    },
    content: 'This Char Kuey Teow is to die for! Perfectly wok-fried with fresh prawns and cockles. The smoky aroma is incredible!',
    rating: 5.0,
    likes: 67,
    comments: 12,
    shares: 5,
    timestamp: '2023-08-14T12:45:00Z',
    isLiked: true,
  },
  {
    id: '3',
    type: 'collection',
    user: {
      id: '103',
      name: 'Lisa Tan',
      username: 'lisat',
      profilePicture: 'https://randomuser.me/api/portraits/women/32.jpg',
      badge: '🌟 Rising',
    },
    collection: {
      id: '401',
      title: 'Best Laksa Spots in KL',
      description: 'My favorite places to get authentic laksa in Kuala Lumpur',
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=500&h=300&fit=crop',
      restaurantCount: 8,
    },
    content: "I've compiled my favorite laksa spots in KL! These places serve the most authentic and flavorful laksa you'll ever taste.",
    likes: 35,
    comments: 6,
    shares: 9,
    timestamp: '2023-08-13T15:20:00Z',
    isLiked: false,
  },
  {
    id: '4',
    type: 'photo',
    user: {
      id: '104',
      name: 'David Lim',
      username: 'davidl',
      profilePicture: 'https://randomuser.me/api/portraits/men/42.jpg',
      badge: '💫 Active',
    },
    restaurant: {
      id: '203',
      name: 'Roti Canai Corner',
      location: 'Kuala Lumpur',
      imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?q=80&w=200&h=200&fit=crop',
    },
    content: 'Sunday brunch with friends! The roti canai here is so fluffy and the curry is rich and flavorful.',
    images: [
      'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?q=80&w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500&h=300&fit=crop',
    ],
    likes: 28,
    comments: 4,
    shares: 2,
    timestamp: '2023-08-12T10:15:00Z',
    isLiked: false,
  },
  {
    id: '5',
    type: 'review',
    user: {
      id: '105',
      name: 'Jenny Koh',
      username: 'jennyk',
      profilePicture: 'https://randomuser.me/api/portraits/women/52.jpg',
      badge: '✨ Explorer',
    },
    restaurant: {
      id: '204',
      name: 'Durian Dessert House',
      location: 'Kuala Lumpur',
      imageUrl: 'https://images.unsplash.com/photo-1622542086073-346c1849d150?q=80&w=200&h=200&fit=crop',
    },
    content: "If you're a durian lover, you must try their durian pancakes! The durian filling is rich and creamy, and the pancake skin is thin and soft.",
    rating: 4.0,
    images: [
      'https://images.unsplash.com/photo-1622542086073-346c1849d150?q=80&w=500&h=300&fit=crop',
    ],
    likes: 19,
    comments: 3,
    shares: 1,
    timestamp: '2023-08-11T16:50:00Z',
    isLiked: true,
  },
];

/**
 * SocialPage component for displaying social feed and interactions
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function SocialPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Fetch social feed data
  const { data: socialFeed, isLoading, error } = useQuery({
    queryKey: ['socialFeed', currentCountry?.code, activeTab],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the country code and filters
      // For now, we'll just return the mock data

      // Filter based on active tab
      let filtered = [...mockSocialFeed];
      if (activeTab !== 'all') {
        filtered = filtered.filter(item => item.type === activeTab);
      }

      // Filter based on search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          item.content.toLowerCase().includes(query) ||
          item.user.name.toLowerCase().includes(query) ||
          (item.restaurant?.name.toLowerCase().includes(query)) ||
          (item.dish?.name.toLowerCase().includes(query)) ||
          (item.collection?.title.toLowerCase().includes(query))
        );
      }

      return Promise.resolve(filtered);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new search
    console.log('Searching for:', searchQuery);
  };

  // Handle like
  const handleLike = (itemId) => {
    // In a real app, this would call an API to like/unlike the item
    console.log('Toggling like for item:', itemId);
  };

  // Handle comment
  const handleComment = (itemId) => {
    // In a real app, this would open a comment form or navigate to a detail page
    console.log('Opening comments for item:', itemId);
  };

  // Handle share
  const handleShare = (itemId) => {
    // In a real app, this would open a share dialog
    console.log('Sharing item:', itemId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout
        title="Social Feed"
        description="Connect with fellow food lovers and share your culinary adventures"
      >
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
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
        title="Social Feed Error"
        description="Error loading social feed"
      >
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Social Feed</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the social feed. Please try again later.
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
      title="Social Feed"
      description="Connect with fellow food lovers and share your culinary adventures"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <LucideClientIcon icon={Users} className="w-8 h-8 mr-3 text-orange-500" aria-hidden="true" />
            Social Feed
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Connect with fellow food lovers, share your culinary adventures, and discover new dining experiences in {currentCountry?.name || 'your area'}.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <input
                type="text"
                placeholder="Search posts, users, restaurants..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LucideClientIcon
                icon={Search}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
                aria-hidden="true"
              />
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <LucideClientIcon icon={Filter} className="w-5 h-5 mr-2" aria-hidden="true" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'review'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('dish')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'dish'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Dishes
                </button>
                <button
                  onClick={() => setActiveTab('photo')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'photo'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab('collection')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'collection'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Collections
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Social Feed */}
        <div className="space-y-6">
          {socialFeed && socialFeed.length > 0 ? (
            socialFeed.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Link href={getCountryLink(`/profile/${item.user.username}`)} className="flex-shrink-0">
                      <img
                        src={item.user.profilePicture}
                        alt={item.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </Link>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Link href={getCountryLink(`/profile/${item.user.username}`)} className="text-base font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                          {item.user.name}
                        </Link>
                        {item.user.badge && (
                          <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {item.user.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {item.restaurant && (
                          <>
                            <Link href={getCountryLink(`/restaurants/${item.restaurant.id}`)} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                              {item.restaurant.name}
                            </Link>
                            <span className="mx-1">•</span>
                          </>
                        )}
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-gray-800 dark:text-gray-200 mb-4">
                    {item.content}
                  </p>

                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-${star <= Math.floor(item.rating) ? 'yellow' : 'gray'}-400`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Images */}
                  {item.images && item.images.length > 0 && (
                    <div className={`grid ${item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
                      {item.images.map((image, index) => (
                        <div key={index} className="rounded-md overflow-hidden">
                          <img
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dish */}
                  {item.dish && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-md">
                      <Link href={getCountryLink(`/dishes/${item.dish.id}`)} className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md overflow-hidden">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={item.dish.imageUrl}
                            alt={item.dish.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {item.dish.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.dish.price}
                          </p>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Collection */}
                  {item.collection && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-md">
                      <Link href={getCountryLink(`/collections/${item.collection.id}`)} className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md overflow-hidden">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={item.collection.imageUrl}
                            alt={item.collection.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {item.collection.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.collection.restaurantCount} restaurants
                          </p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center text-sm ${
                        item.isLiked
                          ? 'text-orange-500 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
                      } transition-colors`}
                    >
                      <LucideClientIcon icon={Heart} className={`w-5 h-5 mr-1 ${item.isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
                      <span>{item.likes}</span>
                    </button>
                    <button
                      onClick={() => handleComment(item.id)}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    >
                      <LucideClientIcon icon={MessageSquare} className="w-5 h-5 mr-1" aria-hidden="true" />
                      <span>{item.comments}</span>
                    </button>
                    <button
                      onClick={() => handleShare(item.id)}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    >
                      <LucideClientIcon icon={Share2} className="w-5 h-5 mr-1" aria-hidden="true" />
                      <span>{item.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No posts found. Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
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
