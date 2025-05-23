/**
 * Dish Comparison Component
 * 
 * Allows users to compare how different restaurants prepare the same dish.
 * Shows side-by-side comparison of ratings, prices, reviews, and details.
 * 
 * Features:
 * - Side-by-side restaurant comparison
 * - Dish-specific metrics comparison
 * - Price and rating analysis
 * - Review highlights
 * - Interactive comparison table
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const DishComparison = ({
  dishId,
  dishName = 'Dish',
  restaurantIds = [],
  showReviews = true,
  showPricing = true,
  showMetrics = true,
  maxRestaurants = 3,
  className = ''
}) => {
  // State
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('rating');

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Comparison metrics
  const metrics = [
    { id: 'rating', label: 'Rating', icon: '⭐' },
    { id: 'price', label: 'Price', icon: '💰' },
    { id: 'reviews', label: 'Reviews', icon: '📝' },
    { id: 'popularity', label: 'Popularity', icon: '🔥' },
    { id: 'availability', label: 'Availability', icon: '✅' }
  ];

  // Fetch comparison data
  const fetchComparisonData = async () => {
    if (!dishId || restaurantIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDishComparison({
        dishId,
        restaurantIds: restaurantIds.slice(0, maxRestaurants),
        country,
        includeReviews: showReviews,
        includePricing: showPricing,
        includeMetrics: showMetrics
      });

      setComparisonData(data);
      
      // Track comparison view
      trackUserEngagement('dish', 'comparison', 'view', {
        dishId,
        dishName,
        restaurantIds: restaurantIds.slice(0, maxRestaurants),
        restaurantCount: restaurantIds.length
      });
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  // Handle restaurant click
  const handleRestaurantClick = (restaurant) => {
    trackUserEngagement('restaurant', restaurant.id, 'click_from_comparison', {
      dishId,
      dishName,
      comparisonPosition: comparisonData.findIndex(r => r.id === restaurant.id) + 1
    });
  };

  // Get best value for metric
  const getBestValue = (metric) => {
    if (comparisonData.length === 0) return null;

    switch (metric) {
      case 'rating':
        return Math.max(...comparisonData.map(r => r.dishRating || 0));
      case 'price':
        return Math.min(...comparisonData.map(r => r.dishPrice || Infinity));
      case 'reviews':
        return Math.max(...comparisonData.map(r => r.dishReviewCount || 0));
      case 'popularity':
        return Math.max(...comparisonData.map(r => r.popularityScore || 0));
      default:
        return null;
    }
  };

  // Check if value is best for metric
  const isBestValue = (value, metric) => {
    const bestValue = getBestValue(metric);
    if (bestValue === null || value === null || value === undefined) return false;

    switch (metric) {
      case 'price':
        return value === bestValue; // Lowest price is best
      default:
        return value === bestValue; // Highest value is best
    }
  };

  // Format price
  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  // Format rating
  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  // Load data on mount
  useEffect(() => {
    fetchComparisonData();
  }, [dishId, restaurantIds]);

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
          <p className="text-lg font-semibold mb-2">Error Loading Comparison</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchComparisonData} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No Comparison Data</p>
          <p className="text-sm">
            Unable to load comparison data for the selected restaurants.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {dishName} Comparison
        </h2>
        <p className="text-gray-600">
          Compare {dishName} across {comparisonData.length} restaurant{comparisonData.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Metric Selector */}
      {showMetrics && (
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-2">
            {metrics.map(metric => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedMetric === metric.id
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{metric.icon}</span>
                <span>{metric.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisonData.map((restaurant, index) => (
          <Card key={restaurant.id} className="p-6">
            {/* Restaurant Header */}
            <div className="text-center mb-4">
              <Link href={`/${country}/restaurants/${restaurant.id}`}>
                <div 
                  className="cursor-pointer hover:text-orange-600 transition-colors"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  {restaurant.imageUrl && (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                </div>
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              {/* Rating */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dish Rating:</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className={`font-medium ${
                    isBestValue(restaurant.dishRating, 'rating') ? 'text-green-600' : ''
                  }`}>
                    {formatRating(restaurant.dishRating)}
                  </span>
                  {isBestValue(restaurant.dishRating, 'rating') && (
                    <Badge variant="success" className="text-xs ml-1">Best</Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              {showPricing && restaurant.dishPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${
                      isBestValue(restaurant.dishPrice, 'price') ? 'text-green-600' : ''
                    }`}>
                      {formatPrice(restaurant.dishPrice)}
                    </span>
                    {isBestValue(restaurant.dishPrice, 'price') && (
                      <Badge variant="success" className="text-xs ml-1">Best Value</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews:</span>
                <span className={`font-medium ${
                  isBestValue(restaurant.dishReviewCount, 'reviews') ? 'text-green-600' : ''
                }`}>
                  {restaurant.dishReviewCount || 0}
                </span>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available:</span>
                <Badge variant={restaurant.dishAvailable ? 'success' : 'destructive'}>
                  {restaurant.dishAvailable ? 'Yes' : 'No'}
                </Badge>
              </div>

              {/* Distance */}
              {restaurant.distance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distance:</span>
                  <span className="text-sm">{restaurant.distance.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Review Highlight */}
            {showReviews && restaurant.topReview && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Top Review:</p>
                <p className="text-sm text-gray-700 italic line-clamp-2">
                  "{restaurant.topReview.content}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  - {restaurant.topReview.author}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-4">
              <Link href={`/${country}/restaurants/${restaurant.id}?dish=${dishId}`}>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  View Details
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest Rated</p>
            <p className="text-lg font-bold text-green-600">
              {formatRating(getBestValue('rating'))} ⭐
            </p>
          </div>
          
          {showPricing && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Best Price</p>
              <p className="text-lg font-bold text-green-600">
                {formatPrice(getBestValue('price'))}
              </p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Most Reviews</p>
            <p className="text-lg font-bold text-blue-600">
              {getBestValue('reviews')} reviews
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Available Now</p>
            <p className="text-lg font-bold text-orange-600">
              {comparisonData.filter(r => r.dishAvailable).length}/{comparisonData.length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DishComparison;
