import React, { useState, useEffect, useCallback } from 'react';
import ImageModule from 'next/image';
import { Award, Star, ChevronRight, ChevronLeft } from 'lucide-react';

// Solution for Next.js 15.x: Extract the actual Image component from default property
const Image = ImageModule.default;
import { Card, Button, AvatarWithInitials } from '@bellyfed/ui';
import dynamic from 'next/dynamic';

// Create a client-only version of the component to prevent hydration errors
const ClientOnlyRankingBoard = dynamic(
  () => Promise.resolve(RankingBoardContent),
  {
    ssr: false,
  },
);

// Types for the ranking data
interface Dish {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  restaurant: string;
  votes: number;
  trend?: string;
}

interface Reviewer {
  id: string;
  name: string;
  avatarUrl?: string;
  reviewCount: number;
  rank: number;
  specialty?: string;
  helpfulCount: number;
}

interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
  priceRange: string;
}

interface RankingBoardProps {
  topDishes: Dish[];
  topReviewers: Reviewer[];
  topRestaurants: Restaurant[];
  className?: string;
}

// The main content component that will be rendered client-side only
const RankingBoardContent: React.FC<RankingBoardProps> = ({
  topDishes,
  topReviewers,
  topRestaurants,
  className,
}) => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState<
    'dishes' | 'reviewers' | 'restaurants'
  >('dishes');

  // State for the current page of each category
  const [currentPage, setCurrentPage] = useState(0);

  // Items per page
  const itemsPerPage = 5;

  // Get the maximum number of pages for the current active tab
  const getMaxPages = useCallback(() => {
    const itemCount =
      activeTab === 'dishes'
        ? topDishes.length
        : activeTab === 'reviewers'
          ? topReviewers.length
          : topRestaurants.length;

    return Math.ceil(itemCount / itemsPerPage);
  }, [activeTab, topDishes, topReviewers, topRestaurants, itemsPerPage]);

  // Auto-rotate tabs and pages with reduced frequency to be less distracting
  useEffect(() => {
    const tabInterval = setInterval(() => {
      setActiveTab(prev => {
        if (prev === 'dishes') return 'reviewers';
        if (prev === 'reviewers') return 'restaurants';
        return 'dishes';
      });
      setCurrentPage(0); // Reset page when changing tabs
    }, 15000); // Change tab every 15 seconds (increased from 10s)

    const pageInterval = setInterval(() => {
      setCurrentPage(prev => {
        const maxPages = getMaxPages();
        return prev < maxPages - 1 ? prev + 1 : 0;
      });
    }, 8000); // Change page every 8 seconds (increased from 5s)

    return () => {
      clearInterval(tabInterval);
      clearInterval(pageInterval);
    };
  }, [getMaxPages]);

  // Handle tab change
  const handleTabChange = (tab: 'dishes' | 'reviewers' | 'restaurants') => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset page when changing tabs
  };

  // Handle page change
  const handlePageChange = (direction: 'prev' | 'next') => {
    const maxPages = getMaxPages();

    if (direction === 'prev') {
      setCurrentPage(prev => (prev > 0 ? prev - 1 : maxPages - 1));
    } else {
      setCurrentPage(prev => (prev < maxPages - 1 ? prev + 1 : 0));
    }
  };

  // Get current items based on active tab and current page
  const getCurrentItems = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    if (activeTab === 'dishes') {
      return topDishes.slice(startIndex, endIndex);
    } else if (activeTab === 'reviewers') {
      return topReviewers.slice(startIndex, endIndex);
    } else {
      return topRestaurants.slice(startIndex, endIndex);
    }
  };

  return (
    <Card
      className={`overflow-hidden ${className}`}
      variant="elevated"
      padding="none"
      radius="xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          <h3 className="font-heading font-bold text-lg">Bellyfed Rankings</h3>
        </div>

        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-white/30 focus:bg-white/30 ${activeTab === 'dishes' ? 'bg-white/20' : ''}`}
            onClick={() => handleTabChange('dishes')}
          >
            Dishes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-white/30 focus:bg-white/30 ${activeTab === 'reviewers' ? 'bg-white/20' : ''}`}
            onClick={() => handleTabChange('reviewers')}
          >
            Reviewers
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-white/30 focus:bg-white/30 ${activeTab === 'restaurants' ? 'bg-white/20' : ''}`}
            onClick={() => handleTabChange('restaurants')}
          >
            Restaurants
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="min-h-[320px]">
          {/* Dishes Tab */}
          {activeTab === 'dishes' && (
            <div className="space-y-3 animate-smooth-fade">
              {getCurrentItems().map((item, index) => {
                const dish = item as Dish; // Type assertion
                return (
                  <div
                    key={dish.id}
                    className="flex items-center p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-800/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 font-heading font-bold text-lg text-primary-600 dark:text-primary-500">
                      #{currentPage * itemsPerPage + index + 1}
                    </div>
                    <div className="w-14 h-14 rounded-md overflow-hidden mr-3 shadow-sm">
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        width={56}
                        height={56}
                        objectFit="cover"
                        className="transition-transform hover:scale-110 duration-500"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-neutral-800 dark:text-neutral-100 truncate">
                        {dish.name}
                      </h4>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                        {dish.restaurant}
                      </div>
                    </div>
                    <div className="flex items-center ml-2 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-accent-gold-500 mr-1" />
                      <span className="font-medium">
                        {dish.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">
                        ({dish.votes})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reviewers Tab */}
          {activeTab === 'reviewers' && (
            <div className="space-y-3 animate-smooth-fade">
              {getCurrentItems().map((item, index) => {
                const reviewer = item as Reviewer; // Type assertion
                return (
                  <div
                    key={reviewer.id}
                    className="flex items-center p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-800/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 font-heading font-bold text-lg text-primary-600 dark:text-primary-500">
                      #{currentPage * itemsPerPage + index + 1}
                    </div>
                    <AvatarWithInitials
                      src={reviewer.avatarUrl}
                      name={reviewer.name}
                      className="mr-3 shadow-sm w-10 h-10"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-neutral-800 dark:text-neutral-100 truncate">
                        {reviewer.name}
                      </h4>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                        {reviewer.specialty || 'Food Critic'}
                      </div>
                    </div>
                    <div className="text-right bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                      <div className="font-medium text-primary-600 dark:text-primary-500">
                        {reviewer.reviewCount}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        reviews
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Restaurants Tab */}
          {activeTab === 'restaurants' && (
            <div className="space-y-3 animate-smooth-fade">
              {getCurrentItems().map((item, index) => {
                const restaurant = item as Restaurant; // Type assertion
                return (
                  <div
                    key={restaurant.id}
                    className="flex items-center p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-800/30"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 font-heading font-bold text-lg text-primary-600 dark:text-primary-500">
                      #{currentPage * itemsPerPage + index + 1}
                    </div>
                    <div className="w-14 h-14 rounded-md overflow-hidden mr-3 shadow-sm">
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        width={56}
                        height={56}
                        objectFit="cover"
                        className="transition-transform hover:scale-110 duration-500"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-neutral-800 dark:text-neutral-100 truncate">
                        {restaurant.name}
                      </h4>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                        {restaurant.cuisine} • {restaurant.priceRange}
                      </div>
                    </div>
                    <div className="flex items-center ml-2 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-accent-gold-500 mr-1" />
                      <span className="font-medium">
                        {restaurant.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">
                        ({restaurant.reviewCount})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
            Page {currentPage + 1} of {getMaxPages()}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('prev')}
              aria-label="Previous page"
              className="border-primary-200 hover:bg-primary-100 dark:border-primary-800/30 dark:hover:bg-primary-900/30 focus:bg-primary-100 dark:focus:bg-primary-900/30 rounded-full w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('next')}
              aria-label="Next page"
              className="border-primary-200 hover:bg-primary-100 dark:border-primary-800/30 dark:hover:bg-primary-900/30 focus:bg-primary-100 dark:focus:bg-primary-900/30 rounded-full w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// The wrapper component that uses the client-only version
const RankingBoard: React.FC<RankingBoardProps> = props => {
  return <ClientOnlyRankingBoard {...props} />;
};

export default RankingBoard;
