import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { User, Bell, Shield, CreditCard, LogOut } from 'lucide-react';
import Layout from '../../components/layout/Layout.js';
import AccountSettings from '../../components/settings/AccountSettings.js';
import NotificationSettings from '../../components/settings/NotificationSettings.js';
import { LucideClientIcon } from '../../components/ui/lucide-icon.js';

// Mock user data
const mockUserData = {
  id: '1',
  name: 'Sarah Chen',
  username: 'sarahc',
  email: 'sarah.chen@example.com',
  profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
  bio: 'Food enthusiast and travel lover. Always on the lookout for the best local cuisines wherever I go!',
  joinDate: '2022-05-15T00:00:00Z',
  location: 'Kuala Lumpur, Malaysia',
  reviewCount: 42,
  followersCount: 156,
  followingCount: 89,
};

// Mock notification settings
const mockNotificationSettings = {
  email: {
    newReviews: true,
    newFollowers: true,
    newComments: true,
    restaurantUpdates: false,
    promotions: false,
    newsletter: true,
  },
  push: {
    newReviews: true,
    newFollowers: true,
    newComments: true,
    restaurantUpdates: true,
    promotions: false,
    newsletter: false,
  },
  sms: {
    newReviews: false,
    newFollowers: false,
    newComments: false,
    restaurantUpdates: false,
    promotions: false,
    newsletter: false,
  },
};

/**
 * SettingsPage component for managing user settings
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(mockUserData);
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
  
  // Handle account settings save
  const handleAccountSave = (updatedData) => {
    // In a real app, this would call an API to update the user's profile
    console.log('Updating account settings:', updatedData);
    setUser({ ...user, ...updatedData });
  };
  
  // Handle notification settings save
  const handleNotificationSave = (updatedSettings) => {
    // In a real app, this would call an API to update the user's notification settings
    console.log('Updating notification settings:', updatedSettings);
    setNotificationSettings(updatedSettings);
  };
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, this would call an API to log the user out
    console.log('Logging out...');
    // Redirect to home page
    router.push('/');
  };
  
  return (
    <Layout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LucideClientIcon icon={User} className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'account'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <LucideClientIcon icon={User} className="w-5 h-5 mr-3" />
                    <span>Account</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <LucideClientIcon icon={Bell} className="w-5 h-5 mr-3" />
                    <span>Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'privacy'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <LucideClientIcon icon={Shield} className="w-5 h-5 mr-3" />
                    <span>Privacy & Security</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                      activeTab === 'billing'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <LucideClientIcon icon={CreditCard} className="w-5 h-5 mr-3" />
                    <span>Billing</span>
                  </button>
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <LucideClientIcon icon={LogOut} className="w-5 h-5 mr-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow">
            {activeTab === 'account' && (
              <AccountSettings
                user={user}
                onSave={handleAccountSave}
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationSettings
                settings={notificationSettings}
                onSave={handleNotificationSave}
              />
            )}
            
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Privacy & Security
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Privacy and security settings will be implemented in a future update.
                </p>
              </div>
            )}
            
            {activeTab === 'billing' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Billing
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Billing settings will be implemented in a future update.
                </p>
              </div>
            )}
          </div>
        </div>
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
