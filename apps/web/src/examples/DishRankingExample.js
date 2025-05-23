/**
 * DishRankingExample
 * 
 * This is an example of how to use the DishRanking component.
 * It demonstrates how to display dish rankings and handle user interactions.
 */

import React from 'react';
import DishRanking from '../components/dish/DishRanking.js';
import Layout from '../components/layout/Layout.js';

/**
 * Example of using the DishRanking component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const DishRankingExample = () => {
  // Sample dish data
  const dishData = {
    dishId: 'dish-123',
    dishSlug: 'nasi-lemak',
    dishName: 'Nasi Lemak',
    restaurantId: 'restaurant-456',
    restaurantName: 'Village Park Restaurant',
  };
  
  // Sample global ranking data
  const globalRanking = {
    averageRank: 4.2,
    totalVotes: 156,
    rankDistribution: {
      '1': 5,
      '2': 10,
      '3': 25,
      '4': 56,
      '5': 60,
    },
  };
  
  // Sample recent rankings data
  const recentRankings = [
    {
      id: 'ranking-1',
      user: {
        id: 'user-1',
        name: 'Sarah Lee',
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      rank: 5,
      notes: 'This is the best Nasi Lemak I\'ve ever had! The sambal is spicy but not overwhelming, and the coconut rice is perfectly cooked.',
      createdAt: '2023-06-15T08:30:00Z',
    },
    {
      id: 'ranking-2',
      user: {
        id: 'user-2',
        name: 'John Tan',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      rank: 4,
      notes: 'Very good Nasi Lemak, but I\'ve had better. The sambal could be a bit spicier.',
      createdAt: '2023-06-10T14:45:00Z',
    },
    {
      id: 'ranking-3',
      user: {
        id: 'user-3',
        name: 'Mei Ling',
        avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      },
      rank: 3,
      notes: 'It was okay, but nothing special. The rice was a bit dry.',
      createdAt: '2023-06-05T11:20:00Z',
    },
  ];

  return (
    <Layout
      title="Dish Ranking Example"
      description="Example of using the DishRanking component"
    >
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dish Ranking Example
        </h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {dishData.dishName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            From {dishData.restaurantName}
          </p>
          
          <DishRanking
            dishId={dishData.dishId}
            dishSlug={dishData.dishSlug}
            dishName={dishData.dishName}
            restaurantId={dishData.restaurantId}
            restaurantName={dishData.restaurantName}
            globalRanking={globalRanking}
            recentRankings={recentRankings}
            className="mb-8"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About This Example
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example demonstrates the DishRanking component, which displays ranking information for a specific dish. The component shows:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
            <li>Global ranking statistics, including average rank and rank distribution</li>
            <li>The user's own ranking (if authenticated and has ranked the dish)</li>
            <li>A button to add or edit the user's ranking</li>
            <li>Recent rankings from other users</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400">
            The component integrates with the useUserRanking hook to fetch and manage the user's ranking data. It also uses the RankingDialog component to allow users to add or edit their ranking.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DishRankingExample;
