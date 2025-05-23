import React from 'react';
import Layout from '../../components/layout/Layout.js';

/**
 * Home page component
 * 
 * @returns {JSX.Element} HomePage component
 */
export default function HomePage() {
  return (
    <Layout
      title="Bellyfed - Discover Great Food"
      description="Discover and share great food experiences with Bellyfed"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Bellyfed
        </h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Discover and share great food experiences with Bellyfed. Find the best restaurants, dishes, and food recommendations in your area.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Dishes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Dishes
            </h2>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Top Reviewers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Reviewers
            </h2>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Top Restaurants */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Restaurants
            </h2>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
