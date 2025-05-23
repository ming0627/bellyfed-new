import React, { memo, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Star, TrendingUp, Clock } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * ActivityFeed component displays recent user activities and social interactions
 *
 * @param {Object} props - Component props
 * @param {string} props.countryName - Name of the current country
 * @returns {JSX.Element} - Rendered component
 */
const ActivityFeed = memo(function ActivityFeed({ countryName }) {
  const [activities, setActivities] = useState([]);

  // Mock activity data - in a real app, this would come from an API
  const mockActivities = [
    {
      id: '1',
      type: 'review',
      user: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=40&h=40&fit=crop',
        badge: '🏆'
      },
      action: 'reviewed',
      target: 'Nasi Lemak House',
      rating: 5,
      content: 'Amazing authentic flavors! The sambal was perfect.',
      timestamp: '2 minutes ago',
      likes: 12,
      comments: 3,
      trending: true
    },
    {
      id: '2',
      type: 'achievement',
      user: {
        name: 'Mike Wong',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=40&h=40&fit=crop',
        badge: '🍜'
      },
      action: 'earned',
      target: 'Ramen Master Badge',
      content: 'Completed 50 ramen reviews across the city!',
      timestamp: '5 minutes ago',
      likes: 28,
      comments: 7,
      trending: false
    },
    {
      id: '3',
      type: 'discovery',
      user: {
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=40&h=40&fit=crop',
        badge: '🍰'
      },
      action: 'discovered',
      target: 'Hidden Gem Café',
      content: 'Found this amazing dessert spot in Chinatown!',
      timestamp: '12 minutes ago',
      likes: 15,
      comments: 5,
      trending: true
    },
    {
      id: '4',
      type: 'ranking',
      user: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=40&h=40&fit=crop',
        badge: '🍕'
      },
      action: 'ranked',
      target: 'Margherita Pizza',
      content: '#1 in Italian cuisine category',
      timestamp: '18 minutes ago',
      likes: 22,
      comments: 8,
      trending: true
    },
    {
      id: '5',
      type: 'follow',
      user: {
        name: 'Lisa Thompson',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=40&h=40&fit=crop',
        badge: '🥗'
      },
      action: 'started following',
      target: 'Top Vegan Spots',
      content: 'Now following the best plant-based restaurants',
      timestamp: '25 minutes ago',
      likes: 8,
      comments: 2,
      trending: false
    }
  ];

  useEffect(() => {
    setActivities(mockActivities);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'review':
        return Star;
      case 'achievement':
        return TrendingUp;
      case 'discovery':
        return Heart;
      case 'ranking':
        return TrendingUp;
      case 'follow':
        return Heart;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'review':
        return 'text-yellow-500 bg-yellow-50';
      case 'achievement':
        return 'text-purple-500 bg-purple-50';
      case 'discovery':
        return 'text-pink-500 bg-pink-50';
      case 'ranking':
        return 'text-orange-500 bg-orange-50';
      case 'follow':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-primary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <LucideClientIcon
                icon={TrendingUp}
                className="w-5 h-5 text-white"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Live Activity</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* User Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 text-xs">
                  {activity.user.badge}
                </div>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{activity.user.name}</span>
                  <span className="text-gray-500">{activity.action}</span>
                  <span className="font-medium text-gray-900">{activity.target}</span>
                  {activity.trending && (
                    <div className="flex items-center space-x-1 text-orange-500">
                      <LucideClientIcon icon={TrendingUp} className="w-3 h-3" />
                      <span className="text-xs font-medium">Trending</span>
                    </div>
                  )}
                </div>

                {activity.rating && (
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <LucideClientIcon
                        key={i}
                        icon={Star}
                        className={`w-4 h-4 ${
                          i < activity.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="text-gray-700 text-sm mb-3">{activity.content}</p>

                {/* Activity Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                      <LucideClientIcon icon={Heart} className="w-4 h-4" />
                      <span className="text-sm">{activity.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <LucideClientIcon icon={MessageCircle} className="w-4 h-4" />
                      <span className="text-sm">{activity.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                      <LucideClientIcon icon={Share2} className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              </div>

              {/* Activity Type Icon */}
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                <LucideClientIcon
                  icon={getActivityIcon(activity.type)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-6 text-center">
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-xl hover:bg-gradient-primary-hover transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span>View All Activity</span>
            <LucideClientIcon icon={TrendingUp} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ActivityFeed;
