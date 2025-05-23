import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Search, Filter, Star, MapPin, Clock, Heart } from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function DishesPage() {
  const router = useRouter()
  const { country } = router.query
  const [dishes, setDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    rating: '',
    sortBy: 'popular'
  })

  // Mock data for dishes
  useEffect(() => {
    const mockDishes = [
      {
        id: 1,
        name: 'Truffle Pasta',
        description: 'Handmade pasta with black truffle and parmesan cheese',
        restaurant: 'The Golden Spoon',
        restaurantId: 1,
        cuisine: 'Italian',
        price: 28,
        rating: 4.9,
        reviewCount: 156,
        image: '/images/truffle-pasta.jpg',
        location: 'Downtown',
        prepTime: '25 min',
        isPopular: true,
        tags: ['pasta', 'truffle', 'premium']
      },
      {
        id: 2,
        name: 'Wagyu Burger',
        description: 'Premium wagyu beef burger with artisanal bun and fries',
        restaurant: 'Burger Palace',
        restaurantId: 2,
        cuisine: 'American',
        price: 35,
        rating: 4.7,
        reviewCount: 203,
        image: '/images/wagyu-burger.jpg',
        location: 'Midtown',
        prepTime: '20 min',
        isPopular: true,
        tags: ['burger', 'wagyu', 'premium']
      },
      {
        id: 3,
        name: 'Ramen Bowl',
        description: 'Rich tonkotsu broth with chashu pork and soft-boiled egg',
        restaurant: 'Noodle House',
        restaurantId: 3,
        cuisine: 'Japanese',
        price: 18,
        rating: 4.6,
        reviewCount: 89,
        image: '/images/ramen-bowl.jpg',
        location: 'Little Tokyo',
        prepTime: '15 min',
        isPopular: false,
        tags: ['ramen', 'pork', 'comfort']
      },
      {
        id: 4,
        name: 'Paella Valenciana',
        description: 'Traditional Spanish paella with saffron rice and seafood',
        restaurant: 'Casa España',
        restaurantId: 4,
        cuisine: 'Spanish',
        price: 32,
        rating: 4.8,
        reviewCount: 124,
        image: '/images/paella.jpg',
        location: 'Spanish Quarter',
        prepTime: '35 min',
        isPopular: true,
        tags: ['paella', 'seafood', 'traditional']
      }
    ]

    // Simulate API call
    setTimeout(() => {
      setDishes(mockDishes)
      setFilteredDishes(mockDishes)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter dishes based on search and filters
  useEffect(() => {
    let filtered = dishes

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Cuisine filter
    if (filters.cuisine) {
      filtered = filtered.filter(dish => dish.cuisine === filters.cuisine)
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(dish => dish.price >= min && dish.price <= max)
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(dish => dish.rating >= Number(filters.rating))
    }

    // Sort dishes
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredDishes(filtered)
  }, [dishes, searchQuery, filters])

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
          <p className="text-orange-600 dark:text-orange-400">Loading delicious dishes...</p>
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
            <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              Discover Amazing Dishes
            </h1>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Explore the best dishes from top restaurants in {country}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Search for dishes, cuisines, or restaurants..."
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
              <option value="0-20">$0 - $20</option>
              <option value="20-30">$20 - $30</option>
              <option value="30-50">$30 - $50</option>
              <option value="50-100">$50+</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredDishes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/${country}/dishes/${dish.id}`)}
              >
                {/* Dish Image */}
                <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center relative overflow-hidden">
                  <span className="text-orange-400 text-4xl">🍽️</span>
                  {dish.isPopular && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Popular
                    </div>
                  )}
                  <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-orange-500" />
                  </button>
                </div>

                {/* Dish Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {dish.name}
                    </h3>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      ${dish.price}
                    </span>
                  </div>

                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3 line-clamp-2">
                    {dish.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center text-orange-500">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {dish.rating} ({dish.reviewCount})
                    </div>
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {dish.prepTime}
                    </div>
                  </div>

                  <div className="border-t border-orange-200 dark:border-orange-800 pt-3">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/${country}/restaurants/${dish.restaurantId}`}
                        className="text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {dish.restaurant}
                      </Link>
                      <div className="flex items-center text-xs text-orange-500 dark:text-orange-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        {dish.location}
                      </div>
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
              No dishes found
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              Try adjusting your search or filters to find more dishes
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  cuisine: '',
                  priceRange: '',
                  rating: '',
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
