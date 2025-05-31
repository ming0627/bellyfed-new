/**
 * Social Notifications Component
 * 
 * Displays social activity notifications including likes, comments,
 * follows, and mentions with real-time updates.
 * 
 * Features:
 * - Real-time notification updates
 * - Notification categorization
 * - Mark as read functionality
 * - Notification actions
 * - Time-based grouping
 * - Analytics tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  AtSign, 
  Share2, 
  Star,
  Bell,
  BellOff,
  Check,
  X
} from 'lucide-react';

const SocialNotifications = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  showMarkAllRead = true,
  maxVisible = 10,
  className = ''
}) => {
  // State
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user } = useAuth();

  // Process notifications
  useEffect(() => {
    const processed = notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, maxVisible);
    
    setVisibleNotifications(processed);
  }, [notifications, maxVisible]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    trackUserEngagement('social', 'notification', 'click', {
      notificationId: notification.id,
      type: notification.type,
      userId: user?.id
    });

    // Mark as read if not already
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  }, [trackUserEngagement, user?.id, onMarkAsRead, onNotificationClick]);

  // Handle mark as read
  const handleMarkAsRead = useCallback((notificationId, event) => {
    event.stopPropagation();
    
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }

    trackUserEngagement('social', 'notification', 'mark_read', {
      notificationId,
      userId: user?.id
    });
  }, [onMarkAsRead, trackUserEngagement, user?.id]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }

    trackUserEngagement('social', 'notification', 'mark_all_read', {
      count: visibleNotifications.filter(n => !n.isRead).length,
      userId: user?.id
    });
  }, [onMarkAllAsRead, visibleNotifications, trackUserEngagement, user?.id]);

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'follow':
        return <UserPlus size={16} className="text-green-500" />;
      case 'mention':
        return <AtSign size={16} className="text-purple-500" />;
      case 'share':
        return <Share2 size={16} className="text-orange-500" />;
      case 'review':
        return <Star size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // Get notification message
  const getNotificationMessage = (notification) => {
    const { type, actorName, targetName } = notification;
    
    switch (type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'comment':
        return `${actorName} commented on your post`;
      case 'follow':
        return `${actorName} started following you`;
      case 'mention':
        return `${actorName} mentioned you in a post`;
      case 'share':
        return `${actorName} shared your post`;
      case 'review':
        return `${actorName} reviewed ${targetName}`;
      default:
        return notification.message || 'New notification';
    }
  };

  // Get time ago
  const getTimeAgo = (createdAt) => {
    const now = Date.now();
    const notificationTime = new Date(createdAt).getTime();
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(createdAt).toLocaleDateString();
  };

  // Get unread count
  const unreadCount = visibleNotifications.filter(n => !n.isRead).length;

  if (visibleNotifications.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <BellOff size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No notifications yet
        </h3>
        <p className="text-gray-600">
          When people interact with your posts, you'll see notifications here.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-gray-700" />
          <h3 className="font-semibold text-gray-900">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {showMarkAllRead && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`
              p-4 border-b border-gray-100 cursor-pointer transition-colors
              hover:bg-gray-50
              ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              {/* Actor Avatar */}
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {notification.actorAvatar ? (
                  <img
                    src={notification.actorAvatar}
                    alt={notification.actorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-semibold">
                    {notification.actorName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    {getNotificationIcon(notification.type)}
                    <p className="text-sm text-gray-900">
                      {getNotificationMessage(notification)}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {getTimeAgo(notification.createdAt)}
                </p>

                {/* Preview Content */}
                {notification.preview && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 line-clamp-2">
                    {notification.preview}
                  </div>
                )}
              </div>

              {/* Notification Image */}
              {notification.image && (
                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                  <img
                    src={notification.image}
                    alt="Notification"
                    className="w-full h-full rounded object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {notifications.length > maxVisible && (
        <div className="p-4 border-t border-gray-200 text-center">
          <Button variant="ghost" size="sm">
            View all notifications
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SocialNotifications;
