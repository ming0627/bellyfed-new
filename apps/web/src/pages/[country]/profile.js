import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/layout/Layout.js';
import ProfileHeader from '../../components/profile/ProfileHeader.js';
import ProfileTabs from '../../components/profile/ProfileTabs.js';
import { useCountry } from '../../contexts/index.js';

// Mock user data
const mockUser = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah.chen@example.com',
  bio: 'Food enthusiast and travel blogger. Always on the lookout for the next culinary adventure!',
  location: 'Kuala Lumpur, Malaysia',
  profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&h=400&fit=crop',
  joinDate: '2022-03-15T00:00:00Z',
  reviewCount: 24,
  commentCount: 56,
  favoriteCount: 18,
  badgeCount: 5,
  badges: [
    {
      id: '1',
      name: 'Malaysian Cuisine Expert',
      icon: '🇲🇾',
      description: 'Awarded for extensive knowledge and reviews of Malaysian cuisine',
      category: 'Cuisine',
      level: 'expert',
    },
    {
      id: '2',
      name: 'Top Reviewer',
      icon: '⭐',
      description: 'One of the top reviewers in Kuala Lumpur',
      category: 'Achievement',
      level: 'gold',
    },
    {
      id: '3',
      name: 'Photo Contributor',
      icon: '📸',
      description: 'Contributed high-quality photos to restaurant listings',
      category: 'Contribution',
      level: 'silver',
    },
  ],
};

/**
 * ProfilePage component for displaying user profile
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function ProfilePage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [isCurrentUser, setIsCurrentUser] = useState(true); // For demo purposes, assume it's the current user
  
  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);
  
  // Fetch user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => {
      // In a real app, this would fetch data from an API
      return Promise.resolve(mockUser);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });
  
  // Handle edit profile action
  const handleEditProfile = (section) => {
    console.log(`Editing ${section}`);
    // In a real app, this would open a modal or navigate to an edit page
    alert(`Editing ${section} - This would open an edit modal in a real app`);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout
        title="Profile"
        description="User profile page"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse space-y-8 w-full max-w-3xl">
              {/* Header skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="relative px-4 sm:px-6 pb-6">
                  <div className="w-32 h-32 mx-auto -mt-16 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800"></div>
                  <div className="mt-4 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
                    <div className="flex justify-center space-x-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Layout
        title="Profile Error"
        description="Error loading profile"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the profile. Please try again later.
              </p>
              <button
                onClick={() => router.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title={`${user.name}'s Profile`}
      description={`View ${user.name}'s profile, reviews, and favorites`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader
          user={user}
          isCurrentUser={isCurrentUser}
          onEditProfile={handleEditProfile}
          getCountryLink={getCountryLink}
        />
        
        <ProfileTabs
          user={user}
          isCurrentUser={isCurrentUser}
          getCountryLink={getCountryLink}
        />
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
    ],
    fallback: true, // Generate pages for paths not returned by getStaticPaths
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
