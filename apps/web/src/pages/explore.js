import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Compass, 
  Star, 
  TrendingUp, 
  MapPin, 
  Clock,
  Filter,
  Search,
  Heart,
  Camera,
  Award,
  Zap,
  Users,
  ChefHat
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function ExplorePage() {
  const router = useRouter()
  const [exploreData, setExploreData] = useState(null)
  const [activeCategory, setActiveCategory] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock explore data
  useEffect(() => {
    const mockData = {
      trending: {
        title: 'Trending Now',
        description: 'What\'s hot in the food world right now',
        items: [
          {
            id: 1,
            type: 'restaurant',
            name: 'Fusion Bistro',
            image: '/images/fusion-bistro.jpg',
            rating: 4.8,
            category: 'Asian Fusion',
            location: 'Downtown',
            trending: '+45% this week',
            description: 'Innovative Asian fusion with a modern twist'
          },
          {
            id: 2,
            type: 'dish',
            name: 'Korean BBQ Tacos',
            image: '/images/korean-tacos.jpg',
            rating: 4.9,
            category: 'Street Food',
            restaurant: 'Seoul Kitchen',
            trending: '+67% this month',
            description: 'Perfect blend of Korean and Mexican flavors'
          },
          {
            id: 3,
            type: 'cuisine',
            name: 'Plant-Based Fine Dining',
            image: '/images/plant-based.jpg',
            rating: 4.7,
            category: 'Vegetarian',
            restaurants: 12,
            trending: '+89% this quarter',
            description: 'Elevated vegetarian cuisine gaining popularity'
          }
        ]
      },
      new: {
        title: 'New Discoveries',
        description: 'Recently opened restaurants and hidden gems',
        items: [
          {
            id: 4,
            type: 'restaurant',
            name: 'The Artisan Table',
            image: '/images/artisan-table.jpg',
            rating: 4.6,
            category: 'Farm-to-Table',
            location: 'Arts District',
            openedDate: '2024-01-10',
            description: 'Fresh, locally-sourced ingredients'
          },
          {
            id: 5,
            type: 'restaurant',
            name: 'Midnight Ramen',
            image: '/images/midnight-ramen.jpg',
            rating: 4.5,
            category: 'Japanese',
            location: 'Chinatown',
            openedDate: '2024-01-05',
            description: 'Authentic ramen open late night'
          }
        ]
      },
      topRated: {
        title: 'Top Rated',
        description: 'Highest rated restaurants and dishes',
        items: [
          {
            id: 6,
            type: 'restaurant',
            name: 'Le Bernardin',
            image: '/images/le-bernardin.jpg',
            rating: 4.9,
            category: 'French',
            location: 'Midtown',
            awards: ['Michelin Star', 'James Beard'],
            description: 'Exquisite French seafood cuisine'
          },
          {
            id: 7,
            type: 'dish',
            name: 'Wagyu Beef Tasting',
            image: '/images/wagyu-beef.jpg',
            rating: 4.9,
            category: 'Steakhouse',
            restaurant: 'Prime Cut',
            price: 85,
            description: 'Premium wagyu beef experience'
          }
        ]
      },
      categories: {
        title: 'Browse by Category',
        description: 'Explore different types of cuisine',
        items: [
          { id: 1, name: 'Italian', count: 234, icon: '🍝', color: 'bg-red-100 text-red-800' },
          { id: 2, name: 'Asian', count: 189, icon: '🍜', color: 'bg-yellow-100 text-yellow-800' },
          { id: 3, name: 'Mexican', count: 156, icon: '🌮', color: 'bg-green-100 text-green-800' },
          { id: 4, name: 'American', count: 145, icon: '🍔', color: 'bg-blue-100 text-blue-800' },
          { id: 5, name: 'Mediterranean', count: 98, icon: '🥗', color: 'bg-purple-100 text-purple-800' },
          { id: 6, name: 'Indian', count: 87, icon: '🍛', color: 'bg-orange-100 text-orange-800' }
        ]
      }
    }

    // Simulate API call
    setTimeout(() => {
      setExploreData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const clearSearch = () => {
    setSearchQuery('')
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'restaurant':
        return ChefHat
      case 'dish':
        return Award
      case 'cuisine':
        return Users
      default:
        return Star
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading explore page...</p>
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
              <Compass className="w-12 h-12 text-orange-500 mr-3" />
              <Search className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              Explore Food
            </h1>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Discover trending restaurants, new dishes, and hidden culinary gems
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={clearSearch}
                placeholder="Search restaurants, dishes, or cuisines..."
                className="text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'new', label: 'New', icon: Zap },
              { id: 'topRated', label: 'Top Rated', icon: Star },
              { id: 'categories', label: 'Categories', icon: Filter }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeCategory === id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories View */}
        {activeCategory === 'categories' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                {exploreData.categories.title}
              </h2>
              <p className="text-orange-700 dark:text-orange-300">
                {exploreData.categories.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {exploreData.categories.items.map((category) => (
                <Link
                  key={category.id}
                  href={`/restaurants?cuisine=${category.name.toLowerCase()}`}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">
                    {category.count} restaurants
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other Categories */}
        {activeCategory !== 'categories' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                {exploreData[activeCategory].title}
              </h2>
              <p className="text-orange-700 dark:text-orange-300">
                {exploreData[activeCategory].description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exploreData[activeCategory].items.map((item) => {
                const TypeIcon = getTypeIcon(item.type)
                
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="aspect-video bg-orange-100 dark:bg-orange-800 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-orange-400 text-6xl">
                          {item.type === 'restaurant' ? '🏪' : 
                           item.type === 'dish' ? '🍽️' : '🌍'}
                        </span>
                      </div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="flex items-center px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {item.type}
                        </span>
                      </div>

                      {/* Trending Badge */}
                      {item.trending && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                            {item.trending}
                          </span>
                        </div>
                      )}

                      {/* New Badge */}
                      {item.openedDate && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                            New
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                            <span>{item.category}</span>
                            {item.location && (
                              <>
                                <span className="mx-2">•</span>
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>{item.location}</span>
                              </>
                            )}
                            {item.restaurant && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{item.restaurant}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <button className="p-2 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                        {item.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                          <span className="font-semibold text-orange-900 dark:text-orange-100">
                            {item.rating}
                          </span>
                        </div>
                        
                        {item.price && (
                          <div className="font-semibold text-orange-900 dark:text-orange-100">
                            ${item.price}
                          </div>
                        )}
                        
                        {item.restaurants && (
                          <div className="text-orange-600 dark:text-orange-400">
                            {item.restaurants} restaurants
                          </div>
                        )}
                        
                        {item.openedDate && (
                          <div className="text-orange-600 dark:text-orange-400">
                            Opened {new Date(item.openedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Awards */}
                      {item.awards && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.awards.map((award, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-200"
                            >
                              {award}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      <Link
                        href={
                          item.type === 'restaurant' ? `/restaurants/${item.id}` :
                          item.type === 'dish' ? `/dishes/${item.id}` :
                          `/cuisine/${item.name.toLowerCase()}`
                        }
                        className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Quick Explore
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/restaurants?filter=nearby"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <MapPin className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Nearby
              </span>
            </Link>
            <Link
              href="/restaurants?filter=open-now"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Clock className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Open Now
              </span>
            </Link>
            <Link
              href="/restaurants?sort=rating"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Star className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Top Rated
              </span>
            </Link>
            <Link
              href="/social"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Camera className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Food Photos
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
