/**
 * My Foodie Leaderboard Component
 * 
 * Displays personalized leaderboard showing user's ranking among friends and local foodies.
 * Shows various ranking categories and achievement progress.
 * 
 * Features:
 * - Personal ranking position
 * - Multiple leaderboard categories
 * - Friend comparisons
 * - Achievement tracking
 * - Progress visualization
 * - Social sharing
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'
import { rankingService } from '../services/rankingService.js'

const MyFoodieLeaderboard = ({
  showCategories = ['overall', 'reviews', 'discoveries', 'social'],
  showFriends = true,
  showLocal = true,
  showAchievements = true,
  maxRankings = 10,
  className = ''
}) => {
  // State
  const [activeCategory, setActiveCategory] = useState('overall')
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Categories configuration
  const categories = {
    overall: {
      name: 'Overall Ranking',
      icon: '🏆',
      description: 'Your overall foodie score',
      metric: 'Total Points'
    },
    reviews: {
      name: 'Review Master',
      icon: '📝',
      description: 'Most helpful reviews',
      metric: 'Reviews Written'
    },
    discoveries: {
      name: 'Food Explorer',
      icon: '🗺️',
      description: 'New restaurant discoveries',
      metric: 'Places Discovered'
    },
    social: {
      name: 'Social Foodie',
      icon: '👥',
      description: 'Community engagement',
      metric: 'Social Score'
    }
  }

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Mock leaderboard data (in real app, would fetch from API)
        const mockLeaderboardData = {
          overall: {
            userRank: 23,
            totalUsers: 1547,
            userScore: 2840,
            rankings: [
              {
                rank: 1,
                user: { id: 'user_1', name: 'Sarah Chen', avatar: '/images/avatars/sarah.jpg' },
                score: 4250,
                isFriend: true
              },
              {
                rank: 2,
                user: { id: 'user_2', name: 'Ahmad Rahman', avatar: '/images/avatars/ahmad.jpg' },
                score: 4100,
                isFriend: false
              },
              {
                rank: 3,
                user: { id: 'user_3', name: 'Lisa Wong', avatar: '/images/avatars/lisa.jpg' },
                score: 3950,
                isFriend: true
              },
              {
                rank: 22,
                user: { id: 'user_22', name: 'David Tan', avatar: '/images/avatars/david.jpg' },
                score: 2860,
                isFriend: true
              },
              {
                rank: 23,
                user: { id: user?.id, name: user?.name, avatar: user?.avatar },
                score: 2840,
                isCurrentUser: true
              },
              {
                rank: 24,
                user: { id: 'user_24', name: 'Emily Lim', avatar: '/images/avatars/emily.jpg' },
                score: 2820,
                isFriend: false
              }
            ]
          },
          reviews: {
            userRank: 15,
            totalUsers: 1547,
            userScore: 89,
            rankings: [
              {
                rank: 1,
                user: { id: 'user_1', name: 'Sarah Chen', avatar: '/images/avatars/sarah.jpg' },
                score: 156,
                isFriend: true
              },
              {
                rank: 14,
                user: { id: 'user_14', name: 'Mike Johnson', avatar: '/images/avatars/mike.jpg' },
                score: 92,
                isFriend: false
              },
              {
                rank: 15,
                user: { id: user?.id, name: user?.name, avatar: user?.avatar },
                score: 89,
                isCurrentUser: true
              },
              {
                rank: 16,
                user: { id: 'user_16', name: 'Anna Lee', avatar: '/images/avatars/anna.jpg' },
                score: 87,
                isFriend: true
              }
            ]
          }
        }

        // Mock user stats
        const mockUserStats = {
          totalPoints: 2840,
          reviewsWritten: 89,
          placesDiscovered: 45,
          socialScore: 156,
          achievements: [
            { id: 'reviewer', name: 'Review Master', progress: 89, target: 100, icon: '📝' },
            { id: 'explorer', name: 'Food Explorer', progress: 45, target: 50, icon: '🗺️' },
            { id: 'social', name: 'Social Butterfly', progress: 156, target: 200, icon: '👥' }
          ],
          weeklyProgress: {
            points: 120,
            reviews: 5,
            discoveries: 2
          }
        }

        setLeaderboardData(mockLeaderboardData)
        setUserStats(mockUserStats)

        // Track leaderboard view
        trackUserEngagement('leaderboard', 'view', activeCategory, {
          userRank: mockLeaderboardData[activeCategory]?.userRank
        })
      } catch (err) {
        console.error('Error loading leaderboard:', err)
        setError(err.message || 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboardData()
  }, [activeCategory, isAuthenticated, user, trackUserEngagement])

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    trackUserEngagement('leaderboard', 'category_change', category)
  }

  // Handle user profile click
  const handleUserClick = (userId) => {
    trackUserEngagement('user', userId, 'view_from_leaderboard', {
      category: activeCategory
    })
    window.location.href = `/profile/${userId}`
  }

  // Get rank badge color
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-orange-600 text-white'
    if (rank <= 10) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Get rank icon
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (!isAuthenticated) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Join the Foodie Leaderboard
        </h3>
        <p className="text-gray-600 mb-4">
          Sign in to see your ranking and compete with other food lovers!
        </p>
        <Button onClick={() => window.location.href = '/signin'}>
          Sign In
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading leaderboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  const currentCategoryData = leaderboardData[activeCategory]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          My Foodie Leaderboard
        </h2>
        <p className="text-gray-600">
          See how you rank among fellow food enthusiasts
        </p>
      </div>

      {/* User Stats Overview */}
      {userStats && (
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userStats.totalPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userStats.reviewsWritten}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userStats.placesDiscovered}
              </div>
              <div className="text-sm text-gray-600">Discoveries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                #{currentCategoryData?.userRank}
              </div>
              <div className="text-sm text-gray-600">Overall Rank</div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="mt-4 pt-4 border-t border-orange-200">
            <h4 className="font-medium text-gray-900 mb-2">This Week</h4>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">+{userStats.weeklyProgress.points} points</span>
              <span className="text-blue-600">+{userStats.weeklyProgress.reviews} reviews</span>
              <span className="text-purple-600">+{userStats.weeklyProgress.discoveries} discoveries</span>
            </div>
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {showCategories.map((categoryKey) => {
          const category = categories[categoryKey]
          return (
            <Button
              key={categoryKey}
              variant={activeCategory === categoryKey ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(categoryKey)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          )
        })}
      </div>

      {/* Current Category Info */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {categories[activeCategory].name}
            </h3>
            <p className="text-sm text-gray-600">
              {categories[activeCategory].description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">
              #{currentCategoryData?.userRank}
            </div>
            <div className="text-sm text-gray-600">
              of {currentCategoryData?.totalUsers.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {categories[activeCategory].name} Leaderboard
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentCategoryData?.rankings.map((entry) => (
            <div
              key={entry.rank}
              className={`
                p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors
                ${entry.isCurrentUser ? 'bg-orange-50 border-l-4 border-orange-500' : ''}
              `}
            >
              {/* Rank */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                ${getRankBadgeColor(entry.rank)}
              `}>
                {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
              </div>

              {/* User Info */}
              <div
                className="flex-1 flex items-center gap-3 cursor-pointer"
                onClick={() => !entry.isCurrentUser && handleUserClick(entry.user.id)}
              >
                <img
                  src={entry.user.avatar || '/images/placeholder-avatar.jpg'}
                  alt={entry.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium truncate ${
                      entry.isCurrentUser ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {entry.isCurrentUser ? 'You' : entry.user.name}
                    </h4>
                    {entry.isFriend && (
                      <Badge variant="secondary" size="sm">Friend</Badge>
                    )}
                    {entry.isCurrentUser && (
                      <Badge variant="warning" size="sm">You</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {categories[activeCategory].metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements */}
      {showAchievements && userStats?.achievements && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Achievement Progress
          </h3>
          <div className="space-y-4">
            {userStats.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">
                      {achievement.name}
                    </h4>
                    <span className="text-sm text-gray-600">
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => window.location.href = '/explore'}
          className="flex-1"
        >
          🗺️ Explore More Restaurants
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/social'}
          className="flex-1"
        >
          👥 Connect with Friends
        </Button>
      </div>
    </div>
  )
}

export default MyFoodieLeaderboard
