/**
 * Restaurant Comparison Component
 * 
 * Allows users to compare multiple restaurants side-by-side.
 * Shows detailed metrics, ratings, and features comparison.
 * 
 * Features:
 * - Side-by-side restaurant comparison
 * - Multiple comparison criteria
 * - Visual comparison charts
 * - Export comparison data
 * - Share comparison results
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const RestaurantComparison = ({
  restaurantIds = [],
  comparisonCriteria = ['rating', 'price', 'service', 'ambiance'],
  showPhotos = true,
  showReviews = true,
  showMenuHighlights = true,
  maxRestaurants = 3,
  className = ''
}) => {
  // State
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCriterion, setSelectedCriterion] = useState('rating');

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Comparison criteria configurations
  const criteriaConfigs = {
    rating: {
      label: 'Overall Rating',
      icon: '⭐',
      format: (value) => value?.toFixed(1) || 'N/A',
      color: 'text-yellow-600'
    },
    price: {
      label: 'Price Range',
      icon: '💰',
      format: (value) => value || 'N/A',
      color: 'text-green-600'
    },
    service: {
      label: 'Service Quality',
      icon: '👨‍💼',
      format: (value) => value?.toFixed(1) || 'N/A',
      color: 'text-blue-600'
    },
    ambiance: {
      label: 'Ambiance',
      icon: '🏮',
      format: (value) => value?.toFixed(1) || 'N/A',
      color: 'text-purple-600'
    },
    food_quality: {
      label: 'Food Quality',
      icon: '🍽️',
      format: (value) => value?.toFixed(1) || 'N/A',
      color: 'text-orange-600'
    },
    location: {
      label: 'Location Score',
      icon: '📍',
      format: (value) => value?.toFixed(1) || 'N/A',
      color: 'text-red-600'
    },
    popularity: {
      label: 'Popularity',
      icon: '🔥',
      format: (value) => value?.toFixed(1) || 'N/A',
      color: 'text-pink-600'
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async () => {
    if (restaurantIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRestaurantComparison({
        restaurantIds: restaurantIds.slice(0, maxRestaurants),
        criteria: comparisonCriteria,
        includePhotos: showPhotos,
        includeReviews: showReviews,
        includeMenuHighlights: showMenuHighlights
      });

      setComparisonData(data);
      
      // Track comparison view
      trackUserEngagement('restaurant', 'comparison', 'view', {
        restaurantIds: restaurantIds.slice(0, maxRestaurants),
        criteria: comparisonCriteria
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
      comparisonPosition: comparisonData.findIndex(r => r.id === restaurant.id) + 1
    });
  };

  // Get best value for criterion
  const getBestValue = (criterion) => {
    if (comparisonData.length === 0) return null;

    const values = comparisonData
      .map(r => r.metrics[criterion])
      .filter(v => v !== null && v !== undefined);

    if (values.length === 0) return null;

    // For price, lower is better; for others, higher is better
    return criterion === 'price' ? Math.min(...values) : Math.max(...values);
  };

  // Check if value is best for criterion
  const isBestValue = (value, criterion) => {
    const bestValue = getBestValue(criterion);
    if (bestValue === null || value === null || value === undefined) return false;
    return value === bestValue;
  };

  // Handle export
  const handleExport = async () => {
    try {
      const exportData = comparisonData.map(restaurant => ({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        location: restaurant.location,
        ...restaurant.metrics
      }));

      const csv = [
        ['Name', 'Cuisine', 'Location', ...comparisonCriteria.map(c => criteriaConfigs[c]?.label || c)],
        ...exportData.map(row => [
          row.name,
          row.cuisine,
          row.location,
          ...comparisonCriteria.map(c => row[c] || 'N/A')
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `restaurant-comparison-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      trackUserEngagement('restaurant', 'comparison', 'export', {
        restaurantCount: comparisonData.length
      });
    } catch (err) {
      console.error('Error exporting comparison:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/${country}/restaurants/compare?ids=${restaurantIds.join(',')}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Restaurant Comparison',
          text: 'Compare restaurants on Bellyfed',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Comparison link copied to clipboard!');
      }

      trackUserEngagement('restaurant', 'comparison', 'share', {
        restaurantCount: comparisonData.length,
        shareMethod: navigator.share ? 'native' : 'clipboard'
      });
    } catch (err) {
      console.error('Error sharing comparison:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchComparisonData();
  }, [restaurantIds]);

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
            Add restaurants to compare their features and ratings.
          </p>
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
            🏪 Restaurant Comparison
          </h2>
          <p className="text-gray-600 mt-1">
            Comparing {comparisonData.length} restaurant{comparisonData.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
          >
            Export Data
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
          >
            Share Comparison
          </Button>
        </div>
      </div>

      {/* Criteria Selector */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {comparisonCriteria.map(criterion => {
            const config = criteriaConfigs[criterion];
            if (!config) return null;

            return (
              <button
                key={criterion}
                onClick={() => setSelectedCriterion(criterion)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCriterion === criterion
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisonData.map((restaurant) => (
          <Card key={restaurant.id} className="p-6">
            {/* Restaurant Header */}
            <div className="text-center mb-4">
              <Link href={`/${country}/restaurants/${restaurant.id}`}>
                <div 
                  className="cursor-pointer hover:text-orange-600 transition-colors"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  {showPhotos && restaurant.imageUrl && (
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
                  <p className="text-xs text-gray-500">{restaurant.location}</p>
                </div>
              </Link>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              {comparisonCriteria.map(criterion => {
                const config = criteriaConfigs[criterion];
                const value = restaurant.metrics[criterion];
                const isBest = isBestValue(value, criterion);

                return config && (
                  <div key={criterion} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{config.icon}</span>
                      <span className="text-sm text-gray-600">{config.label}:</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
                        {config.format(value)}
                      </span>
                      {isBest && <span className="text-green-600">👑</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Menu Highlights */}
            {showMenuHighlights && restaurant.menuHighlights && restaurant.menuHighlights.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Popular Dishes</h4>
                <div className="space-y-1">
                  {restaurant.menuHighlights.slice(0, 3).map((dish, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{dish.name}</span>
                      <span className="text-gray-500">${dish.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Review */}
            {showReviews && restaurant.recentReview && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Review</h4>
                <p className="text-xs text-gray-600 italic line-clamp-2">
                  "{restaurant.recentReview.content}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  - {restaurant.recentReview.author}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-4">
              <Link href={`/${country}/restaurants/${restaurant.id}`}>
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

      {/* Selected Criterion Visualization */}
      {selectedCriterion && criteriaConfigs[selectedCriterion] && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{criteriaConfigs[selectedCriterion].icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {criteriaConfigs[selectedCriterion].label} Comparison
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {comparisonData.map((restaurant) => {
              const value = restaurant.metrics[selectedCriterion];
              const maxValue = Math.max(...comparisonData.map(r => r.metrics[selectedCriterion] || 0));
              const percentage = maxValue > 0 ? (value || 0) / maxValue * 100 : 0;

              return (
                <div key={restaurant.id} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-900 truncate">
                    {restaurant.name}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {criteriaConfigs[selectedCriterion].format(value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Comparison Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonCriteria.map(criterion => {
            const config = criteriaConfigs[criterion];
            const bestRestaurant = comparisonData.find(r => 
              isBestValue(r.metrics[criterion], criterion)
            );
            
            return config && bestRestaurant && (
              <div key={criterion} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{config.icon}</span>
                  <h4 className="font-medium text-gray-900">{config.label}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Best: <span className="font-medium">{bestRestaurant.name}</span>
                </p>
                <p className="text-lg font-bold text-green-600">
                  {config.format(bestRestaurant.metrics[criterion])}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default RestaurantComparison;
