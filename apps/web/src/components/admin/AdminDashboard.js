/**
 * Admin Dashboard Component
 * 
 * Main dashboard for admin users with key metrics, quick actions,
 * and navigation to admin features.
 * 
 * Features:
 * - Key metrics overview
 * - Quick action buttons
 * - Recent activity feed
 * - System status indicators
 * - Navigation shortcuts
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const AdminDashboard = ({
  showMetrics = true,
  showQuickActions = true,
  showRecentActivity = true,
  showSystemStatus = true,
  className = ''
}) => {
  // State
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Quick actions configuration
  const quickActions = [
    {
      id: 'restaurants',
      title: 'Manage Restaurants',
      description: 'Add, edit, or remove restaurants',
      icon: '🏪',
      href: `/${country}/admin/restaurants`,
      color: 'bg-blue-500'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: '👥',
      href: `/${country}/admin/users`,
      color: 'bg-green-500'
    },
    {
      id: 'reviews',
      title: 'Review Moderation',
      description: 'Moderate and manage user reviews',
      icon: '⭐',
      href: `/${country}/admin/reviews`,
      color: 'bg-yellow-500'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: '📊',
      href: `/${country}/admin/analytics`,
      color: 'bg-purple-500'
    },
    {
      id: 'competitions',
      title: 'Competitions',
      description: 'Manage competitions and events',
      icon: '🏆',
      href: `/${country}/admin/competitions`,
      color: 'bg-orange-500'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: '⚙️',
      href: `/${country}/admin/settings`,
      color: 'bg-gray-500'
    }
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch metrics
      if (showMetrics) {
        const metricsData = await analyticsService.getAdminMetrics();
        setMetrics(metricsData);
      }

      // Fetch recent activity
      if (showRecentActivity) {
        const activityData = await analyticsService.getRecentActivity({ limit: 10 });
        setRecentActivity(activityData);
      }

      // Fetch system status
      if (showSystemStatus) {
        const statusData = await analyticsService.getSystemStatus();
        setSystemStatus(statusData);
      }

      trackUserEngagement('admin', 'dashboard', 'view', {
        country,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick action click
  const handleQuickActionClick = (action) => {
    trackUserEngagement('admin', 'dashboard', 'quick_action', {
      actionId: action.id,
      actionTitle: action.title
    });
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'active':
        return 'success';
      case 'warning':
      case 'degraded':
        return 'warning';
      case 'error':
      case 'offline':
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [country]);

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
          <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchDashboardData} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to the Bellyfed administration panel
          </p>
        </div>
        
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      {showMetrics && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalRestaurants)}</p>
              </div>
              <div className="text-3xl">🏪</div>
            </div>
            {metrics.restaurantsGrowth && (
              <div className="mt-2">
                <Badge variant={metrics.restaurantsGrowth > 0 ? 'success' : 'destructive'} className="text-xs">
                  {metrics.restaurantsGrowth > 0 ? '+' : ''}{metrics.restaurantsGrowth}% this month
                </Badge>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.activeUsers)}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            {metrics.usersGrowth && (
              <div className="mt-2">
                <Badge variant={metrics.usersGrowth > 0 ? 'success' : 'destructive'} className="text-xs">
                  {metrics.usersGrowth > 0 ? '+' : ''}{metrics.usersGrowth}% this month
                </Badge>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalReviews)}</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
            {metrics.reviewsGrowth && (
              <div className="mt-2">
                <Badge variant={metrics.reviewsGrowth > 0 ? 'success' : 'destructive'} className="text-xs">
                  {metrics.reviewsGrowth > 0 ? '+' : ''}{metrics.reviewsGrowth}% this month
                </Badge>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.pageViews)}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            {metrics.viewsGrowth && (
              <div className="mt-2">
                <Badge variant={metrics.viewsGrowth > 0 ? 'success' : 'destructive'} className="text-xs">
                  {metrics.viewsGrowth > 0 ? '+' : ''}{metrics.viewsGrowth}% this month
                </Badge>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <div 
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleQuickActionClick(action)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white text-xl`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* System Status */}
      {showSystemStatus && systemStatus && Object.keys(systemStatus).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">
                  {service.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant={getStatusColor(status.status)}>
                  {status.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {showRecentActivity && recentActivity.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg">{activity.icon || '📝'}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          
          {recentActivity.length > 5 && (
            <div className="mt-4 text-center">
              <Link href={`/${country}/admin/activity`}>
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
