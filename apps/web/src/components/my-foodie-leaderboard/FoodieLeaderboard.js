/**
 * Foodie Leaderboard Component
 * 
 * Displays rankings of top food enthusiasts based on various metrics
 * like reviews, discoveries, expertise, and community engagement.
 * 
 * Features:
 * - Multiple leaderboard categories
 * - User ranking and position tracking
 * - Achievement badges and levels
 * - Time period filtering
 * - Social features and following
 */

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const FoodieLeaderboard = ({
  category = 'overall',
  period = 'all_time',
  limit = 50,
  showUserPosition = true,
  showAchievements = true,
  showFollowButtons = true,
  className = ''
}) => {
  // State
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user } = useAuth();

  // Leaderboard categories
  const categories = [
    { id: 'overall', label: 'Overall Score', icon: '🏆', description: 'Combined ranking across all activities' },
    { id: 'reviews', label: 'Top Reviewers', icon: '⭐', description: 'Most helpful and detailed reviews' },
    { id: 'discoveries', label: 'Discoverers', icon: '🔍', description: 'First to find new restaurants and dishes' },
    { id: 'expertise', label: 'Experts', icon: '👨‍🍳', description: 'Deep knowledge in specific cuisines' },
    { id: 'influence', label: 'Influencers', icon: '📢', description: 'Most followed and engaged users' },
    { id: 'consistency', label: 'Consistent', icon: '📅', description: 'Regular and reliable contributors' }
  ];

  // Time periods
  const periods = [
    { id: 'all_time', label: 'All Time' },
    { id: 'this_year', label: 'This Year' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_week', label: 'This Week' }
  ];

  // Achievement levels
  const achievementLevels = [
    { min: 0, max: 99, level: 'Novice', color: 'bg-gray-500', icon: '🥉' },
    { min: 100, max: 499, level: 'Enthusiast', color: 'bg-blue-500', icon: '🥈' },
    { min: 500, max: 999, level: 'Expert', color: 'bg-purple-500', icon: '🥇' },
    { min: 1000, max: 2499, level: 'Master', color: 'bg-orange-500', icon: '👑' },
    { min: 2500, max: Infinity, level: 'Legend', color: 'bg-red-500', icon: '🌟' }
  ];

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getFoodieLeaderboard({
        category,
        period,
        limit,
        country,
        userId: user?.id,
        includeUserPosition: showUserPosition,
        includeAchievements: showAchievements
      });

      setLeaderboard(data.leaderboard || []);
      setUserPosition(data.userPosition || null);
      
      // Track leaderboard view
      trackUserEngagement('leaderboard', 'foodie', 'view', {
        category,
        period,
        userPosition: data.userPosition?.rank,
        totalUsers: data.totalUsers
      });
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow user
  const handleFollowUser = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await analyticsService.unfollowUser(userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await analyticsService.followUser(userId);
        setFollowingUsers(prev => new Set([...prev, userId]));
      }

      trackUserEngagement('user', userId, isFollowing ? 'unfollow' : 'follow', {
        source: 'leaderboard',
        category
      });
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
    }
  };

  // Handle user profile click
  const handleUserClick = (userData) => {
    trackUserEngagement('user', userData.id, 'profile_click', {
      source: 'leaderboard',
      rank: userData.rank,
      category
    });
  };

  // Get achievement level for score
  const getAchievementLevel = (score) => {
    return achievementLevels.find(level => score >= level.min && score <= level.max) || achievementLevels[0];
  };

  // Get rank suffix
  const getRankSuffix = (rank) => {
    if (rank % 100 >= 11 && rank % 100 <= 13) return 'th';
    switch (rank % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchLeaderboard();
  }, [category, period, country]);

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
          <p className="text-lg font-semibold mb-2">Error Loading Leaderboard</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchLeaderboard} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const currentCategory = categories.find(c => c.id === category);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Foodie Leaderboard
        </h2>
        <p className="text-gray-600">
          {currentCategory?.description || 'Top food enthusiasts in the community'}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${category === cat.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              {periods.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${period === p.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* User Position */}
      {showUserPosition && userPosition && user && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                alt={user.name}
                fallback={user.name?.charAt(0) || 'U'}
                size="md"
              />
              <div>
                <p className="font-medium text-gray-900">Your Position</p>
                <p className="text-sm text-gray-600">
                  {userPosition.rank}{getRankSuffix(userPosition.rank)} place with {userPosition.score} points
                </p>
              </div>
            </div>
            
            {showAchievements && (
              <div className="text-right">
                {(() => {
                  const level = getAchievementLevel(userPosition.score);
                  return (
                    <Badge className={`${level.color} text-white`}>
                      {level.icon} {level.level}
                    </Badge>
                  );
                })()}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((userData, index) => {
            const isCurrentUser = user && userData.id === user.id;
            const isFollowing = followingUsers.has(userData.id);
            const level = showAchievements ? getAchievementLevel(userData.score) : null;

            return (
              <Card 
                key={userData.id} 
                className={`p-4 ${isCurrentUser ? 'bg-orange-50 border-orange-200' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="text-center min-w-[60px]">
                      <div className={`
                        text-2xl font-bold
                        ${userData.rank <= 3 ? 'text-orange-600' : 'text-gray-600'}
                      `}>
                        #{userData.rank}
                      </div>
                      {userData.rank <= 3 && (
                        <div className="text-lg">
                          {userData.rank === 1 ? '🥇' : userData.rank === 2 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <Link href={`/${country}/users/${userData.id}`}>
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => handleUserClick(userData)}
                      >
                        <Avatar
                          src={userData.avatar}
                          alt={userData.name}
                          fallback={userData.name?.charAt(0) || 'U'}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {userData.name}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {userData.score} points • {userData.reviewCount || 0} reviews
                          </p>
                          {userData.specialties && userData.specialties.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {userData.specialties.slice(0, 2).map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Actions and Achievements */}
                  <div className="flex items-center gap-3">
                    {/* Achievement Level */}
                    {showAchievements && level && (
                      <Badge className={`${level.color} text-white`}>
                        {level.icon} {level.level}
                      </Badge>
                    )}

                    {/* Follow Button */}
                    {showFollowButtons && user && !isCurrentUser && (
                      <Button
                        onClick={() => handleFollowUser(userData.id, isFollowing)}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Leaderboard Data</p>
            <p className="text-sm">
              No users found for the selected category and time period.
            </p>
          </div>
        </Card>
      )}

      {/* Load More */}
      {leaderboard.length >= limit && (
        <div className="text-center">
          <Button
            onClick={() => {
              // Implement load more functionality
              trackUserEngagement('leaderboard', 'foodie', 'load_more', {
                category,
                period,
                currentCount: leaderboard.length
              });
            }}
            variant="outline"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default FoodieLeaderboard;
