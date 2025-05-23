/**
 * ReviewsTabExample
 * 
 * This is an example of how to use the ReviewsTab component.
 * It demonstrates how to display a user's reviews in a profile tab.
 */

import React from 'react';
import ReviewsTab from '../components/profile/ReviewsTab.js';
import Layout from '../components/layout/Layout.js';
import { useCountry } from '@bellyfed/hooks';

/**
 * Example of using the ReviewsTab component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const ReviewsTabExample = () => {
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
      title="Reviews Tab Example"
      description="Example of using the ReviewsTab component"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Reviews Tab Example
        </h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {user.name}'s Reviews
          </h2>
          
          <ReviewsTab
            user={user}
            getCountryLink={getCountryLink}
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About This Example
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example demonstrates the ReviewsTab component, which displays a user's reviews in their profile. The component shows:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
            <li>A list of reviews the user has written, with details like restaurant name, dish, rating, and content</li>
            <li>Filtering options for rating, date, and search query</li>
            <li>Sorting options for date, rating, and restaurant name</li>
            <li>Photos the user has uploaded with their reviews</li>
            <li>Helpful count and comments count for each review</li>
            <li>Empty state handling for when no reviews are found</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400">
            In a real application, the reviews data would be fetched from an API using the useReviews hook, but for this example, we're using mock data.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewsTabExample;
