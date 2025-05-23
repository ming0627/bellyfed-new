/**
 * Dish Restaurant List Component
 * 
 * Displays a list of restaurants that serve a specific dish.
 * Shows rankings, ratings, and allows comparison between restaurants.
 * 
 * Features:
 * - Restaurant comparison for specific dishes
 * - Dish-specific ratings and rankings
 * - Distance and availability filtering
 * - Price comparison
 * - User reviews for dish at each restaurant
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import RestaurantCard from '../restaurants/RestaurantCard.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const DishRestaurantList = ({
  dishId,
  dishName = 'Dish',
  userLocation = null,
  showFilters = true,
  showComparison = true,
  showRankings = true,
  defaultSortBy = 'rating',
  limit = 20,
  className = ''
}) => {
  // State
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [filterBy, setFilterBy] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [maxDistance, setMaxDistance] = useState(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState(new Set());

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Sort options
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Lowest Price' },
    { value: 'price_high', label: 'Highest Price' },
    { value: 'distance', label: 'Nearest' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Restaurants' },
    { value: 'available', label: 'Available Now' },
    { value: 'delivery', label: 'Delivery Available' },
    { value: 'highly_rated', label: 'Highly Rated (4.0+)' },
    { value: 'verified', label: 'Verified Restaurants' }
  ];

  // Price range options
  const priceRangeOptions = [
    { value: 'all', label: 'All Prices' },
    { value: '$', label: '$ - Budget' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Expensive' },
    { value: '$$$$', label: '$$$$ - Fine Dining' }
  ];

  // Distance options
  const distanceOptions = [
    { value: null, label: 'Any Distance' },
    { value: 1, label: 'Within 1 km' },
    { value: 5, label: 'Within 5 km' },
    { value: 10, label: 'Within 10 km' },
    { value: 25, label: 'Within 25 km' }
  ];

  // Fetch restaurants serving the dish
  const fetchDishRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDishRestaurants({
        dishId,
        userLocation,
        country,
        sortBy,
        filterBy,
        priceRange: priceRange !== 'all' ? priceRange : null,
        maxDistance,
        limit,
        includeReviews: true,
        includeAvailability: true
      });

      setRestaurants(data);
      
      // Track dish restaurants view
      trackUserEngagement('dish', 'restaurants', 'view', {
        dishId,
        dishName,
        restaurantCount: data.length,
        sortBy,
        filterBy
      });
    } catch (err) {
      console.error('Error fetching dish restaurants:', err);
      setError(err.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  // Handle restaurant selection for comparison
  const handleRestaurantSelect = (restaurantId) => {
    setSelectedRestaurants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(restaurantId)) {
        newSet.delete(restaurantId);
      } else if (newSet.size < 3) { // Limit to 3 restaurants for comparison
        newSet.add(restaurantId);
      }
      return newSet;
    });
  };

  // Handle restaurant click
  const handleRestaurantClick = (restaurant) => {
    trackUserEngagement('restaurant', restaurant.id, 'click_from_dish', {
      dishId,
      dishName,
      position: restaurants.findIndex(r => r.id === restaurant.id) + 1,
      dishRating: restaurant.dishRating,
      dishPrice: restaurant.dishPrice
    });
  };

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Apply filters
    if (filterBy !== 'all') {
      filtered = filtered.filter(restaurant => {
        switch (filterBy) {
          case 'available':
            return restaurant.isOpen && restaurant.dishAvailable;
          case 'delivery':
            return restaurant.hasDelivery;
          case 'highly_rated':
            return restaurant.dishRating >= 4.0;
          case 'verified':
            return restaurant.isVerified;
          default:
            return true;
        }
      });
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.dishPriceRange === priceRange);
    }

    // Apply distance filter
    if (maxDistance && userLocation) {
      filtered = filtered.filter(restaurant => 
        restaurant.distance <= maxDistance
      );
    }

    // Sort restaurants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.dishRating || 0) - (a.dishRating || 0);
        case 'price_low':
          return (a.dishPrice || 0) - (b.dishPrice || 0);
        case 'price_high':
          return (b.dishPrice || 0) - (a.dishPrice || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'reviews':
          return (b.dishReviewCount || 0) - (a.dishReviewCount || 0);
        case 'popularity':
          return (b.popularityScore || 0) - (a.popularityScore || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [restaurants, sortBy, filterBy, priceRange, maxDistance, userLocation]);

  // Load data on mount and when filters change
  useEffect(() => {
    if (dishId) {
      fetchDishRestaurants();
    }
  }, [dishId, sortBy, filterBy, priceRange, maxDistance]);

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Restaurants</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchDishRestaurants} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Where to get {dishName}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} serving this dish
          </p>
        </div>

        {showComparison && selectedRestaurants.size > 0 && (
          <Button
            onClick={() => {
              // Handle comparison - could open modal or navigate to comparison page
              trackUserEngagement('dish', 'restaurants', 'compare', {
                dishId,
                restaurantIds: Array.from(selectedRestaurants)
              });
            }}
            className="flex items-center gap-2"
          >
            Compare {selectedRestaurants.size} Restaurant{selectedRestaurants.size !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {priceRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance */}
            {userLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <select
                  value={maxDistance || ''}
                  onChange={(e) => setMaxDistance(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {distanceOptions.map(option => (
                    <option key={option.value || 'all'} value={option.value || ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Restaurant List */}
      {filteredRestaurants.length > 0 ? (
        <div className="space-y-4">
          {filteredRestaurants.map((restaurant, index) => (
            <Card key={restaurant.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Selection checkbox for comparison */}
                {showComparison && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.has(restaurant.id)}
                      onChange={() => handleRestaurantSelect(restaurant.id)}
                      disabled={!selectedRestaurants.has(restaurant.id) && selectedRestaurants.size >= 3}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </div>
                )}

                {/* Restaurant Info */}
                <div className="flex-1" onClick={() => handleRestaurantClick(restaurant)}>
                  <RestaurantCard
                    restaurant={restaurant}
                    showMetrics={false}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  />
                </div>

                {/* Dish-specific Info */}
                <div className="text-right min-w-[120px]">
                  {showRankings && restaurant.dishRank && (
                    <Badge variant="secondary" className="mb-2">
                      #{restaurant.dishRank} for {dishName}
                    </Badge>
                  )}
                  
                  {restaurant.dishRating && (
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{restaurant.dishRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">
                        ({restaurant.dishReviewCount} reviews)
                      </span>
                    </div>
                  )}
                  
                  {restaurant.dishPrice && (
                    <p className="text-lg font-bold text-orange-600">
                      ${restaurant.dishPrice.toFixed(2)}
                    </p>
                  )}
                  
                  {restaurant.distance && (
                    <p className="text-sm text-gray-500 mt-1">
                      {restaurant.distance.toFixed(1)} km away
                    </p>
                  )}
                  
                  {!restaurant.dishAvailable && (
                    <Badge variant="destructive" className="mt-2">
                      Currently Unavailable
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Restaurants Found</p>
            <p className="text-sm">
              No restaurants match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DishRestaurantList;
