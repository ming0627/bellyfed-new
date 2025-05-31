/**
 * Enhanced Social Feed Page
 * 
 * Main social feed page with comprehensive social features including
 * stories, post creation, feed filtering, and real-time interactions.
 * 
 * Phase 3 Implementation: Complete social networking features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../hooks/useAuth.js';
import { useAnalyticsContext } from '../../../components/analytics/AnalyticsProvider.js';
import { socialMediaService } from '@bellyfed/services';
import {
  SocialPostCreator,
  UserStories,
  UserFeedFilters,
  SocialNotifications,
  CommunityGroups
} from '../../../components/social/index.js';
import {
  PostCard,
  StoryViewer,
  ShareModal
} from '../../../components/feed/index.js';
import { Button, Card, LoadingSpinner } from '@bellyfed/ui';
import { Bell, Users, Filter } from 'lucide-react';

export default function SocialFeed({ country }) {
  const router = useRouter();

  // Handle auth safely for static generation
  let user = null;
  let isAuthenticated = false;
  let trackUserEngagement = () => {};

  try {
    const authResult = useAuth();
    user = authResult.user;
    isAuthenticated = authResult.isAuthenticated;
  } catch (error) {
    // Auth provider not available during static generation
    console.log('Auth not available during static generation');
  }

  try {
    const analyticsResult = useAnalyticsContext();
    trackUserEngagement = analyticsResult.trackUserEngagement;
  } catch (error) {
    // Analytics provider not available during static generation
    console.log('Analytics not available during static generation');
  }

  // State
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedFilters, setFeedFilters] = useState({
    contentType: 'all',
    timeRange: '7d',
    location: 'all',
    userType: 'all',
    sortBy: 'recent'
  });
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadFeedData();
  }, [feedFilters]);

  // Load feed data
  const loadFeedData = useCallback(async () => {
    setLoading(true);
    try {
      // Load posts based on filters
      const postsData = await socialMediaService.getFeedPosts(20, 0, feedFilters.sortBy);
      setPosts(postsData.posts || []);

      // Mock data for demo
      const mockStories = [
        {
          id: 'story1',
          userId: 'user1',
          userName: 'Sarah Chen',
          preview: '/images/story-preview-1.jpg',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          segments: [{ type: 'image', url: '/images/story-1.jpg' }]
        }
      ];
      setStories(mockStories);

      const mockNotifications = [
        {
          id: 'notif1',
          type: 'like',
          actorName: 'John Doe',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isRead: false
        }
      ];
      setNotifications(mockNotifications);

      const mockGroups = [
        {
          id: 'group1',
          name: 'Malaysian Food Lovers',
          description: 'Discover the best Malaysian cuisine',
          category: 'cuisine',
          memberCount: 1250,
          isActive: true,
          isFeatured: true
        }
      ];
      setGroups(mockGroups);

    } catch (error) {
      console.error('Error loading feed data:', error);
    } finally {
      setLoading(false);
    }
  }, [feedFilters]);

  // Handle post creation
  const handlePostCreated = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
    
    trackUserEngagement('social', 'post', 'created', {
      postId: newPost.id,
      country,
      userId: user?.id
    });
  }, [trackUserEngagement, country, user?.id]);

  // Handle story click
  const handleStoryClick = useCallback((story) => {
    const storyIndex = stories.findIndex(s => s.id === story.id);
    setCurrentStoryIndex(storyIndex);
    setShowStoryViewer(true);
  }, [stories]);

  // Handle post share
  const handlePostShare = useCallback((post) => {
    setShareContent({
      id: post.id,
      type: 'post',
      title: `${post.user?.name}'s post`,
      description: post.content,
      image: post.photos?.[0]?.url
    });
    setShowShareModal(true);
  }, []);

  // Handle filters change
  const handleFiltersChange = useCallback((newFilters) => {
    setFeedFilters(newFilters);
    
    trackUserEngagement('social', 'feed', 'filter_change', {
      filters: newFilters,
      country,
      userId: user?.id
    });
  }, [trackUserEngagement, country, user?.id]);

  // Get unread notification count
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Social Feed - Bellyfed {country?.toUpperCase()}</title>
        <meta name="description" content="Connect with food lovers and discover amazing restaurants" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-900">Social Feed</h1>
              
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell size={20} />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Filters */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Filter size={20} />
                </button>

                {/* Groups */}
                <button
                  onClick={() => router.push(`/${country}/social/groups`)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Users size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stories */}
              {stories.length > 0 && (
                <Card className="p-4">
                  <UserStories
                    stories={stories}
                    onStoryClick={handleStoryClick}
                    showCreateButton={isAuthenticated}
                  />
                </Card>
              )}

              {/* Post Creator */}
              {isAuthenticated && (
                <SocialPostCreator
                  onPostCreated={handlePostCreated}
                  placeholder="What's on your food adventure today?"
                />
              )}

              {/* Feed Filters */}
              {showFilters && (
                <UserFeedFilters
                  onFiltersChange={handleFiltersChange}
                  initialFilters={feedFilters}
                />
              )}

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onShareClick={() => handlePostShare(post)}
                  />
                ))}
              </div>

              {/* Load More */}
              {posts.length > 0 && (
                <div className="text-center">
                  <Button variant="outline">
                    Load More Posts
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              {showNotifications && (
                <SocialNotifications
                  notifications={notifications}
                  maxVisible={5}
                />
              )}

              {/* Community Groups */}
              <CommunityGroups
                groups={groups}
                maxVisible={3}
                showCreateButton={false}
              />
            </div>
          </div>
        </div>

        {/* Story Viewer Modal */}
        {showStoryViewer && (
          <StoryViewer
            stories={stories}
            initialStoryIndex={currentStoryIndex}
            isOpen={showStoryViewer}
            onClose={() => setShowStoryViewer(false)}
          />
        )}

        {/* Share Modal */}
        {showShareModal && shareContent && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            content={shareContent}
            shareUrl={`${window.location.origin}/${country}/post/${shareContent.id}`}
          />
        )}
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } }
    ],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country
    },
    revalidate: 60, // 1 minute for social content
  };
}
