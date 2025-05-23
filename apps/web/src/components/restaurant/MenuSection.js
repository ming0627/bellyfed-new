/**
 * Restaurant Menu Section Component
 * 
 * Displays restaurant menu with categories, items, prices, and descriptions.
 * Supports filtering, searching, and detailed item views.
 * 
 * Features:
 * - Menu categories and items
 * - Price display and currency formatting
 * - Item descriptions and ingredients
 * - Dietary restriction indicators
 * - Search and filtering
 * - Item availability status
 * - Photo integration
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'

const MenuSection = ({
  restaurantId,
  menu = [],
  showCategories = true,
  showSearch = true,
  showPrices = true,
  showImages = true,
  showDietaryInfo = true,
  currency = 'RM',
  className = ''
}) => {
  // State
  const [menuData, setMenuData] = useState(menu)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Load menu data
  useEffect(() => {
    const loadMenu = async () => {
      if (menu.length > 0) {
        setMenuData(menu)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Mock menu data (in real app, would fetch from API)
        const mockMenu = [
          {
            id: 'menu_1',
            name: 'Nasi Lemak Special',
            description: 'Fragrant coconut rice served with sambal, crispy anchovies, roasted peanuts, boiled egg, and cucumber slices',
            price: 8.50,
            category: 'Rice Dishes',
            image: '/images/menu/nasi-lemak-special.jpg',
            available: true,
            spiceLevel: 'medium',
            dietaryInfo: ['halal'],
            ingredients: ['coconut rice', 'sambal', 'anchovies', 'peanuts', 'egg', 'cucumber'],
            allergens: ['nuts', 'eggs'],
            calories: 450,
            preparationTime: '10-15 minutes'
          },
          {
            id: 'menu_2',
            name: 'Rendang Beef',
            description: 'Slow-cooked beef in rich coconut milk and aromatic spices, a traditional Malaysian delicacy',
            price: 15.00,
            category: 'Main Dishes',
            image: '/images/menu/rendang-beef.jpg',
            available: true,
            spiceLevel: 'mild',
            dietaryInfo: ['halal'],
            ingredients: ['beef', 'coconut milk', 'lemongrass', 'galangal', 'chili'],
            allergens: [],
            calories: 380,
            preparationTime: '15-20 minutes'
          },
          {
            id: 'menu_3',
            name: 'Char Kway Teow',
            description: 'Stir-fried flat rice noodles with prawns, Chinese sausage, bean sprouts, and dark soy sauce',
            price: 12.00,
            category: 'Noodles',
            image: '/images/menu/char-kway-teow.jpg',
            available: true,
            spiceLevel: 'mild',
            dietaryInfo: [],
            ingredients: ['rice noodles', 'prawns', 'chinese sausage', 'bean sprouts', 'soy sauce'],
            allergens: ['shellfish', 'soy'],
            calories: 520,
            preparationTime: '12-18 minutes'
          },
          {
            id: 'menu_4',
            name: 'Teh Tarik',
            description: 'Traditional Malaysian pulled tea with condensed milk, served hot',
            price: 3.50,
            category: 'Beverages',
            image: '/images/menu/teh-tarik.jpg',
            available: true,
            spiceLevel: 'none',
            dietaryInfo: ['vegetarian'],
            ingredients: ['black tea', 'condensed milk', 'evaporated milk'],
            allergens: ['dairy'],
            calories: 120,
            preparationTime: '3-5 minutes'
          },
          {
            id: 'menu_5',
            name: 'Satay Chicken',
            description: 'Grilled chicken skewers marinated in turmeric and spices, served with peanut sauce',
            price: 18.00,
            category: 'Grilled',
            image: '/images/menu/satay-chicken.jpg',
            available: false,
            spiceLevel: 'medium',
            dietaryInfo: ['halal'],
            ingredients: ['chicken', 'turmeric', 'lemongrass', 'peanut sauce'],
            allergens: ['nuts'],
            calories: 320,
            preparationTime: '20-25 minutes'
          },
          {
            id: 'menu_6',
            name: 'Cendol',
            description: 'Traditional dessert with pandan jelly, coconut milk, and palm sugar syrup over shaved ice',
            price: 5.50,
            category: 'Desserts',
            image: '/images/menu/cendol.jpg',
            available: true,
            spiceLevel: 'none',
            dietaryInfo: ['vegetarian', 'vegan'],
            ingredients: ['pandan jelly', 'coconut milk', 'palm sugar', 'shaved ice'],
            allergens: [],
            calories: 180,
            preparationTime: '5-8 minutes'
          }
        ]

        setMenuData(mockMenu)

        // Track menu view
        trackUserEngagement('restaurant', restaurantId, 'menu_view', {
          itemCount: mockMenu.length
        })
      } catch (err) {
        console.error('Error loading menu:', err)
        setError(err.message || 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [menu, restaurantId, trackUserEngagement])

  // Get unique categories
  const categories = ['all', ...new Set(menuData.map(item => item.category))]

  // Filter menu items
  const filteredItems = menuData.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    return matchesCategory && matchesSearch
  })

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    trackUserEngagement('restaurant', restaurantId, 'menu_filter', {
      category
    })
  }

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    trackUserEngagement('restaurant', restaurantId, 'menu_search', {
      query
    })
  }

  // Handle item click
  const handleItemClick = (item) => {
    setSelectedItem(item)
    trackUserEngagement('restaurant', restaurantId, 'menu_item_view', {
      itemId: item.id,
      itemName: item.name
    })
  }

  // Get spice level indicator
  const getSpiceLevelIndicator = (level) => {
    switch (level) {
      case 'none':
        return <span className="text-gray-400">🌶️</span>
      case 'mild':
        return <span className="text-green-500">🌶️</span>
      case 'medium':
        return <span className="text-yellow-500">🌶️🌶️</span>
      case 'hot':
        return <span className="text-red-500">🌶️🌶️🌶️</span>
      default:
        return null
    }
  }

  // Get dietary badges
  const getDietaryBadges = (dietaryInfo) => {
    return dietaryInfo.map(info => {
      const badgeProps = {
        halal: { variant: 'success', text: '🕌 Halal' },
        vegetarian: { variant: 'secondary', text: '🥬 Vegetarian' },
        vegan: { variant: 'secondary', text: '🌱 Vegan' },
        'gluten-free': { variant: 'warning', text: '🌾 Gluten-Free' }
      }
      
      const props = badgeProps[info] || { variant: 'default', text: info }
      
      return (
        <Badge key={info} variant={props.variant} size="sm">
          {props.text}
        </Badge>
      )
    })
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading menu...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Menu
          </h2>
          <p className="text-gray-600">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        )}
      </div>

      {/* Category Filters */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'all' ? 'All Items' : category}
            </Button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`p-6 cursor-pointer hover:shadow-md transition-shadow ${
                !item.available ? 'opacity-60' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex gap-6">
                {/* Item Image */}
                {showImages && (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-food.jpg'
                      }}
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {!item.available && (
                          <Badge variant="error" size="sm">
                            Unavailable
                          </Badge>
                        )}
                        {getSpiceLevelIndicator(item.spiceLevel)}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Dietary Info */}
                      {showDietaryInfo && item.dietaryInfo.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getDietaryBadges(item.dietaryInfo)}
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {item.calories && (
                          <span>🔥 {item.calories} cal</span>
                        )}
                        {item.preparationTime && (
                          <span>⏱️ {item.preparationTime}</span>
                        )}
                        {item.allergens.length > 0 && (
                          <span>⚠️ Contains: {item.allergens.join(', ')}</span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    {showPrices && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-orange-600">
                          {currency}{item.price.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No menu items found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms.'
              : 'Menu items will appear here when available.'
            }
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => handleSearch('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedItem.name}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              {selectedItem.image && (
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-6">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.jpg'
                    }}
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{selectedItem.category}</Badge>
                    {getSpiceLevelIndicator(selectedItem.spiceLevel)}
                    {!selectedItem.available && (
                      <Badge variant="error">Unavailable</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {currency}{selectedItem.price.toFixed(2)}
                  </div>
                </div>

                <p className="text-gray-700">{selectedItem.description}</p>

                {selectedItem.dietaryInfo.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                      {getDietaryBadges(selectedItem.dietaryInfo)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.ingredients.map((ingredient) => (
                        <Badge key={ingredient} variant="outline" size="sm">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Nutrition & Info</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>🔥 {selectedItem.calories} calories</div>
                      <div>⏱️ {selectedItem.preparationTime}</div>
                      {selectedItem.allergens.length > 0 && (
                        <div>⚠️ Contains: {selectedItem.allergens.join(', ')}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
                <Button
                  disabled={!selectedItem.available}
                  onClick={() => {
                    // Handle add to order
                    console.log('Add to order:', selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  {selectedItem.available ? 'Add to Order' : 'Unavailable'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MenuSection
