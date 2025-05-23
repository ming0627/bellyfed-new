/**
 * RestaurantListExample
 * 
 * This is an example of how to use the RestaurantList component.
 * It demonstrates how to handle loading more restaurants and filtering.
 */

import React, { useState, useCallback } from 'react';
import RestaurantList from '../components/restaurants/RestaurantList.js';
import Layout from '../components/layout/Layout.js';
import { useCountry } from '@bellyfed/hooks';

/**
 * Example of using the RestaurantList component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantListExample = () => {
  const { currentCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Mock data for restaurants
  const [restaurants, setRestaurants] = useState([
    {
      id: '1',
      name: 'Delicious Restaurant',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      rating: 4.5,
      reviewCount: 128,
      cuisine: 'Malaysian',
      priceRange: '$$',
      location: 'Kuala Lumpur',
      distance: '1.2 km',
      isOpen: true,
      isVerified: true,
      description: 'A fantastic place to eat with authentic Malaysian cuisine.',
    },
    {
      id: '2',
      name: 'Spicy Delight',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
      rating: 4.2,
      reviewCount: 95,
      cuisine: 'Indian',
      priceRange: '$$$',
      location: 'Petaling Jaya',
      distance: '3.5 km',
      isOpen: false,
      isVerified: false,
      description: 'The best spicy food in town with authentic Indian flavors.',
    },
    {
      id: '3',
      name: 'Sushi Paradise',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      rating: 4.8,
      reviewCount: 210,
      cuisine: 'Japanese',
      priceRange: '$$$$',
      location: 'Bangsar',
      distance: '2.1 km',
      isOpen: true,
      isVerified: true,
      description: 'Fresh sushi and Japanese cuisine in a modern setting.',
    },
  ]);
  
  // Generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!currentCountry) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry]);
  
  // Handle loading more restaurants
  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRestaurants = [
        {
          id: '4',
          name: 'Burger Joint',
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          rating: 4.0,
          reviewCount: 156,
          cuisine: 'American',
          priceRange: '$$',
          location: 'KLCC',
          distance: '0.8 km',
          isOpen: true,
          isVerified: false,
          description: 'Juicy burgers and crispy fries in a casual setting.',
        },
        {
          id: '5',
          name: 'Pasta Palace',
          imageUrl: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          rating: 4.3,
          reviewCount: 89,
          cuisine: 'Italian',
          priceRange: '$$$',
          location: 'Mont Kiara',
          distance: '4.2 km',
          isOpen: true,
          isVerified: true,
          description: 'Authentic Italian pasta and pizza with a great wine selection.',
        },
        {
          id: '6',
          name: 'Taco Temple',
          imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          rating: 4.1,
          reviewCount: 72,
          cuisine: 'Mexican',
          priceRange: '$$',
          location: 'Damansara',
          distance: '5.0 km',
          isOpen: false,
          isVerified: false,
          description: 'Authentic Mexican tacos, burritos, and margaritas.',
        },
      ];
      
      setRestaurants(prev => [...prev, ...newRestaurants]);
      setIsLoading(false);
      
      // No more restaurants to load after this
      setHasMore(false);
    }, 1500);
  }, []);

  return (
    <Layout
      title="Restaurant List Example"
      description="Example of using the RestaurantList component"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Restaurant List Example
        </h1>
        
        <RestaurantList
          restaurants={restaurants}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          getCountryLink={getCountryLink}
          showFilters={true}
          emptyMessage="No restaurants found. Try adjusting your filters."
          className="mb-8"
        />
      </div>
    </Layout>
  );
};

export default RestaurantListExample;
