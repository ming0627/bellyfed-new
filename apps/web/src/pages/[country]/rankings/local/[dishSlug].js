import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Trophy, 
  Star, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Navigation, 
  Filter,
  Search,
  Heart,
  Share2,
  Clock
} from 'lucide-react'

export default function LocalDishRankingPage() {
  const router = useRouter()
  const { country, dishSlug } = router.query
  const [rankings, setRankings] = useState([])
  const [dishInfo, setDishInfo] = useState(null)
  const [locationInfo, setLocationInfo] = useState(null)
  const [filters, setFilters] = useState({
    neighborhood: '',
    priceRange: '',
    distance: '',
    sortBy: 'rank'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for local dish rankings
  useEffect(() => {
    if (dishSlug && country) {
      const mockDishInfo = {
        name: dishSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `The best ${dishSlug.replace(/-/g, ' ')} in ${country}`,
        localRankings: 156,
        averageRating: 4.4,
        localRank: 3
      }

      const mockLocationInfo = {
        city: country === 'usa' ? 'San Francisco' : 'Local Area',
        region: country === 'usa' ? 'California' : country.toUpperCase(),
        userLocation: 'Downtown'
      }

      const mockRankings = [
        {
          id: 1,
          restaurant: 'Local Favorite',
          location: 'Downtown',
          address: '123 Main St',
          rating: 4.8,
          votes: 234,
          rank: 1,
          change: '+1',
          price: 18,
          distance: '0.3 miles',
          description: 'Neighborhood gem with authentic local flavors',
          image: '/images/local-dish-1.jpg',
          isOpen: true,
          openUntil: '10:00 PM'
        },
        {
          id: 2,
          restaurant: 'Corner Bistro',
          location: 'Mission District',
          address: '456 Valencia St',
          rating: 4.7,
          votes: 189,
          rank: 2,
          change: '0',
          price: 22,
          distance: '0.8 miles',
          description: 'Cozy spot known for traditional preparation',
          image: '/images/local-dish-2.jpg',
          isOpen: true,
          openUntil: '9:30 PM'
        },
        {
          id: 3,
          restaurant: 'The Local Kitchen',
          location: 'Castro',
          address: '789 Castro St',
          rating: 4.6,
          votes: 167,
          rank: 3,
          change: '+2',
          price: 25,
          distance: '1.2 miles',
          description: 'Farm-to-table approach with local ingredients',
          image: '/images/local-dish-3.jpg',
          isOpen: false,
          openUntil: 'Closed'
        },
        {
          id: 4,
          restaurant: 'Neighborhood Eats',
          location: 'Haight',
          address: '321 Haight St',
          rating: 4.5,
          votes: 145,
          rank: 4,
          change: '-1',
          price: 20,
          distance: '1.5 miles',
          description: 'Local institution serving the community for 20+ years',
          image: '/images/local-dish-4.jpg',
          isOpen: true,
          openUntil: '11:00 PM'
        },
        {
          id: 5,
          restaurant: 'City Bites',
          location: 'SOMA',
          address: '654 Folsom St',
          rating: 4.4,
          votes: 123,
          rank: 5,
          change: '+3',
          price: 28,
          distance: '2.1 miles',
          description: 'Modern interpretation of classic local dish',
          image: '/images/local-dish-5.jpg',
          isOpen: true,
          openUntil: '10:30 PM'
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setDishInfo(mockDishInfo)
        setLocationInfo(mockLocationInfo)
        setRankings(mockRankings)
        setIsLoading(false)
      }, 1000)
    }
  }, [dishSlug, country])

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
          <p className="text-orange-600 dark:text-orange-400">Loading local rankings...</p>
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
            <span className="text-orange-900 dark:text-orange-100">Local</span>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">{dishInfo?.name}</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Navigation className="w-10 h-10 text-orange-500 mr-3" />
              <Trophy className="w-10 h-10 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                Best {dishInfo?.name} in {locationInfo?.city}
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              {dishInfo?.description} • Rankings based on your location in {locationInfo?.userLocation}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  #{dishInfo?.localRank}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Local Rank</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dishInfo?.localRankings}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Local Rankings</div>
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
                value={filters.neighborhood}
                onChange={(e) => setFilters(prev => ({ ...prev, neighborhood: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="">All Neighborhoods</option>
                <option value="Downtown">Downtown</option>
                <option value="Mission District">Mission District</option>
                <option value="Castro">Castro</option>
                <option value="Haight">Haight</option>
                <option value="SOMA">SOMA</option>
              </select>

              <select
                value={filters.distance}
                onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="">Any Distance</option>
                <option value="0.5">Within 0.5 miles</option>
                <option value="1">Within 1 mile</option>
                <option value="2">Within 2 miles</option>
                <option value="5">Within 5 miles</option>
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="">All Prices</option>
                <option value="0-20">$0 - $20</option>
                <option value="20-30">$20 - $30</option>
                <option value="30+">$30+</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
              >
                <option value="rank">By Rank</option>
                <option value="distance">By Distance</option>
                <option value="rating">By Rating</option>
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
                    <span className="text-orange-400 text-2xl">🍽️</span>
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
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ranking.isOpen 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {ranking.isOpen ? 'Open' : 'Closed'}
                        </div>
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {ranking.address} • {ranking.location}
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm mb-2">
                        <Navigation className="w-4 h-4 mr-1" />
                        {ranking.distance} away
                        {ranking.isOpen && (
                          <>
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-1" />
                            Open until {ranking.openUntil}
                          </>
                        )}
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
                        {ranking.votes} votes
                      </p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${ranking.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex flex-col space-y-2">
                  <Link
                    href={`/${country}/restaurants/${ranking.id}`}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <button className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
            Load More Local Rankings
          </button>
        </div>

        {/* Map Integration Placeholder */}
        <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Map View
          </h3>
          <div className="h-64 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-400 mx-auto mb-2" />
              <p className="text-orange-600 dark:text-orange-400">
                Interactive map showing restaurant locations
              </p>
              <p className="text-sm text-orange-500 dark:text-orange-500 mt-1">
                Map integration coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Related Local Rankings */}
        <div className="mt-8 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Other Popular Dishes in {locationInfo?.city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${country}/rankings/local/pizza`}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Pizza</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">89 local rankings</p>
            </Link>
            <Link
              href={`/${country}/rankings/local/burger`}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Burger</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">67 local rankings</p>
            </Link>
            <Link
              href={`/${country}/rankings/local/sushi`}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Sushi</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">54 local rankings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
