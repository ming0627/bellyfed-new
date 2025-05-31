/**
 * Menu Management Component
 * 
 * Comprehensive menu management system for restaurant owners.
 * Allows CRUD operations on menu items, categories, and pricing.
 * 
 * Features:
 * - Menu item creation, editing, and deletion
 * - Category management
 * - Availability controls
 * - Pricing management
 * - Bulk operations
 * - Search and filtering
 * 
 * Next.js 15 Compatible:
 * - Default export only
 * - JavaScript (.js) file
 * - No React import needed
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Tag,
  Clock,
  Star
} from 'lucide-react'

export default function MenuManagement({ restaurantId, country = 'my' }) {
  const [menuData, setMenuData] = useState({ categories: [], items: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [editingItem, setEditingItem] = useState(null)

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    isSpecial: false,
    preparationTime: '',
    allergens: [],
    dietaryInfo: []
  })

  // Dietary options
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy_free', label: 'Dairy Free', icon: '🥛' },
    { id: 'nut_free', label: 'Nut Free', icon: '🥜' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' }
  ]

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        const mockData = {
          categories: [
            { id: 1, name: 'Appetizers', itemCount: 8 },
            { id: 2, name: 'Main Courses', itemCount: 15 },
            { id: 3, name: 'Desserts', itemCount: 6 },
            { id: 4, name: 'Beverages', itemCount: 12 }
          ],
          items: [
            {
              id: 1,
              name: 'Truffle Pasta',
              description: 'Fresh pasta with truffle oil and parmesan',
              price: 28.99,
              category: 'Main Courses',
              isAvailable: true,
              isSpecial: true,
              preparationTime: '15 mins',
              dietaryInfo: ['vegetarian'],
              allergens: ['dairy', 'gluten'],
              orders: 45,
              rating: 4.8
            },
            {
              id: 2,
              name: 'Grilled Salmon',
              description: 'Atlantic salmon with seasonal vegetables',
              price: 32.99,
              category: 'Main Courses',
              isAvailable: true,
              isSpecial: false,
              preparationTime: '20 mins',
              dietaryInfo: ['gluten_free'],
              allergens: ['fish'],
              orders: 38,
              rating: 4.6
            },
            {
              id: 3,
              name: 'Caesar Salad',
              description: 'Classic caesar with house-made croutons',
              price: 16.99,
              category: 'Appetizers',
              isAvailable: false,
              isSpecial: false,
              preparationTime: '10 mins',
              dietaryInfo: [],
              allergens: ['dairy', 'eggs'],
              orders: 22,
              rating: 4.3
            }
          ]
        }
        
        setTimeout(() => {
          setMenuData(mockData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching menu data:', error)
        setIsLoading(false)
      }
    }

    if (restaurantId) {
      fetchMenuData()
    }
  }, [restaurantId])

  const filteredItems = menuData.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }



  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      console.log('Deleting item:', itemId)
      // TODO: Implement actual deletion
      // fetchMenuData() // Refresh data
    } catch (err) {
      console.error('Error deleting menu item:', err)
      alert('Failed to delete menu item. Please try again.')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) return

    try {
      const itemIds = Array.from(selectedItems)
      
      switch (action) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${itemIds.length} items?`)) return
          console.log('Bulk deleting items:', itemIds)
          break
        case 'disable':
          console.log('Bulk disabling items:', itemIds)
          break
        case 'enable':
          console.log('Bulk enabling items:', itemIds)
          break
      }

      setSelectedItems(new Set())
      // fetchMenuData() // Refresh data
    } catch (err) {
      console.error('Error performing bulk action:', err)
      alert('Failed to perform bulk action. Please try again.')
    }
  }

  const startEditItem = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      isAvailable: item.isAvailable !== false,
      isSpecial: item.isSpecial || false,
      preparationTime: item.preparationTime || '',
      allergens: item.allergens || [],
      dietaryInfo: item.dietaryInfo || []
    })
    setEditingItem(item)
    // TODO: Navigate to edit page or show edit modal
    console.log('Edit item:', item.id)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-orange-200 dark:bg-orange-700 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-orange-200 dark:bg-orange-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">Menu Management</h2>
          <p className="text-orange-600 dark:text-orange-400 mt-1">
            {filteredItems.length} of {menuData.items.length} menu items
          </p>
        </div>

        <div className="flex gap-3">
          {selectedItems.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('enable')}
                className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
              >
                Enable ({selectedItems.size})
              </button>
              <button
                onClick={() => handleBulkAction('disable')}
                className="px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-300"
              >
                Disable ({selectedItems.size})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
              >
                Delete ({selectedItems.size})
              </button>
            </div>
          )}
          
          <Link
            href={`/${country}/restaurant/menu/add`}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
            >
              <option value="all">All Categories</option>
              {menuData.categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.itemCount})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                      {item.name}
                      {item.isSpecial && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                          Special
                        </span>
                      )}
                    </h3>

                    {item.description && (
                      <p className="text-orange-600 dark:text-orange-400 text-sm mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {item.isAvailable ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full dark:bg-orange-800 dark:text-orange-200">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-orange-600 dark:text-orange-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {item.preparationTime}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {item.rating}
                    </div>
                  </div>
                  <div className="text-xs">
                    {item.orders} orders
                  </div>
                </div>

                {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryInfo.map((info, index) => {
                      const option = dietaryOptions.find(opt => opt.id === info)
                      return option && (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-200">
                          {option.icon} {option.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-orange-200 dark:border-orange-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditItem(item)}
                      className="flex items-center px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>

                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-8 text-center">
          <div className="text-orange-500 mb-4">
            <Tag className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-2">
            No Menu Items Found
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start building your menu by adding your first item.'
            }
          </p>
          <Link
            href={`/${country}/restaurant/menu/add`}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Link>
        </div>
      )}
    </div>
  )
}
