import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Search, Filter, Star, MapPin, Clock, Heart, ChefHat } from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function RestaurantsPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    rating: '',
    location: '',
    sortBy: 'popular'
  })

  // Mock data for restaurants
  useEffect(() => {
    const mockRestaurants = [
      {
        id: 1,
        name: 'The Golden Spoon',
        description: 'Fine dining with contemporary Italian cuisine and exceptional service',
        cuisine: 'Italian',
        priceRange: '$$$',
        rating: 4.9,
        reviewCount: 456,
        location: 'Downtown',
        address: '123 Main St, Downtown',
        phone: '(555) 123-4567',
        hours: 'Open until 10:00 PM',
        image: '/images/golden-spoon.jpg',
        isOpen: true,
        features: ['Fine Dining', 'Wine Bar', 'Outdoor Seating'],
        popularDishes: ['Truffle Pasta', 'Osso Buco', 'Tiramisu']
      },
      {
        id: 2,
        name: 'Casa España',
        description: 'Authentic Spanish tapas and paella in a vibrant atmosphere',
        cuisine: 'Spanish',
        priceRange: '$$',
        rating: 4.8,
        reviewCount: 389,
        location: 'Spanish Quarter',
        address: '456 Tapas Ave, Spanish Quarter',
        phone: '(555) 234-5678',
        hours: 'Open until 11:00 PM',
        image: '/images/casa-espana.jpg',
        isOpen: true,
        features: ['Tapas Bar', 'Live Music', 'Group Dining'],
        popularDishes: ['Paella Valenciana', 'Jamón Ibérico', 'Sangria']
      },
      {
        id: 3,
        name: 'Burger Palace',
        description: 'Gourmet burgers made with premium ingredients and artisanal buns',
        cuisine: 'American',
        priceRange: '$$',
        rating: 4.7,
        reviewCount: 567,
        location: 'Midtown',
        address: '789 Burger Blvd, Midtown',
        phone: '(555) 345-6789',
        hours: 'Open until 9:00 PM',
        image: '/images/burger-palace.jpg',
        isOpen: true,
        features: ['Casual Dining', 'Takeout', 'Delivery'],
        popularDishes: ['Wagyu Burger', 'Truffle Fries', 'Milkshakes']
      },
      {
        id: 4,
        name: 'Noodle House',
        description: 'Traditional Japanese ramen and authentic Asian noodle dishes',
        cuisine: 'Japanese',
        priceRange: '$',
        rating: 4.6,
        reviewCount: 234,
        location: 'Little Tokyo',
        address: '321 Ramen Row, Little Tokyo',
        phone: '(555) 456-7890',
        hours: 'Closed',
        image: '/images/noodle-house.jpg',
        isOpen: false,
        features: ['Quick Service', 'Vegetarian Options', 'Counter Seating'],
        popularDishes: ['Tonkotsu Ramen', 'Gyoza', 'Miso Soup']
      }
    ]

    // Simulate API call
    setTimeout(() => {
      setRestaurants(mockRestaurants)
      setFilteredRestaurants(mockRestaurants)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter restaurants based on search and filters
  useEffect(() => {
    let filtered = restaurants

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Cuisine filter
    if (filters.cuisine) {
      filtered = filtered.filter(restaurant => restaurant.cuisine === filters.cuisine)
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(restaurant => restaurant.priceRange === filters.priceRange)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(restaurant => restaurant.location === filters.location)
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(restaurant => restaurant.rating >= Number(filters.rating))
    }

    // Sort restaurants
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        // For demo purposes, just reverse the order
        filtered.reverse()
        break
    }

    setFilteredRestaurants(filtered)
  }, [restaurants, searchQuery, filters])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearSearch = () => {
    setSearchQuery('')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                Discover Restaurants
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Find amazing restaurants and culinary experiences near you
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search for restaurants, cuisines, or locations..."
              className="text-lg"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
            >
              <option value="">All Cuisines</option>
              <option value="Italian">Italian</option>
              <option value="American">American</option>
              <option value="Japanese">Japanese</option>
              <option value="Spanish">Spanish</option>
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
            >
              <option value="">All Prices</option>
              <option value="$">$ - Budget</option>
              <option value="$$">$$ - Moderate</option>
              <option value="$$$">$$$ - Expensive</option>
              <option value="$$$$">$$$$ - Very Expensive</option>
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
            >
              <option value="">All Locations</option>
              <option value="Downtown">Downtown</option>
              <option value="Midtown">Midtown</option>
              <option value="Spanish Quarter">Spanish Quarter</option>
              <option value="Little Tokyo">Little Tokyo</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredRestaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/restaurants/${restaurant.id}`)}
              >
                {/* Restaurant Image */}
                <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center relative overflow-hidden">
                  <span className="text-orange-400 text-4xl">🏪</span>
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isOpen 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </div>
                  <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-orange-500" />
                  </button>
                </div>

                {/* Restaurant Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {restaurant.name}
                    </h3>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {restaurant.priceRange}
                    </span>
                  </div>

                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center text-orange-500">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {restaurant.rating} ({restaurant.reviewCount})
                    </div>
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {restaurant.hours}
                    </div>
                  </div>

                  <div className="border-t border-orange-200 dark:border-orange-800 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.location}
                      </div>
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {restaurant.cuisine}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {restaurant.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300"
                        >
                          {feature}
                        </span>
                      ))}
                      {restaurant.features.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300">
                          +{restaurant.features.length - 2} more
                        </span>
                      )}
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
              Try adjusting your search or filters to find more restaurants
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  cuisine: '',
                  priceRange: '',
                  rating: '',
                  location: '',
                  sortBy: 'popular'
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
