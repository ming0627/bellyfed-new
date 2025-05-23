import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Filter,
  Search,
  Trash2,
  Share2,
  Plus,
  Grid,
  List,
  Calendar
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'
import { useAuth } from '../../contexts/AuthContext.js'

export default function FavoritesPage() {
  const router = useRouter()
  const { country } = router.query
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('restaurants')
  const [viewMode, setViewMode] = useState('grid')
  const [favorites, setFavorites] = useState({
    restaurants: [],
    dishes: [],
    collections: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    cuisine: '',
    location: '',
    priceRange: '',
    sortBy: 'recent'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for favorites
  useEffect(() => {
    if (isAuthenticated) {
      const mockFavorites = {
        restaurants: [
          {
            id: 1,
            name: 'The Golden Spoon',
            cuisine: 'Italian',
            location: 'Downtown',
            rating: 4.9,
            reviews: 456,
            priceRange: '$$$',
            image: '/images/golden-spoon.jpg',
            addedDate: '2024-01-15',
            lastVisited: '2024-01-20',
            notes: 'Amazing truffle pasta! Must try the tiramisu.',
            tags: ['romantic', 'special occasion']
          },
          {
            id: 2,
            name: 'Casa España',
            cuisine: 'Spanish',
            location: 'Spanish Quarter',
            rating: 4.8,
            reviews: 389,
            priceRange: '$$',
            image: '/images/casa-espana.jpg',
            addedDate: '2024-01-10',
            lastVisited: '2024-01-18',
            notes: 'Best paella in the city. Great for groups.',
            tags: ['group dining', 'authentic']
          },
          {
            id: 3,
            name: 'Noodle House',
            cuisine: 'Japanese',
            location: 'Little Tokyo',
            rating: 4.6,
            reviews: 234,
            priceRange: '$',
            image: '/images/noodle-house.jpg',
            addedDate: '2024-01-05',
            lastVisited: null,
            notes: 'Want to try their ramen soon.',
            tags: ['casual', 'comfort food']
          }
        ],
        dishes: [
          {
            id: 1,
            name: 'Truffle Pasta',
            restaurant: 'The Golden Spoon',
            restaurantId: 1,
            rating: 5,
            price: 28,
            image: '/images/truffle-pasta.jpg',
            addedDate: '2024-01-15',
            notes: 'Perfect balance of flavors. Worth every penny.',
            tags: ['luxury', 'pasta']
          },
          {
            id: 2,
            name: 'Paella Valenciana',
            restaurant: 'Casa España',
            restaurantId: 2,
            rating: 5,
            price: 32,
            image: '/images/paella.jpg',
            addedDate: '2024-01-10',
            notes: 'Authentic Spanish flavors. Great for sharing.',
            tags: ['seafood', 'traditional']
          }
        ],
        collections: [
          {
            id: 1,
            name: 'Date Night Spots',
            description: 'Perfect restaurants for romantic evenings',
            itemCount: 8,
            image: '/images/date-night.jpg',
            createdDate: '2024-01-01',
            isPublic: false
          },
          {
            id: 2,
            name: 'Best Brunch',
            description: 'Weekend brunch favorites',
            itemCount: 5,
            image: '/images/brunch.jpg',
            createdDate: '2023-12-15',
            isPublic: true
          }
        ]
      }

      // Simulate API call
      setTimeout(() => {
        setFavorites(mockFavorites)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const handleRemoveFavorite = (type, id) => {
    if (confirm('Are you sure you want to remove this from your favorites?')) {
      setFavorites(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== id)
      }))
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Sign In to View Favorites
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Save your favorite restaurants and dishes to access them anytime.
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
              Sign Up
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
          <p className="text-orange-600 dark:text-orange-400">Loading your favorites...</p>
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
              <Heart className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                My Favorites
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Your saved restaurants, dishes, and collections in {country}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search your favorites..."
              className="text-lg"
            />
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-orange-100 dark:bg-orange-800 rounded-lg p-1">
              {[
                { id: 'restaurants', label: 'Restaurants', count: favorites.restaurants.length },
                { id: 'dishes', label: 'Dishes', count: favorites.dishes.length },
                { id: 'collections', label: 'Collections', count: favorites.collections.length }
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Filters:
                </span>
              </div>
              
              {activeTab === 'restaurants' && (
                <>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                    className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
                  >
                    <option value="">All Cuisines</option>
                    <option value="Italian">Italian</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Japanese">Japanese</option>
                  </select>

                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
                  >
                    <option value="">All Locations</option>
                    <option value="Downtown">Downtown</option>
                    <option value="Spanish Quarter">Spanish Quarter</option>
                    <option value="Little Tokyo">Little Tokyo</option>
                  </select>
                </>
              )}

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
                {activeTab === 'restaurants' && <option value="visited">Last Visited</option>}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-orange-200 dark:bg-orange-700 rounded p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-orange-600' : ''}`}
                >
                  <Grid className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-orange-600' : ''}`}
                >
                  <List className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                </button>
              </div>
              <button className="flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors">
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurants */}
        {activeTab === 'restaurants' && (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {favorites.restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={`bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center relative">
                      <span className="text-orange-400 text-4xl">🏪</span>
                      <button
                        onClick={() => handleRemoveFavorite('restaurants', restaurant.id)}
                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {restaurant.name}
                        </h3>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {restaurant.priceRange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center text-orange-500">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          {restaurant.rating} ({restaurant.reviews})
                        </div>
                        <span className="text-orange-600 dark:text-orange-400">
                          {restaurant.cuisine}
                        </span>
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.location}
                      </div>
                      {restaurant.notes && (
                        <p className="text-orange-700 dark:text-orange-300 text-sm mb-3 italic">
                          "{restaurant.notes}"
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-orange-500 dark:text-orange-400">
                        <span>Added {new Date(restaurant.addedDate).toLocaleDateString()}</span>
                        {restaurant.lastVisited && (
                          <span>Visited {new Date(restaurant.lastVisited).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-orange-400 text-2xl">🏪</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                            <span>{restaurant.cuisine}</span>
                            <span>{restaurant.location}</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-orange-500 fill-current" />
                              {restaurant.rating}
                            </div>
                          </div>
                          {restaurant.notes && (
                            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 italic">
                              "{restaurant.notes}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite('restaurants', restaurant.id)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dishes */}
        {activeTab === 'dishes' && (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {favorites.dishes.map((dish) => (
              <div
                key={dish.id}
                className={`bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center relative">
                      <span className="text-orange-400 text-4xl">🍽️</span>
                      <button
                        onClick={() => handleRemoveFavorite('dishes', dish.id)}
                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {dish.name}
                        </h3>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          ${dish.price}
                        </span>
                      </div>
                      <p className="text-orange-600 dark:text-orange-400 text-sm mb-3">
                        at {dish.restaurant}
                      </p>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < dish.rating
                                ? 'text-orange-500 fill-current'
                                : 'text-orange-300 dark:text-orange-600'
                            }`}
                          />
                        ))}
                      </div>
                      {dish.notes && (
                        <p className="text-orange-700 dark:text-orange-300 text-sm mb-3 italic">
                          "{dish.notes}"
                        </p>
                      )}
                      <div className="text-xs text-orange-500 dark:text-orange-400">
                        Added {new Date(dish.addedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-orange-400 text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                            {dish.name}
                          </h3>
                          <p className="text-orange-600 dark:text-orange-400 text-sm">
                            at {dish.restaurant} • ${dish.price}
                          </p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < dish.rating
                                    ? 'text-orange-500 fill-current'
                                    : 'text-orange-300 dark:text-orange-600'
                                }`}
                              />
                            ))}
                          </div>
                          {dish.notes && (
                            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 italic">
                              "{dish.notes}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite('dishes', dish.id)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Collections */}
        {activeTab === 'collections' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                  <span className="text-orange-400 text-4xl">📁</span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                      {collection.name}
                    </h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      collection.isPublic 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200'
                    }`}>
                      {collection.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                  <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600 dark:text-orange-400">
                      {collection.itemCount} items
                    </span>
                    <span className="text-orange-500 dark:text-orange-400">
                      Created {new Date(collection.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'restaurants' && favorites.restaurants.length === 0) ||
          (activeTab === 'dishes' && favorites.dishes.length === 0) ||
          (activeTab === 'collections' && favorites.collections.length === 0)) && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              No {activeTab} saved yet
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              Start exploring and save your favorite {activeTab} to see them here.
            </p>
            <Link
              href={`/${country}/${activeTab === 'dishes' ? 'dishes' : 'restaurants'}`}
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Explore {activeTab === 'dishes' ? 'Dishes' : 'Restaurants'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
