/**
 * RankingCardExample
 * 
 * This is an example of how to use the RankingCard component.
 * It demonstrates how to display rankings for dishes, restaurants, reviewers, and locations.
 */

import React from 'react';
import { Trophy, Utensils, MapPin, Building } from 'lucide-react';
import RankingCard from '../components/rankings/RankingCard.js';
import Layout from '../components/layout/Layout.js';
import { useCountry } from '@bellyfed/hooks';

/**
 * Example of using the RankingCard component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const RankingCardExample = () => {
  const { currentCountry } = useCountry();
  
  // Generate country-specific links
  const getCountryLink = (path) => {
    if (!currentCountry) return path;
    return `/${currentCountry.code}${path}`;
  };
  
  // Mock data for top dishes
  const topDishes = [
    {
      id: '1',
      name: 'Nasi Lemak',
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurant: 'Village Park Restaurant',
      rating: 4.8,
      value: 256,
      trend: 'up',
    },
    {
      id: '2',
      name: 'Char Kway Teow',
      imageUrl: 'https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurant: 'Penang Famous',
      rating: 4.7,
      value: 198,
      trend: 'down',
    },
    {
      id: '3',
      name: 'Roti Canai',
      imageUrl: 'https://images.unsplash.com/photo-1626694733135-2d4c1b8c2f9e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurant: 'Mamak Corner',
      rating: 4.6,
      value: 187,
    },
    {
      id: '4',
      name: 'Laksa',
      imageUrl: 'https://images.unsplash.com/photo-1618626422502-5f0cf2b9c2b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurant: 'Laksa House',
      rating: 4.5,
      value: 165,
      trend: 'new',
    },
    {
      id: '5',
      name: 'Satay',
      imageUrl: 'https://images.unsplash.com/photo-1625471204571-eb11bafb0baa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      restaurant: 'Satay Station',
      rating: 4.4,
      value: 142,
    },
  ];
  
  // Mock data for top restaurants
  const topRestaurants = [
    {
      id: '1',
      name: 'Village Park Restaurant',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      cuisine: 'Malaysian',
      rating: 4.8,
      value: 324,
      trend: 'up',
    },
    {
      id: '2',
      name: 'Penang Famous',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
      cuisine: 'Chinese',
      rating: 4.7,
      value: 287,
    },
    {
      id: '3',
      name: 'Mamak Corner',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      cuisine: 'Indian',
      rating: 4.6,
      value: 256,
      trend: 'down',
    },
    {
      id: '4',
      name: 'Laksa House',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      cuisine: 'Malaysian',
      rating: 4.5,
      value: 198,
      trend: 'new',
    },
    {
      id: '5',
      name: 'Satay Station',
      imageUrl: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      cuisine: 'Malaysian',
      rating: 4.4,
      value: 176,
    },
  ];
  
  // Mock data for top reviewers
  const topReviewers = [
    {
      id: '1',
      name: 'Sarah Lee',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      specialty: 'Malaysian Cuisine',
      value: 87,
      trend: 'up',
    },
    {
      id: '2',
      name: 'John Tan',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      specialty: 'Street Food',
      value: 76,
    },
    {
      id: '3',
      name: 'Mei Ling',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      specialty: 'Desserts',
      value: 65,
      trend: 'down',
    },
    {
      id: '4',
      name: 'Raj Kumar',
      avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
      specialty: 'Indian Cuisine',
      value: 54,
      trend: 'new',
    },
    {
      id: '5',
      name: 'David Wong',
      avatarUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
      specialty: 'Fine Dining',
      value: 43,
    },
  ];
  
  // Mock data for top locations
  const topLocations = [
    {
      id: '1',
      name: 'Bukit Bintang',
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      city: 'Kuala Lumpur',
      value: 87,
      trend: 'up',
    },
    {
      id: '2',
      name: 'Bangsar',
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      city: 'Kuala Lumpur',
      value: 76,
    },
    {
      id: '3',
      name: 'Georgetown',
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      city: 'Penang',
      value: 65,
      trend: 'down',
    },
    {
      id: '4',
      name: 'Jonker Street',
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      city: 'Melaka',
      value: 54,
      trend: 'new',
    },
    {
      id: '5',
      name: 'Gurney Drive',
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      city: 'Penang',
      value: 43,
    },
  ];

  return (
    <Layout
      title="Ranking Card Example"
      description="Example of using the RankingCard component"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Ranking Card Example
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Top Dishes */}
          <RankingCard
            title="Top Dishes"
            viewAllLink="/dish-restaurants"
            viewAllLabel="View all top dishes"
            icon={Utensils}
            gradientFrom="orange-500"
            gradientTo="orange-600"
            items={topDishes}
            itemValueLabel="votes"
            highlightClass="bg-orange-50 dark:bg-orange-900/20"
            type="dish"
            getCountryLink={getCountryLink}
          />
          
          {/* Top Restaurants */}
          <RankingCard
            title="Top Restaurants"
            viewAllLink="/restaurants"
            viewAllLabel="View all top restaurants"
            icon={Building}
            gradientFrom="blue-600"
            gradientTo="blue-700"
            items={topRestaurants}
            itemValueLabel="reviews"
            highlightClass="bg-blue-50 dark:bg-blue-900/20"
            type="restaurant"
            getCountryLink={getCountryLink}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Reviewers */}
          <RankingCard
            title="Top Reviewers"
            viewAllLink="/social"
            viewAllLabel="View all top reviewers"
            icon={Trophy}
            gradientFrom="purple-600"
            gradientTo="purple-700"
            items={topReviewers}
            itemValueLabel="reviews"
            highlightClass="bg-purple-50 dark:bg-purple-900/20"
            type="reviewer"
            getCountryLink={getCountryLink}
          />
          
          {/* Top Locations */}
          <RankingCard
            title="Top Areas"
            viewAllLink="/restaurants"
            viewAllLabel="View all top areas"
            icon={MapPin}
            gradientFrom="green-600"
            gradientTo="green-700"
            items={topLocations}
            itemValueLabel="restaurants"
            highlightClass="bg-green-50 dark:bg-green-900/20"
            type="location"
            getCountryLink={getCountryLink}
          />
        </div>
      </div>
    </Layout>
  );
};

export default RankingCardExample;
