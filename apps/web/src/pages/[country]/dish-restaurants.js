import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Heart,
  Filter,
  Search,
  Navigation,
  DollarSign,
  Users
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function DishRestaurantsPage() {
  const router = useRouter()
  const { country, dish } = router.query
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [dishInfo, setDishInfo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    rating: '',
    distance: '',
    sortBy: 'rating'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for restaurants serving a specific dish
  useEffect(() => {
    if (dish && country) {
      const dishName = dish.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      const mockDishInfo = {
        name: dishName,
        description: `Find the best ${dishName.toLowerCase()} in ${country}`,
        totalRestaurants: 23,
        averagePrice: 25,
        averageRating: 4.3
      }

      const mockRestaurants = [
        {
          id: 1,
          name: 'The Golden Spoon',
          description: 'Fine dining with contemporary Italian cuisine',
          cuisine: 'Italian',
          location: 'Downtown',
          address: '123 Main St, Downtown',
          phone: '(555) 123-4567',
          website: 'https://goldenspoon.com',
          rating: 4.9,
          reviews: 456,
          priceRange: '$$$',
          distance: '0.5 miles',
          dishPrice: 28,
          dishRating: 5,
          dishReviews: 89,
          isOpen: true,
          openUntil: '10:00 PM',
          features: ['Reservations', 'Outdoor Seating', 'Wine Bar'],
          specialNote: 'Famous for their truffle preparation'
        },
        {
          id: 2,
          name: 'Casa Italiana',
          description: 'Authentic Italian family recipes',
          cuisine: 'Italian',
          location: 'Little Italy',
          address: '456 Pasta Ave, Little Italy',
          phone: '(555) 234-5678',
          website: 'https://casaitaliana.com',
          rating: 4.7,
          reviews: 234,
          priceRange: '$$',
          distance: '1.2 miles',
          dishPrice: 22,
          dishRating: 4,
          dishReviews: 45,
          isOpen: true,
          openUntil: '9:30 PM',
          features: ['Takeout', 'Family Friendly', 'Parking'],
          specialNote: 'Traditional recipe passed down 3 generations'
        },
        {
          id: 3,
          name: 'Modern Bistro',
          description: 'Contemporary take on classic dishes',
          cuisine: 'Fusion',
          location: 'Arts District',
          address: '789 Creative Blvd, Arts District',
          phone: '(555) 345-6789',
          website: 'https://modernbistro.com',
          rating: 4.5,
          reviews: 167,
          priceRange: '$$',
          distance: '2.1 miles',
          dishPrice: 24,
          dishRating: 4,
          dishReviews: 32,
          isOpen: false,
          openUntil: 'Closed',
          features: ['Modern Atmosphere', 'Craft Cocktails', 'Live Music'],
          specialNote: 'Innovative fusion interpretation'
        },
        {
          id: 4,
          name: 'Nonna\'s Kitchen',
          description: 'Home-style Italian cooking',
          cuisine: 'Italian',
          location: 'Suburbs',
          address: '321 Family Way, Suburbs',
          phone: '(555) 456-7890',
          website: null,
          rating: 4.6,
          reviews: 89,
          priceRange: '$',
          distance: '3.5 miles',
          dishPrice: 18,
          dishRating: 5,
          dishReviews: 28,
          isOpen: true,
          openUntil: '8:00 PM',
          features: ['Family Owned', 'Casual Dining', 'Large Portions'],
          specialNote: 'Best value for authentic taste'
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setDishInfo(mockDishInfo)
        setRestaurants(mockRestaurants)
        setFilteredRestaurants(mockRestaurants)
        setIsLoading(false)
      }, 1000)
    }
  }, [dish, country])

  // Filter restaurants based on search and filters
  useEffect(() => {
    let filtered = restaurants

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(restaurant => restaurant.location === filters.location)
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(restaurant => restaurant.priceRange === filters.priceRange)
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(restaurant => restaurant.rating >= Number(filters.rating))
    }

    // Distance filter
    if (filters.distance) {
      const maxDistance = parseFloat(filters.distance)
      filtered = filtered.filter(restaurant => 
        parseFloat(restaurant.distance) <= maxDistance
      )
    }

    // Sort restaurants
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'dishRating':
        filtered.sort((a, b) => b.dishRating - a.dishRating)
        break
      case 'price':
        filtered.sort((a, b) => a.dishPrice - b.dishPrice)
        break
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
        break
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
    }

    setFilteredRestaurants(filtered)
  }, [restaurants, searchQuery, filters])

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Finding restaurants...</p>
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
            <Link href={`/${country}/dishes`} className="hover:text-orange-800 dark:hover:text-orange-200">
              Dishes
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">{dishInfo?.name}</span>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              Best {dishInfo?.name} in {country}
            </h1>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              {dishInfo?.description}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dishInfo?.totalRestaurants}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Restaurants</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-500 mr-1" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dishInfo?.averagePrice}
                  </span>
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Avg Price</div>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-500 fill-current mr-1" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dishInfo?.averageRating}
                  </span>
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search restaurants..."
              className="text-lg"
            />
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
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
            >
              <option value="">All Locations</option>
              <option value="Downtown">Downtown</option>
              <option value="Little Italy">Little Italy</option>
              <option value="Arts District">Arts District</option>
              <option value="Suburbs">Suburbs</option>
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="px-3 py-1 rounded border border-orange-200 bg-white text-orange-700 text-sm dark:bg-orange-700 dark:border-orange-600 dark:text-orange-300"
            >
              <option value="">All Prices</option>
              <option value="$">$ - Budget</option>
              <option value="$$">$$ - Moderate</option>
              <option value="$$$">$$$ - Expensive</option>
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
              <option value="rating">Restaurant Rating</option>
              <option value="dishRating">Dish Rating</option>
              <option value="price">Price: Low to High</option>
              <option value="distance">Distance</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRestaurants.length > 0 ? (
          <div className="space-y-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                  {/* Restaurant Image */}
                  <div className="flex-shrink-0 mb-4 lg:mb-0">
                    <div className="w-full lg:w-32 h-32 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-4xl">🏪</span>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100">
                            {restaurant.name}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            restaurant.isOpen 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {restaurant.isOpen ? 'Open' : 'Closed'}
                          </div>
                        </div>
                        <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">
                          {restaurant.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {restaurant.location} • {restaurant.distance}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {restaurant.phone}
                          </div>
                          {restaurant.isOpen && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Open until {restaurant.openUntil}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right mt-4 sm:mt-0">
                        <div className="flex items-center mb-2">
                          <Star className="w-5 h-5 text-orange-500 fill-current mr-1" />
                          <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                            {restaurant.rating}
                          </span>
                          <span className="text-orange-600 dark:text-orange-400 text-sm ml-1">
                            ({restaurant.reviews})
                          </span>
                        </div>
                        <p className="text-orange-600 dark:text-orange-400 text-sm">
                          {restaurant.cuisine} • {restaurant.priceRange}
                        </p>
                      </div>
                    </div>

                    {/* Dish-specific Info */}
                    <div className="bg-orange-50 dark:bg-orange-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                            {dishInfo?.name} at this restaurant
                          </h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                              <span className="font-medium text-orange-900 dark:text-orange-100">
                                {restaurant.dishRating}
                              </span>
                              <span className="text-orange-600 dark:text-orange-400 ml-1">
                                ({restaurant.dishReviews} reviews)
                              </span>
                            </div>
                            <span className="text-orange-600 dark:text-orange-400">
                              {restaurant.specialNote}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${restaurant.dishPrice}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/${country}/restaurants/${restaurant.id}`}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                      >
                        View Restaurant
                      </Link>
                      <button className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                        <Navigation className="w-4 h-4 mr-2 inline" />
                        Directions
                      </button>
                      {restaurant.website && (
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                        >
                          <Globe className="w-4 h-4 mr-2 inline" />
                          Website
                        </a>
                      )}
                      <button className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                        <Heart className="w-4 h-4 mr-2 inline" />
                        Save
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
              Try adjusting your search or filters to find restaurants serving {dishInfo?.name}
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  location: '',
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

        {/* Load More */}
        {filteredRestaurants.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
              Load More Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
