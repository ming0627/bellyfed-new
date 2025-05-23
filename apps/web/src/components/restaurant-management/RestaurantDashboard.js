/**
 * Restaurant Dashboard Component
 * 
 * Main dashboard for restaurant owners to manage their restaurant profile,
 * view analytics, manage menu, and respond to reviews.
 * 
 * Features:
 * - Restaurant analytics overview
 * - Quick action buttons
 * - Recent reviews and ratings
 * - Menu management shortcuts
 * - Performance metrics
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const RestaurantDashboard = ({
  restaurantId,
  showAnalytics = true,
  showQuickActions = true,
  showRecentReviews = true,
  showPerformanceMetrics = true,
  className = ''
}) => {
  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user } = useAuth();

  // Quick actions for restaurant management
  const quickActions = [
    {
      id: 'edit_profile',
      title: 'Edit Restaurant Profile',
      description: 'Update restaurant information and photos',
      icon: '✏️',
      href: `/${country}/restaurant-management/${restaurantId}/profile`,
      color: 'bg-blue-500'
    },
    {
      id: 'manage_menu',
      title: 'Manage Menu',
      description: 'Add, edit, or remove menu items',
      icon: '📋',
      href: `/${country}/restaurant-management/${restaurantId}/menu`,
      color: 'bg-green-500'
    },
    {
      id: 'view_reviews',
      title: 'Manage Reviews',
      description: 'Respond to customer reviews',
      icon: '⭐',
      href: `/${country}/restaurant-management/${restaurantId}/reviews`,
      color: 'bg-yellow-500'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Detailed performance analytics',
      icon: '📊',
      href: `/${country}/restaurant-management/${restaurantId}/analytics`,
      color: 'bg-purple-500'
    },
    {
      id: 'promotions',
      title: 'Manage Promotions',
      description: 'Create and manage special offers',
      icon: '🎯',
      href: `/${country}/restaurant-management/${restaurantId}/promotions`,
      color: 'bg-orange-500'
    },
    {
      id: 'settings',
      title: 'Restaurant Settings',
      description: 'Configure restaurant settings',
      icon: '⚙️',
      href: `/${country}/restaurant-management/${restaurantId}/settings`,
      color: 'bg-gray-500'
    }
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!restaurantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRestaurantDashboard({
        restaurantId,
        includeAnalytics: showAnalytics,
        includeReviews: showRecentReviews,
        includeMetrics: showPerformanceMetrics
      });

      setDashboardData(data);
      
      // Track dashboard view
      trackUserEngagement('restaurant', restaurantId, 'dashboard_view', {
        userId: user?.id,
        restaurantName: data.restaurant?.name
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
    trackUserEngagement('restaurant', restaurantId, 'quick_action', {
      actionId: action.id,
      actionTitle: action.title
    });
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  // Get trend indicator
  const getTrendIndicator = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [restaurantId]);

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

  if (!dashboardData) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No Dashboard Data</p>
          <p className="text-sm">Unable to load dashboard information.</p>
        </div>
      </Card>
    );
  }

  const { restaurant, analytics, recentReviews, metrics } = dashboardData;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant?.name || 'Restaurant Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your restaurant and track performance
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href={`/${country}/restaurants/${restaurantId}`}>
            <Button variant="outline">
              View Public Profile
            </Button>
          </Link>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalViews)}</p>
              </div>
              <div className="text-3xl">👀</div>
            </div>
            {analytics.viewsTrend && (
              <div className="mt-2">
                {(() => {
                  const trend = getTrendIndicator(analytics.totalViews, analytics.previousViews);
                  return trend && (
                    <Badge variant={trend.isPositive ? 'success' : 'destructive'} className="text-xs">
                      {trend.isPositive ? '+' : '-'}{trend.value}% this month
                    </Badge>
                  );
                })()}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageRating?.toFixed(1) || 'N/A'}</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
            {analytics.totalReviews && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">{formatNumber(analytics.totalReviews)} reviews</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Visits</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.monthlyVisits)}</p>
              </div>
              <div className="text-3xl">📍</div>
            </div>
            {analytics.visitsTrend && (
              <div className="mt-2">
                {(() => {
                  const trend = getTrendIndicator(analytics.monthlyVisits, analytics.previousVisits);
                  return trend && (
                    <Badge variant={trend.isPositive ? 'success' : 'destructive'} className="text-xs">
                      {trend.isPositive ? '+' : '-'}{trend.value}% vs last month
                    </Badge>
                  );
                })()}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ranking</p>
                <p className="text-2xl font-bold text-gray-900">#{analytics.ranking || 'N/A'}</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
            {analytics.rankingCategory && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">in {analytics.rankingCategory}</p>
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

      {/* Recent Reviews */}
      {showRecentReviews && recentReviews && recentReviews.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
            <Link href={`/${country}/restaurant-management/${restaurantId}/reviews`}>
              <Button variant="outline" size="sm">
                View All Reviews
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{review.userName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {review.content}
                </p>
                
                {!review.hasResponse && (
                  <Badge variant="warning" className="text-xs">
                    Needs Response
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      {showPerformanceMetrics && metrics && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{metrics.responseRate || 0}%</p>
              <p className="text-sm text-gray-600">Review Response Rate</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{metrics.averageResponseTime || 0}h</p>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{metrics.customerSatisfaction || 0}%</p>
              <p className="text-sm text-gray-600">Customer Satisfaction</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RestaurantDashboard;
