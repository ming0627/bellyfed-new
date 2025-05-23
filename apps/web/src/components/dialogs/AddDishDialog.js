/**
 * Add Dish Dialog Component
 * 
 * Modal dialog for adding new dishes to restaurants.
 * Includes form validation, image upload, and restaurant association.
 * 
 * Features:
 * - Comprehensive dish form
 * - Image upload with preview
 * - Restaurant selection
 * - Category and cuisine selection
 * - Price and description fields
 * - Form validation
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner, Badge } from '@bellyfed/ui';
import { LocationSearch } from '../location/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const AddDishDialog = ({
  isOpen = false,
  onClose,
  onDishAdded,
  restaurantId = null,
  restaurantName = '',
  className = ''
}) => {
  // State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'MYR',
    category: '',
    cuisine: '',
    ingredients: [],
    allergens: [],
    dietaryInfo: [],
    spiceLevel: '',
    preparationTime: '',
    servingSize: '',
    restaurantId: restaurantId || '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Form options
  const categories = [
    'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Soup', 'Salad', 'Snack'
  ];

  const cuisines = [
    'Malaysian', 'Chinese', 'Indian', 'Western', 'Japanese', 'Korean', 'Thai', 'Italian', 'Mexican', 'Other'
  ];

  const spiceLevels = [
    { value: 'none', label: 'No Spice' },
    { value: 'mild', label: 'Mild' },
    { value: 'medium', label: 'Medium' },
    { value: 'hot', label: 'Hot' },
    { value: 'very_hot', label: 'Very Hot' }
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'Keto', 'Low-Carb'
  ];

  const allergenOptions = [
    'Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Shellfish', 'Fish', 'Sesame'
  ];

  // Fetch restaurants for selection
  const fetchRestaurants = async () => {
    if (restaurantId) return; // Skip if restaurant is pre-selected

    setLoadingRestaurants(true);
    try {
      const data = await analyticsService.getRestaurants({
        limit: 50,
        userId: user?.id
      });
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please sign in to add dishes');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Dish name is required');
      return;
    }

    if (!formData.restaurantId) {
      setError('Please select a restaurant');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dishData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
        userId: user.id
      };

      const newDish = await analyticsService.createDish(dishData);

      // Track dish creation
      trackUserEngagement('dish', 'create', 'success', {
        dishId: newDish.id,
        restaurantId: formData.restaurantId,
        category: formData.category,
        cuisine: formData.cuisine
      });

      if (onDishAdded) {
        onDishAdded(newDish);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'MYR',
        category: '',
        cuisine: '',
        ingredients: [],
        allergens: [],
        dietaryInfo: [],
        spiceLevel: '',
        preparationTime: '',
        servingSize: '',
        restaurantId: restaurantId || '',
        images: []
      });
      setImagePreview(null);

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error creating dish:', err);
      setError(err.message || 'Failed to create dish');
      
      trackUserEngagement('dish', 'create', 'error', {
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload the file to a service
      setFormData(prev => ({
        ...prev,
        images: [{ file, url: URL.createObjectURL(file) }]
      }));
    }
  };

  // Handle array field changes
  const handleArrayFieldChange = (field, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [field]: isChecked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Load restaurants on mount
  useEffect(() => {
    if (isOpen) {
      fetchRestaurants();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              🍽️ Add New Dish
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter dish name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Restaurant Selection */}
            {!restaurantId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant *
                </label>
                {loadingRestaurants ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <select
                    value={formData.restaurantId}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select restaurant</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {restaurantId && restaurantName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                  {restaurantName}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the dish..."
              />
            </div>

            {/* Price and Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="flex">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="MYR">MYR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine
                </label>
                <select
                  value={formData.cuisine}
                  onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select cuisine</option>
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spice Level
                </label>
                <select
                  value={formData.spiceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, spiceLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select spice level</option>
                  {spiceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dietary Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Information
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietaryInfo.includes(option)}
                      onChange={(e) => handleArrayFieldChange('dietaryInfo', option, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allergenOptions.map(allergen => (
                  <label key={allergen} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allergens.includes(allergen)}
                      onChange={(e) => handleArrayFieldChange('allergens', allergen, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dish Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Dish preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, images: [] }));
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="dish-image"
                    />
                    <label
                      htmlFor="dish-image"
                      className="cursor-pointer text-gray-600 hover:text-gray-800"
                    >
                      <div className="text-4xl mb-2">📸</div>
                      <div className="text-sm">Click to upload dish image</div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !isAuthenticated}
              >
                {loading ? 'Adding Dish...' : 'Add Dish'}
              </Button>
            </div>
          </form>

          {/* Authentication Prompt */}
          {!isAuthenticated && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              Please sign in to add dishes to restaurants.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AddDishDialog;
