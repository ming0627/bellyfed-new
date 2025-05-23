/**
 * Dish Voting Component
 * 
 * Provides voting functionality for dishes with multiple voting types.
 * Supports upvote/downvote, star ratings, and preference voting.
 * 
 * Features:
 * - Multiple voting types (updown, star, preference)
 * - Real-time vote updates
 * - User authentication integration
 * - Vote history tracking
 * - Visual feedback and animations
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const DishVoting = ({
  dishId,
  dishName = 'Dish',
  restaurantId,
  votingType = 'updown', // 'updown', 'star', 'preference'
  showResults = true,
  showVoteCount = true,
  allowMultipleVotes = false,
  className = ''
}) => {
  // State
  const [voteData, setVoteData] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Fetch voting data
  const fetchVotingData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDishVotes({
        dishId,
        userId: user?.id,
        includeUserVote: true
      });

      setVoteData(data);
      setUserVote(data.userVote);
      
      // Track vote view
      trackUserEngagement('dish', dishId, 'vote_view', {
        votingType,
        hasUserVote: !!data.userVote
      });
    } catch (err) {
      console.error('Error fetching voting data:', err);
      setError(err.message || 'Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  // Submit vote
  const submitVote = async (voteValue) => {
    if (!isAuthenticated) {
      alert('Please sign in to vote');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await analyticsService.submitDishVote({
        dishId,
        userId: user.id,
        voteType: votingType,
        value: voteValue,
        restaurantId
      });

      // Update local state
      setVoteData(result.voteData);
      setUserVote(result.userVote);

      // Track vote submission
      trackUserEngagement('dish', dishId, 'vote_submit', {
        votingType,
        voteValue,
        previousVote: userVote?.value
      });
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  // Render updown voting
  const renderUpDownVoting = () => {
    const upvotes = voteData?.upvotes || 0;
    const downvotes = voteData?.downvotes || 0;
    const userUpvoted = userVote?.value === 'up';
    const userDownvoted = userVote?.value === 'down';

    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => submitVote(userUpvoted ? null : 'up')}
          disabled={submitting || !isAuthenticated}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${userUpvoted 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
            }
            ${submitting || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="text-lg">👍</span>
          {showVoteCount && <span className="font-medium">{upvotes}</span>}
        </button>

        <button
          onClick={() => submitVote(userDownvoted ? null : 'down')}
          disabled={submitting || !isAuthenticated}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${userDownvoted 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
            }
            ${submitting || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="text-lg">👎</span>
          {showVoteCount && <span className="font-medium">{downvotes}</span>}
        </button>

        {showResults && (
          <div className="text-sm text-gray-500">
            {upvotes + downvotes} total votes
          </div>
        )}
      </div>
    );
  };

  // Render star rating
  const renderStarRating = () => {
    const averageRating = voteData?.averageRating || 0;
    const totalVotes = voteData?.totalVotes || 0;
    const userRating = userVote?.value || 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => submitVote(star === userRating ? 0 : star)}
              disabled={submitting || !isAuthenticated}
              className={`
                text-2xl transition-all cursor-pointer
                ${star <= userRating 
                  ? 'text-yellow-400 hover:text-yellow-500' 
                  : 'text-gray-300 hover:text-yellow-300'
                }
                ${submitting || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              ⭐
            </button>
          ))}
        </div>

        {showResults && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{averageRating.toFixed(1)}</span>
            </div>
            {showVoteCount && (
              <div className="text-gray-500">
                ({totalVotes} {totalVotes === 1 ? 'rating' : 'ratings'})
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render preference voting
  const renderPreferenceVoting = () => {
    const preferences = voteData?.preferences || {};
    const userPreference = userVote?.value;
    const options = ['love', 'like', 'neutral', 'dislike'];

    const optionConfig = {
      love: { emoji: '😍', label: 'Love it!', color: 'text-pink-600' },
      like: { emoji: '😊', label: 'Like it', color: 'text-green-600' },
      neutral: { emoji: '😐', label: 'Neutral', color: 'text-gray-600' },
      dislike: { emoji: '😞', label: 'Dislike', color: 'text-red-600' }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {options.map((option) => {
            const config = optionConfig[option];
            const count = preferences[option] || 0;
            const isSelected = userPreference === option;

            return (
              <button
                key={option}
                onClick={() => submitVote(isSelected ? null : option)}
                disabled={submitting || !isAuthenticated}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-lg border transition-all
                  ${isSelected 
                    ? 'border-orange-200 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${submitting || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-xs font-medium">{config.label}</span>
                {showVoteCount && (
                  <span className="text-xs text-gray-500">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {showResults && (
          <div className="text-sm text-gray-500 text-center">
            {Object.values(preferences).reduce((a, b) => a + b, 0)} total votes
          </div>
        )}
      </div>
    );
  };

  // Load data on mount
  useEffect(() => {
    fetchVotingData();
  }, [dishId, user?.id]);

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
          <p className="font-semibold mb-2">Error Loading Votes</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchVotingData} 
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

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Rate {dishName}
        </h3>
        <p className="text-sm text-gray-600">
          Share your opinion about this dish
        </p>
      </div>

      {/* Voting Interface */}
      <div className="mb-4">
        {votingType === 'updown' && renderUpDownVoting()}
        {votingType === 'star' && renderStarRating()}
        {votingType === 'preference' && renderPreferenceVoting()}
      </div>

      {/* User Vote Display */}
      {userVote && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Your vote:</span> {
              votingType === 'star' 
                ? `${userVote.value} star${userVote.value !== 1 ? 's' : ''}`
                : votingType === 'preference'
                ? optionConfig[userVote.value]?.label || userVote.value
                : userVote.value === 'up' ? 'Upvote' : 'Downvote'
            }
          </p>
        </div>
      )}

      {/* Authentication Prompt */}
      {!isAuthenticated && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            Sign in to vote and share your opinion
          </p>
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </div>
      )}

      {/* Loading State */}
      {submitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </Card>
  );
};

export default DishVoting;
