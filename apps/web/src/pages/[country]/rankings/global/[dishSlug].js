import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Trophy, 
  Star, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Filter,
  Search,
  Heart,
  Share2
} from 'lucide-react'

export default function GlobalDishRankingPage() {
  const router = useRouter()
  const { country, dishSlug } = router.query
  const [rankings, setRankings] = useState([])
  const [dishInfo, setDishInfo] = useState(null)
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    sortBy: 'rank'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for global dish rankings
  useEffect(() => {
    if (dishSlug) {
      const mockDishInfo = {
        name: dishSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: 'A beloved dish enjoyed worldwide with countless variations and interpretations',
        totalRankings: 1247,
        averageRating: 4.6,
        globalRank: 15
      }

      const mockRankings = [
        {
          id: 1,
          restaurant: 'The Golden Spoon',
          location: 'San Francisco, CA',
          country: 'USA',
          rating: 4.9,
          votes: 1247,
          rank: 1,
          change: '+2',
          price: 28,
          description: 'Handmade pasta with black truffle and parmesan cheese',
          image: '/images/truffle-pasta-1.jpg',
          verified: true
        },
        {
          id: 2,
          restaurant: 'Nonna\'s Kitchen',
          location: 'Rome, Italy',
          country: 'Italy',
          rating: 4.8,
          votes: 1156,
          rank: 2,
          change: '-1',
          price: 22,
          description: 'Traditional Roman-style preparation with authentic ingredients',
          image: '/images/truffle-pasta-2.jpg',
          verified: true
        },
        {
          id: 3,
          restaurant: 'Le Petit Bistro',
          location: 'Paris, France',
          country: 'France',
          rating: 4.8,
          votes: 1089,
          rank: 3,
          change: '+1',
          price: 35,
          description: 'French interpretation with seasonal truffle varieties',
          image: '/images/truffle-pasta-3.jpg',
          verified: false
        },
        {
          id: 4,
          restaurant: 'Casa Italiana',
          location: 'New York, NY',
          country: 'USA',
          rating: 4.7,
          votes: 987,
          rank: 4,
          change: '0',
          price: 32,
          description: 'Modern take on classic Italian flavors',
          image: '/images/truffle-pasta-4.jpg',
          verified: true
        },
        {
          id: 5,
          restaurant: 'Truffle House',
          location: 'London, UK',
          country: 'UK',
          rating: 4.7,
          votes: 876,
          rank: 5,
          change: '+3',
          price: 38,
          description: 'Premium British truffle with house-made pasta',
          image: '/images/truffle-pasta-5.jpg',
          verified: true
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setDishInfo(mockDishInfo)
        setRankings(mockRankings)
        setIsLoading(false)
      }, 1000)
    }
  }, [dishSlug])

  const getRankChangeIcon = (change) => {
    if (change.startsWith('+')) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (change.startsWith('-')) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
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
          <p className="text-orange-600 dark:text-orange-400">Loading global rankings...</p>
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
            <span className="text-orange-900 dark:text-orange-100">Global</span>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">{dishInfo?.name}</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-10 h-10 text-orange-500 mr-3" />
              <Trophy className="w-10 h-10 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                Global {dishInfo?.name} Rankings
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              {dishInfo?.description}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  #{dishInfo?.globalRank}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Global Rank</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dishInfo?.totalRankings?.toLocaleString()}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Total Rankings</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-500 fill-current mr-1" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dishInfo?.averageRating}
                  </span>
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Average Rating</div>
              </div>
            </div>
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
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="">All Locations</option>
                <option value="USA">USA</option>
                <option value="Italy">Italy</option>
                <option value="France">France</option>
                <option value="UK">UK</option>
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="">All Prices</option>
                <option value="0-25">$0 - $25</option>
                <option value="25-35">$25 - $35</option>
                <option value="35-50">$35 - $50</option>
                <option value="50+">$50+</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="rank">By Rank</option>
                <option value="rating">By Rating</option>
                <option value="votes">By Votes</option>
                <option value="price">By Price</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors">
                <Heart className="w-4 h-4 mr-1" />
                Save
              </button>
              <button className="flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {rankings.map((ranking) => (
            <div
              key={ranking.id}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-6">
                {/* Rank */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      #{ranking.rank}
                    </span>
                  </div>
                  <div className="flex items-center justify-center mt-2 space-x-1">
                    {getRankChangeIcon(ranking.change)}
                    <span className={`text-sm font-medium ${getRankChangeColor(ranking.change)}`}>
                      {ranking.change}
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 text-2xl">🍝</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {ranking.restaurant}
                        </h3>
                        {ranking.verified && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {ranking.location}, {ranking.country}
                      </div>
                      <p className="text-orange-700 dark:text-orange-300 text-sm">
                        {ranking.description}
                      </p>
                    </div>

                    <div className="text-right ml-4">
                      <div className="flex items-center mb-2">
                        <Star className="w-5 h-5 text-orange-500 fill-current mr-1" />
                        <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {ranking.rating}
                        </span>
                      </div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                        {ranking.votes.toLocaleString()} votes
                      </p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${ranking.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/${country}/restaurants/${ranking.id}`}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
            Load More Rankings
          </button>
        </div>

        {/* Related Rankings */}
        <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Related Global Rankings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${country}/rankings/global/pizza`}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Pizza</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">2,156 rankings</p>
            </Link>
            <Link
              href={`/${country}/rankings/global/burger`}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Burger</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">1,834 rankings</p>
            </Link>
            <Link
              href={`/${country}/rankings/global/sushi`}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Sushi</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">1,567 rankings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
