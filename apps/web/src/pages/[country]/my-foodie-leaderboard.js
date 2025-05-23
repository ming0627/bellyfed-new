import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Trophy,
  Star,
  TrendingUp,
  Users,
  Medal,
  Crown,
  Target,
  Calendar,
  Award,
  ChefHat,
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.js'

export default function MyFoodieLeaderboardPage() {
  const router = useRouter()
  const { country } = router.query
  const { user, isAuthenticated } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [activeCategory, setActiveCategory] = useState('overall')
  const [timeframe, setTimeframe] = useState('monthly')
  const [isLoading, setIsLoading] = useState(true)

  // Mock leaderboard data
  useEffect(() => {
    if (isAuthenticated) {
      const mockData = {
        userStats: {
          currentRank: 23,
          totalUsers: 1247,
          points: 2840,
          level: 'Food Explorer',
          nextLevel: 'Culinary Connoisseur',
          pointsToNext: 160,
          badges: ['First Review', 'Photo Master', 'Local Expert', 'Trend Setter'],
          achievements: {
            reviewsWritten: 47,
            photosUploaded: 89,
            restaurantsVisited: 34,
            helpfulVotes: 156,
            followersGained: 23
          }
        },
        categories: {
          overall: {
            title: 'Overall Ranking',
            description: 'Based on all foodie activities',
            leaderboard: [
              { rank: 1, user: 'FoodieKing', points: 8950, level: 'Master Chef', avatar: '👑', change: 0 },
              { rank: 2, user: 'CulinaryQueen', points: 8720, level: 'Master Chef', avatar: '🍳', change: 1 },
              { rank: 3, user: 'TasteExplorer', points: 8450, level: 'Culinary Connoisseur', avatar: '🌟', change: -1 },
              { rank: 4, user: 'FlavorHunter', points: 7890, level: 'Culinary Connoisseur', avatar: '🔍', change: 2 },
              { rank: 5, user: 'DishCritic', points: 7650, level: 'Culinary Connoisseur', avatar: '📝', change: 0 },
              // ... more users
              { rank: 23, user: user?.name || 'You', points: 2840, level: 'Food Explorer', avatar: '🍽️', change: 3, isCurrentUser: true }
            ]
          },
          reviews: {
            title: 'Review Masters',
            description: 'Top reviewers by quality and quantity',
            leaderboard: [
              { rank: 1, user: 'ReviewGuru', points: 450, metric: 'reviews', avatar: '📝', change: 0 },
              { rank: 2, user: 'CriticPro', points: 423, metric: 'reviews', avatar: '⭐', change: 1 },
              { rank: 3, user: 'TasteTester', points: 398, metric: 'reviews', avatar: '👅', change: -1 },
              // ... more users
              { rank: 15, user: user?.name || 'You', points: 47, metric: 'reviews', avatar: '🍽️', change: 2, isCurrentUser: true }
            ]
          },
          photos: {
            title: 'Photo Champions',
            description: 'Best food photographers',
            leaderboard: [
              { rank: 1, user: 'PhotoFoodie', points: 892, metric: 'photos', avatar: '📸', change: 0 },
              { rank: 2, user: 'SnapMaster', points: 756, metric: 'photos', avatar: '📷', change: 1 },
              { rank: 3, user: 'VisualTaste', points: 689, metric: 'photos', avatar: '🎨', change: -1 },
              // ... more users
              { rank: 8, user: user?.name || 'You', points: 89, metric: 'photos', avatar: '🍽️', change: 5, isCurrentUser: true }
            ]
          },
          discoveries: {
            title: 'Discovery Leaders',
            description: 'First to find new restaurants',
            leaderboard: [
              { rank: 1, user: 'ScoutMaster', points: 234, metric: 'discoveries', avatar: '🔍', change: 0 },
              { rank: 2, user: 'NewPlaceFinder', points: 198, metric: 'discoveries', avatar: '🗺️', change: 1 },
              { rank: 3, user: 'ExploreMore', points: 176, metric: 'discoveries', avatar: '🧭', change: -1 },
              // ... more users
              { rank: 12, user: user?.name || 'You', points: 34, metric: 'discoveries', avatar: '🍽️', change: 1, isCurrentUser: true }
            ]
          }
        },
        recentActivity: [
          { type: 'rank_up', message: 'You moved up 3 positions in Overall Ranking!', time: '2 hours ago' },
          { type: 'badge', message: 'You earned the "Photo Master" badge!', time: '1 day ago' },
          { type: 'achievement', message: 'You reached 150+ helpful votes!', time: '3 days ago' }
        ]
      }

      // Simulate API call
      setTimeout(() => {
        setLeaderboardData(mockData)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const refreshLeaderboard = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Sign In to View Leaderboard
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Join the foodie community and compete with other food lovers!
          </p>
          <div className="space-x-4">
            <Link
              href="/signin"
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const currentCategory = leaderboardData.categories[activeCategory]
  const userStats = leaderboardData.userStats

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 mb-6">
            <Link href={`/${country}`} className="hover:text-orange-800 dark:hover:text-orange-200">
              {country}
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">My Foodie Leaderboard</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <Trophy className="w-12 h-12 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    Foodie Leaderboard
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    Compete with food lovers in {country}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
                <option value="alltime">All Time</option>
              </select>
              <button
                onClick={refreshLeaderboard}
                className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl mr-4">
                🍽️
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'Food Explorer'}</h2>
                <p className="text-orange-100">Level: {userStats.level}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm">Rank #{userStats.currentRank} of {userStats.totalUsers.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.points.toLocaleString()}</div>
              <div className="text-orange-100">Total Points</div>
              <div className="text-sm mt-2">
                {userStats.pointsToNext} points to {userStats.nextLevel}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((userStats.points % 1000) / 1000) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {Object.entries(userStats.achievements).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-orange-100 text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 mb-8">
          <div className="flex overflow-x-auto">
            {Object.entries(leaderboardData.categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex-shrink-0 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeCategory === key
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{category.title}</div>
                  <div className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                    {category.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800">
              <div className="p-6 border-b border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  {currentCategory.title}
                </h3>
                <p className="text-orange-600 dark:text-orange-400 text-sm">
                  {currentCategory.description}
                </p>
              </div>

              <div className="divide-y divide-orange-200 dark:divide-orange-800">
                {currentCategory.leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-4 flex items-center justify-between ${
                      entry.isCurrentUser ? 'bg-orange-50 dark:bg-orange-800' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                        entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-orange-50 text-orange-600 dark:bg-orange-800 dark:text-orange-400'
                      }`}>
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? <Crown className="w-4 h-4" /> :
                          entry.rank === 2 ? <Medal className="w-4 h-4" /> :
                          <Award className="w-4 h-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>

                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{entry.avatar}</span>
                        <div>
                          <div className={`font-medium ${
                            entry.isCurrentUser
                              ? 'text-orange-900 dark:text-orange-100'
                              : 'text-orange-800 dark:text-orange-200'
                          }`}>
                            {entry.user}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          {entry.level && (
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                              {entry.level}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="text-right mr-3">
                        <div className="font-semibold text-orange-900 dark:text-orange-100">
                          {entry.points.toLocaleString()}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          {entry.metric || 'points'}
                        </div>
                      </div>

                      {entry.change !== 0 && (
                        <div className={`flex items-center text-sm ${
                          entry.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`w-4 h-4 mr-1 ${
                            entry.change < 0 ? 'rotate-180' : ''
                          }`} />
                          {Math.abs(entry.change)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {leaderboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      activity.type === 'rank_up' ? 'bg-green-500' :
                      activity.type === 'badge' ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="text-orange-900 dark:text-orange-100 text-sm">
                        {activity.message}
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 text-xs">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Your Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {userStats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg"
                  >
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-xs font-medium text-orange-900 dark:text-orange-100">
                      {badge}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Boost Your Ranking
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/${country}/restaurants`}
                  className="flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <ChefHat className="w-5 h-5 text-orange-500 mr-3" />
                  <span className="text-orange-900 dark:text-orange-100 text-sm font-medium">
                    Write Reviews
                  </span>
                </Link>
                <Link
                  href={`/${country}/explore`}
                  className="flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <MapPin className="w-5 h-5 text-orange-500 mr-3" />
                  <span className="text-orange-900 dark:text-orange-100 text-sm font-medium">
                    Discover Places
                  </span>
                </Link>
                <Link
                  href={`/${country}/social`}
                  className="flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <Users className="w-5 h-5 text-orange-500 mr-3" />
                  <span className="text-orange-900 dark:text-orange-100 text-sm font-medium">
                    Share Photos
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
