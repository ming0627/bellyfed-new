/**
 * Dynamic Dish Ranking Component
 * 
 * Displays real-time dish rankings with interactive features.
 * Shows trending dishes, user rankings, and dynamic updates.
 * 
 * Features:
 * - Real-time ranking updates
 * - Multiple ranking types (global, local, personal)
 * - Interactive voting and rating
 * - Animated transitions
 * - Filtering and sorting options
 * - Responsive design
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'
import { rankingService } from '../services/rankingService.js'

const DynamicDishRanking = ({
  rankingType = 'global', // 'global', 'local', 'personal', 'trending'
  location = null,
  timeframe = '7d', // '24h', '7d', '30d', 'all'
  maxItems = 10,
  showVoting = true,
  showTrends = true,
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  className = ''
}) => {
  // State
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userVotes, setUserVotes] = useState({})
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Load rankings
  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock ranking data (in real app, would fetch from API)
        const mockRankings = [
          {
            id: 'dish_1',
            name: 'Nasi Lemak',
            description: 'Traditional Malaysian coconut rice with sambal',
            category: 'Malaysian',
            image: '/images/dishes/nasi-lemak.jpg',
            rank: 1,
            previousRank: 2,
            score: 9.2,
            totalVotes: 1547,
            upvotes: 1398,
            downvotes: 149,
            trend: 'up',
            trendChange: 1,
            restaurants: 89,
            averagePrice: 12.50,
            userVote: null
          },
          {
            id: 'dish_2',
            name: 'Char Kway Teow',
            description: 'Stir-fried rice noodles with prawns and Chinese sausage',
            category: 'Chinese',
            image: '/images/dishes/char-kway-teow.jpg',
            rank: 2,
            previousRank: 1,
            score: 9.0,
            totalVotes: 1234,
            upvotes: 1111,
            downvotes: 123,
            trend: 'down',
            trendChange: -1,
            restaurants: 67,
            averagePrice: 15.00,
            userVote: 'up'
          },
          {
            id: 'dish_3',
            name: 'Rendang',
            description: 'Slow-cooked beef in coconut milk and spices',
            category: 'Malaysian',
            image: '/images/dishes/rendang.jpg',
            rank: 3,
            previousRank: 4,
            score: 8.8,
            totalVotes: 987,
            upvotes: 876,
            downvotes: 111,
            trend: 'up',
            trendChange: 1,
            restaurants: 45,
            averagePrice: 18.00,
            userVote: null
          },
          {
            id: 'dish_4',
            name: 'Laksa',
            description: 'Spicy noodle soup with coconut milk',
            category: 'Malaysian',
            image: '/images/dishes/laksa.jpg',
            rank: 4,
            previousRank: 3,
            score: 8.6,
            totalVotes: 856,
            upvotes: 742,
            downvotes: 114,
            trend: 'down',
            trendChange: -1,
            restaurants: 52,
            averagePrice: 14.50,
            userVote: 'down'
          },
          {
            id: 'dish_5',
            name: 'Satay',
            description: 'Grilled skewered meat with peanut sauce',
            category: 'Malaysian',
            image: '/images/dishes/satay.jpg',
            rank: 5,
            previousRank: 5,
            score: 8.4,
            totalVotes: 723,
            upvotes: 634,
            downvotes: 89,
            trend: 'stable',
            trendChange: 0,
            restaurants: 78,
            averagePrice: 16.00,
            userVote: null
          }
        ]

        setRankings(mockRankings.slice(0, maxItems))
        setLastUpdate(new Date())

        // Track ranking view
        trackUserEngagement('ranking', 'view', rankingType, {
          timeframe: selectedTimeframe,
          category: selectedCategory,
          itemCount: mockRankings.length
        })
      } catch (err) {
        console.error('Error loading rankings:', err)
        setError(err.message || 'Failed to load rankings')
      } finally {
        setLoading(false)
      }
    }

    loadRankings()
  }, [rankingType, selectedTimeframe, selectedCategory, maxItems, trackUserEngagement])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate real-time updates by slightly modifying scores
      setRankings(prev => prev.map(dish => ({
        ...dish,
        score: Math.max(0, dish.score + (Math.random() - 0.5) * 0.1),
        totalVotes: dish.totalVotes + Math.floor(Math.random() * 3)
      })))
      setLastUpdate(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Handle vote
  const handleVote = async (dishId, voteType) => {
    if (!isAuthenticated) {
      alert('Please sign in to vote')
      return
    }

    try {
      // Update local state immediately for better UX
      setUserVotes(prev => ({ ...prev, [dishId]: voteType }))
      
      setRankings(prev => prev.map(dish => {
        if (dish.id === dishId) {
          const newUpvotes = voteType === 'up' ? dish.upvotes + 1 : dish.upvotes
          const newDownvotes = voteType === 'down' ? dish.downvotes + 1 : dish.downvotes
          const newTotal = newUpvotes + newDownvotes
          const newScore = newTotal > 0 ? (newUpvotes / newTotal) * 10 : dish.score

          return {
            ...dish,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            totalVotes: newTotal,
            score: newScore,
            userVote: voteType
          }
        }
        return dish
      }))

      // Track vote
      trackUserEngagement('dish', dishId, 'vote', {
        voteType,
        rankingType,
        source: 'dynamic_ranking'
      })

      // In real app, would call API
      // await rankingService.submitVote(dishId, voteType)
    } catch (err) {
      console.error('Error submitting vote:', err)
      // Revert local state on error
      setUserVotes(prev => {
        const updated = { ...prev }
        delete updated[dishId]
        return updated
      })
    }
  }

  // Get trend icon
  const getTrendIcon = (trend, change) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">📈 +{change}</span>
      case 'down':
        return <span className="text-red-500">📉 {change}</span>
      case 'stable':
        return <span className="text-gray-500">➡️ {change}</span>
      default:
        return null
    }
  }

  // Get ranking title
  const getRankingTitle = () => {
    switch (rankingType) {
      case 'global':
        return 'Global Dish Rankings'
      case 'local':
        return `Local Dish Rankings${location ? ` - ${location}` : ''}`
      case 'personal':
        return 'Your Personal Rankings'
      case 'trending':
        return 'Trending Dishes'
      default:
        return 'Dish Rankings'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {getRankingTitle()}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
            {autoRefresh && <span className="ml-2">🔄 Auto-refreshing</span>}
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="Malaysian">Malaysian</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Western">Western</option>
            </select>
          </div>
        )}
      </div>

      {/* Rankings List */}
      <div className="space-y-3">
        {rankings.map((dish, index) => (
          <Card
            key={dish.id}
            className={`
              p-4 transition-all duration-300 hover:shadow-md
              ${dish.rank <= 3 ? 'border-orange-200 bg-orange-50' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <div className={`
                  text-2xl font-bold
                  ${dish.rank === 1 ? 'text-yellow-500' : 
                    dish.rank === 2 ? 'text-gray-400' :
                    dish.rank === 3 ? 'text-orange-600' : 'text-gray-600'}
                `}>
                  {dish.rank === 1 ? '🥇' :
                   dish.rank === 2 ? '🥈' :
                   dish.rank === 3 ? '🥉' : `#${dish.rank}`}
                </div>
              </div>

              {/* Dish Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-dish.jpg'
                  }}
                />
              </div>

              {/* Dish Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {dish.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" size="sm">
                        {dish.category}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {dish.restaurants} restaurants
                      </span>
                      <span className="text-sm text-gray-600">
                        RM{dish.averagePrice.toFixed(2)} avg
                      </span>
                    </div>
                  </div>

                  {/* Score and Trend */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-orange-600">
                      {dish.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {dish.totalVotes} votes
                    </div>
                    {showTrends && (
                      <div className="text-xs mt-1">
                        {getTrendIcon(dish.trend, dish.trendChange)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Voting */}
              {showVoting && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    variant={dish.userVote === 'up' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleVote(dish.id, dish.userVote === 'up' ? null : 'up')}
                    disabled={!isAuthenticated}
                    className={`
                      ${dish.userVote === 'up' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}
                      transition-colors
                    `}
                  >
                    👍 {dish.upvotes}
                  </Button>
                  <Button
                    variant={dish.userVote === 'down' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleVote(dish.id, dish.userVote === 'down' ? null : 'down')}
                    disabled={!isAuthenticated}
                    className={`
                      ${dish.userVote === 'down' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50'}
                      transition-colors
                    `}
                  >
                    👎 {dish.downvotes}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Authentication Prompt */}
      {!isAuthenticated && showVoting && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
          <p className="text-orange-800">
            <a href="/signin" className="font-medium underline hover:no-underline">
              Sign in
            </a> to vote and influence the rankings!
          </p>
        </div>
      )}
    </div>
  )
}

export default DynamicDishRanking
