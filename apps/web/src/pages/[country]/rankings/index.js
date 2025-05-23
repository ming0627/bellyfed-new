import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Trophy, Star, TrendingUp, Users, Globe, MapPin } from 'lucide-react'

export default function RankingsIndexPage() {
  const router = useRouter()
  const { country } = router.query
  const [activeTab, setActiveTab] = useState('dishes')
  const [rankings, setRankings] = useState({
    dishes: [],
    restaurants: [],
    reviewers: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for rankings
  useEffect(() => {
    const mockRankings = {
      dishes: [
        {
          id: 1,
          name: 'Truffle Pasta',
          restaurant: 'The Golden Spoon',
          rating: 4.9,
          votes: 1247,
          rank: 1,
          change: '+2',
          image: '/images/truffle-pasta.jpg',
          cuisine: 'Italian'
        },
        {
          id: 2,
          name: 'Wagyu Burger',
          restaurant: 'Burger Palace',
          rating: 4.8,
          votes: 1156,
          rank: 2,
          change: '-1',
          image: '/images/wagyu-burger.jpg',
          cuisine: 'American'
        },
        {
          id: 3,
          name: 'Paella Valenciana',
          restaurant: 'Casa España',
          rating: 4.8,
          votes: 1089,
          rank: 3,
          change: '+1',
          image: '/images/paella.jpg',
          cuisine: 'Spanish'
        }
      ],
      restaurants: [
        {
          id: 1,
          name: 'The Golden Spoon',
          cuisine: 'Italian',
          rating: 4.9,
          reviews: 456,
          rank: 1,
          change: '0',
          location: 'Downtown',
          image: '/images/golden-spoon.jpg'
        },
        {
          id: 2,
          name: 'Casa España',
          cuisine: 'Spanish',
          rating: 4.8,
          reviews: 389,
          rank: 2,
          change: '+1',
          location: 'Spanish Quarter',
          image: '/images/casa-espana.jpg'
        },
        {
          id: 3,
          name: 'Burger Palace',
          cuisine: 'American',
          rating: 4.7,
          reviews: 567,
          rank: 3,
          change: '-1',
          location: 'Midtown',
          image: '/images/burger-palace.jpg'
        }
      ],
      reviewers: [
        {
          id: 1,
          name: 'Sarah Chen',
          username: '@sarahfoodie',
          reviews: 234,
          followers: 1567,
          rank: 1,
          change: '+1',
          avatar: '/images/sarah-avatar.jpg',
          badge: 'Elite Reviewer'
        },
        {
          id: 2,
          name: 'Mike Rodriguez',
          username: '@mikeats',
          reviews: 189,
          followers: 1234,
          rank: 2,
          change: '0',
          avatar: '/images/mike-avatar.jpg',
          badge: 'Top Contributor'
        },
        {
          id: 3,
          name: 'Emma Thompson',
          username: '@emmaeats',
          reviews: 156,
          followers: 987,
          rank: 3,
          change: '+2',
          avatar: '/images/emma-avatar.jpg',
          badge: 'Rising Star'
        }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setRankings(mockRankings)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getRankChangeIcon = (change) => {
    if (change.startsWith('+')) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (change.startsWith('-')) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
    }
    return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
  }

  const getRankChangeColor = (change) => {
    if (change.startsWith('+')) return 'text-green-600'
    if (change.startsWith('-')) return 'text-red-600'
    return 'text-gray-500'
  }

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

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                Food Rankings
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Discover the top-rated dishes, restaurants, and reviewers in {country}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-orange-100 dark:bg-orange-800 rounded-lg p-1">
              {[
                { id: 'dishes', label: 'Top Dishes', icon: Star },
                { id: 'restaurants', label: 'Top Restaurants', icon: MapPin },
                { id: 'reviewers', label: 'Top Reviewers', icon: Users }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dishes Rankings */}
        {activeTab === 'dishes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Top Dishes
              </h2>
              <Link
                href={`/${country}/rankings/global/all-dishes`}
                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 font-medium"
              >
                View All →
              </Link>
            </div>
            {rankings.dishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/${country}/dishes/${dish.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full">
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      #{dish.rank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {dish.name}
                        </h3>
                        <p className="text-orange-600 dark:text-orange-400">
                          {dish.restaurant} • {dish.cuisine}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="w-4 h-4 text-orange-500 mr-1 fill-current" />
                          <span className="font-semibold text-orange-900 dark:text-orange-100">
                            {dish.rating}
                          </span>
                        </div>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {dish.votes} votes
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRankChangeIcon(dish.change)}
                    <span className={`text-sm font-medium ${getRankChangeColor(dish.change)}`}>
                      {dish.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Restaurants Rankings */}
        {activeTab === 'restaurants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Top Restaurants
              </h2>
              <Link
                href={`/${country}/restaurants`}
                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 font-medium"
              >
                View All →
              </Link>
            </div>
            {rankings.restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/${country}/restaurants/${restaurant.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full">
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      #{restaurant.rank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {restaurant.name}
                        </h3>
                        <p className="text-orange-600 dark:text-orange-400">
                          {restaurant.cuisine} • {restaurant.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="w-4 h-4 text-orange-500 mr-1 fill-current" />
                          <span className="font-semibold text-orange-900 dark:text-orange-100">
                            {restaurant.rating}
                          </span>
                        </div>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {restaurant.reviews} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRankChangeIcon(restaurant.change)}
                    <span className={`text-sm font-medium ${getRankChangeColor(restaurant.change)}`}>
                      {restaurant.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviewers Rankings */}
        {activeTab === 'reviewers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Top Reviewers
              </h2>
              <Link
                href={`/${country}/social`}
                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 font-medium"
              >
                View All →
              </Link>
            </div>
            {rankings.reviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/profile/${reviewer.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full">
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      #{reviewer.rank}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center">
                    <span className="text-orange-700 dark:text-orange-300 font-semibold">
                      {reviewer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {reviewer.name}
                        </h3>
                        <p className="text-orange-600 dark:text-orange-400">
                          {reviewer.username} • {reviewer.badge}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-900 dark:text-orange-100">
                          {reviewer.reviews} reviews
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {reviewer.followers} followers
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRankChangeIcon(reviewer.change)}
                    <span className={`text-sm font-medium ${getRankChangeColor(reviewer.change)}`}>
                      {reviewer.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
