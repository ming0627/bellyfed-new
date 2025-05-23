/**
 * AI Recommendations Component
 *
 * Displays AI-powered restaurant and dish recommendations based on user preferences,
 * location, and past behavior. Features personalized suggestions with confidence scores.
 *
 * Features:
 * - Personalized AI recommendations
 * - Confidence scoring
 * - Multiple recommendation types
 * - Real-time updates
 * - Interactive feedback system
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import RestaurantCard from '../restaurants/RestaurantCard.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const AIRecommendations = ({
  userId = null,
  location = null,
  preferences = {},
  recommendationType = 'mixed', // 'restaurants', 'dishes', 'mixed'
  limit = 10,
  showConfidenceScores = true,
  showFeedback = true,
  showExplanations = true,
  className = ''
}) => {
  // State
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Recommendation types
  const recommendationTypes = [
    { id: 'mixed', label: 'All Recommendations', icon: '🎯' },
    { id: 'restaurants', label: 'Restaurants', icon: '🏪' },
    { id: 'dishes', label: 'Dishes', icon: '🍽️' },
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'nearby', label: 'Nearby', icon: '📍' }
  ];

  // Fetch AI recommendations
  const fetchRecommendations = async (type = recommendationType, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await analyticsService.getAIRecommendations({
        userId,
        location,
        preferences,
        type,
        limit,
        country,
        includeExplanations: showExplanations,
        includeConfidenceScores: showConfidenceScores
      });

      setRecommendations(data);

      // Track recommendations view
      trackUserEngagement('ai', 'recommendations', 'view', {
        type,
        count: data.length,
        userId,
        location: location?.name || 'unknown'
      });
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle recommendation feedback
  const handleFeedback = async (recommendationId, feedback) => {
    try {
      await analyticsService.submitRecommendationFeedback({
        recommendationId,
        feedback, // 'like', 'dislike', 'not_interested'
        userId
      });

      setFeedbackSubmitted(prev => new Set([...prev, recommendationId]));

      trackUserEngagement('ai', 'recommendations', 'feedback', {
        recommendationId,
        feedback,
        userId
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Handle recommendation click
  const handleRecommendationClick = (recommendation) => {
    trackUserEngagement('ai', 'recommendations', 'click', {
      recommendationId: recommendation.id,
      type: recommendation.type,
      confidenceScore: recommendation.confidenceScore,
      userId
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchRecommendations(recommendationType, true);
  };

  // Get confidence color
  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get confidence label
  const getConfidenceLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  // Filter recommendations by type
  const filteredRecommendations = useMemo(() => {
    if (recommendationType === 'mixed') {
      return recommendations;
    }
    return recommendations.filter(rec => rec.type === recommendationType);
  }, [recommendations, recommendationType]);

  // Load recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, [userId, location, recommendationType, country]);

  if (loading && !refreshing) {
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
          <p className="text-lg font-semibold mb-2">Error Loading Recommendations</p>
          <p className="text-sm">{error}</p>
          <Button
            onClick={() => fetchRecommendations()}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            🤖 AI Recommendations
          </h2>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Recommendation Types */}
      <div className="flex flex-wrap gap-2">
        {recommendationTypes.map(type => (
          <button
            key={type.id}
            onClick={() => fetchRecommendations(type.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${recommendationType === type.id
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.type}
                    </Badge>
                    {showConfidenceScores && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${getConfidenceColor(recommendation.confidenceScore)}`}
                      >
                        {getConfidenceLabel(recommendation.confidenceScore)} Confidence
                      </Badge>
                    )}
                  </div>

                  {showExplanations && recommendation.explanation && (
                    <p className="text-sm text-gray-600 mb-3">
                      {recommendation.explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendation Content */}
              <div onClick={() => handleRecommendationClick(recommendation)}>
                {recommendation.type === 'restaurant' && recommendation.restaurant && (
                  <RestaurantCard
                    restaurant={recommendation.restaurant}
                    showMetrics={false}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  />
                )}

                {recommendation.type === 'dish' && recommendation.dish && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    {recommendation.dish.imageUrl && (
                      <img
                        src={recommendation.dish.imageUrl}
                        alt={recommendation.dish.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{recommendation.dish.name}</h4>
                      <p className="text-sm text-gray-600">{recommendation.dish.restaurant}</p>
                      {recommendation.dish.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">{recommendation.dish.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {showFeedback && !feedbackSubmitted.has(recommendation.id) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Was this recommendation helpful?</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleFeedback(recommendation.id, 'like')}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                    >
                      👍 Yes
                    </Button>
                    <Button
                      onClick={() => handleFeedback(recommendation.id, 'dislike')}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      👎 No
                    </Button>
                    <Button
                      onClick={() => handleFeedback(recommendation.id, 'not_interested')}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:bg-gray-50"
                    >
                      Not Interested
                    </Button>
                  </div>
                </div>
              )}

              {feedbackSubmitted.has(recommendation.id) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-green-600">✓ Thank you for your feedback!</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Recommendations Available</p>
            <p className="text-sm">
              We're learning about your preferences. Try exploring more restaurants and dishes to get personalized recommendations.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIRecommendations;
