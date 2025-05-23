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
  ChefHat,
  MapPin,
  Filter,
  Calendar,
  Award,
  Eye,
  ThumbsUp,
  MessageSquare
} from 'lucide-react'

export default function RankingPage() {
  const router = useRouter()
  const { country } = router.query
  const [activeCategory, setActiveCategory] = useState('restaurants')
  const [timeframe, setTimeframe] = useState('monthly')
  const [rankingData, setRankingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock ranking data
  useEffect(() => {
    const mockData = {
      restaurants: {
        title: 'Top Restaurants',
        description: 'Best restaurants based on reviews and ratings',
        rankings: [
          {
            rank: 1,
            name: 'The Golden Spoon',
            location: 'Downtown',
            cuisine: 'Italian',
            rating: 4.9,
            reviews: 1247,
            image: '/images/golden-spoon.jpg',
            change: 0,
            badges: ['Top Rated', 'Trending']
          },
          {
            rank: 2,
            name: 'Ocean Breeze',
            location: 'Waterfront',
            cuisine: 'Seafood',
            rating: 4.8,
            reviews: 892,
            image: '/images/ocean-breeze.jpg',
            change: 1,
            badges: ['Rising Star']
          },
          {
            rank: 3,
            name: 'Spice Garden',
            location: 'Little India',
            cuisine: 'Indian',
            rating: 4.7,
            reviews: 756,
            image: '/images/spice-garden.jpg',
            change: -1,
            badges: ['Local Favorite']
          },
          {
            rank: 4,
            name: 'Burger Palace',
            location: 'City Center',
            cuisine: 'American',
            rating: 4.6,
            reviews: 634,
            image: '/images/burger-palace.jpg',
            change: 2,
            badges: ['Best Value']
          },
          {
            rank: 5,
            name: 'Sushi Zen',
            location: 'Japantown',
            cuisine: 'Japanese',
            rating: 4.6,
            reviews: 523,
            image: '/images/sushi-zen.jpg',
            change: 0,
            badges: ['Authentic']
          }
        ]
      },
      dishes: {
        title: 'Top Dishes',
        description: 'Most popular dishes across all restaurants',
        rankings: [
          {
            rank: 1,
            name: 'Truffle Pasta',
            restaurant: 'The Golden Spoon',
            cuisine: 'Italian',
            rating: 4.9,
            orders: 2340,
            price: 28,
            change: 0,
            badges: ['Signature Dish']
          },
          {
            rank: 2,
            name: 'Lobster Thermidor',
            restaurant: 'Ocean Breeze',
            cuisine: 'Seafood',
            rating: 4.8,
            orders: 1890,
            price: 45,
            change: 1,
            badges: ['Premium']
          },
          {
            rank: 3,
            name: 'Butter Chicken',
            restaurant: 'Spice Garden',
            cuisine: 'Indian',
            rating: 4.7,
            orders: 1567,
            price: 18,
            change: -1,
            badges: ['Best Value']
          },
          {
            rank: 4,
            name: 'Wagyu Burger',
            restaurant: 'Burger Palace',
            cuisine: 'American',
            rating: 4.6,
            orders: 1234,
            price: 32,
            change: 2,
            badges: ['Trending']
          },
          {
            rank: 5,
            name: 'Omakase Set',
            restaurant: 'Sushi Zen',
            cuisine: 'Japanese',
            rating: 4.6,
            orders: 987,
            price: 85,
            change: 0,
            badges: ['Chef\'s Choice']
          }
        ]
      },
      reviewers: {
        title: 'Top Reviewers',
        description: 'Most influential food reviewers in the community',
        rankings: [
          {
            rank: 1,
            name: 'FoodieKing',
            avatar: '👑',
            reviews: 342,
            followers: 1247,
            helpfulVotes: 2890,
            level: 'Master Critic',
            change: 0,
            badges: ['Verified', 'Expert']
          },
          {
            rank: 2,
            name: 'CulinaryQueen',
            avatar: '🍳',
            reviews: 298,
            followers: 1089,
            helpfulVotes: 2456,
            level: 'Food Expert',
            change: 1,
            badges: ['Rising Star']
          },
          {
            rank: 3,
            name: 'TasteExplorer',
            avatar: '🌟',
            reviews: 267,
            followers: 934,
            helpfulVotes: 2123,
            level: 'Food Expert',
            change: -1,
            badges: ['Local Guide']
          },
          {
            rank: 4,
            name: 'FlavorHunter',
            avatar: '🔍',
            reviews: 234,
            followers: 823,
            helpfulVotes: 1890,
            level: 'Food Enthusiast',
            change: 2,
            badges: ['Discoverer']
          },
          {
            rank: 5,
            name: 'DishCritic',
            avatar: '📝',
            reviews: 198,
            followers: 756,
            helpfulVotes: 1567,
            level: 'Food Enthusiast',
            change: 0,
            badges: ['Detailed']
          }
        ]
      }
    }

    // Simulate API call
    setTimeout(() => {
      setRankingData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = [
    { id: 'restaurants', label: 'Restaurants', icon: ChefHat },
    { id: 'dishes', label: 'Dishes', icon: Award },
    { id: 'reviewers', label: 'Reviewers', icon: Users }
  ]

  const timeframes = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'yearly', label: 'This Year' },
    { id: 'alltime', label: 'All Time' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading rankings...</p>
        </div>
      </div>
    )
  }

  const currentCategory = rankingData[activeCategory]

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
            <span className="text-orange-900 dark:text-orange-100">Rankings</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-orange-500 mr-3" />
              <Medal className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                {country} Food Rankings
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Discover the best restaurants, dishes, and reviewers in {country}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  1,247
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Restaurants Ranked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  5,890
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Dishes Rated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  892
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Active Reviewers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  23,456
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Total Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-orange-700 hover:bg-orange-200 dark:bg-orange-700 dark:text-orange-300 dark:hover:bg-orange-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                {timeframes.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800">
          <div className="p-6 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {currentCategory.title}
                </h2>
                <p className="text-orange-600 dark:text-orange-400">
                  {currentCategory.description}
                </p>
              </div>
              <div className="text-sm text-orange-500 dark:text-orange-400">
                Updated {timeframe === 'weekly' ? 'weekly' : timeframe === 'monthly' ? 'monthly' : 'daily'}
              </div>
            </div>
          </div>

          <div className="divide-y divide-orange-200 dark:divide-orange-800">
            {currentCategory.rankings.map((item) => (
              <div key={item.rank} className="p-6 hover:bg-orange-50 dark:hover:bg-orange-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      item.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      item.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      item.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200' :
                      'bg-orange-50 text-orange-600 dark:bg-orange-800 dark:text-orange-400'
                    }`}>
                      {item.rank <= 3 ? (
                        item.rank === 1 ? <Crown className="w-6 h-6" /> :
                        item.rank === 2 ? <Medal className="w-6 h-6" /> :
                        <Award className="w-6 h-6" />
                      ) : (
                        item.rank
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {activeCategory === 'reviewers' && (
                          <span className="text-2xl">{item.avatar}</span>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                            {item.name}
                          </h3>
                          {activeCategory === 'restaurants' && (
                            <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                              <MapPin className="w-4 h-4 mr-1" />
                              {item.location} • {item.cuisine}
                            </div>
                          )}
                          {activeCategory === 'dishes' && (
                            <div className="text-orange-600 dark:text-orange-400 text-sm">
                              {item.restaurant} • {item.cuisine}
                            </div>
                          )}
                          {activeCategory === 'reviewers' && (
                            <div className="text-orange-600 dark:text-orange-400 text-sm">
                              {item.level}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.badges.map((badge, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-sm">
                        {activeCategory === 'restaurants' && (
                          <>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                              <span className="font-medium text-orange-900 dark:text-orange-100">
                                {item.rating}
                              </span>
                            </div>
                            <div className="flex items-center text-orange-600 dark:text-orange-400">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {item.reviews} reviews
                            </div>
                          </>
                        )}
                        {activeCategory === 'dishes' && (
                          <>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                              <span className="font-medium text-orange-900 dark:text-orange-100">
                                {item.rating}
                              </span>
                            </div>
                            <div className="text-orange-600 dark:text-orange-400">
                              {item.orders} orders
                            </div>
                            <div className="font-medium text-orange-900 dark:text-orange-100">
                              ${item.price}
                            </div>
                          </>
                        )}
                        {activeCategory === 'reviewers' && (
                          <>
                            <div className="flex items-center text-orange-600 dark:text-orange-400">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {item.reviews} reviews
                            </div>
                            <div className="flex items-center text-orange-600 dark:text-orange-400">
                              <Users className="w-4 h-4 mr-1" />
                              {item.followers} followers
                            </div>
                            <div className="flex items-center text-orange-600 dark:text-orange-400">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {item.helpfulVotes} helpful
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Change Indicator */}
                  <div className="flex items-center">
                    {item.change !== 0 && (
                      <div className={`flex items-center text-sm font-medium ${
                        item.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`w-4 h-4 mr-1 ${
                          item.change < 0 ? 'rotate-180' : ''
                        }`} />
                        {Math.abs(item.change)}
                      </div>
                    )}
                    {item.change === 0 && (
                      <div className="text-orange-500 text-sm">—</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="p-6 text-center border-t border-orange-200 dark:border-orange-800">
            <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
              Load More Rankings
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <Eye className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How Rankings Work
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Our rankings are calculated using a combination of factors including user ratings, 
                review quality, popularity trends, and community engagement. Rankings are updated 
                regularly to reflect the latest data and ensure accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
