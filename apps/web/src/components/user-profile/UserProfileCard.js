/**
 * User Profile Card Component
 * 
 * Displays user profile information in a card format.
 * Shows avatar, stats, achievements, and social information.
 * 
 * Features:
 * - User avatar and basic info
 * - Activity statistics
 * - Achievement badges
 * - Social connections
 * - Follow/unfollow functionality
 * - Profile customization options
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const UserProfileCard = ({
  userId,
  showStats = true,
  showAchievements = true,
  showFollowButton = true,
  showSocialLinks = true,
  compact = false,
  className = ''
}) => {
  // State
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { country } = useCountry();

  // Fetch user profile data
  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getUserProfile({
        userId,
        currentUserId: currentUser?.id,
        includeStats: showStats,
        includeAchievements: showAchievements
      });

      setProfileData(data);
      setFollowing(data.isFollowing || false);
      
      // Track profile view
      trackUserEngagement('user_profile', userId, 'view', {
        viewerUserId: currentUser?.id,
        compact
      });
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to follow users');
      return;
    }

    if (currentUser?.id === userId) {
      return; // Can't follow yourself
    }

    setFollowLoading(true);

    try {
      const result = await analyticsService.toggleUserFollow({
        userId,
        followerId: currentUser.id,
        action: following ? 'unfollow' : 'follow'
      });

      setFollowing(result.isFollowing);
      
      // Update follower count in profile data
      if (profileData) {
        setProfileData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + (result.isFollowing ? 1 : -1)
          }
        }));
      }

      // Track follow action
      trackUserEngagement('user_profile', userId, following ? 'unfollow' : 'follow', {
        followerId: currentUser.id
      });
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toString() || '0';
  };

  // Get achievement color
  const getAchievementColor = (level) => {
    switch (level) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  // Load profile data on mount
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

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
          <p className="font-semibold mb-2">Error Loading Profile</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchProfileData} 
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

  if (!profileData) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="font-medium">User not found</p>
        </div>
      </Card>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={profileData.avatar}
          alt={profileData.name}
          fallback={profileData.name?.charAt(0) || 'U'}
          size={compact ? 'md' : 'lg'}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/${country}/users/${userId}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600 cursor-pointer">
                  {profileData.name}
                </h3>
              </Link>
              {profileData.username && (
                <p className="text-sm text-gray-600">@{profileData.username}</p>
              )}
              {profileData.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <span>📍</span>
                  <span>{profileData.location}</span>
                </p>
              )}
            </div>
            
            {showFollowButton && !isOwnProfile && isAuthenticated && (
              <Button
                onClick={handleFollowToggle}
                disabled={followLoading}
                variant={following ? 'outline' : 'default'}
                size="sm"
              >
                {followLoading ? '...' : following ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
          
          {profileData.bio && !compact && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {profileData.bio}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && profileData.stats && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatNumber(profileData.stats.reviews)}
            </div>
            <div className="text-xs text-gray-600">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatNumber(profileData.stats.followers)}
            </div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatNumber(profileData.stats.following)}
            </div>
            <div className="text-xs text-gray-600">Following</div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {showAchievements && profileData.achievements && profileData.achievements.length > 0 && !compact && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">🏆 Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {profileData.achievements.slice(0, 6).map((achievement, index) => (
              <Badge
                key={index}
                className={`text-xs ${getAchievementColor(achievement.level)}`}
                title={achievement.description}
              >
                {achievement.icon} {achievement.name}
              </Badge>
            ))}
            {profileData.achievements.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{profileData.achievements.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {profileData.recentActivity && !compact && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">📱 Recent Activity</h4>
          <div className="space-y-2">
            {profileData.recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{activity.icon}</span>
                <span className="text-gray-700 flex-1">{activity.description}</span>
                <span className="text-xs text-gray-500">{activity.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {showSocialLinks && profileData.socialLinks && Object.keys(profileData.socialLinks).length > 0 && !compact && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">🔗 Social Links</h4>
          <div className="flex gap-2">
            {Object.entries(profileData.socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors"
                title={platform}
              >
                {platform === 'instagram' && '📷'}
                {platform === 'twitter' && '🐦'}
                {platform === 'facebook' && '📘'}
                {platform === 'website' && '🌐'}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link href={`/${country}/users/${userId}`}>
          <Button variant="outline" size="sm" className="flex-1">
            View Profile
          </Button>
        </Link>
        
        {!isOwnProfile && isAuthenticated && (
          <Button variant="outline" size="sm">
            Message
          </Button>
        )}
        
        {isOwnProfile && (
          <Link href={`/${country}/profile/edit`}>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Join Date */}
      {profileData.joinDate && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Joined {new Date(profileData.joinDate).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </div>
      )}
    </Card>
  );
};

export default UserProfileCard;
