import { useCallback, useEffect, useState } from 'react';

import { useCountry } from '../contexts/CountryContext.js';

// Import components
import ActivityFeed from './homepage/ActivityFeed.js';
import Collections from './homepage/Collections.js';
import FeaturedContent from './homepage/FeaturedContent.js';
import FeaturedRestaurants from './homepage/FeaturedRestaurants.js';
import PremiumBanner from './homepage/PremiumBanner.js';
import TopCritics from './homepage/TopCritics.js';
import TopFoodies from './homepage/TopFoodies.js';
import TopRatedDishes from './homepage/TopRatedDishes.js';

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

/**
 * Homepage component for the Bellyfed application
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function Homepage() {
  const { currentCountry, isInitialized, updateRankingData } = useCountry();
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [topReviewers, setTopReviewers] = useState(mockTopReviewers);

  // Memoize the country link generator to prevent unnecessary re-renders
  const getCountryLink = useCallback(
    path => {
      if (!currentCountry || !currentCountry.code) return path;
      return `/${currentCountry.code}${path}`;
    },
    [currentCountry],
  );

  // Function to randomly update stats - memoized to prevent unnecessary re-renders
  const updateStats = useCallback(() => {
    // Use the context method to update ranking data with animations
    updateRankingData();
  }, [updateRankingData]);

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

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Modern gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <PremiumBanner
          showPremiumBanner={showPremiumBanner}
          setShowPremiumBanner={setShowPremiumBanner}
        />

        {/* Main Content with enhanced spacing */}
        <main className="w-full relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9966' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <TopFoodies
              reviewers={currentCountry?.reviewers || []}
              dishes={currentCountry?.dishes || []}
              locations={currentCountry?.locations || []}
              countryName={currentCountry?.name || 'Your Country'}
              getCountryLink={getCountryLink}
            />

            <FeaturedContent
              countryName={currentCountry?.name || 'Your Country'}
              getCountryLink={getCountryLink}
            />

            {/* Two-column layout for activity and content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
              <div className="xl:col-span-2">
                <TopRatedDishes />
              </div>
              <div className="xl:col-span-1">
                <ActivityFeed countryName={currentCountry?.name || 'Your Country'} />
              </div>
            </div>

            <TopCritics topReviewers={topReviewers} />

            <Collections
              countryName={currentCountry?.name || 'Your Country'}
              getCountryLink={getCountryLink}
            />

            <FeaturedRestaurants
              countryName={currentCountry?.name || 'Your Country'}
              getCountryLink={getCountryLink}
            />
          </div>
        </main>
      </div>
    </>
  );
}
