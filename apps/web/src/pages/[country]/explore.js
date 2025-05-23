import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Compass, 
  Star, 
  MapPin, 
  TrendingUp, 
  Heart, 
  Camera, 
  Filter,
  Search,
  Clock,
  Users,
  Award,
  Zap
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function ExplorePage() {
  const router = useRouter()
  const { country } = router.query
  const [activeTab, setActiveTab] = useState('trending')
  const [exploreData, setExploreData] = useState({
    trending: [],
    newRestaurants: [],
    topRated: [],
    nearYou: [],
    categories: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for explore page
  useEffect(() => {
    const mockExploreData = {
      trending: [
        {
          id: 1,
          type: 'restaurant',
          name: 'The Golden Spoon',
          description: 'Trending for their amazing truffle pasta',
          image: '/images/golden-spoon.jpg',
          rating: 4.9,
          reviews: 456,
          location: 'Downtown',
          trendingReason: 'Featured in Food & Wine Magazine',
          badge: 'Trending'
        },
        {
          id: 2,
          type: 'dish',
          name: 'Wagyu Burger',
          restaurant: 'Burger Palace',
          description: 'The most talked-about burger in the city',
          image: '/images/wagyu-burger.jpg',
          rating: 4.8,
          reviews: 203,
          location: 'Midtown',
          trendingReason: 'Viral on social media',
          badge: 'Viral'
        },
        {
          id: 3,
          type: 'restaurant',
          name: 'Casa España',
          description: 'Authentic Spanish tapas gaining popularity',
          image: '/images/casa-espana.jpg',
          rating: 4.7,
          reviews: 189,
          location: 'Spanish Quarter',
          trendingReason: 'Rising star in local scene',
          badge: 'Rising'
        }
      ],
      newRestaurants: [
        {
          id: 4,
          name: 'Fresh Kitchen',
          description: 'Farm-to-table concept with seasonal menu',
          image: '/images/fresh-kitchen.jpg',
          rating: 4.6,
          reviews: 23,
          location: 'Mission District',
          openedDate: '2024-01-15',
          cuisine: 'American'
        },
        {
          id: 5,
          name: 'Noodle Bar',
          description: 'Authentic ramen and Asian noodle dishes',
          image: '/images/noodle-bar.jpg',
          rating: 4.5,
          reviews: 18,
          location: 'Chinatown',
          openedDate: '2024-01-10',
          cuisine: 'Asian'
        }
      ],
      topRated: [
        {
          id: 6,
          name: 'Le Petit Bistro',
          description: 'French fine dining at its finest',
          image: '/images/petit-bistro.jpg',
          rating: 4.9,
          reviews: 567,
          location: 'French Quarter',
          cuisine: 'French',
          priceRange: '$$$'
        },
        {
          id: 7,
          name: 'Sushi Master',
          description: 'Traditional Japanese sushi experience',
          image: '/images/sushi-master.jpg',
          rating: 4.8,
          reviews: 432,
          location: 'Little Tokyo',
          cuisine: 'Japanese',
          priceRange: '$$$$'
        }
      ],
      categories: [
        { id: 1, name: 'Italian', count: 45, icon: '🍝', color: 'bg-red-500' },
        { id: 2, name: 'Asian', count: 38, icon: '🍜', color: 'bg-yellow-500' },
        { id: 3, name: 'Mexican', count: 32, icon: '🌮', color: 'bg-green-500' },
        { id: 4, name: 'American', count: 28, icon: '🍔', color: 'bg-blue-500' },
        { id: 5, name: 'French', count: 22, icon: '🥐', color: 'bg-purple-500' },
        { id: 6, name: 'Indian', count: 19, icon: '🍛', color: 'bg-orange-500' }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setExploreData(mockExploreData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Exploring amazing food...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Compass className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                Explore {country}
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Discover trending restaurants, new openings, and hidden gems
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search for restaurants, dishes, or cuisines..."
              className="text-lg"
            />
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-orange-100 dark:bg-orange-800 rounded-lg p-1">
              {[
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'new', label: 'New', icon: Zap },
                { id: 'top-rated', label: 'Top Rated', icon: Star },
                { id: 'categories', label: 'Categories', icon: Filter }
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

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending */}
        {activeTab === 'trending' && (
          <div>
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                What's Trending
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exploreData.trending.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/${country}/${item.type === 'restaurant' ? 'restaurants' : 'dishes'}/${item.id}`)}
                >
                  {/* Badge */}
                  <div className="relative">
                    <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                      <span className="text-orange-400 text-4xl">
                        {item.type === 'restaurant' ? '🏪' : '🍽️'}
                      </span>
                    </div>
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-medium text-white ${
                      item.badge === 'Trending' ? 'bg-orange-500' :
                      item.badge === 'Viral' ? 'bg-red-500' :
                      'bg-green-500'
                    }`}>
                      {item.badge}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      {item.name}
                      {item.restaurant && (
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-normal">
                          {' '}at {item.restaurant}
                        </span>
                      )}
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          {item.rating}
                        </span>
                        <span className="text-orange-600 dark:text-orange-400 text-sm ml-1">
                          ({item.reviews})
                        </span>
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </div>
                    </div>
                    <div className="text-xs text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-800 px-2 py-1 rounded">
                      {item.trendingReason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Restaurants */}
        {activeTab === 'new' && (
          <div>
            <div className="flex items-center mb-6">
              <Zap className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                New Restaurants
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exploreData.newRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/${country}/restaurants/${restaurant.id}`)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                      <span className="text-orange-400 text-4xl">🏪</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      New
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      {restaurant.name}
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          {restaurant.rating}
                        </span>
                        <span className="text-orange-600 dark:text-orange-400 text-sm ml-1">
                          ({restaurant.reviews})
                        </span>
                      </div>
                      <span className="text-orange-600 dark:text-orange-400 text-sm">
                        {restaurant.cuisine}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.location}
                      </div>
                      <div className="text-xs text-orange-500 dark:text-orange-400">
                        Opened {new Date(restaurant.openedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Rated */}
        {activeTab === 'top-rated' && (
          <div>
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Top Rated Restaurants
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exploreData.topRated.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/${country}/restaurants/${restaurant.id}`)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                      <span className="text-orange-400 text-4xl">🏪</span>
                    </div>
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <Award className="w-3 h-3 inline mr-1" />
                      Top Rated
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      {restaurant.name}
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          {restaurant.rating}
                        </span>
                        <span className="text-orange-600 dark:text-orange-400 text-sm ml-1">
                          ({restaurant.reviews})
                        </span>
                      </div>
                      <span className="text-orange-600 dark:text-orange-400 text-sm">
                        {restaurant.priceRange}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.location}
                      </div>
                      <span className="text-orange-600 dark:text-orange-400 text-sm">
                        {restaurant.cuisine}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center mb-6">
              <Filter className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Browse by Cuisine
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exploreData.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${country}/restaurants?cuisine=${category.name.toLowerCase()}`}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                        {category.name}
                      </h3>
                      <p className="text-orange-600 dark:text-orange-400 text-sm">
                        {category.count} restaurants
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href={`/${country}/rankings`}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Trophy className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                View Rankings
              </span>
            </Link>
            <Link
              href={`/${country}/social`}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Users className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Social Feed
              </span>
            </Link>
            <Link
              href={`/${country}/favorites`}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Heart className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                My Favorites
              </span>
            </Link>
            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700">
              <Camera className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Upload Photo
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
