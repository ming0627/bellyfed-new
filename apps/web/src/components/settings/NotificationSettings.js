import React, { useState, memo } from 'react';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * NotificationSettings component for managing user notification preferences
 *
 * @param {Object} props - Component props
 * @param {Object} props.settings - Current notification settings
 * @param {Function} props.onSave - Function to handle save
 * @returns {JSX.Element} - Rendered component
 */
const NotificationSettings = memo(function NotificationSettings({
  settings = {},
  onSave,
}) {
  const [formData, setFormData] = useState({
    email: {
      newReviews: settings.email?.newReviews ?? true,
      newFollowers: settings.email?.newFollowers ?? true,
      newComments: settings.email?.newComments ?? true,
      restaurantUpdates: settings.email?.restaurantUpdates ?? false,
      promotions: settings.email?.promotions ?? false,
      newsletter: settings.email?.newsletter ?? false,
    },
    push: {
      newReviews: settings.push?.newReviews ?? true,
      newFollowers: settings.push?.newFollowers ?? true,
      newComments: settings.push?.newComments ?? true,
      restaurantUpdates: settings.push?.restaurantUpdates ?? true,
      promotions: settings.push?.promotions ?? false,
      newsletter: settings.push?.newsletter ?? false,
    },
    sms: {
      newReviews: settings.sms?.newReviews ?? false,
      newFollowers: settings.sms?.newFollowers ?? false,
      newComments: settings.sms?.newComments ?? false,
      restaurantUpdates: settings.sms?.restaurantUpdates ?? false,
      promotions: settings.sms?.promotions ?? false,
      newsletter: settings.sms?.newsletter ?? false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle toggle change
  const handleToggleChange = (channel, setting) => {
    setFormData({
      ...formData,
      [channel]: {
        ...formData[channel],
        [setting]: !formData[channel][setting],
      },
    });
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // In a real app, this would call an API to update the user's notification settings
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the onSave callback with the updated settings
      if (onSave) {
        onSave(formData);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notification Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Email Notifications */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <LucideClientIcon
              icon={Mail}
              className="w-6 h-6 text-orange-500 mr-2"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Email Notifications
            </h3>
          </div>

          <div className="space-y-4 pl-8">
            {/* New Reviews */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-newReviews"
                className="text-gray-700 dark:text-gray-300"
              >
                New reviews on your content
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="email-newReviews"
                  className="opacity-0 w-0 h-0"
                  checked={formData.email.newReviews}
                  onChange={() => handleToggleChange('email', 'newReviews')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.email.newReviews
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.email.newReviews
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* New Followers */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-newFollowers"
                className="text-gray-700 dark:text-gray-300"
              >
                New followers
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="email-newFollowers"
                  className="opacity-0 w-0 h-0"
                  checked={formData.email.newFollowers}
                  onChange={() => handleToggleChange('email', 'newFollowers')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.email.newFollowers
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.email.newFollowers
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* New Comments */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-newComments"
                className="text-gray-700 dark:text-gray-300"
              >
                Comments on your reviews
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="email-newComments"
                  className="opacity-0 w-0 h-0"
                  checked={formData.email.newComments}
                  onChange={() => handleToggleChange('email', 'newComments')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.email.newComments
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.email.newComments
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* Restaurant Updates */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-restaurantUpdates"
                className="text-gray-700 dark:text-gray-300"
              >
                Updates from restaurants you follow
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="email-restaurantUpdates"
                  className="opacity-0 w-0 h-0"
                  checked={formData.email.restaurantUpdates}
                  onChange={() =>
                    handleToggleChange('email', 'restaurantUpdates')
                  }
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.email.restaurantUpdates
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.email.restaurantUpdates
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* Promotions */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-promotions"
                className="text-gray-700 dark:text-gray-300"
              >
                Promotions and deals
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="email-promotions"
                  className="opacity-0 w-0 h-0"
                  checked={formData.email.promotions}
                  onChange={() => handleToggleChange('email', 'promotions')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.email.promotions
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.email.promotions
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-newsletter"
                className="text-gray-700 dark:text-gray-300"
              >
                Weekly newsletter
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="email-newsletter"
                  className="opacity-0 w-0 h-0"
                  checked={formData.email.newsletter}
                  onChange={() => handleToggleChange('email', 'newsletter')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.email.newsletter
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.email.newsletter
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <LucideClientIcon
              icon={Bell}
              className="w-6 h-6 text-orange-500 mr-2"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Push Notifications
            </h3>
          </div>

          <div className="space-y-4 pl-8">
            {/* New Reviews */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="push-newReviews"
                className="text-gray-700 dark:text-gray-300"
              >
                New reviews on your content
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="push-newReviews"
                  className="opacity-0 w-0 h-0"
                  checked={formData.push.newReviews}
                  onChange={() => handleToggleChange('push', 'newReviews')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.push.newReviews
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.push.newReviews
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* New Followers */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="push-newFollowers"
                className="text-gray-700 dark:text-gray-300"
              >
                New followers
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="push-newFollowers"
                  className="opacity-0 w-0 h-0"
                  checked={formData.push.newFollowers}
                  onChange={() => handleToggleChange('push', 'newFollowers')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.push.newFollowers
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.push.newFollowers
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* New Comments */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="push-newComments"
                className="text-gray-700 dark:text-gray-300"
              >
                Comments on your reviews
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="push-newComments"
                  className="opacity-0 w-0 h-0"
                  checked={formData.push.newComments}
                  onChange={() => handleToggleChange('push', 'newComments')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.push.newComments
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.push.newComments
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* Restaurant Updates */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="push-restaurantUpdates"
                className="text-gray-700 dark:text-gray-300"
              >
                Updates from restaurants you follow
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="push-restaurantUpdates"
                  className="opacity-0 w-0 h-0"
                  checked={formData.push.restaurantUpdates}
                  onChange={() =>
                    handleToggleChange('push', 'restaurantUpdates')
                  }
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.push.restaurantUpdates
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.push.restaurantUpdates
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <LucideClientIcon
              icon={Smartphone}
              className="w-6 h-6 text-orange-500 mr-2"
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              SMS Notifications
            </h3>
          </div>

          <div className="space-y-4 pl-8">
            {/* New Reviews */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="sms-newReviews"
                className="text-gray-700 dark:text-gray-300"
              >
                New reviews on your content
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="sms-newReviews"
                  className="opacity-0 w-0 h-0"
                  checked={formData.sms.newReviews}
                  onChange={() => handleToggleChange('sms', 'newReviews')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.sms.newReviews
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.sms.newReviews
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>

            {/* New Followers */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="sms-newFollowers"
                className="text-gray-700 dark:text-gray-300"
              >
                New followers
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="sms-newFollowers"
                  className="opacity-0 w-0 h-0"
                  checked={formData.sms.newFollowers}
                  onChange={() => handleToggleChange('sms', 'newFollowers')}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    formData.sms.newFollowers
                      ? 'bg-orange-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span
                  className={`absolute cursor-pointer w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    formData.sms.newFollowers
                      ? 'transform translate-x-6'
                      : 'transform translate-x-1'
                  }`}
                  style={{ top: '0.25rem' }}
                ></span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">
              Notification settings updated successfully!
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <LucideClientIcon icon={Save} className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
});

export default NotificationSettings;
