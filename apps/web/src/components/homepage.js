import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Premium Banner - Migrated from old-packages */}
      <PremiumBanner
        showPremiumBanner={showPremiumBanner}
        setShowPremiumBanner={setShowPremiumBanner}
      />

      {/* Navigation - Migrated from old-packages */}
      <Navigation getCountryLink={createCountryLink} />

      {/* Main Content - Updated layout to match old-packages structure */}
      <main className="content-container px-4 py-8">
        {/* TopFoodies - Hero section with three ranking cards */}
        <TopFoodies
          reviewers={reviewers}
          dishes={dishes}
          locations={locations}
          countryName={currentCountry?.name || 'Your Country'}
          getCountryLink={createCountryLink}
        />

        {/* TopCritics - Professional card design with interactive features, click animations, and enhanced styling */}
        <TopCritics topReviewers={topReviewers} />

        {/* TopRatedDishes - Sophisticated version with animations */}
        <TopRatedDishes />

        {/* Collections - Carousel and grid sections */}
        <Collections
          countryName={currentCountry?.name || 'Your Country'}
          getCountryLink={createCountryLink}
        />

        {/* FeaturedRestaurants - Grid of featured restaurants */}
        <FeaturedRestaurants
          countryName={currentCountry?.name || 'Your Country'}
          getCountryLink={createCountryLink}
        />
      </main>
    </div>
  );
};

export default Homepage;
