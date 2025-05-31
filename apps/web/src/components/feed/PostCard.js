/**
 * Post Card Component
 * 
 * Displays individual social media posts with rich content,
 * interactions, and user information.
 * 
 * Features:
 * - Rich post content display
 * - Image and video support
 * - User interactions (like, comment, share)
 * - User profile information
 * - Time stamps and location
 * - Hashtag and mention support
 */

import React, { useState, useCallback } from 'react';
import { Card } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import PostInteractions from '../social/PostInteractions.js';
import { 
  MapPin, 
  MoreHorizontal, 
  Star, 
  Verified,
  Clock
} from 'lucide-react';

const PostCard = ({
  post,
  onUserClick,
  onPostClick,
  onLikeChange,
  onCommentClick,
  onShareClick,
  showInteractions = true,
  className = ''
}) => {
  // State
  const [imageError, setImageError] = useState({});

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user } = useAuth();

  // Handle user click
  const handleUserClick = useCallback((e) => {
    e.stopPropagation();
    
    trackUserEngagement('social', 'post', 'user_click', {
      postId: post.id,
      targetUserId: post.userId,
      viewerId: user?.id
    });

    if (onUserClick) {
      onUserClick(post.userId, post.user);
    }
  }, [post.id, post.userId, post.user, trackUserEngagement, user?.id, onUserClick]);

  // Handle post click
  const handlePostClick = useCallback(() => {
    trackUserEngagement('social', 'post', 'click', {
      postId: post.id,
      userId: user?.id
    });

    if (onPostClick) {
      onPostClick(post);
    }
  }, [post, trackUserEngagement, user?.id, onPostClick]);

  // Handle image error
  const handleImageError = useCallback((imageIndex) => {
    setImageError(prev => ({ ...prev, [imageIndex]: true }));
  }, []);

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const postTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  // Render hashtags and mentions
  const renderContent = (content) => {
    if (!content) return null;

    const parts = content.split(/(\s+)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-600 hover:text-blue-700 cursor-pointer">
            {part}
          </span>
        );
      } else if (part.startsWith('@')) {
        return (
          <span key={index} className="text-purple-600 hover:text-purple-700 cursor-pointer">
            {part}
          </span>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  // Render post images
  const renderImages = () => {
    if (!post.photos || post.photos.length === 0) return null;

    const imageCount = post.photos.length;
    
    if (imageCount === 1) {
      return (
        <div className="mt-3">
          <img
            src={post.photos[0].url || `/api/s3/${post.photos[0].bucket}/${post.photos[0].key}`}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-lg"
            onError={() => handleImageError(0)}
            style={{ display: imageError[0] ? 'none' : 'block' }}
          />
        </div>
      );
    }

    return (
      <div className="mt-3">
        <div className={`grid gap-2 ${imageCount === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {post.photos.slice(0, 4).map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo.url || `/api/s3/${photo.bucket}/${photo.key}`}
                alt={`Post image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
                onError={() => handleImageError(index)}
                style={{ display: imageError[index] ? 'none' : 'block' }}
              />
              {index === 3 && imageCount > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{imageCount - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render restaurant/location info
  const renderLocationInfo = () => {
    if (!post.restaurant && !post.location) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        {post.restaurant && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-200 rounded flex items-center justify-center">
              <span className="text-orange-700 text-sm font-semibold">
                {post.restaurant.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{post.restaurant.name}</h4>
              {post.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={`${
                        i < post.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">{post.rating}/5</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {post.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{post.location}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Post Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <button
              onClick={handleUserClick}
              className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center hover:bg-orange-300 transition-colors"
            >
              {post.user?.avatar ? (
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-orange-700 font-semibold">
                  {post.user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </button>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUserClick}
                  className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                >
                  {post.user?.name || 'Unknown User'}
                </button>
                {post.user?.isVerified && (
                  <Verified size={16} className="text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={12} />
                <span>{getTimeAgo(post.createdAt)}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <MapPin size={12} />
                    <span>{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* More Options */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 pt-3 cursor-pointer" onClick={handlePostClick}>
        {/* Text Content */}
        {post.content && (
          <div className="text-gray-900 mb-2 whitespace-pre-wrap">
            {renderContent(post.content)}
          </div>
        )}

        {/* Images */}
        {renderImages()}

        {/* Location/Restaurant Info */}
        {renderLocationInfo()}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.hashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm"
              >
                #{hashtag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Interactions */}
      {showInteractions && (
        <div className="px-4 pb-4">
          <PostInteractions
            postId={post.id}
            initialLikes={post.likeCount}
            initialComments={post.commentCount}
            initialShares={post.shareCount}
            isLiked={post.isLiked}
            onLikeChange={onLikeChange}
            onCommentClick={onCommentClick}
            onShareClick={onShareClick}
          />
        </div>
      )}
    </Card>
  );
};

export default PostCard;
