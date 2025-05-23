import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Trophy, 
  Star, 
  Plus, 
  Edit3, 
  Share2,
  Calendar,
  TrendingUp,
  User,
  Filter,
  Search
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'
import { useAuth } from '../../../../contexts/AuthContext.js'

export default function MyRankingsIndexPage() {
  const router = useRouter()
  const { country } = router.query
  const { user, isAuthenticated } = useAuth()
  const [myRankings, setMyRankings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'recent'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for user's rankings
  useEffect(() => {
    if (isAuthenticated) {
      const mockRankings = [
        {
          id: 1,
          dishName: 'Truffle Pasta',
          slug: 'truffle-pasta',
          category: 'Italian',
          itemCount: 5,
          lastUpdated: '2024-01-15',
          averageRating: 4.2,
          averagePrice: 25,
          topRestaurant: 'The Golden Spoon',
          isPublic: true,
          views: 234,
          likes: 45
        },
        {
          id: 2,
          dishName: 'Wagyu Burger',
          slug: 'wagyu-burger',
          category: 'American',
          itemCount: 3,
          lastUpdated: '2024-01-10',
          averageRating: 4.7,
          averagePrice: 32,
          topRestaurant: 'Burger Palace',
          isPublic: false,
          views: 0,
          likes: 0
        },
        {
          id: 3,
          dishName: 'Ramen',
          slug: 'ramen',
          category: 'Japanese',
          itemCount: 7,
          lastUpdated: '2024-01-05',
          averageRating: 4.1,
          averagePrice: 18,
          topRestaurant: 'Noodle House',
          isPublic: true,
          views: 156,
          likes: 28
        },
        {
          id: 4,
          dishName: 'Paella',
          slug: 'paella',
          category: 'Spanish',
          itemCount: 4,
          lastUpdated: '2023-12-20',
          averageRating: 4.5,
          averagePrice: 28,
          topRestaurant: 'Casa España',
          isPublic: true,
          views: 89,
          likes: 12
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setMyRankings(mockRankings)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Filter rankings based on search and filters
  const filteredRankings = myRankings.filter(ranking => {
    const matchesSearch = !searchQuery || 
      ranking.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ranking.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ranking.topRestaurant.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !filters.category || ranking.category === filters.category
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      case 'name':
        return a.dishName.localeCompare(b.dishName)
      case 'rating':
        return b.averageRating - a.averageRating
      case 'items':
        return b.itemCount - a.itemCount
      case 'popular':
        return b.views - a.views
      default:
        return 0
    }
  })

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Sign In to View Your Rankings
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Create and manage your personal food rankings.
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
          <p className="text-orange-600 dark:text-orange-400">Loading your rankings...</p>
        </div>
      </div>
    )
  }

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
            <Link href={`/${country}/rankings`} className="hover:text-orange-800 dark:hover:text-orange-200">
              Rankings
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">My Rankings</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-orange-500 mr-3" />
              <Trophy className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                My Rankings
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Your personal food rankings and taste preferences in {country}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {myRankings.length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Rankings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {myRankings.reduce((sum, ranking) => sum + ranking.itemCount, 0)}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Items Ranked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {myRankings.filter(r => r.isPublic).length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Public</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {myRankings.reduce((sum, ranking) => sum + ranking.views, 0)}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Total Views</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search your rankings..."
              className="text-lg"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
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
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="">All Categories</option>
                <option value="Italian">Italian</option>
                <option value="American">American</option>
                <option value="Japanese">Japanese</option>
                <option value="Spanish">Spanish</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="recent">Recently Updated</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="items">Most Items</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create New Ranking
            </button>
          </div>
        </div>
      </div>

      {/* Rankings Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRankings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRankings.map((ranking) => (
              <div
                key={ranking.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/${country}/rankings/my/${ranking.slug}`)}
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                      {ranking.dishName}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ranking.isPublic 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200'
                    }`}>
                      {ranking.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400 mb-4">
                    <span>{ranking.category}</span>
                    <span>•</span>
                    <span>{ranking.itemCount} items</span>
                  </div>

                  <div className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                    <strong>Top choice:</strong> {ranking.topRestaurant}
                  </div>
                </div>

                {/* Stats */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          {ranking.averageRating}
                        </span>
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">Avg Rating</div>
                    </div>
                    <div>
                      <div className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        ${ranking.averagePrice}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">Avg Price</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-orange-50 dark:bg-orange-800 border-t border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(ranking.lastUpdated).toLocaleDateString()}
                    </div>
                    {ranking.isPublic && (
                      <div className="flex items-center space-x-3 text-orange-600 dark:text-orange-400">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {ranking.views}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {ranking.likes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-3 bg-orange-100 dark:bg-orange-800 flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/${country}/rankings/my/${ranking.slug}`)
                    }}
                    className="flex items-center text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  {ranking.isPublic && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implement share functionality
                      }}
                      className="flex items-center text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100 text-sm font-medium"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              {searchQuery || filters.category ? 'No rankings found' : 'No rankings yet'}
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              {searchQuery || filters.category 
                ? 'Try adjusting your search or filters to find rankings.'
                : 'Start creating your personal food rankings to track your favorite dishes and restaurants.'
              }
            </p>
            {!searchQuery && !filters.category && (
              <button className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ranking
              </button>
            )}
          </div>
        )}

        {/* Tips */}
        {myRankings.length > 0 && (
          <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Ranking Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-700 dark:text-orange-300">
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Creating Better Rankings
                </h4>
                <ul className="space-y-1">
                  <li>• Try at least 3-5 places before ranking</li>
                  <li>• Add detailed notes about your experience</li>
                  <li>• Consider price, quality, and service</li>
                  <li>• Update rankings as you try new places</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Sharing Your Rankings
                </h4>
                <ul className="space-y-1">
                  <li>• Make rankings public to share with friends</li>
                  <li>• Get recommendations from your network</li>
                  <li>• Discover new places through others' rankings</li>
                  <li>• Build your reputation as a food expert</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
