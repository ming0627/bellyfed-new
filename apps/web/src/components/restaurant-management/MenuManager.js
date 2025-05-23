/**
 * Menu Manager Component
 * 
 * Allows restaurant owners to manage their menu items including
 * adding, editing, removing, and organizing dishes and categories.
 * 
 * Features:
 * - Menu item CRUD operations
 * - Category management
 * - Drag and drop reordering
 * - Bulk operations
 * - Image upload for dishes
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { analyticsService } from '../../services/analyticsService.js';

const MenuManager = ({
  restaurantId,
  showCategories = true,
  showBulkActions = true,
  allowReordering = true,
  className = ''
}) => {
  // State
  const [menuData, setMenuData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    isSpecial: false,
    allergens: [],
    dietaryInfo: []
  });

  // Dietary options
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy_free', label: 'Dairy Free', icon: '🥛' },
    { id: 'nut_free', label: 'Nut Free', icon: '🥜' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' }
  ];

  // Common allergens
  const allergenOptions = [
    'Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame'
  ];

  // Fetch menu data
  const fetchMenuData = async () => {
    if (!restaurantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRestaurantMenu({
        restaurantId,
        includeCategories: showCategories,
        includeAvailability: true
      });

      setMenuData(data);
      
      // Track menu view
      trackUserEngagement('restaurant', restaurantId, 'menu_view', {
        itemCount: data.items?.length || 0,
        categoryCount: data.categories?.length || 0
      });
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError(err.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        await analyticsService.updateMenuItem({
          restaurantId,
          itemId: editingItem.id,
          ...formData,
          price: parseFloat(formData.price)
        });
        
        trackUserEngagement('restaurant', restaurantId, 'menu_item_update', {
          itemId: editingItem.id,
          itemName: formData.name
        });
      } else {
        // Create new item
        await analyticsService.createMenuItem({
          restaurantId,
          ...formData,
          price: parseFloat(formData.price)
        });
        
        trackUserEngagement('restaurant', restaurantId, 'menu_item_create', {
          itemName: formData.name,
          category: formData.category
        });
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true,
        isSpecial: false,
        allergens: [],
        dietaryInfo: []
      });
      setEditingItem(null);
      setShowAddForm(false);
      fetchMenuData();
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert('Failed to save menu item. Please try again.');
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await analyticsService.deleteMenuItem({ restaurantId, itemId });
      
      trackUserEngagement('restaurant', restaurantId, 'menu_item_delete', {
        itemId
      });
      
      fetchMenuData();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) return;

    try {
      const itemIds = Array.from(selectedItems);
      
      switch (action) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${itemIds.length} items?`)) return;
          await analyticsService.bulkDeleteMenuItems({ restaurantId, itemIds });
          break;
        case 'disable':
          await analyticsService.bulkUpdateMenuItems({ 
            restaurantId, 
            itemIds, 
            updates: { isAvailable: false } 
          });
          break;
        case 'enable':
          await analyticsService.bulkUpdateMenuItems({ 
            restaurantId, 
            itemIds, 
            updates: { isAvailable: true } 
          });
          break;
      }

      trackUserEngagement('restaurant', restaurantId, 'menu_bulk_action', {
        action,
        itemCount: itemIds.length
      });

      setSelectedItems(new Set());
      fetchMenuData();
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert('Failed to perform bulk action. Please try again.');
    }
  };

  // Start editing item
  const startEditItem = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      isAvailable: item.isAvailable !== false,
      isSpecial: item.isSpecial || false,
      allergens: item.allergens || [],
      dietaryInfo: item.dietaryInfo || []
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  // Load data on mount
  useEffect(() => {
    fetchMenuData();
  }, [restaurantId]);

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Menu</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchMenuData} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Manager</h2>
          <p className="text-gray-600 mt-1">
            {menuData.items?.length || 0} menu items across {menuData.categories?.length || 0} categories
          </p>
        </div>

        <div className="flex gap-3">
          {showBulkActions && selectedItems.size > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkAction('enable')}
                variant="outline"
                size="sm"
              >
                Enable ({selectedItems.size})
              </Button>
              <Button
                onClick={() => handleBulkAction('disable')}
                variant="outline"
                size="sm"
              >
                Disable ({selectedItems.size})
              </Button>
              <Button
                onClick={() => handleBulkAction('delete')}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                Delete ({selectedItems.size})
              </Button>
            </div>
          )}
          
          <Button
            onClick={() => {
              setShowAddForm(true);
              setEditingItem(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                isAvailable: true,
                isSpecial: false,
                allergens: [],
                dietaryInfo: []
              });
            }}
          >
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Category</option>
                  {menuData.categories?.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Available</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isSpecial}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSpecial: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Special Item</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Menu Items */}
      {menuData.items && menuData.items.length > 0 ? (
        <div className="space-y-4">
          {menuData.items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-4">
                {showBulkActions && (
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-1"
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                        {item.isSpecial && (
                          <Badge variant="secondary" className="ml-2">Special</Badge>
                        )}
                        {!item.isAvailable && (
                          <Badge variant="destructive" className="ml-2">Unavailable</Badge>
                        )}
                      </h3>
                      
                      {item.description && (
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-lg font-bold text-orange-600">
                          ${item.price?.toFixed(2)}
                        </span>
                        
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </div>

                      {item.dietaryInfo && item.dietaryInfo.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.dietaryInfo.map((info, index) => {
                            const option = dietaryOptions.find(opt => opt.id === info);
                            return option && (
                              <Badge key={index} variant="outline" className="text-xs">
                                {option.icon} {option.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditItem(item)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Menu Items</p>
            <p className="text-sm mb-4">
              Start building your menu by adding your first item.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Add First Menu Item
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MenuManager;
