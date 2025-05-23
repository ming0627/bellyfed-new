import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all', // all, restaurants, dishes
    location: '',
    rating: '',
    priceRange: '',
    cuisine: ''
  })

  // Initialize search from URL params
  useEffect(() => {
    const { q, type, location } = router.query
    if (q) {
      setSearchQuery(q)
      performSearch(q, { type, location })
    }
  }, [router.query])

  const performSearch = useCallback(async (query, searchFilters = {}) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      const mockResults = [
        {
          id: 1,
          type: 'restaurant',
          name: 'The Golden Spoon',
          description: 'Fine dining with contemporary cuisine',
          rating: 4.8,
          location: 'Downtown',
          image: '/images/restaurant-placeholder.jpg',
          priceRange: '$$$'
        },
        {
          id: 2,
          type: 'dish',
          name: 'Truffle Pasta',
          description: 'Handmade pasta with black truffle and parmesan',
          rating: 4.9,
          restaurant: 'The Golden Spoon',
          image: '/images/dish-placeholder.jpg',
          price: '$28'
        },
        {
          id: 3,
          type: 'restaurant',
          name: 'Street Food Paradise',
          description: 'Authentic street food from around the world',
          rating: 4.6,
          location: 'Food District',
          image: '/images/restaurant-placeholder.jpg',
          priceRange: '$'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSearchResults(mockResults)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Update URL with search params
      router.push({
        pathname: '/search',
        query: { q: searchQuery, ...filters }
      }, undefined, { shallow: true })
      
      performSearch(searchQuery, filters)
    }
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilters)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    router.push('/search', undefined, { shallow: true })
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Search Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              Discover Amazing Food
            </h1>
            <p className="text-orange-700 dark:text-orange-300">
              Search for restaurants, dishes, and culinary experiences
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search for restaurants, dishes, or cuisines..."
              className="text-lg"
            />
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['all', 'restaurants', 'dishes'].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange('type', type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.type === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-800 dark:text-orange-300 dark:hover:bg-orange-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-orange-600 dark:text-orange-400">Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100">
                Search Results ({searchResults.length})
              </h2>
              <button className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/${result.type}s/${result.id}`)}
                >
                  <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                    <span className="text-orange-400 text-4xl">🍽️</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        {result.name}
                      </h3>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full dark:bg-orange-800 dark:text-orange-300">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                      {result.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-orange-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {result.rating}
                      </div>
                      {result.location && (
                        <div className="flex items-center text-orange-600 dark:text-orange-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {result.location}
                        </div>
                      )}
                      {result.priceRange && (
                        <span className="text-orange-700 dark:text-orange-300 font-medium">
                          {result.priceRange}
                        </span>
                      )}
                      {result.price && (
                        <span className="text-orange-700 dark:text-orange-300 font-medium">
                          {result.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              No results found
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              We couldn't find anything matching "{searchQuery}"
            </p>
            <button
              onClick={clearSearch}
              className="text-orange-500 hover:text-orange-700 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Start your food discovery
            </h3>
            <p className="text-orange-600 dark:text-orange-400">
              Enter a search term above to find restaurants and dishes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
