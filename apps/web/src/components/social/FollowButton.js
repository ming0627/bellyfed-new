/**
 * Follow Button Component
 * 
 * Provides follow/unfollow functionality for users with real-time updates
 * and optimistic UI updates for better user experience.
 * 
 * Features:
 * - Follow/unfollow toggle functionality
 * - Optimistic UI updates
 * - Loading states and error handling
 * - Follower count display
 * - Authentication checks
 * - Analytics tracking
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const FollowButton = ({
  targetUserId,
  targetUserName = 'User',
  initialFollowing = false,
  initialFollowerCount = 0,
  showFollowerCount = true,
  size = 'md',
  variant = 'default',
  disabled = false,
  onFollowChange,
  className = ''
}) => {
  // State
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Check if user can follow (not themselves)
  const canFollow = isAuthenticated && user?.id !== targetUserId;

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!canFollow || loading || disabled) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    const previousCount = followerCount;
    
    setIsFollowing(!wasFollowing);
    setFollowerCount(prev => wasFollowing ? prev - 1 : prev + 1);
    setLoading(true);
    setError(null);

    try {
      const result = await analyticsService.toggleUserFollow({
        userId: targetUserId,
        followerId: user.id,
        action: wasFollowing ? 'unfollow' : 'follow'
      });

      // Update with server response
      setIsFollowing(result.isFollowing);
      setFollowerCount(result.followerCount || followerCount);

      // Track follow action
      trackUserEngagement('social', 'follow', result.isFollowing ? 'follow' : 'unfollow', {
        targetUserId,
        targetUserName,
        followerId: user.id
      });

      // Notify parent component
      if (onFollowChange) {
        onFollowChange(result.isFollowing, result.followerCount);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      
      // Revert optimistic update
      setIsFollowing(wasFollowing);
      setFollowerCount(previousCount);
      setError(err.message || 'Failed to update follow status');

      // Track error
      trackUserEngagement('social', 'follow', 'error', {
        targetUserId,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sign in prompt
  const handleSignInPrompt = () => {
    trackUserEngagement('social', 'follow', 'sign_in_prompt', {
      targetUserId,
      targetUserName
    });
    
    // In a real app, this would redirect to sign in
    alert('Please sign in to follow users');
  };

  // Get button text
  const getButtonText = () => {
    if (loading) return 'Loading...';
    if (isFollowing) return 'Following';
    return 'Follow';
  };

  // Get button variant
  const getButtonVariant = () => {
    if (variant !== 'default') return variant;
    return isFollowing ? 'outline' : 'default';
  };

  // Update state when props change
  useEffect(() => {
    setIsFollowing(initialFollowing);
    setFollowerCount(initialFollowerCount);
  }, [initialFollowing, initialFollowerCount]);

  // Don't render if user is trying to follow themselves
  if (isAuthenticated && user?.id === targetUserId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={canFollow ? handleFollowToggle : handleSignInPrompt}
        disabled={loading || disabled}
        variant={getButtonVariant()}
        size={size}
        className={`
          transition-all duration-200
          ${isFollowing 
            ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-300' 
            : ''
          }
          ${loading ? 'opacity-75 cursor-not-allowed' : ''}
        `}
      >
        <span className="flex items-center gap-1">
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : isFollowing ? (
            <span>✓</span>
          ) : (
            <span>+</span>
          )}
          <span>{getButtonText()}</span>
        </span>
      </Button>

      {showFollowerCount && (
        <span className="text-sm text-gray-600">
          {followerCount.toLocaleString()} follower{followerCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default FollowButton;
