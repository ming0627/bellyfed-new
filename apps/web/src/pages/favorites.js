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
  Calendar,
  ChefHat,
  Award,
  Grid,
  List
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'
import { useAuth } from '../contexts/AuthContext.js'

export default function FavoritesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [filteredFavorites, setFilteredFavorites] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('recent')
  const [isLoading, setIsLoading] = useState(true)

  // Mock favorites data
  useEffect(() => {
    if (isAuthenticated) {
      const mockFavorites = [
        {
          id: 1,
          type: 'restaurant',
          name: 'The Golden Spoon',
          cuisine: 'Italian',
          rating: 4.9,
          reviewCount: 1247,
          location: 'Downtown',
          distance: '0.5 miles',
          priceRange: '$$$',
          image: '/images/golden-spoon.jpg',
          addedDate: '2024-01-10',
          lastVisited: '2024-01-12',
          notes: 'Amazing truffle pasta!',
          isOpen: true
        },
        {
          id: 2,
          type: 'dish',
          name: 'Lobster Thermidor',
          restaurant: 'Ocean Breeze',
          cuisine: 'Seafood',
          rating: 4.8,
          price: 45,
          image: '/images/lobster-thermidor.jpg',
          addedDate: '2024-01-08',
          lastOrdered: '2024-01-09',
          notes: 'Perfect for special occasions',
          available: true
        },
        {
          id: 3,
          type: 'restaurant',
          name: 'Spice Garden',
          cuisine: 'Indian',
          rating: 4.7,
          reviewCount: 756,
          location: 'Little India',
          distance: '1.2 miles',
          priceRange: '$$',
          image: '/images/spice-garden.jpg',
          addedDate: '2024-01-05',
          lastVisited: '2024-01-07',
          notes: 'Best butter chicken in the city',
          isOpen: true
        },
        {
          id: 4,
          type: 'dish',
          name: 'Wagyu Burger',
          restaurant: 'Burger Palace',
          cuisine: 'American',
          rating: 4.6,
          price: 32,
          image: '/images/wagyu-burger.jpg',
          addedDate: '2024-01-03',
          lastOrdered: '2024-01-04',
          notes: 'Expensive but worth it',
          available: false
        },
        {
          id: 5,
          type: 'restaurant',
          name: 'Sushi Zen',
          cuisine: 'Japanese',
          rating: 4.6,
          reviewCount: 523,
          location: 'Japantown',
          distance: '2.1 miles',
          priceRange: '$$$$',
          image: '/images/sushi-zen.jpg',
          addedDate: '2024-01-01',
          lastVisited: null,
          notes: 'Want to try the omakase',
          isOpen: false
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setFavorites(mockFavorites)
        setFilteredFavorites(mockFavorites)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Filter and sort favorites
  useEffect(() => {
    let filtered = favorites

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.restaurant && item.restaurant.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedDate) - new Date(a.addedDate)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.rating - a.rating
        case 'cuisine':
          return a.cuisine.localeCompare(b.cuisine)
        default:
          return 0
      }
    })

    setFilteredFavorites(filtered)
  }, [favorites, activeTab, searchQuery, sortBy])

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(item => item.id !== id))
  }

  const shareFavorite = (item) => {
    const shareText = `Check out ${item.name} - one of my favorite ${item.type === 'restaurant' ? 'restaurants' : 'dishes'}!`
    if (navigator.share) {
      navigator.share({
        title: `${item.name} - Bellyfed`,
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
      // TODO: Show toast notification
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
            Save your favorite restaurants and dishes to access them anytime!
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
              Create Account
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
          <p className="text-orange-600 dark:text-orange-400">Loading favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 text-orange-500 mr-3 fill-current" />
              <Star className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              My Favorites
            </h1>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Your saved restaurants and dishes in one place
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={clearSearch}
                placeholder="Search your favorites..."
                className="text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'all', label: 'All', count: favorites.length },
                { id: 'restaurant', label: 'Restaurants', count: favorites.filter(f => f.type === 'restaurant').length },
                { id: 'dish', label: 'Dishes', count: favorites.filter(f => f.type === 'dish').length }
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-orange-700 hover:bg-orange-200 dark:bg-orange-700 dark:text-orange-300 dark:hover:bg-orange-600'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="cuisine">Cuisine</option>
              </select>

              <div className="flex border border-orange-200 rounded-lg dark:border-orange-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-orange-700 dark:text-orange-300'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-orange-700 dark:text-orange-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredFavorites.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Image */}
                <div className={`bg-orange-100 dark:bg-orange-800 relative ${
                  viewMode === 'list' ? 'w-32 h-32' : 'aspect-video'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-orange-400 text-4xl">
                      {item.type === 'restaurant' ? '🏪' : '🍽️'}
                    </span>
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="flex items-center px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                      {item.type === 'restaurant' ? <ChefHat className="w-3 h-3 mr-1" /> : <Award className="w-3 h-3 mr-1" />}
                      {item.type}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {item.type === 'restaurant' && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  )}

                  {item.type === 'dish' && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.available ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                        {item.name}
                      </h3>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                        <span>{item.cuisine}</span>
                        {item.restaurant && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{item.restaurant}</span>
                          </>
                        )}
                        {item.location && (
                          <>
                            <span className="mx-2">•</span>
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{item.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => shareFavorite(item)}
                        className="p-1 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                      <span className="font-semibold text-orange-900 dark:text-orange-100">
                        {item.rating}
                      </span>
                      {item.reviewCount && (
                        <span className="text-orange-600 dark:text-orange-400 text-sm ml-1">
                          ({item.reviewCount})
                        </span>
                      )}
                    </div>
                    
                    {item.price && (
                      <div className="font-semibold text-orange-900 dark:text-orange-100">
                        ${item.price}
                      </div>
                    )}
                    
                    {item.priceRange && (
                      <div className="text-orange-600 dark:text-orange-400">
                        {item.priceRange}
                      </div>
                    )}
                    
                    {item.distance && (
                      <div className="text-orange-600 dark:text-orange-400 text-sm">
                        {item.distance}
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-3 italic">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-orange-500 dark:text-orange-400 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Added {new Date(item.addedDate).toLocaleDateString()}
                    </div>
                    {item.lastVisited && (
                      <div>
                        Last visited {new Date(item.lastVisited).toLocaleDateString()}
                      </div>
                    )}
                    {item.lastOrdered && (
                      <div>
                        Last ordered {new Date(item.lastOrdered).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={item.type === 'restaurant' ? `/restaurants/${item.id}` : `/dishes/${item.id}`}
                      className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded transition-colors text-center"
                    >
                      View Details
                    </Link>
                    {item.type === 'restaurant' && (
                      <button className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                        Order Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              {searchQuery || activeTab !== 'all' ? 'No favorites found' : 'No favorites yet'}
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              {searchQuery || activeTab !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Start exploring restaurants and dishes to build your favorites list!'
              }
            </p>
            {(!searchQuery && activeTab === 'all') && (
              <Link
                href="/explore"
                className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                Explore Restaurants
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
        {favorites.length > 0 && (
          <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Your Favorites Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {favorites.length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Total Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {favorites.filter(f => f.type === 'restaurant').length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {favorites.filter(f => f.type === 'dish').length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Dishes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {new Set(favorites.map(f => f.cuisine)).size}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Cuisines</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
