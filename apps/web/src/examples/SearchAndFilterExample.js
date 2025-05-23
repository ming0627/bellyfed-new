/**
 * SearchAndFilterExample
 * 
 * This is an example of how to use the SearchAndFilter component.
 * It demonstrates how to handle search and filter changes and display results.
 */

import React, { useState, useCallback } from 'react';
import SearchAndFilter from '../components/SearchAndFilter.js';
import Layout from '../components/layout/Layout.js';
import { useRouter } from 'next/router';
import { useCountry } from '@bellyfed/hooks';

/**
 * Example of using the SearchAndFilter component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const SearchAndFilterExample = () => {
  const router = useRouter();
  const { currentCountry } = useCountry();
  
  // State for search and filter parameters
  const [searchParams, setSearchParams] = useState({
    q: '',
    location: '',
    priceRange: [],
    cuisineTypes: [],
    rating: null,
    features: [],
    openNow: false,
    offerDelivery: false,
    offerTakeout: false,
  });
  
  // State for search results (mock data)
  const [results, setResults] = useState([]);
  
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle search and filter changes
  const handleSearch = useCallback((params) => {
    setSearchParams(params);
    
    // Simulate API call
    setIsLoading(true);
    
    // Mock data for demonstration
    const mockResults = [
      {
        id: '1',
        name: 'Delicious Restaurant',
        description: 'A fantastic place to eat',
        cuisineTypes: ['Malaysian', 'Chinese'],
        priceRange: '2',
        rating: 4.5,
        address: {
          street: '123 Main St',
          city: 'Kuala Lumpur',
          country: 'Malaysia',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            alt: 'Restaurant interior',
          },
        ],
        isOpen: true,
        offerDelivery: true,
        offerTakeout: true,
      },
      {
        id: '2',
        name: 'Spicy Delight',
        description: 'The best spicy food in town',
        cuisineTypes: ['Indian', 'Thai'],
        priceRange: '3',
        rating: 4.2,
        address: {
          street: '456 Spice Ave',
          city: 'Penang',
          country: 'Malaysia',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
            alt: 'Restaurant food',
          },
        ],
        isOpen: false,
        offerDelivery: true,
        offerTakeout: false,
      },
      {
        id: '3',
        name: 'Sushi Paradise',
        description: 'Fresh sushi and Japanese cuisine',
        cuisineTypes: ['Japanese'],
        priceRange: '4',
        rating: 4.8,
        address: {
          street: '789 Sushi Blvd',
          city: 'Kuala Lumpur',
          country: 'Malaysia',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
            alt: 'Sushi platter',
          },
        ],
        isOpen: true,
        offerDelivery: false,
        offerTakeout: true,
      },
    ];
    
    // Filter results based on search parameters
    const filtered = mockResults.filter(restaurant => {
      // Search query filter
      if (params.q && !restaurant.name.toLowerCase().includes(params.q.toLowerCase()) && 
          !restaurant.description.toLowerCase().includes(params.q.toLowerCase())) {
        return false;
      }
      
      // Location filter
      if (params.location && !restaurant.address.city.toLowerCase().includes(params.location.toLowerCase())) {
        return false;
      }
      
      // Price range filter
      if (params.priceRange.length > 0 && !params.priceRange.includes(restaurant.priceRange)) {
        return false;
      }
      
      // Cuisine types filter
      if (params.cuisineTypes.length > 0 && 
          !restaurant.cuisineTypes.some(cuisine => params.cuisineTypes.includes(cuisine))) {
        return false;
      }
      
      // Rating filter
      if (params.rating && restaurant.rating < params.rating) {
        return false;
      }
      
      // Open now filter
      if (params.openNow && !restaurant.isOpen) {
        return false;
      }
      
      // Delivery filter
      if (params.offerDelivery && !restaurant.offerDelivery) {
        return false;
      }
      
      // Takeout filter
      if (params.offerTakeout && !restaurant.offerTakeout) {
        return false;
      }
      
      return true;
    });
    
    // Simulate API delay
    setTimeout(() => {
      setResults(filtered);
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!currentCountry) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry]);

  return (
    <Layout
      title="Search and Filter Example"
      description="Example of using the SearchAndFilter component"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Search and Filter Example
        </h1>
        
        {/* SearchAndFilter Component */}
        <SearchAndFilter
          searchQuery={searchParams.q}
          locationQuery={searchParams.location}
          filters={{
            priceRange: searchParams.priceRange,
            cuisineTypes: searchParams.cuisineTypes,
            rating: searchParams.rating,
            openNow: searchParams.openNow,
            offerDelivery: searchParams.offerDelivery,
            offerTakeout: searchParams.offerTakeout,
          }}
          onSearch={handleSearch}
          onFilterChange={(filters) => handleSearch({ ...searchParams, ...filters })}
          searchPlaceholder="Search for restaurants, cuisines, dishes..."
          locationPlaceholder="Enter location (city, area, street...)"
          showLocationSearch={true}
          showFilters={true}
          availableFilters={['price', 'cuisine', 'rating', 'features']}
          className="mb-8"
        />
        
        {/* Results Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Search Results
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No results found. Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(restaurant => (
                <div 
                  key={restaurant.id}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-600"
                >
                  {restaurant.photos && restaurant.photos.length > 0 && (
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={restaurant.photos[0].url}
                        alt={restaurant.photos[0].alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {restaurant.rating}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {restaurant.priceRange === '1' ? '$' : 
                         restaurant.priceRange === '2' ? '$$' : 
                         restaurant.priceRange === '3' ? '$$$' : '$$$$'}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {restaurant.cuisineTypes.join(', ')}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {restaurant.address.street}, {restaurant.address.city}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {restaurant.isOpen && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Open Now
                        </span>
                      )}
                      {restaurant.offerDelivery && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Delivery
                        </span>
                      )}
                      {restaurant.offerTakeout && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Takeout
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchAndFilterExample;
