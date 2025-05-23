/**
 * Test Feature Components Page
 * 
 * Test page for newly migrated feature components including
 * analytics, competitions, premium, admin, AI center, dish restaurants,
 * foodie leaderboard, and restaurant management components.
 */

import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui/index.js';
import { 
  AnalyticsProvider, 
  PageView, 
  RestaurantAnalytics, 
  TrendingRestaurants 
} from '../components/analytics/index.js';
import { 
  CompetitionCard, 
  CompetitionList 
} from '../components/competitions/index.js';
import { 
  PremiumBanner, 
  PremiumFeatures 
} from '../components/premium/index.js';
import { 
  AdminGuard, 
  AdminDashboard,
  useAdminPermissions 
} from '../components/admin/index.js';
import {
  AIRecommendations,
  AIChat
} from '../components/ai-center/index.js';
import {
  DishRestaurantList,
  DishComparison
} from '../components/dish-restaurants/index.js';
import {
  FoodieLeaderboard,
  UserAchievements
} from '../components/my-foodie-leaderboard/index.js';
import {
  RestaurantDashboard,
  MenuManager
} from '../components/restaurant-management/index.js';

// Mock data for testing
const mockCompetitions = [
  {
    id: '1',
    title: 'Best Pizza Challenge',
    description: 'Find the best pizza in your city and compete with other food lovers!',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    participantCount: 1250,
    prize: '$500',
    type: 'discovery',
    categories: ['Pizza', 'Italian', 'Fast Food'],
    isParticipating: false,
    trendingScore: 85
  },
  {
    id: '2',
    title: 'Sushi Master Quest',
    description: 'Discover the finest sushi restaurants and become a sushi expert!',
    status: 'upcoming',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    participantCount: 890,
    prize: '$1000',
    type: 'expertise',
    categories: ['Sushi', 'Japanese', 'Fine Dining'],
    isParticipating: true,
    userRank: 15,
    userScore: 2450
  }
];

const TestFeatureComponents = () => {
  const [activeSection, setActiveSection] = useState('analytics');
  const adminPermissions = useAdminPermissions();

  const sections = [
    { id: 'analytics', title: 'Analytics Components', icon: '📊' },
    { id: 'competitions', title: 'Competition Components', icon: '🏆' },
    { id: 'premium', title: 'Premium Components', icon: '⭐' },
    { id: 'admin', title: 'Admin Components', icon: '👑' },
    { id: 'ai-center', title: 'AI Center Components', icon: '🤖' },
    { id: 'dish-restaurants', title: 'Dish Restaurant Components', icon: '🍽️' },
    { id: 'leaderboard', title: 'Foodie Leaderboard Components', icon: '🏅' },
    { id: 'restaurant-mgmt', title: 'Restaurant Management Components', icon: '🏪' }
  ];

  const renderAnalyticsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analytics Provider Test</h3>
        <p className="text-gray-600 mb-4">
          The AnalyticsProvider is wrapping this entire page and tracking page views automatically.
        </p>
        <Badge variant="success">✓ Analytics Provider Active</Badge>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Page View Component</h3>
        <PageView
          pageName="test-feature-components"
          pageCategory="testing"
          metadata={{ testMode: true }}
          debug={true}
        />
        <Badge variant="secondary">PageView Component Loaded</Badge>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Restaurant Analytics</h3>
        <RestaurantAnalytics
          restaurantId="test-restaurant-1"
          restaurantName="Test Restaurant"
          showExportButton={false}
          showRealTimeData={false}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trending Restaurants</h3>
        <TrendingRestaurants
          limit={5}
          showCategories={true}
          showMetrics={true}
          showViewAll={false}
        />
      </Card>
    </div>
  );

  const renderCompetitionsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Competition Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCompetitions.map(competition => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              showParticipants={true}
              showProgress={true}
              showActions={true}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Competition List</h3>
        <CompetitionList
          competitions={mockCompetitions}
          loading={false}
          error={null}
          showFilters={true}
          showSearch={true}
          showViewToggle={true}
          defaultView="grid"
        />
      </Card>
    </div>
  );

  const renderPremiumSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Premium Banner - Default</h3>
        <PremiumBanner
          variant="default"
          showDismiss={false}
          showPricing={true}
          showFeatures={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Premium Banner - Compact</h3>
        <PremiumBanner
          variant="compact"
          showDismiss={false}
          showPricing={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Premium Features</h3>
        <PremiumFeatures
          showComparison={true}
          showPricing={true}
          showTestimonials={false}
        />
      </Card>
    </div>
  );

  const renderAdminSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Admin Permissions Check</h3>
        <div className="space-y-2">
          <p><strong>Is Admin:</strong> {adminPermissions.isAdmin ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Is Moderator:</strong> {adminPermissions.isModerator ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User Role:</strong> {adminPermissions.userRole}</p>
          <p><strong>Permissions:</strong> {adminPermissions.userPermissions.join(', ') || 'None'}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Admin Dashboard</h3>
        <AdminGuard
          requiredRole="admin"
          fallbackComponent={
            <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-600">Admin dashboard requires admin privileges</p>
            </div>
          }
        >
          <AdminDashboard
            showMetrics={true}
            showQuickActions={true}
            showRecentActivity={true}
            showSystemStatus={true}
          />
        </AdminGuard>
      </Card>
    </div>
  );

  const renderAICenterSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        <AIRecommendations
          userId="test-user-1"
          recommendationType="mixed"
          limit={5}
          showConfidenceScores={true}
          showFeedback={true}
          showExplanations={true}
        />
      </Card>

      <Card className="p-6" style={{ height: '500px' }}>
        <h3 className="text-lg font-semibold mb-4">AI Chat</h3>
        <AIChat
          userId="test-user-1"
          showSuggestions={true}
          className="h-full"
        />
      </Card>
    </div>
  );

  const renderDishRestaurantsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dish Restaurant List</h3>
        <DishRestaurantList
          dishId="test-dish-1"
          dishName="Margherita Pizza"
          showFilters={true}
          showComparison={true}
          showRankings={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dish Comparison</h3>
        <DishComparison
          dishId="test-dish-1"
          dishName="Margherita Pizza"
          restaurantIds={['rest-1', 'rest-2', 'rest-3']}
          showReviews={true}
          showPricing={true}
          showMetrics={true}
        />
      </Card>
    </div>
  );

  const renderLeaderboardSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Foodie Leaderboard</h3>
        <FoodieLeaderboard
          category="overall"
          period="all_time"
          limit={10}
          showUserPosition={true}
          showAchievements={true}
          showFollowButtons={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">User Achievements</h3>
        <UserAchievements
          showProgress={true}
          showSharing={true}
          showCategories={true}
          showRarity={true}
        />
      </Card>
    </div>
  );

  const renderRestaurantMgmtSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Restaurant Dashboard</h3>
        <RestaurantDashboard
          restaurantId="test-restaurant-1"
          showAnalytics={true}
          showQuickActions={true}
          showRecentReviews={true}
          showPerformanceMetrics={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Menu Manager</h3>
        <MenuManager
          restaurantId="test-restaurant-1"
          showCategories={true}
          showBulkActions={true}
          allowReordering={true}
        />
      </Card>
    </div>
  );

  return (
    <AnalyticsProvider
      enableAutoTracking={true}
      enableDebugMode={true}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Feature Components Test Page
            </h1>
            <p className="text-lg text-gray-600">
              Testing all newly migrated feature components
            </p>
          </div>

          {/* Navigation */}
          <Card className="p-4 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${activeSection === section.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Content */}
          <div>
            {activeSection === 'analytics' && renderAnalyticsSection()}
            {activeSection === 'competitions' && renderCompetitionsSection()}
            {activeSection === 'premium' && renderPremiumSection()}
            {activeSection === 'admin' && renderAdminSection()}
            {activeSection === 'ai-center' && renderAICenterSection()}
            {activeSection === 'dish-restaurants' && renderDishRestaurantsSection()}
            {activeSection === 'leaderboard' && renderLeaderboardSection()}
            {activeSection === 'restaurant-mgmt' && renderRestaurantMgmtSection()}
          </div>
        </div>
      </div>
    </AnalyticsProvider>
  );
};

export default TestFeatureComponents;
