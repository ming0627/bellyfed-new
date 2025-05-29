import React, { useState, memo } from 'react';
import {
  Star,
  Heart,
  Award,
  Settings,
  MapPin,
  Trophy,
} from 'lucide-react';
import UserFavorites from './UserFavorites.js';
import RankingsTab from './RankingsTab.js';
import ReviewsTab from './ReviewsTab.js';

/**
 * ProfileTabs component for displaying user profile tabs
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {boolean} props.isCurrentUser - Whether the profile belongs to the current user
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const ProfileTabs = memo(function ProfileTabs({
  user,
  isCurrentUser = false,
  getCountryLink,
}) {
  const [activeTab, setActiveTab] = useState('reviews');

  // Define tabs
  const tabs = [
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      count: user.reviewCount || 0,
      component: <ReviewsTab user={user} getCountryLink={getCountryLink} />,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      count: user.favoriteCount || 0,
      component: <UserFavorites user={user} getCountryLink={getCountryLink} />,
    },
    {
      id: 'rankings',
      label: 'Rankings',
      icon: Trophy,
      count: user.rankingCount || 0,
      component: <RankingsTab user={user} getCountryLink={getCountryLink} />,
    },
    {
      id: 'badges',
      label: 'Badges',
      icon: Award,
      count: user.badgeCount || 0,
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Badges
          </h3>

          {user.badges && user.badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{badge.icon}</span>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {badge.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {badge.description || badge.tooltip}
                  </p>
                  {badge.category && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full">
                        {badge.category}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <AwardclassName="w-8 h-8 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                 />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Badges Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {isCurrentUser
                  ? 'Keep writing reviews and engaging with the community to earn badges!'
                  : `${user.name} hasn't earned any badges yet.`}
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Add settings tab for current user
  if (isCurrentUser) {
    tabs.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      count: null,
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Account Settings
          </h3>

          <div className="space-y-6">
            {/* Profile Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Profile Information
              </h4>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    defaultValue={user.bio || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                       />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      defaultValue={user.location || ''}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Privacy Settings
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Profile Visibility
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Control who can see your profile
                    </p>
                  </div>
                  <select
                    id="profile-visibility"
                    name="profileVisibility"
                    defaultValue="public"
                    className="ml-4 block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 sm:text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive email notifications for activity
                    </p>
                  </div>
                  <div className="ml-4 relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      name="emailNotifications"
                      defaultChecked
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-300 border-4 border-gray-300 dark:border-gray-700 appearance-none cursor-pointer"
                    />
                    <label
                      htmlFor="email-notifications"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                    ></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Account Actions
              </h4>

              <div className="space-y-4">
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Change Password
                </button>

                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
    });
  }

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 flex items-center whitespace-nowrap font-medium text-sm border-b-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <tab.iconclassName={`w-5 h-5 mr-2 ${
                  activeTab === tab.id
                    ? 'text-orange-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                aria-hidden="true"
               />
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{tabs.find(tab => tab.id === activeTab)?.component}</div>
    </div>
  );
});

export default ProfileTabs;
