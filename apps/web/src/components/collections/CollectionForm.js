import React, { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import {
  X,
  Image as ImageIcon,
  Search,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
// Define the validation schema using zod
const collectionSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(100, { message: 'Title must be at most 100 characters long' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' })
    .max(500, { message: 'Description must be at most 500 characters long' }),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long' })
    .max(100, { message: 'Location must be at most 100 characters long' }),
  imageUrl: z.string().optional(),
  restaurants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        imageUrl: z.string().optional(),
        cuisine: z.string().optional(),
        location: z.string().optional(),
      }),
    )
    .min(1, {
      message: 'Please add at least one restaurant to your collection',
    }),
});

/**
 * CollectionForm component for creating or editing a collection
 *
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial collection data for editing (optional)
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 * @param {string} props.submitButtonText - Text for the submit button
 * @returns {JSX.Element} - Rendered component
 */
const CollectionForm = memo(function CollectionForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Create Collection',
}) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      imageUrl: initialData?.imageUrl || '',
      restaurants: initialData?.restaurants || [],
    },
  });

  // Watch the restaurants array to update the UI
  const restaurants = watch('restaurants');

  // Handle image upload
  const handleImageUpload = useCallback(
    e => {
      const file = e.target.files[0];
      if (!file) return;

      // In a real app, this would upload the file to a server
      // For now, we'll just create a local URL
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        setImagePreview(imageUrl);
        setValue('imageUrl', imageUrl);
      };
      reader.readAsDataURL(file);
    },
    [setValue],
  );

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    setImagePreview('');
    setValue('imageUrl', '');
  }, [setValue]);

  // Handle restaurant search
  const handleSearchRestaurants = useCallback(async query => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // In a real app, this would call an API to search for restaurants
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock search results
      const results = [
        {
          id: '1',
          name: 'Spice Garden',
          imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&h=200&fit=crop',
          cuisine: 'Indian',
          location: 'Kuala Lumpur',
        },
        {
          id: '2',
          name: 'Sushi Express',
          imageUrl:
            'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200&h=200&fit=crop',
          cuisine: 'Japanese',
          location: 'Kuala Lumpur',
        },
        {
          id: '3',
          name: 'Pasta Paradise',
          imageUrl:
            'https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=200&h=200&fit=crop',
          cuisine: 'Italian',
          location: 'Kuala Lumpur',
        },
      ].filter(
        r =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching restaurants:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle adding a restaurant to the collection
  const handleAddRestaurant = useCallback(
    restaurant => {
      const currentRestaurants = watch('restaurants') || [];

      // Check if restaurant is already in the collection
      if (currentRestaurants.some(r => r.id === restaurant.id)) {
        return;
      }

      setValue('restaurants', [...currentRestaurants, restaurant]);
      setSearchQuery('');
      setSearchResults([]);
    },
    [watch, setValue],
  );

  // Handle removing a restaurant from the collection
  const handleRemoveRestaurant = useCallback(
    restaurantId => {
      const currentRestaurants = watch('restaurants') || [];
      setValue(
        'restaurants',
        currentRestaurants.filter(r => r.id !== restaurantId),
      );
    },
    [watch, setValue],
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    data => {
      if (onSubmit) {
        onSubmit(data);
      }
    },
    [onSubmit],
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Collection Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Collection Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="e.g., Best Brunch Spots in KL"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Collection Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Describe your collection..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Collection Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Location <span className="text-red-500">*</span>
        </label>
        <input
          id="location"
          type="text"
          {...register('location')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="e.g., Kuala Lumpur"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.location.message}
          </p>
        )}
      </div>

      {/* Collection Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cover Image
        </label>

        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <div className="relative mx-auto h-64 w-full rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Collection cover"
                  layout="fill"
                  objectFit="cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add Restaurants <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search for restaurants..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={e => handleSearchRestaurants(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-y-auto">
            <ul className="py-1">
              {searchResults.map(restaurant => (
                <li
                  key={restaurant.id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                  onClick={() => handleAddRestaurant(restaurant)}
                >
                  <div className="flex items-center">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        width={40}
                        height={40}
                        objectFit="cover"
                        className="rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {restaurant.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {restaurant.cuisine} • {restaurant.location}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isSearching && (
          <div className="mt-2 text-center py-2 text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        )}

        {/* Selected Restaurants */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected Restaurants ({restaurants?.length || 0})
          </h3>

          {restaurants?.length > 0 ? (
            <ul className="space-y-2">
              {restaurants.map(restaurant => (
                <li
                  key={restaurant.id}
                  className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        width={40}
                        height={40}
                        objectFit="cover"
                        className="rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {restaurant.name}
                      </p>
                      {(restaurant.cuisine || restaurant.location) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {restaurant.cuisine}{' '}
                          {restaurant.cuisine && restaurant.location && '•'}{' '}
                          {restaurant.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRestaurant(restaurant.id)}
                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 border border-gray-300 dark:border-gray-700 border-dashed rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                No restaurants added yet. Search and add restaurants to your
                collection.
              </p>
            </div>
          )}

          {errors.restaurants && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.restaurants.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
});

export default CollectionForm;
