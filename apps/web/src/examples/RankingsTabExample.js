/**
 * RankingsTabExample
 * 
 * This is an example of how to use the RankingsTab component.
 * It demonstrates how to display a user's rankings in a profile tab.
 */

import React from 'react';
import RankingsTab from '../components/profile/RankingsTab.js';
import Layout from '../components/layout/Layout.js';
import { useCountry } from '@bellyfed/hooks';

/**
 * Example of using the RankingsTab component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const RankingsTabExample = () => {
  const { currentCountry } = useCountry();
  
  // Generate country-specific links
  const getCountryLink = (path) => {
    if (!currentCountry) return path;
    return `/${currentCountry.code}${path}`;
  };
  
  // Sample user data
  const user = {
    id: 'user1',
    name: 'Sarah Lee',
    username: 'sarahlee',
    email: 'sarah.lee@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Food enthusiast and amateur chef',
    location: 'Kuala Lumpur, Malaysia',
    website: 'https://sarahlee.com',
    joinedDate: '2022-01-15T00:00:00Z',
    reviewCount: 42,
    favoriteCount: 15,
    rankingCount: 23,
    badgeCount: 7,
    followersCount: 120,
    followingCount: 85,
    isVerified: true,
  };

  return (
    <Layout
      title="Rankings Tab Example"
      description="Example of using the RankingsTab component"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Rankings Tab Example
        </h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {user.name}'s Rankings
          </h2>
          
          <RankingsTab
            user={user}
            getCountryLink={getCountryLink}
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About This Example
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example demonstrates the RankingsTab component, which displays a user's dish rankings in their profile. The component shows:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
            <li>A list of dishes the user has ranked, with details like dish name, restaurant, cuisine, and rank</li>
            <li>Filtering options for rank, cuisine, and search query</li>
            <li>Sorting options for date, rank, and dish name</li>
            <li>Taste status indicators (Loved it, Liked it, It was okay, Didn't like it)</li>
            <li>Photos the user has uploaded with their rankings</li>
            <li>Empty state handling for when no rankings are found</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400">
            In a real application, the rankings data would be fetched from an API using the useUserRanking hook, but for this example, we're using mock data.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RankingsTabExample;
