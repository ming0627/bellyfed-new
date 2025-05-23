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
    { id: 'comments', title: 'Comment Components', icon: '💬' }
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
          </div>
        </div>
      </div>
    </AnalyticsProvider>
  );
};

export default TestFeatureComponents;
