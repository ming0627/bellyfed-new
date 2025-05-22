import React, { useState, memo } from 'react';
import Link from 'next/link';
import { Star, MapPin, Search, Filter, Heart } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

// Mock data for user favorites
const mockUserFavorites = [
  {
    id: '1',
    name: 'Nasi Lemak House',
    description: 'Authentic Malaysian cuisine specializing in Nasi Lemak',
    address: {
      street: '123 Jalan Bukit Bintang',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Malaysian', 'Halal'],
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 256,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
    savedAt: '2023-05-10T14:23:00Z',
  },
  {
    id: '2',
    name: 'Sushi Sensation',
    description: 'Premium Japanese sushi and sashimi restaurant',
    address: {
      street: '45 Jalan Sultan Ismail',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50250',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Japanese', 'Seafood'],
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 189,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop',
    savedAt: '2023-04-15T18:45:00Z',
  },
  {
    id: '3',
    name: 'Taco Temple',
    description: 'Authentic Mexican street food with a modern twist',
    address: {
      street: '78 Jalan Petaling',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50000',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Mexican', 'Fusion'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&h=400&fit=crop',
    savedAt: '2023-03-20T12:30:00Z',
  },
];

/**
 * UserFavorites component for displaying a user's favorite restaurants
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const UserFavorites = memo(function UserFavorites({
  user,
  getCountryLink,
}) {
  const [favorites, setFavorites] = useState(mockUserFavorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('all');
  
  // Get unique cuisine types from favorites
  const cuisineTypes = [...new Set(
    favorites.flatMap(favorite => favorite.cuisineTypes || [])
  )].sort();
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle cuisine filter change
  const handleCuisineFilterChange = (e) => {
    setFilterCuisine(e.target.value);
  };
  
  // Filter favorites based on search query and cuisine filter
  const filteredFavorites = favorites.filter((favorite) => {
    // Search filter
    const searchMatch = searchQuery === '' || 
      favorite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Cuisine filter
    const cuisineMatch = filterCuisine === 'all' || 
      favorite.cuisineTypes?.includes(filterCuisine);
    
    return searchMatch && cuisineMatch;
  });
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    
    const { street, city, state } = address;
    const parts = [street, city, state].filter(Boolean);
    return parts.join(', ');
  };
  
  // Remove from favorites
  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(favorite => favorite.id !== id));
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Favorite Restaurants ({filteredFavorites.length})
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideClientIcon
                icon={Search}
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search favorites..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Cuisine Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideClientIcon
                icon={Filter}
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={filterCuisine}
              onChange={handleCuisineFilterChange}
            >
              <option value="all">All Cuisines</option>
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Favorites List */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Restaurant Image */}
              <div className="relative h-48">
                {favorite.imageUrl ? (
                  <img
                    src={favorite.imageUrl}
                    alt={favorite.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No Image</span>
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={`Remove ${favorite.name} from favorites`}
                >
                  <LucideClientIcon
                    icon={Heart}
                    className="w-5 h-5 text-red-500 fill-current"
                    aria-hidden="true"
                  />
                </button>
                
                {/* Price Range */}
                {favorite.priceRange && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                    {favorite.priceRange}
                  </div>
                )}
              </div>
              
              {/* Restaurant Info */}
              <div className="p-4">
                <Link
                  href={getCountryLink(`/restaurants/${favorite.id}`)}
                  className="block font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors mb-1"
                >
                  {favorite.name}
                </Link>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-yellow-500 mr-2">
                    <LucideClientIcon icon={Star} className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span className="ml-1 text-xs font-medium">
                      {favorite.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    ({favorite.reviewCount?.toLocaleString() || 0} reviews)
                  </span>
                </div>
                
                {favorite.cuisineTypes && favorite.cuisineTypes.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {favorite.cuisineTypes.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-start text-gray-600 dark:text-gray-400 text-sm">
                  <LucideClientIcon
                    icon={MapPin}
                    className="w-4 h-4 mt-0.5 mr-1 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="line-clamp-2">
                    {formatAddress(favorite.address)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <LucideClientIcon
              icon={Heart}
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Favorites Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery || filterCuisine !== 'all'
              ? 'No favorites match your search criteria. Try adjusting your filters.'
              : `${user.name} hasn't saved any favorite restaurants yet.`}
          </p>
        </div>
      )}
    </div>
  );
});

export default UserFavorites;
