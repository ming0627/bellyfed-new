/**
 * Post Interactions Component
 * 
 * Handles like, comment, and share interactions for social posts.
 * Provides real-time updates and optimistic UI for better UX.
 * 
 * Features:
 * - Like/unlike functionality
 * - Comment display and creation
 * - Share options
 * - Real-time interaction counts
 * - Optimistic UI updates
 * - Analytics tracking
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { socialMediaService } from '@bellyfed/services';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const PostInteractions = ({
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  isLiked = false,
  showComments = true,
  showShare = true,
  onLikeChange,
  onCommentClick,
  onShareClick,
  className = ''
}) => {
  // State
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [shares, setShares] = useState(initialShares);
  const [liked, setLiked] = useState(isLiked);
  const [loading, setLoading] = useState({
    like: false,
    comment: false,
    share: false
  });

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Handle like toggle
  const handleLikeToggle = useCallback(async () => {
    if (!isAuthenticated || loading.like) return;

    // Optimistic update
    const wasLiked = liked;
    const previousLikes = likes;
    
    setLiked(!wasLiked);
    setLikes(prev => wasLiked ? prev - 1 : prev + 1);
    setLoading(prev => ({ ...prev, like: true }));

    try {
      const success = wasLiked 
        ? await socialMediaService.unlikePost(postId)
        : await socialMediaService.likePost(postId);

      if (!success) {
        throw new Error('Failed to update like status');
      }

      // Track interaction
      trackUserEngagement('social', 'post', wasLiked ? 'unlike' : 'like', {
        postId,
        userId: user?.id
      });

      // Notify parent
      if (onLikeChange) {
        onLikeChange(!wasLiked, wasLiked ? likes - 1 : likes + 1);
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update
      setLiked(wasLiked);
      setLikes(previousLikes);

      // Track error
      trackUserEngagement('social', 'post', 'like_error', {
        postId,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, like: false }));
    }
  }, [isAuthenticated, loading.like, liked, likes, postId, trackUserEngagement, user?.id, onLikeChange]);

  // Handle comment click
  const handleCommentClick = useCallback(() => {
    if (!isAuthenticated) {
      // Prompt to sign in
      alert('Please sign in to comment');
      return;
    }

    trackUserEngagement('social', 'post', 'comment_click', {
      postId,
      userId: user?.id
    });

    if (onCommentClick) {
      onCommentClick(postId);
    }
  }, [isAuthenticated, postId, trackUserEngagement, user?.id, onCommentClick]);

  // Handle share click
  const handleShareClick = useCallback(() => {
    trackUserEngagement('social', 'post', 'share_click', {
      postId,
      userId: user?.id
    });

    if (onShareClick) {
      onShareClick(postId);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: 'Check out this post on Bellyfed',
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        alert('Link copied to clipboard!');
      }
    }
  }, [postId, trackUserEngagement, user?.id, onShareClick]);

  // Format count for display
  const formatCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      {/* Left side - Like, Comment, Share */}
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          disabled={loading.like}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
            ${liked 
              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }
            ${loading.like ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Heart 
            size={20} 
            className={`transition-all duration-200 ${liked ? 'fill-current' : ''}`}
          />
          <span className="text-sm font-medium">
            {likes > 0 ? formatCount(likes) : 'Like'}
          </span>
        </button>

        {/* Comment Button */}
        {showComments && (
          <button
            onClick={handleCommentClick}
            disabled={loading.comment}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">
              {comments > 0 ? formatCount(comments) : 'Comment'}
            </span>
          </button>
        )}

        {/* Share Button */}
        {showShare && (
          <button
            onClick={handleShareClick}
            disabled={loading.share}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 cursor-pointer"
          >
            <Share2 size={20} />
            <span className="text-sm font-medium">
              {shares > 0 ? formatCount(shares) : 'Share'}
            </span>
          </button>
        )}
      </div>

      {/* Right side - More options */}
      <button className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
};

export default PostInteractions;
