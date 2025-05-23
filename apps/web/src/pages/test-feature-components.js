/**
 * Test Feature Components Page
 *
 * Test page for newly migrated feature components including
 * analytics, competitions, premium, admin, AI center, dish restaurants,
 * foodie leaderboard, and restaurant management components.
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@bellyfed/ui';
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
import {
  DishRanking,
  DishVoting,
  DishComments
} from '../components/dish/index.js';
import {
  RankingForm,
  RankingList
} from '../components/ranking/index.js';
import {
  RankingCard,
  RankingDialog,
  RankingBoard,
  RankingComparison
} from '../components/rankings/index.js';
import {
  ReviewCard,
  RestaurantComparison,
  RestaurantBooking
} from '../components/restaurant/index.js';
import {
  BarChart
} from '../components/charts/index.js';
import {
  AddDishDialog,
  AddRestaurantButton
} from '../components/dialogs/index.js';
import {
  FeedContent
} from '../components/feed/index.js';
import {
  LocationSearch
} from '../components/location/index.js';
import {
  Statistics
} from '../components/statistics/index.js';
import {
  ChatInterface
} from '../components/chat/index.js';
import {
  CustomDatePicker
} from '../components/date-picker/index.js';
import {
  UserProfileCard
} from '../components/user-profile/index.js';
import {
  NotificationCenter
} from '../components/notifications/index.js';
import {
  SearchBar
} from '../components/search/index.js';
import {
  FilterPanel
} from '../components/filters/index.js';
import {
  MapView
} from '../components/maps/index.js';
import {
  SocialShare,
  FollowButton
} from '../components/social/index.js';
import {
  ReviewForm,
  ReviewList
} from '../components/reviews/index.js';
import {
  CommentThread
} from '../components/comments/index.js';
import {
  ContactForm
} from '../components/forms/index.js';
import {
  PhotoGallery
} from '../components/gallery/index.js';
import {
  ConfirmationModal
} from '../components/modals/index.js';
import {
  DataTable
} from '../components/tables/index.js';
import {
  ReservationForm
} from '../components/booking/index.js';
import {
  PaymentForm
} from '../components/payment/index.js';
import {
  DashboardWidget
} from '../components/dashboard/index.js';
import {
  InfoCard
} from '../components/cards/index.js';
import {
  StatsWidget
} from '../components/widgets/index.js';
import {
  Breadcrumb
} from '../components/navigation/index.js';
import {
  PageHeader
} from '../components/layout/index.js';
import {
  VideoPlayer
} from '../components/media/index.js';
import {
  FeedbackForm
} from '../components/feedback/index.js';
import {
  ProgressBar
} from '../components/progress/index.js';
import {
  AlertBanner
} from '../components/alerts/index.js';
import {
  Tooltip
} from '../components/tooltips/index.js';
import {
  TabContainer
} from '../components/tabs/index.js';
import {
  AccordionItem
} from '../components/accordion/index.js';
import {
  ImageCarousel
} from '../components/carousel/index.js';
import {
  DropdownMenu
} from '../components/dropdowns/index.js';
import {
  SkeletonLoader
} from '../components/skeleton/index.js';
import {
  StatusBadge
} from '../components/badges/index.js';
import {
  EmptyState
} from '../components/empty/index.js';
import {
  StepIndicator
} from '../components/steps/index.js';

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

// Client-only wrapper to avoid SSR issues
const ClientOnlyTestFeatureComponents = () => {
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
    { id: 'restaurant-mgmt', title: 'Restaurant Management Components', icon: '🏪' },
    { id: 'dish', title: 'Dish Components', icon: '🍽️' },
    { id: 'ranking', title: 'Ranking Components', icon: '📊' },
    { id: 'rankings', title: 'Rankings Components', icon: '🏆' },
    { id: 'restaurant', title: 'Restaurant Components', icon: '🏪' },
    { id: 'charts', title: 'Charts Components', icon: '📈' },
    { id: 'dialogs', title: 'Dialog Components', icon: '💬' },
    { id: 'feed', title: 'Feed Components', icon: '📱' },
    { id: 'location', title: 'Location Components', icon: '📍' },
    { id: 'statistics', title: 'Statistics Components', icon: '📊' },
    { id: 'chat', title: 'Chat Components', icon: '💬' },
    { id: 'date-picker', title: 'Date Picker Components', icon: '📅' },
    { id: 'user-profile', title: 'User Profile Components', icon: '👤' },
    { id: 'notifications', title: 'Notification Components', icon: '🔔' },
    { id: 'search', title: 'Search Components', icon: '🔍' },
    { id: 'filters', title: 'Filter Components', icon: '🔧' },
    { id: 'maps', title: 'Map Components', icon: '🗺️' },
    { id: 'social', title: 'Social Components', icon: '👥' },
    { id: 'reviews', title: 'Review Components', icon: '⭐' },
    { id: 'comments', title: 'Comment Components', icon: '💬' },
    { id: 'forms', title: 'Form Components', icon: '📝' },
    { id: 'gallery', title: 'Gallery Components', icon: '🖼️' },
    { id: 'modals', title: 'Modal Components', icon: '🪟' },
    { id: 'tables', title: 'Table Components', icon: '📊' },
    { id: 'booking', title: 'Booking Components', icon: '📅' },
    { id: 'payment', title: 'Payment Components', icon: '💳' },
    { id: 'dashboard', title: 'Dashboard Components', icon: '📈' },
    { id: 'cards', title: 'Card Components', icon: '🃏' },
    { id: 'widgets', title: 'Widget Components', icon: '📊' },
    { id: 'navigation', title: 'Navigation Components', icon: '🧭' },
    { id: 'layout', title: 'Layout Components', icon: '📐' },
    { id: 'media', title: 'Media Components', icon: '🎬' },
    { id: 'feedback', title: 'Feedback Components', icon: '💬' },
    { id: 'progress', title: 'Progress Components', icon: '📊' },
    { id: 'alerts', title: 'Alert Components', icon: '🚨' },
    { id: 'tooltips', title: 'Tooltip Components', icon: '💭' },
    { id: 'tabs', title: 'Tab Components', icon: '📑' },
    { id: 'accordion', title: 'Accordion Components', icon: '📋' },
    { id: 'carousel', title: 'Carousel Components', icon: '🎠' },
    { id: 'dropdowns', title: 'Dropdown Components', icon: '⬇️' },
    { id: 'skeleton', title: 'Skeleton Components', icon: '💀' },
    { id: 'badges', title: 'Badge Components', icon: '🏷️' },
    { id: 'empty', title: 'Empty State Components', icon: '📭' },
    { id: 'steps', title: 'Step Components', icon: '👣' }
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

  const renderDishSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dish Ranking</h3>
        <DishRanking
          dishId="test-dish-1"
          dishName="Margherita Pizza"
          restaurantId="test-restaurant-1"
          showGlobalRanking={true}
          showUserRanking={true}
          showRecentRankings={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dish Voting</h3>
        <DishVoting
          dishId="test-dish-1"
          dishName="Margherita Pizza"
          restaurantId="test-restaurant-1"
          votingType="updown"
          showResults={true}
          showVoteCount={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dish Comments</h3>
        <DishComments
          dishId="test-dish-1"
          dishName="Margherita Pizza"
          restaurantId="test-restaurant-1"
          showAddComment={true}
          showReplies={true}
          commentsPerPage={5}
        />
      </Card>
    </div>
  );

  const renderRankingSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ranking Form</h3>
        <RankingForm
          entityType="dish"
          entityId="test-dish-1"
          entityData={{ name: "Margherita Pizza" }}
          showPreview={true}
          autoSave={false}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ranking List</h3>
        <RankingList
          entityType="dish"
          entityId="test-dish-1"
          showFilters={true}
          showSorting={true}
          showViewToggle={true}
          defaultView="grid"
          itemsPerPage={6}
        />
      </Card>
    </div>
  );

  const renderRankingsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ranking Board</h3>
        <RankingBoard
          categories={['dishes', 'restaurants', 'users']}
          showTimeFilter={true}
          showTrends={true}
          showViewAll={true}
          itemsPerCategory={5}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ranking Comparison</h3>
        <RankingComparison
          entityType="dish"
          entityIds={['dish-1', 'dish-2', 'dish-3']}
          comparisonMetrics={['overall', 'popularity', 'recent']}
          showCharts={true}
          showExport={true}
          showShare={true}
        />
      </Card>
    </div>
  );

  const renderRestaurantSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Restaurant Comparison</h3>
        <RestaurantComparison
          restaurantIds={['rest-1', 'rest-2', 'rest-3']}
          comparisonCriteria={['rating', 'price', 'service', 'ambiance']}
          showPhotos={true}
          showReviews={true}
          showMenuHighlights={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Restaurant Booking</h3>
        <RestaurantBooking
          restaurantId="test-restaurant-1"
          restaurantName="Test Restaurant"
          showAvailability={true}
          showSpecialRequests={true}
          maxPartySize={8}
          advanceBookingDays={30}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Review Card</h3>
        <ReviewCard
          review={{
            id: '1',
            userName: 'John Doe',
            userAvatar: null,
            rating: 4.5,
            date: '2024-01-15',
            content: 'Amazing food and great service! The pasta was perfectly cooked and the atmosphere was wonderful.',
            helpful: 12,
            images: []
          }}
          showActions={true}
          showImages={true}
        />
      </Card>
    </div>
  );

  const renderChartsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bar Chart - Vertical</h3>
        <BarChart
          data={[
            { label: 'Pizza', value: 85 },
            { label: 'Burger', value: 72 },
            { label: 'Pasta', value: 68 },
            { label: 'Sushi', value: 91 },
            { label: 'Tacos', value: 76 }
          ]}
          title="Popular Dishes Rating"
          orientation="vertical"
          colorScheme="orange"
          height={300}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bar Chart - Horizontal</h3>
        <BarChart
          data={[
            { label: 'Italian', value: 45 },
            { label: 'Chinese', value: 38 },
            { label: 'Japanese', value: 52 },
            { label: 'Mexican', value: 29 }
          ]}
          title="Cuisine Popularity"
          orientation="horizontal"
          colorScheme="blue"
          height={250}
        />
      </Card>
    </div>
  );

  const renderDialogsSection = () => {
    const [showAddDish, setShowAddDish] = useState(false);

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Restaurant Button</h3>
          <div className="space-y-4">
            <AddRestaurantButton
              variant="default"
              size="md"
              showIcon={true}
              requiresAdmin={false}
            />
            <AddRestaurantButton
              variant="outline"
              size="sm"
              showIcon={true}
              requiresAdmin={true}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Dish Dialog</h3>
          <Button onClick={() => setShowAddDish(true)}>
            Open Add Dish Dialog
          </Button>
          <AddDishDialog
            isOpen={showAddDish}
            onClose={() => setShowAddDish(false)}
            onDishAdded={(dish) => {
              console.log('Dish added:', dish);
              setShowAddDish(false);
            }}
            restaurantId="test-restaurant-1"
            restaurantName="Test Restaurant"
          />
        </Card>
      </div>
    );
  };

  const renderFeedSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Feed Content - Following</h3>
        <FeedContent
          feedType="following"
          showFilters={true}
          showComposer={true}
          itemsPerPage={5}
          enableInfiniteScroll={false}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Feed Content - Discover</h3>
        <FeedContent
          feedType="discover"
          showFilters={true}
          showComposer={false}
          itemsPerPage={3}
          enableInfiniteScroll={false}
        />
      </Card>
    </div>
  );

  const renderLocationSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location Search</h3>
        <LocationSearch
          onLocationSelect={(location) => console.log('Selected location:', location)}
          placeholder="Search for restaurants, areas, or landmarks..."
          showCurrentLocation={true}
          showMap={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location Search - Compact</h3>
        <LocationSearch
          onLocationSelect={(location) => console.log('Selected location:', location)}
          placeholder="Quick location search..."
          showCurrentLocation={false}
          showMap={false}
        />
      </Card>
    </div>
  );

  const renderStatisticsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">General Statistics</h3>
        <Statistics
          entityType="general"
          timeframe="month"
          showCharts={true}
          showExport={true}
          autoRefresh={false}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Restaurant Statistics</h3>
        <Statistics
          entityType="restaurant"
          entityId="test-restaurant-1"
          timeframe="week"
          showCharts={true}
          showExport={true}
          autoRefresh={false}
        />
      </Card>
    </div>
  );

  const renderChatSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Chat Interface - Direct Chat</h3>
        <ChatInterface
          chatId="chat-1"
          chatType="direct"
          participants={[
            { id: 'user-1', name: 'John Doe', avatar: null },
            { id: 'user-2', name: 'Jane Smith', avatar: null }
          ]}
          showParticipants={true}
          showTypingIndicator={true}
          allowFileUpload={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Chat Interface - Group Chat</h3>
        <ChatInterface
          chatId="chat-2"
          chatType="group"
          participants={[
            { id: 'user-1', name: 'John Doe', avatar: null },
            { id: 'user-2', name: 'Jane Smith', avatar: null },
            { id: 'user-3', name: 'Bob Wilson', avatar: null }
          ]}
          showParticipants={true}
          showTypingIndicator={true}
          allowFileUpload={true}
        />
      </Card>
    </div>
  );

  const renderDatePickerSection = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedRange, setSelectedRange] = useState([null, null]);

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Custom Date Picker - Single Date</h3>
          <CustomDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Select a date"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
          />
          {selectedDate && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedDate.toLocaleDateString()}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Custom Date Picker - Date Range</h3>
          <CustomDatePicker
            value={selectedRange}
            onChange={setSelectedRange}
            placeholder="Select date range"
            isRange={true}
            minDate={new Date()}
          />
          {selectedRange[0] && selectedRange[1] && (
            <p className="mt-2 text-sm text-gray-600">
              Range: {selectedRange[0].toLocaleDateString()} - {selectedRange[1].toLocaleDateString()}
            </p>
          )}
        </Card>
      </div>
    );
  };

  const renderUserProfileSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">User Profile Card - Full</h3>
        <UserProfileCard
          userId="user-1"
          showStats={true}
          showAchievements={true}
          showFollowButton={true}
          showSocialLinks={true}
          compact={false}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">User Profile Card - Compact</h3>
        <UserProfileCard
          userId="user-2"
          showStats={true}
          showAchievements={false}
          showFollowButton={true}
          showSocialLinks={false}
          compact={true}
        />
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Center</h3>
        <NotificationCenter
          showUnreadOnly={false}
          maxNotifications={20}
          enableRealTime={true}
          showMarkAllRead={true}
          showFilters={true}
        />
      </Card>
    </div>
  );

  const renderSearchSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Bar - Full Featured</h3>
        <SearchBar
          placeholder="Search restaurants, dishes, or users..."
          showFilters={true}
          showSuggestions={true}
          showHistory={true}
          maxSuggestions={8}
          categories={['restaurants', 'dishes', 'users']}
          onSearch={(query, category, suggestion) => {
            console.log('Search:', { query, category, suggestion });
          }}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Bar - Simple</h3>
        <SearchBar
          placeholder="Quick search..."
          showFilters={false}
          showSuggestions={true}
          showHistory={false}
          maxSuggestions={5}
          categories={['restaurants']}
        />
      </Card>
    </div>
  );

  const renderFiltersSection = () => {
    const [filterValues, setFilterValues] = useState({});

    const mockFilters = [
      {
        id: 'cuisine',
        label: 'Cuisine Type',
        type: 'checkbox',
        options: [
          { value: 'malaysian', label: 'Malaysian', count: 45 },
          { value: 'chinese', label: 'Chinese', count: 32 },
          { value: 'indian', label: 'Indian', count: 28 },
          { value: 'western', label: 'Western', count: 21 }
        ]
      },
      {
        id: 'price',
        label: 'Price Range',
        type: 'range',
        min: 0,
        max: 100,
        showSlider: true
      },
      {
        id: 'rating',
        label: 'Minimum Rating',
        type: 'radio',
        options: [
          { value: '4.5', label: '4.5+ Stars', count: 12 },
          { value: '4.0', label: '4.0+ Stars', count: 28 },
          { value: '3.5', label: '3.5+ Stars', count: 45 },
          { value: '3.0', label: '3.0+ Stars', count: 67 }
        ]
      },
      {
        id: 'location',
        label: 'Area',
        type: 'select',
        options: [
          { value: 'klcc', label: 'KLCC', count: 15 },
          { value: 'bukit-bintang', label: 'Bukit Bintang', count: 23 },
          { value: 'bangsar', label: 'Bangsar', count: 18 }
        ]
      }
    ];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filter Panel</h3>
          <FilterPanel
            filters={mockFilters}
            values={filterValues}
            onChange={setFilterValues}
            showClearAll={true}
            collapsible={true}
          />
          {Object.keys(filterValues).length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Current Filters:</h4>
              <pre className="text-xs text-gray-600">
                {JSON.stringify(filterValues, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderMapsSection = () => {
    const mockMarkers = [
      {
        id: 'restaurant-1',
        name: 'Nasi Lemak Wanjo',
        type: 'restaurant',
        rating: 4.8,
        reviewCount: 234,
        cuisine: 'Malaysian',
        address: 'Kampung Baru, KL',
        image: null
      },
      {
        id: 'restaurant-2',
        name: 'Din Tai Fung',
        type: 'restaurant',
        rating: 4.6,
        reviewCount: 567,
        cuisine: 'Chinese',
        address: 'Pavilion KL',
        image: null
      },
      {
        id: 'restaurant-3',
        name: 'Banana Leaf Apolo',
        type: 'restaurant',
        rating: 4.3,
        reviewCount: 189,
        cuisine: 'Indian',
        address: 'Brickfields, KL',
        image: null
      }
    ];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interactive Map View</h3>
          <MapView
            center={{ lat: 3.1390, lng: 101.6869 }}
            zoom={12}
            markers={mockMarkers}
            showUserLocation={true}
            showSearch={true}
            showDirections={true}
            enableClustering={true}
            onMarkerClick={(marker) => console.log('Marker clicked:', marker)}
          />
        </Card>
      </div>
    );
  };

  const renderSocialSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Social Share - Full Featured</h3>
        <SocialShare
          url="https://bellyfed.com/restaurants/nasi-lemak-wanjo"
          title="Amazing Nasi Lemak at Wanjo!"
          description="Just had the best nasi lemak in KL. You have to try this place!"
          hashtags={['bellyfed', 'nasilemak', 'malaysianfood', 'kl']}
          platforms={['facebook', 'twitter', 'whatsapp', 'telegram', 'copy']}
          showLabels={true}
          size="md"
          variant="default"
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Social Share - Floating Style</h3>
        <SocialShare
          title="Check out this restaurant!"
          platforms={['facebook', 'twitter', 'whatsapp', 'copy']}
          showLabels={true}
          size="lg"
          variant="floating"
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Follow Button Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Following User</h4>
            <FollowButton
              targetUserId="user-123"
              targetUserName="John Doe"
              initialFollowing={true}
              initialFollowerCount={1234}
              showFollowerCount={true}
              size="md"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Not Following User</h4>
            <FollowButton
              targetUserId="user-456"
              targetUserName="Jane Smith"
              initialFollowing={false}
              initialFollowerCount={567}
              showFollowerCount={true}
              size="md"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Compact Style</h4>
            <FollowButton
              targetUserId="user-789"
              targetUserName="Bob Wilson"
              initialFollowing={false}
              initialFollowerCount={89}
              showFollowerCount={false}
              size="sm"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderReviewsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Review List - Restaurant Reviews</h3>
        <ReviewList
          targetType="restaurant"
          targetId="restaurant-123"
          showFilters={true}
          showSorting={true}
          showPhotos={true}
          showRatingBreakdown={true}
          itemsPerPage={5}
          enableInfiniteScroll={false}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Review Form - New Review</h3>
        <ReviewForm
          targetType="restaurant"
          targetId="restaurant-123"
          targetName="Nasi Lemak Wanjo"
          existingReview={null}
          showCategories={true}
          allowPhotos={true}
          maxPhotos={5}
          onSubmit={(review) => console.log('Review submitted:', review)}
          onCancel={() => console.log('Review cancelled')}
        />
      </Card>
    </div>
  );

  const renderCommentsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comment Thread - Dish Comments</h3>
        <CommentThread
          targetType="dish"
          targetId="dish-123"
          showReplyForm={true}
          showReactions={true}
          maxDepth={3}
          commentsPerPage={10}
          enableRealTime={true}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comment Thread - Restaurant Discussion</h3>
        <CommentThread
          targetType="restaurant"
          targetId="restaurant-456"
          showReplyForm={true}
          showReactions={true}
          maxDepth={2}
          commentsPerPage={15}
          enableRealTime={false}
        />
      </Card>
    </div>
  );

  const renderFormsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Form - Full Featured</h3>
        <ContactForm
          inquiryType="general"
          showSubjectField={true}
          showAttachments={true}
          showPriorityField={true}
          maxAttachments={3}
          autoSave={true}
          onSubmit={(result) => console.log('Form submitted:', result)}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Form - Simple</h3>
        <ContactForm
          inquiryType="support"
          showSubjectField={false}
          showAttachments={false}
          showPriorityField={false}
          autoSave={false}
        />
      </Card>
    </div>
  );

  const renderGallerySection = () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        title: 'Delicious Pizza',
        caption: 'Authentic Italian pizza with fresh ingredients',
        uploadedBy: 'user-1',
        uploadedAt: '2024-01-15T10:30:00Z',
        metadata: { size: 245760, type: 'image/jpeg', name: 'pizza.jpg' }
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        thumbnailUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200',
        title: 'Gourmet Burger',
        caption: 'Juicy beef burger with artisanal toppings',
        uploadedBy: 'user-2',
        uploadedAt: '2024-01-14T15:45:00Z',
        metadata: { size: 189432, type: 'image/jpeg', name: 'burger.jpg' }
      },
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
        title: 'Fresh Salad',
        caption: 'Healthy mixed greens with seasonal vegetables',
        uploadedBy: 'user-3',
        uploadedAt: '2024-01-13T12:20:00Z',
        metadata: { size: 156789, type: 'image/jpeg', name: 'salad.jpg' }
      }
    ];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Photo Gallery - Restaurant Photos</h3>
          <PhotoGallery
            photos={mockPhotos}
            targetType="restaurant"
            targetId="restaurant-123"
            showUpload={true}
            showCaptions={true}
            showMetadata={true}
            allowZoom={true}
            gridColumns="auto"
            aspectRatio="square"
            maxPhotos={20}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Photo Gallery - Compact Grid</h3>
          <PhotoGallery
            photos={mockPhotos.slice(0, 2)}
            targetType="dish"
            targetId="dish-456"
            showUpload={false}
            showCaptions={false}
            showMetadata={false}
            allowZoom={true}
            gridColumns={3}
            aspectRatio="landscape"
            maxPhotos={10}
          />
        </Card>
      </div>
    );
  };

  const renderModalsSection = () => {
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showDangerModal, setShowDangerModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const handleConfirm = async () => {
      setModalLoading(true);
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setModalLoading(false);
      setShowInfoModal(false);
      setShowWarningModal(false);
      setShowDangerModal(false);
    };

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confirmation Modals</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Info Modal</h4>
              <Button onClick={() => setShowInfoModal(true)}>
                Show Info Modal
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Warning Modal</h4>
              <Button onClick={() => setShowWarningModal(true)} variant="outline">
                Show Warning Modal
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Danger Modal</h4>
              <Button onClick={() => setShowDangerModal(true)} className="bg-red-600 hover:bg-red-700">
                Show Danger Modal
              </Button>
            </div>
          </div>
        </Card>

        {/* Modals */}
        <ConfirmationModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onConfirm={handleConfirm}
          title="Information"
          message="This is an informational message. Would you like to proceed?"
          confirmText="Proceed"
          cancelText="Cancel"
          severity="info"
          loading={modalLoading}
        />

        <ConfirmationModal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          onConfirm={handleConfirm}
          title="Warning"
          message="This action may have consequences. Are you sure you want to continue?"
          confirmText="Continue"
          cancelText="Cancel"
          severity="warning"
          loading={modalLoading}
        />

        <ConfirmationModal
          isOpen={showDangerModal}
          onClose={() => setShowDangerModal(false)}
          onConfirm={handleConfirm}
          title="Delete Item"
          message="This action cannot be undone. Are you sure you want to delete this item permanently?"
          confirmText="Delete"
          cancelText="Cancel"
          severity="danger"
          loading={modalLoading}
          preventBackdropClose={true}
        />
      </div>
    );
  };

  const renderTablesSection = () => {
    const mockTableData = [
      {
        id: 1,
        name: 'Nasi Lemak Wanjo',
        cuisine: 'Malaysian',
        rating: 4.8,
        reviews: 234,
        price: 15.50,
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Din Tai Fung',
        cuisine: 'Chinese',
        rating: 4.6,
        reviews: 567,
        price: 45.00,
        status: 'active',
        createdAt: '2024-01-14T15:45:00Z'
      },
      {
        id: 3,
        name: 'Banana Leaf Apolo',
        cuisine: 'Indian',
        rating: 4.3,
        reviews: 189,
        price: 25.75,
        status: 'inactive',
        createdAt: '2024-01-13T12:20:00Z'
      },
      {
        id: 4,
        name: 'Jalan Alor Food Street',
        cuisine: 'Street Food',
        rating: 4.5,
        reviews: 892,
        price: 8.25,
        status: 'active',
        createdAt: '2024-01-12T18:10:00Z'
      },
      {
        id: 5,
        name: 'Atmosphere 360',
        cuisine: 'International',
        rating: 4.2,
        reviews: 156,
        price: 85.00,
        status: 'active',
        createdAt: '2024-01-11T20:30:00Z'
      }
    ];

    const tableColumns = [
      {
        key: 'name',
        header: 'Restaurant Name',
        sortable: true
      },
      {
        key: 'cuisine',
        header: 'Cuisine',
        sortable: true
      },
      {
        key: 'rating',
        header: 'Rating',
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{value}</span>
          </div>
        )
      },
      {
        key: 'reviews',
        header: 'Reviews',
        sortable: true
      },
      {
        key: 'price',
        header: 'Avg Price',
        type: 'currency',
        sortable: true
      },
      {
        key: 'status',
        header: 'Status',
        type: 'badge',
        sortable: true
      },
      {
        key: 'createdAt',
        header: 'Created',
        type: 'date',
        sortable: true
      }
    ];

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Data Table - Full Featured</h3>
          <DataTable
            data={mockTableData}
            columns={tableColumns}
            loading={false}
            searchable={true}
            sortable={true}
            selectable={true}
            pagination={true}
            pageSize={3}
            pageSizeOptions={[3, 5, 10]}
            showExport={true}
            emptyMessage="No restaurants found"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Data Table - Simple</h3>
          <DataTable
            data={mockTableData.slice(0, 3)}
            columns={tableColumns.slice(0, 4)}
            loading={false}
            searchable={false}
            sortable={true}
            selectable={false}
            pagination={false}
            showExport={false}
          />
        </Card>
      </div>
    );
  };

  const renderBookingSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reservation Form</h3>
        <ReservationForm
          restaurantId="restaurant-123"
          restaurantName="Nasi Lemak Wanjo"
          minPartySize={1}
          maxPartySize={12}
          advanceBookingDays={30}
          timeSlotInterval={30}
          operatingHours={{ open: '11:00', close: '22:00' }}
          onReservationComplete={(result) => console.log('Reservation:', result)}
        />
      </Card>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Form</h3>
        <PaymentForm
          amount={45.50}
          currency="USD"
          orderDetails={{
            items: [
              { name: 'Nasi Lemak', quantity: 2, price: 15.50 },
              { name: 'Teh Tarik', quantity: 2, price: 7.25 }
            ]
          }}
          onPaymentSuccess={(result) => console.log('Payment success:', result)}
          onPaymentError={(error) => console.log('Payment error:', error)}
          showBillingAddress={true}
          acceptedMethods={['card', 'paypal']}
        />
      </Card>
    </div>
  );

  const renderDashboardSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardWidget
          title="Restaurant Analytics"
          subtitle="Monthly performance overview"
          icon="📊"
          actions={[
            { id: 'view', label: 'View Details', icon: '👁️' },
            { id: 'export', label: 'Export', icon: '📤' }
          ]}
          onRefresh={() => console.log('Refreshing analytics...')}
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Orders</span>
              <span className="font-semibold">1,234</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue</span>
              <span className="font-semibold">$12,345</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Rating</span>
              <span className="font-semibold">4.8 ⭐</span>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Recent Activity"
          icon="🔔"
          loading={false}
          size="default"
          variant="highlighted"
        >
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">New review</span> from John D.
            </div>
            <div className="text-sm">
              <span className="font-medium">Order #1234</span> completed
            </div>
            <div className="text-sm">
              <span className="font-medium">Menu updated</span> - 3 new items
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );

  const renderCardsSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          title="Nasi Lemak Wanjo"
          subtitle="Traditional Malaysian Cuisine"
          description="Authentic nasi lemak served with sambal, anchovies, and boiled egg. A must-try local favorite!"
          image="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300"
          status="active"
          badges={['Halal', 'Local Favorite', 'Spicy']}
          actions={[
            { label: 'View Menu', icon: '📋' },
            { label: 'Reserve', icon: '📅' }
          ]}
          layout="vertical"
          size="default"
        />

        <InfoCard
          title="Din Tai Fung"
          subtitle="Chinese Dim Sum"
          description="World-famous xiaolongbao and authentic Chinese cuisine in an elegant setting."
          icon="🥟"
          status="active"
          badges={['Premium', 'Dim Sum']}
          actions={[
            { label: 'Order Now', icon: '🛒', variant: 'default' }
          ]}
          layout="vertical"
          size="default"
        />

        <InfoCard
          title="Quick Stats"
          description="Restaurant performance overview"
          icon="📈"
          layout="horizontal"
          size="small"
          actions={[
            { label: 'Details', size: 'sm' }
          ]}
        />
      </div>
    </div>
  );

  const renderWidgetsSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          title="Total Revenue"
          value={12345.67}
          previousValue={10234.56}
          format="currency"
          showTrend={true}
          icon="💰"
          color="green"
          size="default"
        />

        <StatsWidget
          title="Orders Today"
          value={89}
          previousValue={76}
          showTrend={true}
          icon="📦"
          color="blue"
          size="default"
        />

        <StatsWidget
          title="Customer Rating"
          value={4.8}
          previousValue={4.6}
          unit="/5"
          showTrend={true}
          icon="⭐"
          color="yellow"
          size="default"
        />

        <StatsWidget
          title="Goal Progress"
          value={75}
          format="percentage"
          showProgress={true}
          progressMax={100}
          icon="🎯"
          color="purple"
          size="default"
        />
      </div>
    </div>
  );

  // Render functions for all new components
  const renderNavigationSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Breadcrumb Navigation</h3>
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Restaurants', href: '/restaurants' },
              { label: 'Malaysian Cuisine', href: '/restaurants/malaysian' },
              { label: 'Nasi Lemak Wanjo', href: null }
            ]}
          />
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: '📊' },
              { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
              { label: 'Reports', href: null, icon: '📋' }
            ]}
            separator=">"
            showHome={false}
          />
        </div>
      </Card>
    </div>
  );

  const renderLayoutSection = () => (
    <div className="space-y-8">
      <PageHeader
        title="Restaurant Management"
        subtitle="Manage your restaurant listings and analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Restaurants', href: '/restaurants' },
          { label: 'Management', href: null }
        ]}
        actions={[
          { label: 'Add Restaurant', icon: '➕', onClick: () => console.log('Add restaurant') },
          { label: 'Export Data', icon: '📤', variant: 'outline', onClick: () => console.log('Export') }
        ]}
      />
    </div>
  );

  const renderMediaSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Video Player</h3>
        <VideoPlayer
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          poster="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
          title="Restaurant Tour - Nasi Lemak Wanjo"
          controls={true}
        />
      </Card>
    </div>
  );

  const renderFeedbackSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackForm
          onSubmit={(data) => console.log('Feedback:', data)}
          showRating={true}
          placeholder="How was your dining experience?"
        />
        <FeedbackForm
          onSubmit={(data) => console.log('Simple feedback:', data)}
          showRating={false}
          placeholder="Share your thoughts..."
        />
      </div>
    </div>
  );

  const renderProgressSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Bars</h3>
        <div className="space-y-6">
          <ProgressBar value={75} label="Order Completion" color="green" />
          <ProgressBar value={45} label="Profile Setup" color="blue" size="large" />
          <ProgressBar value={90} label="Restaurant Verification" color="yellow" size="small" />
          <ProgressBar value={60} label="Loading..." color="purple" animated={true} />
        </div>
      </Card>
    </div>
  );

  const renderAlertsSection = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <AlertBanner
          type="success"
          title="Order Confirmed"
          message="Your order has been successfully placed and is being prepared."
          actions={[{ label: 'Track Order', onClick: () => console.log('Track order') }]}
        />
        <AlertBanner
          type="warning"
          title="Limited Availability"
          message="Only 3 tables left for tonight. Book now to secure your spot."
          actions={[
            { label: 'Book Now', onClick: () => console.log('Book now') },
            { label: 'View Alternatives', onClick: () => console.log('Alternatives') }
          ]}
        />
        <AlertBanner
          type="error"
          title="Payment Failed"
          message="There was an issue processing your payment. Please try again."
          actions={[{ label: 'Retry Payment', onClick: () => console.log('Retry') }]}
        />
        <AlertBanner
          type="info"
          title="New Features Available"
          message="Check out our new menu recommendations based on your preferences."
          dismissible={false}
        />
      </div>
    </div>
  );

  const renderTooltipsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tooltips</h3>
        <div className="flex flex-wrap gap-4">
          <Tooltip content="This shows restaurant information" position="top">
            <Button>Hover for Top Tooltip</Button>
          </Tooltip>
          <Tooltip content="Click to see more details" position="bottom" trigger="click">
            <Button variant="outline">Click for Bottom Tooltip</Button>
          </Tooltip>
          <Tooltip content="Focus to see help text" position="right" trigger="focus">
            <input className="px-3 py-2 border rounded" placeholder="Focus me" />
          </Tooltip>
        </div>
      </Card>
    </div>
  );

  const renderTabsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tab Container</h3>
        <TabContainer
          tabs={[
            {
              label: 'Menu',
              icon: '🍽️',
              content: (
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Restaurant Menu</h4>
                  <p>Browse our delicious selection of authentic Malaysian dishes.</p>
                </div>
              )
            },
            {
              label: 'Reviews',
              icon: '⭐',
              badge: '234',
              content: (
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Customer Reviews</h4>
                  <p>See what our customers are saying about their dining experience.</p>
                </div>
              )
            },
            {
              label: 'Location',
              icon: '📍',
              content: (
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Restaurant Location</h4>
                  <p>Find us easily with our detailed location and directions.</p>
                </div>
              )
            }
          ]}
          variant="pills"
        />
      </Card>
    </div>
  );

  const renderAccordionSection = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <AccordionItem title="Restaurant Information" icon="🏪" defaultOpen={true}>
          <p>Nasi Lemak Wanjo is a traditional Malaysian restaurant serving authentic local cuisine since 1985. Located in the heart of Kuala Lumpur, we pride ourselves on using fresh ingredients and traditional cooking methods.</p>
        </AccordionItem>
        <AccordionItem title="Menu Highlights" icon="🍽️">
          <div className="space-y-2">
            <p><strong>Nasi Lemak Special</strong> - Our signature dish with coconut rice, sambal, anchovies, and boiled egg</p>
            <p><strong>Rendang Beef</strong> - Slow-cooked beef in rich coconut curry</p>
            <p><strong>Satay Platter</strong> - Grilled skewered meat with peanut sauce</p>
          </div>
        </AccordionItem>
        <AccordionItem title="Opening Hours" icon="🕐">
          <div className="space-y-1">
            <p>Monday - Friday: 11:00 AM - 10:00 PM</p>
            <p>Saturday - Sunday: 10:00 AM - 11:00 PM</p>
            <p>Public Holidays: 10:00 AM - 9:00 PM</p>
          </div>
        </AccordionItem>
      </div>
    </div>
  );

  const renderCarouselSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Image Carousel</h3>
        <ImageCarousel
          images={[
            {
              src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600',
              alt: 'Nasi Lemak',
              caption: 'Our signature Nasi Lemak with traditional accompaniments'
            },
            {
              src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
              alt: 'Rendang',
              caption: 'Slow-cooked beef rendang with aromatic spices'
            },
            {
              src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
              alt: 'Restaurant Interior',
              caption: 'Cozy dining atmosphere with traditional Malaysian decor'
            }
          ]}
          autoPlay={true}
          autoPlayInterval={4000}
          showIndicators={true}
          showNavigation={true}
        />
      </Card>
    </div>
  );

  const renderDropdownsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dropdown Menus</h3>
        <div className="flex flex-wrap gap-4">
          <DropdownMenu
            trigger={<Button>Restaurant Actions</Button>}
            items={[
              { label: 'View Details', icon: '👁️', onClick: () => console.log('View details') },
              { label: 'Edit Restaurant', icon: '✏️', onClick: () => console.log('Edit') },
              { type: 'divider' },
              { label: 'Share', icon: '📤', onClick: () => console.log('Share') },
              { label: 'Bookmark', icon: '🔖', onClick: () => console.log('Bookmark') },
              { type: 'divider' },
              { label: 'Delete', icon: '🗑️', danger: true, onClick: () => console.log('Delete') }
            ]}
            position="bottom-left"
          />

          <DropdownMenu
            trigger={<Button variant="outline">User Menu</Button>}
            items={[
              { label: 'Profile', icon: '👤', description: 'Manage your account', onClick: () => console.log('Profile') },
              { label: 'Settings', icon: '⚙️', description: 'App preferences', onClick: () => console.log('Settings') },
              { label: 'Help', icon: '❓', description: 'Get support', shortcut: '⌘H', onClick: () => console.log('Help') },
              { type: 'divider' },
              { label: 'Sign Out', icon: '🚪', onClick: () => console.log('Sign out') }
            ]}
            position="bottom-right"
          />
        </div>
      </Card>
    </div>
  );

  const renderSkeletonSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Skeleton Loaders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3">Text Skeleton</h4>
            <SkeletonLoader type="text" lines={4} />
          </div>

          <div>
            <h4 className="font-medium mb-3">Card Skeleton</h4>
            <SkeletonLoader type="card" />
          </div>

          <div>
            <h4 className="font-medium mb-3">Mixed Elements</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <SkeletonLoader type="circle" width="12" />
                <SkeletonLoader type="text" lines={2} />
              </div>
              <SkeletonLoader type="rectangle" height="32" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBadgesSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Filled Badges</h4>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" label="Open" icon="✅" />
              <StatusBadge status="warning" label="Busy" icon="⚠️" />
              <StatusBadge status="error" label="Closed" icon="❌" />
              <StatusBadge status="info" label="New" icon="ℹ️" pulse={true} />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Outline Badges</h4>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" label="Verified" variant="outline" />
              <StatusBadge status="warning" label="Pending" variant="outline" />
              <StatusBadge status="error" label="Rejected" variant="outline" />
              <StatusBadge status="info" label="Draft" variant="outline" />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Dot Indicators</h4>
            <div className="space-y-2">
              <StatusBadge status="success" label="Online" variant="dot" />
              <StatusBadge status="warning" label="Away" variant="dot" />
              <StatusBadge status="error" label="Offline" variant="dot" />
              <StatusBadge status="info" label="Idle" variant="dot" pulse={true} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderEmptySection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmptyState
          icon="🍽️"
          title="No Restaurants Found"
          description="We couldn't find any restaurants matching your criteria. Try adjusting your filters or search terms."
          actions={[
            { label: 'Clear Filters', icon: '🔄', onClick: () => console.log('Clear filters') },
            { label: 'Browse All', icon: '🔍', variant: 'outline', onClick: () => console.log('Browse all') }
          ]}
          size="default"
        />

        <EmptyState
          icon="📝"
          title="No Reviews Yet"
          description="Be the first to share your dining experience!"
          actions={[
            { label: 'Write Review', icon: '✏️', onClick: () => console.log('Write review') }
          ]}
          size="small"
        />
      </div>
    </div>
  );

  const renderStepsSection = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Step Indicators</h3>
        <div className="space-y-8">
          <div>
            <h4 className="font-medium mb-4">Horizontal Steps</h4>
            <StepIndicator
              steps={[
                { label: 'Choose Restaurant', description: 'Browse and select' },
                { label: 'Make Reservation', description: 'Pick date and time' },
                { label: 'Confirm Details', description: 'Review booking' },
                { label: 'Payment', description: 'Complete transaction' },
                { label: 'Confirmation', description: 'Booking confirmed' }
              ]}
              currentStep={2}
              onStepClick={(step) => console.log('Navigate to step:', step)}
              allowClickPrevious={true}
              orientation="horizontal"
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Vertical Steps</h4>
            <StepIndicator
              steps={[
                { label: 'Account Setup', description: 'Create your profile' },
                { label: 'Restaurant Info', description: 'Add restaurant details' },
                { label: 'Menu Upload', description: 'Upload your menu' },
                { label: 'Verification', description: 'Verify your listing' }
              ]}
              currentStep={1}
              onStepClick={(step) => console.log('Navigate to step:', step)}
              orientation="vertical"
            />
          </div>
        </div>
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
            {activeSection === 'dish' && renderDishSection()}
            {activeSection === 'ranking' && renderRankingSection()}
            {activeSection === 'rankings' && renderRankingsSection()}
            {activeSection === 'restaurant' && renderRestaurantSection()}
            {activeSection === 'charts' && renderChartsSection()}
            {activeSection === 'dialogs' && renderDialogsSection()}
            {activeSection === 'feed' && renderFeedSection()}
            {activeSection === 'location' && renderLocationSection()}
            {activeSection === 'statistics' && renderStatisticsSection()}
            {activeSection === 'chat' && renderChatSection()}
            {activeSection === 'date-picker' && renderDatePickerSection()}
            {activeSection === 'user-profile' && renderUserProfileSection()}
            {activeSection === 'notifications' && renderNotificationsSection()}
            {activeSection === 'search' && renderSearchSection()}
            {activeSection === 'filters' && renderFiltersSection()}
            {activeSection === 'maps' && renderMapsSection()}
            {activeSection === 'social' && renderSocialSection()}
            {activeSection === 'reviews' && renderReviewsSection()}
            {activeSection === 'comments' && renderCommentsSection()}
            {activeSection === 'forms' && renderFormsSection()}
            {activeSection === 'gallery' && renderGallerySection()}
            {activeSection === 'modals' && renderModalsSection()}
            {activeSection === 'tables' && renderTablesSection()}
            {activeSection === 'booking' && renderBookingSection()}
            {activeSection === 'payment' && renderPaymentSection()}
            {activeSection === 'dashboard' && renderDashboardSection()}
            {activeSection === 'cards' && renderCardsSection()}
            {activeSection === 'widgets' && renderWidgetsSection()}
            {activeSection === 'navigation' && renderNavigationSection()}
            {activeSection === 'layout' && renderLayoutSection()}
            {activeSection === 'media' && renderMediaSection()}
            {activeSection === 'feedback' && renderFeedbackSection()}
            {activeSection === 'progress' && renderProgressSection()}
            {activeSection === 'alerts' && renderAlertsSection()}
            {activeSection === 'tooltips' && renderTooltipsSection()}
            {activeSection === 'tabs' && renderTabsSection()}
            {activeSection === 'accordion' && renderAccordionSection()}
            {activeSection === 'carousel' && renderCarouselSection()}
            {activeSection === 'dropdowns' && renderDropdownsSection()}
            {activeSection === 'skeleton' && renderSkeletonSection()}
            {activeSection === 'badges' && renderBadgesSection()}
            {activeSection === 'empty' && renderEmptySection()}
            {activeSection === 'steps' && renderStepsSection()}
          </div>
        </div>
      </div>
    </AnalyticsProvider>
  );
};

// Main component with client-side only rendering
const TestFeatureComponents = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Feature Components Test...</p>
        </div>
      </div>
    );
  }

  return <ClientOnlyTestFeatureComponents />;
};

export default TestFeatureComponents;

// Force client-side rendering to avoid SSR issues with auth context
export async function getServerSideProps() {
  return {
    props: {},
  };
}
