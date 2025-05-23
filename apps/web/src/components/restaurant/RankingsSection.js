/**
 * Restaurant Rankings Section Component
 * 
 * Displays restaurant rankings and leaderboards for dishes, reviews, and overall performance.
 * Shows competitive rankings and user achievements.
 * 
 * Features:
 * - Restaurant overall ranking
 * - Top dishes ranking
 * - User rankings and reviews
 * - Competitive leaderboards
 * - Achievement badges
 * - Ranking history and trends
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { rankingService } from '../../services/rankingService.js'

const RankingsSection = ({
  restaurantId,
  showOverallRanking = true,
  showDishRankings = true,
  showUserRankings = true,
  showTrends = true,
  maxItems = 10,
  className = ''
}) => {
  // State
  const [rankings, setRankings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overall')

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Ranking tabs
  const tabs = {
    overall: { name: 'Overall', icon: '🏆' },
    dishes: { name: 'Top Dishes', icon: '🍽️' },
    reviewers: { name: 'Top Reviewers', icon: '⭐' },
    trends: { name: 'Trends', icon: '📈' }
  }

  // Load rankings data
  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock rankings data (in real app, would fetch from API)
        const mockRankings = {
          overall: {
            position: 3,
            totalRestaurants: 150,
            score: 4.5,
            category: 'Malaysian Cuisine',
            cityRank: 3,
            nationalRank: 15,
            badges: ['Top Rated', 'Customer Favorite', 'Best Value'],
            trend: 'up',
            previousPosition: 5
          },
          topDishes: [
            {
              id: 'dish_1',
              name: 'Nasi Lemak Special',
              rank: 1,
              rating: 4.8,
              reviewCount: 234,
              image: '/images/dishes/nasi-lemak-special.jpg',
              trend: 'up',
              previousRank: 2
            },
            {
              id: 'dish_2',
              name: 'Rendang Beef',
              rank: 2,
              rating: 4.7,
              reviewCount: 189,
              image: '/images/dishes/rendang-beef.jpg',
              trend: 'stable',
              previousRank: 2
            },
            {
              id: 'dish_3',
              name: 'Char Kway Teow',
              rank: 3,
              rating: 4.6,
              reviewCount: 156,
              image: '/images/dishes/char-kway-teow.jpg',
              trend: 'down',
              previousRank: 1
            }
          ],
          topReviewers: [
            {
              id: 'user_1',
              name: 'Sarah Chen',
              avatar: '/images/avatars/sarah.jpg',
              reviewCount: 45,
              averageRating: 4.2,
              helpfulVotes: 234,
              badges: ['Top Reviewer', 'Verified Foodie'],
              joinDate: '2023-01-15'
            },
            {
              id: 'user_2',
              name: 'Ahmad Rahman',
              avatar: '/images/avatars/ahmad.jpg',
              reviewCount: 38,
              averageRating: 4.5,
              helpfulVotes: 189,
              badges: ['Local Expert'],
              joinDate: '2023-03-20'
            },
            {
              id: 'user_3',
              name: 'Lisa Wong',
              avatar: '/images/avatars/lisa.jpg',
              reviewCount: 32,
              averageRating: 4.3,
              helpfulVotes: 167,
              badges: ['Rising Star'],
              joinDate: '2023-06-10'
            }
          ],
          trends: {
            monthlyGrowth: 15.2,
            reviewGrowth: 23.5,
            ratingTrend: 'improving',
            popularTimes: ['12:00-14:00', '19:00-21:00'],
            seasonalTrends: [
              { month: 'Jan', rating: 4.2, reviews: 45 },
              { month: 'Feb', rating: 4.3, reviews: 52 },
              { month: 'Mar', rating: 4.4, reviews: 48 },
              { month: 'Apr', rating: 4.5, reviews: 61 },
              { month: 'May', rating: 4.5, reviews: 58 },
              { month: 'Jun', rating: 4.6, reviews: 67 }
            ]
          }
        }

        setRankings(mockRankings)

        // Track rankings view
        trackUserEngagement('restaurant', restaurantId, 'rankings_view', {
          tab: activeTab
        })
      } catch (err) {
        console.error('Error loading rankings:', err)
        setError(err.message || 'Failed to load rankings')
      } finally {
        setLoading(false)
      }
    }

    loadRankings()
  }, [restaurantId, activeTab, trackUserEngagement])

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    trackUserEngagement('restaurant', restaurantId, 'rankings_tab_change', {
      tab
    })
  }

  // Get trend indicator
  const getTrendIndicator = (trend, previousValue, currentValue) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">📈 +{Math.abs(previousValue - currentValue)}</span>
      case 'down':
        return <span className="text-red-500">📉 -{Math.abs(previousValue - currentValue)}</span>
      case 'stable':
        return <span className="text-gray-500">➡️ No change</span>
      default:
        return null
    }
  }

  // Get rank suffix
  const getRankSuffix = (rank) => {
    if (rank % 10 === 1 && rank % 100 !== 11) return 'st'
    if (rank % 10 === 2 && rank % 100 !== 12) return 'nd'
    if (rank % 10 === 3 && rank % 100 !== 13) return 'rd'
    return 'th'
  }

  // Render tab content
  const renderTabContent = () => {
    if (!rankings) return null

    switch (activeTab) {
      case 'overall':
        return (
          <div className="space-y-6">
            {/* Overall Ranking Card */}
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  #{rankings.overall.position}
                </div>
                <div className="text-lg text-gray-700 mb-4">
                  out of {rankings.overall.totalRestaurants} restaurants
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-semibold">{rankings.overall.score}</span>
                  <span className="text-gray-600">overall rating</span>
                </div>
                {getTrendIndicator(rankings.overall.trend, rankings.overall.previousPosition, rankings.overall.position)}
              </div>
            </Card>

            {/* Ranking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Regional Rankings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">City Rank:</span>
                    <span className="font-medium">#{rankings.overall.cityRank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">National Rank:</span>
                    <span className="font-medium">#{rankings.overall.nationalRank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{rankings.overall.category}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rankings.overall.badges.map((badge) => (
                    <Badge key={badge} variant="success" className="flex items-center gap-1">
                      🏆 {badge}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )

      case 'dishes':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Ranked Dishes
            </h3>
            {rankings.topDishes.map((dish) => (
              <Card key={dish.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-orange-600 w-8">
                    #{dish.rank}
                  </div>
                  
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.jpg'
                    }}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{dish.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium">{dish.rating}</span>
                        <span className="text-gray-500">({dish.reviewCount})</span>
                      </div>
                      {getTrendIndicator(dish.trend, dish.previousRank, dish.rank)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )

      case 'reviewers':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Reviewers
            </h3>
            {rankings.topReviewers.map((reviewer, index) => (
              <Card key={reviewer.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-orange-600 w-8">
                    #{index + 1}
                  </div>
                  
                  <img
                    src={reviewer.avatar}
                    alt={reviewer.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-avatar.jpg'
                    }}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{reviewer.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{reviewer.reviewCount} reviews</span>
                      <span>⭐ {reviewer.averageRating}</span>
                      <span>👍 {reviewer.helpfulVotes} helpful</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reviewer.badges.map((badge) => (
                        <Badge key={badge} variant="outline" size="sm">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )

      case 'trends':
        return (
          <div className="space-y-6">
            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{rankings.trends.monthlyGrowth}%
                </div>
                <div className="text-sm text-gray-600">Monthly Growth</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  +{rankings.trends.reviewGrowth}%
                </div>
                <div className="text-sm text-gray-600">Review Growth</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {rankings.trends.ratingTrend === 'improving' ? '📈' : '📉'}
                </div>
                <div className="text-sm text-gray-600">Rating Trend</div>
              </Card>
            </div>

            {/* Popular Times */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Times
              </h3>
              <div className="flex flex-wrap gap-2">
                {rankings.trends.popularTimes.map((time) => (
                  <Badge key={time} variant="secondary">
                    🕐 {time}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Seasonal Trends Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                6-Month Performance
              </h3>
              <div className="space-y-3">
                {rankings.trends.seasonalTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {trend.month}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(trend.rating / 5) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium w-8">
                      {trend.rating}
                    </div>
                    <div className="text-sm text-gray-500 w-16">
                      {trend.reviews} reviews
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading rankings...</span>
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rankings & Performance
        </h2>
        <p className="text-gray-600">
          See how this restaurant ranks among competitors
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {Object.entries(tabs).map(([key, tab]) => {
            // Hide certain tabs based on props
            if (key === 'overall' && !showOverallRanking) return null
            if (key === 'dishes' && !showDishRankings) return null
            if (key === 'reviewers' && !showUserRankings) return null
            if (key === 'trends' && !showTrends) return null
            
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === key 
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default RankingsSection
