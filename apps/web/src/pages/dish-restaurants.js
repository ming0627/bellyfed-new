import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  ChefHat, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Filter,
  Search,
  Heart,
  Share2,
  Phone,
  Globe,
  Navigation,
  Award
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function DishRestaurantsPage() {
  const router = useRouter()
  const { dish } = router.query
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    distance: '',
    sortBy: 'rating'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock restaurants data
  useEffect(() => {
    if (dish) {
      const mockRestaurants = [
        {
          id: 1,
          name: 'The Golden Spoon',
          cuisine: 'Italian',
          rating: 4.9,
          reviewCount: 1247,
          priceRange: '$$$',
          distance: '0.5 miles',
          address: '123 Main St, Downtown',
          phone: '+1 (555) 123-4567',
          website: 'goldspoon.com',
          image: '/images/golden-spoon.jpg',
          dishPrice: 28,
          dishRating: 4.9,
          dishReviews: 89,
          specialties: ['Truffle Pasta', 'Risotto', 'Osso Buco'],
          openNow: true,
          deliveryTime: '25-35 min',
          features: ['Outdoor Seating', 'Wine Bar', 'Reservations']
        },
        {
          id: 2,
          name: 'Nonna\'s Kitchen',
          cuisine: 'Italian',
          rating: 4.7,
          reviewCount: 892,
          priceRange: '$$',
          distance: '1.2 miles',
          address: '456 Oak Ave, Little Italy',
          phone: '+1 (555) 234-5678',
          website: 'nonnaskitchen.com',
          image: '/images/nonnas-kitchen.jpg',
          dishPrice: 22,
          dishRating: 4.6,
          dishReviews: 67,
          specialties: ['Homemade Pasta', 'Pizza', 'Tiramisu'],
          openNow: true,
          deliveryTime: '30-40 min',
          features: ['Family Style', 'Takeout', 'Catering']
        },
        {
          id: 3,
          name: 'Bella Vista',
          cuisine: 'Italian',
          rating: 4.5,
          reviewCount: 634,
          priceRange: '$$$$',
          distance: '2.1 miles',
          address: '789 Hill St, Uptown',
          phone: '+1 (555) 345-6789',
          website: 'bellavista.com',
          image: '/images/bella-vista.jpg',
          dishPrice: 35,
          dishRating: 4.8,
          dishReviews: 45,
          specialties: ['Fine Dining', 'Wine Pairing', 'Chef\'s Table'],
          openNow: false,
          deliveryTime: 'Closed',
          features: ['Fine Dining', 'Wine Cellar', 'Private Dining']
        },
        {
          id: 4,
          name: 'Pasta Corner',
          cuisine: 'Italian',
          rating: 4.3,
          reviewCount: 423,
          priceRange: '$',
          distance: '0.8 miles',
          address: '321 Elm St, Student Quarter',
          phone: '+1 (555) 456-7890',
          website: 'pastacorner.com',
          image: '/images/pasta-corner.jpg',
          dishPrice: 15,
          dishRating: 4.2,
          dishReviews: 78,
          specialties: ['Quick Service', 'Fresh Pasta', 'Lunch Specials'],
          openNow: true,
          deliveryTime: '15-25 min',
          features: ['Quick Service', 'Student Discount', 'Delivery']
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setRestaurants(mockRestaurants)
        setFilteredRestaurants(mockRestaurants)
        setIsLoading(false)
      }, 1000)
    }
  }, [dish])

  // Filter restaurants
  useEffect(() => {
    let filtered = restaurants

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(restaurant => restaurant.priceRange === filters.priceRange)
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      filtered = filtered.filter(restaurant => restaurant.rating >= minRating)
    }

    // Distance filter
    if (filters.distance) {
      const maxDistance = parseFloat(filters.distance)
      filtered = filtered.filter(restaurant => 
        parseFloat(restaurant.distance) <= maxDistance
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance)
        case 'price':
          return a.dishPrice - b.dishPrice
        case 'reviews':
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    setFilteredRestaurants(filtered)
  }, [restaurants, searchQuery, filters])

  const clearSearch = () => {
    setSearchQuery('')
  }

  const getPriceColor = (price) => {
    if (price <= 15) return 'text-green-600 dark:text-green-400'
    if (price <= 25) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading restaurants...</p>
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
              <ChefHat className="w-12 h-12 text-orange-500 mr-3" />
              <Award className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              Best {dish} Restaurants
            </h1>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Discover the top restaurants serving {dish} near you
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={clearSearch}
                placeholder={`Search restaurants serving ${dish}...`}
                className="text-lg"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {restaurants.length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Restaurants</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {restaurants.filter(r => r.rating >= 4.5).length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Top Rated</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {restaurants.filter(r => r.openNow).length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Open Now</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ${Math.round(restaurants.reduce((sum, r) => sum + r.dishPrice, 0) / restaurants.length)}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Avg Price</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Filters:
              </span>
            </div>
            
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
            >
              <option value="">All Prices</option>
              <option value="$">$ (Under $20)</option>
              <option value="$$">$$ ($20-30)</option>
              <option value="$$$">$$$ ($30-50)</option>
              <option value="$$$$">$$$$ ($50+)</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>

            <select
              value={filters.distance}
              onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
              className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
            >
              <option value="">Any Distance</option>
              <option value="1">Within 1 mile</option>
              <option value="2">Within 2 miles</option>
              <option value="5">Within 5 miles</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
            >
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest</option>
              <option value="price">Lowest Price</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRestaurants.length > 0 ? (
          <div className="space-y-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Restaurant Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-1">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                            <span>{restaurant.cuisine}</span>
                            <span>•</span>
                            <span>{restaurant.priceRange}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {restaurant.distance}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200">
                            <Heart className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                          <span className="font-semibold text-orange-900 dark:text-orange-100">
                            {restaurant.rating}
                          </span>
                          <span className="text-orange-600 dark:text-orange-400 ml-1">
                            ({restaurant.reviewCount} reviews)
                          </span>
                        </div>
                        
                        <div className={`flex items-center ${restaurant.openNow ? 'text-green-600' : 'text-red-600'}`}>
                          <Clock className="w-4 h-4 mr-1" />
                          {restaurant.openNow ? 'Open Now' : 'Closed'}
                        </div>
                      </div>

                      <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                        {restaurant.address}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {restaurant.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="lg:ml-8 lg:w-64">
                      <div className="bg-orange-50 dark:bg-orange-800 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                          {dish} at this restaurant
                        </h4>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                            <span className="font-medium text-orange-900 dark:text-orange-100">
                              {restaurant.dishRating}
                            </span>
                            <span className="text-orange-600 dark:text-orange-400 text-sm ml-1">
                              ({restaurant.dishReviews})
                            </span>
                          </div>
                          <div className={`font-bold ${getPriceColor(restaurant.dishPrice)}`}>
                            ${restaurant.dishPrice}
                          </div>
                        </div>

                        <div className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                          Delivery: {restaurant.deliveryTime}
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded transition-colors">
                            Order Now
                          </button>
                          <Link
                            href={`/restaurants/${restaurant.id}`}
                            className="flex-1 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium rounded transition-colors text-center dark:bg-orange-700 dark:hover:bg-orange-600 dark:text-orange-300"
                          >
                            View Menu
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {restaurant.phone}
                      </a>
                      <a
                        href={`https://${restaurant.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        {restaurant.website}
                      </a>
                      <button className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                        <Navigation className="w-4 h-4 mr-1" />
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              No restaurants found
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              Try adjusting your search criteria or filters to find restaurants serving {dish}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  priceRange: '',
                  rating: '',
                  distance: '',
                  sortBy: 'rating'
                })
              }}
              className="text-orange-500 hover:text-orange-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
