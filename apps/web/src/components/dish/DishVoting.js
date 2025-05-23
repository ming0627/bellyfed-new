/**
 * Dish Voting Component
 * 
 * Allows users to vote on dishes with different voting mechanisms.
 * Supports upvote/downvote, star ratings, and preference selections.
 * 
 * Features:
 * - Multiple voting types (upvote/downvote, star rating, preference)
 * - Real-time vote counting and updates
 * - User authentication integration
 * - Vote history and analytics tracking
 * - Responsive design with animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const DishVoting = ({
  dishId,
  dishName = 'Dish',
  restaurantId = null,
  restaurantName = null,
  votingType = 'updown', // 'updown', 'star', 'preference'
  showResults = true,
  showVoteCount = true,
  allowMultipleVotes = false,
  className = ''
}) => {
  // State
  const [voteData, setVoteData] = useState({
    upvotes: 0,
    downvotes: 0,
    totalVotes: 0,
    averageRating: 0,
    userVote: null,
    userRating: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();

  // Vote types
  const voteTypes = {
    updown: {
      options: [
        { id: 'up', label: 'Upvote', icon: '👍', color: 'text-green-600' },
        { id: 'down', label: 'Downvote', icon: '👎', color: 'text-red-600' }
      ]
    },
    star: {
      options: [
        { id: 1, label: '1 Star', icon: '⭐', color: 'text-yellow-500' },
        { id: 2, label: '2 Stars', icon: '⭐⭐', color: 'text-yellow-500' },
        { id: 3, label: '3 Stars', icon: '⭐⭐⭐', color: 'text-yellow-500' },
        { id: 4, label: '4 Stars', icon: '⭐⭐⭐⭐', color: 'text-yellow-500' },
        { id: 5, label: '5 Stars', icon: '⭐⭐⭐⭐⭐', color: 'text-yellow-500' }
      ]
    },
    preference: {
      options: [
        { id: 'love', label: 'Love it', icon: '❤️', color: 'text-red-500' },
        { id: 'like', label: 'Like it', icon: '👍', color: 'text-green-500' },
        { id: 'neutral', label: 'Neutral', icon: '😐', color: 'text-gray-500' },
        { id: 'dislike', label: 'Dislike', icon: '👎', color: 'text-orange-500' }
      ]
    }
  };

  // Fetch vote data
  const fetchVoteData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDishVotes({
        dishId,
        restaurantId,
        userId: user?.id,
        votingType
      });

      setVoteData(data);
      
      // Track vote data view
      trackUserEngagement('dish', dishId, 'votes_view', {
        dishName,
        restaurantId,
        votingType,
        totalVotes: data.totalVotes
      });
    } catch (err) {
      console.error('Error fetching vote data:', err);
      setError(err.message || 'Failed to load vote data');
    } finally {
      setLoading(false);
    }
  };

  // Handle vote submission
  const handleVote = async (voteValue) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      trackUserEngagement('dish', dishId, 'vote_attempt_unauthenticated', {
        dishName,
        voteValue,
        votingType
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await analyticsService.submitDishVote({
        dishId,
        restaurantId,
        userId: user.id,
        voteValue,
        votingType,
        allowMultiple: allowMultipleVotes
      });

      // Update local state
      setVoteData(prev => ({
        ...prev,
        ...result,
        userVote: votingType === 'updown' ? voteValue : prev.userVote,
        userRating: votingType === 'star' ? voteValue : prev.userRating
      }));

      // Track vote submission
      trackUserEngagement('dish', dishId, 'vote_submitted', {
        dishName,
        restaurantId,
        voteValue,
        votingType,
        userId: user.id
      });
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle vote removal
  const handleRemoveVote = async () => {
    if (!isAuthenticated) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await analyticsService.removeDishVote({
        dishId,
        restaurantId,
        userId: user.id,
        votingType
      });

      // Update local state
      setVoteData(prev => ({
        ...prev,
        ...result,
        userVote: null,
        userRating: null
      }));

      // Track vote removal
      trackUserEngagement('dish', dishId, 'vote_removed', {
        dishName,
        restaurantId,
        votingType,
        userId: user.id
      });
    } catch (err) {
      console.error('Error removing vote:', err);
      setError(err.message || 'Failed to remove vote');
    } finally {
      setSubmitting(false);
    }
  };

  // Get vote percentage
  const getVotePercentage = (voteType) => {
    if (voteData.totalVotes === 0) return 0;
    
    switch (voteType) {
      case 'up':
        return (voteData.upvotes / voteData.totalVotes) * 100;
      case 'down':
        return (voteData.downvotes / voteData.totalVotes) * 100;
      default:
        return 0;
    }
  };

  // Check if user has voted
  const hasUserVoted = (voteValue) => {
    if (votingType === 'updown') {
      return voteData.userVote === voteValue;
    } else if (votingType === 'star') {
      return voteData.userRating === voteValue;
    }
    return false;
  };

  // Load data on mount
  useEffect(() => {
    fetchVoteData();
  }, [dishId, restaurantId, user?.id]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-sm font-medium mb-2">Error Loading Votes</p>
          <p className="text-xs">{error}</p>
          <Button 
            onClick={fetchVoteData} 
            className="mt-3"
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const currentVoteType = voteTypes[votingType];

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {votingType === 'updown' ? 'Vote' : votingType === 'star' ? 'Rate' : 'Preference'}
          </h3>
          {showVoteCount && (
            <p className="text-sm text-gray-600">
              {voteData.totalVotes} {voteData.totalVotes === 1 ? 'vote' : 'votes'}
            </p>
          )}
        </div>

        {isAuthenticated && (voteData.userVote || voteData.userRating) && (
          <Button
            onClick={handleRemoveVote}
            variant="outline"
            size="sm"
            disabled={submitting}
            className="text-gray-600 hover:text-red-600"
          >
            Remove Vote
          </Button>
        )}
      </div>

      {/* Voting Options */}
      <div className="space-y-3 mb-4">
        {currentVoteType.options.map((option) => {
          const isSelected = hasUserVoted(option.id);
          const isDisabled = submitting || (!isAuthenticated && !isSelected);

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border transition-all
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                {isSelected && (
                  <Badge variant="secondary" className="text-xs">
                    Your vote
                  </Badge>
                )}
              </div>

              {submitting && isSelected && (
                <LoadingSpinner size="sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {showResults && votingType === 'updown' && voteData.totalVotes > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600">👍 Upvotes</span>
            <span className="font-medium">{voteData.upvotes} ({getVotePercentage('up').toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getVotePercentage('up')}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-red-600">👎 Downvotes</span>
            <span className="font-medium">{voteData.downvotes} ({getVotePercentage('down').toFixed(1)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getVotePercentage('down')}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Star Rating Results */}
      {showResults && votingType === 'star' && voteData.totalVotes > 0 && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-yellow-500">
              {voteData.averageRating.toFixed(1)}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(voteData.averageRating)
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Average rating from {voteData.totalVotes} {voteData.totalVotes === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      )}

      {/* Authentication Prompt */}
      {!isAuthenticated && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            Sign in to vote on this dish
          </p>
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DishVoting;
