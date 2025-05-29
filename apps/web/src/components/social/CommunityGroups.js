/**
 * Community Groups Component
 * 
 * Displays and manages food community groups where users can
 * join discussions about specific cuisines, restaurants, or food topics.
 * 
 * Features:
 * - Group discovery and browsing
 * - Join/leave group functionality
 * - Group member count and activity
 * - Featured groups
 * - Group search and filtering
 * - Analytics tracking
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button, Card, Input } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { 
  Users, 
  Search, 
  Plus, 
  Star, 
  MapPin, 
  MessageCircle,
  TrendingUp,
  Crown,
  Lock,
  Globe
} from 'lucide-react';

const CommunityGroups = ({
  groups = [],
  userGroups = [],
  onGroupJoin,
  onGroupLeave,
  onGroupClick,
  showSearch = true,
  showCreateButton = true,
  maxVisible = 6,
  className = ''
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState({});

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Group categories
  const categories = [
    { value: 'all', label: 'All Groups' },
    { value: 'cuisine', label: 'Cuisine Types' },
    { value: 'location', label: 'Local Areas' },
    { value: 'dietary', label: 'Dietary Preferences' },
    { value: 'restaurant', label: 'Restaurant Fans' },
    { value: 'cooking', label: 'Cooking & Recipes' }
  ];

  // Filter groups based on search and category
  useEffect(() => {
    let filtered = groups;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by relevance and member count
    filtered.sort((a, b) => {
      // Prioritize groups user hasn't joined
      const aJoined = userGroups.includes(a.id);
      const bJoined = userGroups.includes(b.id);
      
      if (aJoined !== bJoined) {
        return aJoined ? 1 : -1;
      }
      
      // Then by member count
      return b.memberCount - a.memberCount;
    });

    setFilteredGroups(filtered.slice(0, maxVisible));
  }, [groups, userGroups, searchQuery, selectedCategory, maxVisible]);

  // Handle group join
  const handleGroupJoin = useCallback(async (groupId) => {
    if (!isAuthenticated || loading[groupId]) return;

    setLoading(prev => ({ ...prev, [groupId]: true }));

    try {
      if (onGroupJoin) {
        await onGroupJoin(groupId);
      }

      trackUserEngagement('social', 'group', 'join', {
        groupId,
        userId: user?.id
      });

    } catch (error) {
      console.error('Error joining group:', error);
      
      trackUserEngagement('social', 'group', 'join_error', {
        groupId,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, [groupId]: false }));
    }
  }, [isAuthenticated, loading, onGroupJoin, trackUserEngagement, user?.id]);

  // Handle group leave
  const handleGroupLeave = useCallback(async (groupId) => {
    if (!isAuthenticated || loading[groupId]) return;

    setLoading(prev => ({ ...prev, [groupId]: true }));

    try {
      if (onGroupLeave) {
        await onGroupLeave(groupId);
      }

      trackUserEngagement('social', 'group', 'leave', {
        groupId,
        userId: user?.id
      });

    } catch (error) {
      console.error('Error leaving group:', error);
      
      trackUserEngagement('social', 'group', 'leave_error', {
        groupId,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, [groupId]: false }));
    }
  }, [isAuthenticated, loading, onGroupLeave, trackUserEngagement, user?.id]);

  // Handle group click
  const handleGroupClick = useCallback((group) => {
    trackUserEngagement('social', 'group', 'view', {
      groupId: group.id,
      groupName: group.name,
      userId: user?.id
    });

    if (onGroupClick) {
      onGroupClick(group);
    }
  }, [trackUserEngagement, user?.id, onGroupClick]);

  // Get group icon
  const getGroupIcon = (category) => {
    switch (category) {
      case 'cuisine':
        return '🍜';
      case 'location':
        return '📍';
      case 'dietary':
        return '🥗';
      case 'restaurant':
        return '🏪';
      case 'cooking':
        return '👨‍🍳';
      default:
        return '🍽️';
    }
  };

  // Format member count
  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Community Groups
          </h2>
        </div>
        
        {showCreateButton && isAuthenticated && (
          <Button size="sm" className="flex items-center gap-1">
            <Plus size={16} />
            Create Group
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`
                  px-3 py-1 rounded-full text-sm transition-colors
                  ${selectedCategory === category.value
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => {
            const isJoined = userGroups.includes(group.id);
            const isLoading = loading[group.id];

            return (
              <Card
                key={group.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleGroupClick(group)}
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                      {group.icon || getGroupIcon(group.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        {group.isPrivate ? (
                          <Lock size={12} />
                        ) : (
                          <Globe size={12} />
                        )}
                        <span>{group.isPrivate ? 'Private' : 'Public'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {group.isFeatured && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                      <Star size={12} />
                      Featured
                    </div>
                  )}
                </div>

                {/* Group Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>

                {/* Group Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{formatMemberCount(group.memberCount)} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{group.postCount || 0} posts</span>
                    </div>
                  </div>
                  
                  {group.isActive && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp size={14} />
                      <span>Active</span>
                    </div>
                  )}
                </div>

                {/* Group Tags */}
                {group.tags && group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{group.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Join/Leave Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    isJoined ? handleGroupLeave(group.id) : handleGroupJoin(group.id);
                  }}
                  disabled={isLoading || !isAuthenticated}
                  variant={isJoined ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? (
                    'Loading...'
                  ) : isJoined ? (
                    'Leave Group'
                  ) : (
                    'Join Group'
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No groups found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? `No groups match "${searchQuery}"`
              : 'No groups available in this category'
            }
          </p>
          {showCreateButton && isAuthenticated && (
            <Button variant="outline">
              Create the first group
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default CommunityGroups;
