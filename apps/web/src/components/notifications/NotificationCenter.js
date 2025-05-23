/**
 * Notification Center Component
 * 
 * Displays and manages user notifications with real-time updates.
 * Supports different notification types and interactive actions.
 * 
 * Features:
 * - Real-time notification updates
 * - Multiple notification types (info, success, warning, error)
 * - Mark as read/unread functionality
 * - Notification filtering and sorting
 * - Bulk actions (mark all as read, clear all)
 * - Push notification integration
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const NotificationCenter = ({
  showUnreadOnly = false,
  maxNotifications = 50,
  enableRealTime = true,
  showMarkAllRead = true,
  showFilters = true,
  className = ''
}) => {
  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Notification types configuration
  const notificationTypes = {
    follow: {
      icon: '👥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'New Follower'
    },
    like: {
      icon: '❤️',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Like'
    },
    comment: {
      icon: '💬',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Comment'
    },
    review: {
      icon: '⭐',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Review'
    },
    restaurant: {
      icon: '🏪',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Restaurant'
    },
    system: {
      icon: '🔔',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'System'
    }
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: 'Unread' },
    { id: 'follow', label: 'Followers' },
    { id: 'like', label: 'Likes' },
    { id: 'comment', label: 'Comments' },
    { id: 'review', label: 'Reviews' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'system', label: 'System' }
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getUserNotifications({
        userId: user.id,
        filter: showUnreadOnly ? 'unread' : filter,
        limit: maxNotifications
      });

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      
      // Track notification center view
      trackUserEngagement('notifications', 'center', 'view', {
        filter,
        notificationCount: data.notifications?.length || 0,
        unreadCount: data.unreadCount || 0
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await analyticsService.markNotificationAsRead({
        notificationId,
        userId: user.id
      });

      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      ));

      setUnreadCount(prev => Math.max(0, prev - 1));

      // Track mark as read
      trackUserEngagement('notifications', notificationId, 'mark_read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await analyticsService.markAllNotificationsAsRead({
        userId: user.id
      });

      // Update local state
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true
      })));

      setUnreadCount(0);

      // Track mark all as read
      trackUserEngagement('notifications', 'center', 'mark_all_read', {
        notificationCount: notifications.length
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Track notification click
    trackUserEngagement('notifications', notification.id, 'click', {
      type: notification.type,
      isRead: notification.isRead
    });

    // Navigate to related content if applicable
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  // Load notifications on mount and when filter changes
  useEffect(() => {
    fetchNotifications();
  }, [filter, isAuthenticated]);

  // Real-time updates (mock implementation)
  useEffect(() => {
    if (!enableRealTime || !isAuthenticated) return;

    const interval = setInterval(() => {
      // In a real app, this would use WebSocket or Server-Sent Events
      fetchNotifications();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [enableRealTime, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">Sign In Required</p>
          <p className="text-sm mb-4">
            Please sign in to view your notifications
          </p>
          <Button variant="outline">
            Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              🔔 Notifications
            </h2>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {showMarkAllRead && unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${filter === option.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p className="font-semibold mb-2">Error Loading Notifications</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={fetchNotifications} 
              className="mt-3"
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map((notification) => {
              const typeConfig = notificationTypes[notification.type] || notificationTypes.system;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 border-b border-gray-100 cursor-pointer transition-colors
                    ${!notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg
                      ${typeConfig.bgColor}
                    `}>
                      {typeConfig.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-normal'} text-gray-900`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actor Info */}
                      {notification.actor && (
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar
                            src={notification.actor.avatar}
                            alt={notification.actor.name}
                            fallback={notification.actor.name?.charAt(0) || 'U'}
                            size="xs"
                          />
                          <span className="text-xs text-gray-600">
                            {notification.actor.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-lg font-medium mb-2">No Notifications</p>
            <p className="text-sm">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <Button variant="outline" size="sm">
            View All Notifications
          </Button>
        </div>
      )}
    </Card>
  );
};

export default NotificationCenter;
