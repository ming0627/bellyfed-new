import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Search,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Award,
  Camera,
} from 'lucide-react';

import { useCountry } from '../contexts/index.js';
import { getCountryLink } from '../utils/routing.js';

// Import all homepage components - MIGRATED FROM OLD-PACKAGES
import Collections from './homepage/Collections.js';
import FeaturedRestaurants from './homepage/FeaturedRestaurants.js';
import Navigation from './homepage/Navigation.js';
import PremiumBanner from './homepage/PremiumBanner.js';
import TopCritics from './homepage/TopCritics.js';
import TopFoodies from './homepage/TopFoodies.js';
import TopRatedDishes from './homepage/TopRatedDishes.js';

// Mock data for restaurants - in a real app, this would be fetched from an API
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
    cuisineTypes: ['Malaysian', 'Halal'],
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 256,
    ranking: {
      totalScore: 4.7,
      foodScore: 4.8,
      serviceScore: 4.6,
      ambienceScore: 4.5,
      valueScore: 4.7,
    },
    isFeatured: true,
    isVerified: true,
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
    cuisineTypes: ['Japanese', 'Seafood'],
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 189,
    ranking: {
      totalScore: 4.8,
      foodScore: 4.9,
      serviceScore: 4.7,
      ambienceScore: 4.8,
      valueScore: 4.6,
    },
    isFeatured: true,
    isVerified: true,
  },
];

// Mock data for top reviewers - in a real app, this would be fetched from an API
const mockTopReviewers = [
  {
    name: 'Sarah Chen',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
    reviews: 156,
    highlight: false,
    badges: [
      {
        type: 'regional',
        name: 'District Manager',
        icon: '🏙️',
        tooltip: 'Top authority for Orchard district dining',
        region: 'Orchard, Singapore',
        level: 'director',
        reviewCount: 85,
      },
      {
        type: 'fineDining',
        name: 'Fine Dining Director',
        icon: '🍽️',
        tooltip: 'Distinguished fine dining expert',
        level: 'director',
        reviewCount: 75,
      },
    ],
  },
  {
    name: 'Mike Wong',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop',
    reviews: 132,
    highlight: false,
    badges: [
      {
        type: 'expertise',
        name: 'Lead Ramen Expert',
        icon: '🍜',
        tooltip: 'Leading authority on ramen',
        category: 'Japanese',
        level: 'lead',
        reviewCount: 60,
      },
    ],
  },
];

// This file defines the main Homepage component for the Bellyfed web application.
// It fetches and displays various sections like featured restaurants, top critics,
// top-rated dishes, and collections. It also handles dynamic updates for some of these sections.
//
// MIGRATED: Updated to match the visual design and component structure from old-packages
// while maintaining compatibility with the current project structure and conventions.

/**
 * Homepage component for the Bellyfed application
 * Migrated from old-packages to include all visual components and enhanced functionality
 *
 * @returns {JSX.Element} - Rendered component
 */
const Homepage = function Homepage() {
  const { currentCountry, isInitialized } = useCountry();
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize state with default values - Enhanced from old-packages structure
  const [reviewers, setReviewers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [topReviewers, setTopReviewers] = useState(mockTopReviewers);

  // Update data when country changes
  useEffect(() => {
    if (!currentCountry || !currentCountry.reviewers) return;

    setReviewers(
      currentCountry.reviewers.map(r => ({ ...r, highlight: false })),
    );

    if (currentCountry.dishes) {
      setDishes(
        currentCountry.dishes.map(d => ({
          ...d,
          highlight: false,
          dish: d.name,
        })),
      );
    }

    if (currentCountry.locations) {
      setLocations(
        currentCountry.locations.map(l => ({
          ...l,
          highlight: false,
          area: l.name,
          new: l.newCount,
        })),
      );
    }
  }, [currentCountry]);

  // Memoize the country link generator to prevent unnecessary re-renders - RESTORED FROM OLD-PACKAGES
  const createCountryLink = useCallback(
    path => {
      return getCountryLink(path, currentCountry?.code);
    },
    [currentCountry],
  );

  // Function to randomly update stats - memoized to prevent unnecessary re-renders
  const updateStats = useCallback(() => {
    // Update reviewers with error handling
    setReviewers(prev => {
      if (!prev || !Array.isArray(prev)) return [];

      try {
        const newReviews = prev.map(reviewer => {
          const newReviews = reviewer.reviews + Math.floor(Math.random() * 8);
          return {
            ...reviewer,
            reviews: newReviews,
            highlight: newReviews !== reviewer.reviews,
          };
        });
        return [...newReviews].sort((a, b) => b.reviews - a.reviews);
      } catch (error) {
        console.error('Error updating reviewers:', error);
        return prev;
      }
    });

    // Update dishes with error handling
    setDishes(prev => {
      if (!prev || !Array.isArray(prev)) return [];

      try {
        const newDishes = prev.map(dish => {
          const change = Math.floor(Math.random() * 15);
          const newVotes = dish.votes + change;
          const newTrend = `↑ ${Math.floor(Math.random() * 15 + 5)}%`;
          return {
            ...dish,
            votes: newVotes,
            trend: newTrend,
            highlight: newVotes !== dish.votes,
          };
        });
        return [...newDishes].sort((a, b) => b.votes - a.votes);
      } catch (error) {
        console.error('Error updating dishes:', error);
        return prev;
      }
    });

    // Update locations with error handling
    setLocations(prev => {
      if (!prev || !Array.isArray(prev)) return [];

      try {
        const newLocations = prev.map(location => {
          const newRestaurants = Math.floor(Math.random() * 5);
          const newTotal = location.restaurants + newRestaurants;
          const newAdded = `+${Math.floor(Math.random() * 8 + 1)} this month`;
          return {
            ...location,
            restaurants: newTotal,
            new: newAdded,
            highlight: newTotal !== location.restaurants,
          };
        });
        return [...newLocations].sort((a, b) => b.restaurants - a.restaurants);
      } catch (error) {
        console.error('Error updating locations:', error);
        return prev;
      }
    });
  }, []);

  // Update stats periodically
  useEffect(() => {
    // Skip if country data isn't initialized yet
    if (!isInitialized) return;

    const interval = setInterval(() => {
      updateStats();

      // Update top reviewers
      setTopReviewers(prev => {
        if (!prev || !Array.isArray(prev)) return mockTopReviewers;

        return prev.map(reviewer => ({
          ...reviewer,
          reviews: reviewer.reviews + Math.floor(Math.random() * 3),
          highlight: true,
        }));
      });
    }, 2000); // Reduced frequency to improve performance

    return () => clearInterval(interval);
  }, [updateStats, isInitialized]);

  // Fetch restaurant data
  const {
    // data: restaurants, // Removed unused variable
    isLoading,
    error,
  } = useQuery({
    queryKey: ['restaurants', currentCountry?.code],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the country code
      return Promise.resolve(mockRestaurants);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Add error handling
    onError: err => {
      console.error('Error fetching restaurants:', err);
    },
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Data
        </h1>
        <p className="text-gray-700 mb-6">
          We encountered a problem while loading the page. Please try again
          later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Premium Banner - Migrated from old-packages */}
      <PremiumBanner
        showPremiumBanner={showPremiumBanner}
        setShowPremiumBanner={setShowPremiumBanner}
      />

      {/* Navigation - Migrated from old-packages */}
      <Navigation getCountryLink={createCountryLink} />

      {/* Hero Section - New enhanced design for food review app */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover & Share Amazing Food Experiences
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Join {currentCountry?.name || 'our'} community of food lovers.
              Read reviews, find the best dishes, and share your culinary
              journey.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants, dishes, or cuisines..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm opacity-90">Restaurants</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm opacity-90">Reviews</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-sm opacity-90">Food Lovers</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-sm opacity-90">Cities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <Camera className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Share Review</h3>
            <p className="text-sm text-gray-600 mt-1">Post your experience</p>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <MapPin className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Near Me</h3>
            <p className="text-sm text-gray-600 mt-1">Find nearby spots</p>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <TrendingUp className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Trending</h3>
            <p className="text-sm text-gray-600 mt-1">What's hot now</p>
          </button>
          <button className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <Award className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Top Rated</h3>
            <p className="text-sm text-gray-600 mt-1">Best of the best</p>
          </button>
        </div>
      </section>

      {/* Main Content - Updated layout to match old-packages structure */}
      <main className="content-container px-4 py-8">
        {/* Trending This Week Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              Trending This Week
            </h2>
            <a
              href={createCountryLink('/explore')}
              className="text-orange-500 hover:text-orange-600 font-semibold"
            >
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-orange-400 to-red-400"></div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                      🔥 Trending
                    </span>
                    <span className="text-sm text-gray-500">
                      +45% this week
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">
                    Spicy Ramen Challenge
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    The hottest ramen spots taking over the city
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">4.8</span>
                      <span className="text-sm text-gray-500">(234)</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      15 restaurants
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TopFoodies - Hero section with three ranking cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-8 h-8 text-orange-500" />
            Community Leaderboard
          </h2>
          <TopFoodies
            reviewers={reviewers}
            dishes={dishes}
            locations={locations}
            countryName={currentCountry?.name || 'Your Country'}
            getCountryLink={createCountryLink}
          />
        </div>

        {/* TopCritics - Professional card design with interactive features, click animations, and enhanced styling */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-8 h-8 text-orange-500" />
            Featured Food Critics
          </h2>
          <TopCritics topReviewers={topReviewers} />
        </div>

        {/* TopRatedDishes - Sophisticated version with animations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-8 h-8 text-orange-500" />
            Must-Try Dishes
          </h2>
          <TopRatedDishes />
        </div>

        {/* Collections - Carousel and grid sections */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Curated Collections
          </h2>
          <Collections
            countryName={currentCountry?.name || 'Your Country'}
            getCountryLink={createCountryLink}
          />
        </div>

        {/* FeaturedRestaurants - Grid of featured restaurants */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Featured Restaurants
          </h2>
          <FeaturedRestaurants
            countryName={currentCountry?.name || 'Your Country'}
            getCountryLink={createCountryLink}
          />
        </div>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food lovers in{' '}
            {currentCountry?.name || 'your area'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Sign Up Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-500 transition-colors">
              Browse Restaurants
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
