/**
 * User Stories Component
 * 
 * Instagram-style stories feature for sharing temporary content.
 * Stories disappear after 24 hours and support images, videos, and text.
 * 
 * Features:
 * - Story creation and viewing
 * - 24-hour expiration
 * - Image and video support
 * - Story rings for unviewed content
 * - Story viewer modal
 * - Analytics tracking
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Plus, Play, Eye } from 'lucide-react';

const UserStories = ({
  stories = [],
  onStoryClick,
  onCreateStory,
  showCreateButton = true,
  maxVisible = 8,
  className = ''
}) => {
  // State
  const [visibleStories, setVisibleStories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Process stories on mount and when stories change
  useEffect(() => {
    const processedStories = stories
      .filter(story => {
        // Filter out expired stories (older than 24 hours)
        const storyAge = Date.now() - new Date(story.createdAt).getTime();
        return storyAge < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      })
      .sort((a, b) => {
        // Sort by: user's own stories first, then by creation time (newest first)
        if (a.userId === user?.id && b.userId !== user?.id) return -1;
        if (a.userId !== user?.id && b.userId === user?.id) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, maxVisible);

    setVisibleStories(processedStories);
  }, [stories, user?.id, maxVisible]);

  // Handle story click
  const handleStoryClick = useCallback((story) => {
    trackUserEngagement('social', 'story', 'view', {
      storyId: story.id,
      authorId: story.userId,
      viewerId: user?.id
    });

    if (onStoryClick) {
      onStoryClick(story);
    }
  }, [trackUserEngagement, user?.id, onStoryClick]);

  // Handle create story
  const handleCreateStory = useCallback(() => {
    if (!isAuthenticated) {
      alert('Please sign in to create stories');
      return;
    }

    trackUserEngagement('social', 'story', 'create_click', {
      userId: user?.id
    });

    if (onCreateStory) {
      onCreateStory();
    }
  }, [isAuthenticated, trackUserEngagement, user?.id, onCreateStory]);

  // Get story ring color based on view status
  const getStoryRingColor = (story) => {
    if (story.userId === user?.id) {
      return 'ring-blue-500'; // User's own story
    } else if (story.isViewed) {
      return 'ring-gray-300'; // Viewed story
    } else {
      return 'ring-gradient-to-r from-purple-500 to-pink-500'; // Unviewed story
    }
  };

  // Get time since story was created
  const getTimeAgo = (createdAt) => {
    const now = Date.now();
    const storyTime = new Date(createdAt).getTime();
    const diffInHours = Math.floor((now - storyTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - storyTime) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else {
      return `${diffInHours}h`;
    }
  };

  if (visibleStories.length === 0 && !showCreateButton) {
    return null;
  }

  return (
    <div className={`flex gap-4 overflow-x-auto pb-2 ${className}`}>
      {/* Create Story Button */}
      {showCreateButton && isAuthenticated && (
        <div className="flex-shrink-0">
          <button
            onClick={handleCreateStory}
            className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-semibold text-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-600 max-w-16 truncate">
              Your Story
            </span>
          </button>
        </div>
      )}

      {/* Stories */}
      {visibleStories.map((story) => (
        <div key={story.id} className="flex-shrink-0">
          <button
            onClick={() => handleStoryClick(story)}
            className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="relative">
              {/* Story Ring */}
              <div className={`w-16 h-16 rounded-full p-0.5 ${getStoryRingColor(story)}`}>
                <div className="w-full h-full bg-white rounded-full p-0.5">
                  {/* Story Preview */}
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                    {story.preview ? (
                      <img
                        src={story.preview}
                        alt={`${story.userName}'s story`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-lg">
                          {story.userName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Story Type Indicator */}
              {story.type === 'video' && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Play size={10} className="text-white fill-current" />
                </div>
              )}

              {/* View Count (for user's own stories) */}
              {story.userId === user?.id && story.viewCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {story.viewCount > 9 ? '9+' : story.viewCount}
                  </span>
                </div>
              )}
            </div>

            {/* User Name and Time */}
            <div className="text-center">
              <span className="text-xs text-gray-800 max-w-16 truncate block">
                {story.userId === user?.id ? 'You' : story.userName}
              </span>
              <span className="text-xs text-gray-500">
                {getTimeAgo(story.createdAt)}
              </span>
            </div>
          </button>
        </div>
      ))}

      {/* View All Stories Button */}
      {stories.length > maxVisible && (
        <div className="flex-shrink-0">
          <button className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Eye size={24} className="text-gray-600" />
            </div>
            <span className="text-xs text-gray-600">
              View All
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserStories;
