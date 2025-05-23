/**
 * Add Restaurant Button Component
 * 
 * Button component that triggers the restaurant creation flow.
 * Handles permissions, authentication, and navigation to restaurant creation.
 * 
 * Features:
 * - Permission checking
 * - Authentication validation
 * - Restaurant creation dialog
 * - Admin and user flows
 * - Analytics tracking
 */

import React, { useState } from 'react';
import { Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCountry } from '../../hooks/useCountry.js';

const AddRestaurantButton = ({
  variant = 'default',
  size = 'md',
  showIcon = true,
  requiresAdmin = false,
  onRestaurantAdded,
  className = ''
}) => {
  // State
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { country } = useCountry();

  // Check if user can add restaurants
  const canAddRestaurant = () => {
    if (!isAuthenticated) return false;
    if (requiresAdmin && !isAdmin) return false;
    return true;
  };

  // Handle button click
  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to sign in
      trackUserEngagement('restaurant', 'add_button', 'unauthenticated_click');
      window.location.href = `/${country}/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (requiresAdmin && !isAdmin) {
      // Show permission error
      trackUserEngagement('restaurant', 'add_button', 'permission_denied');
      alert('You need admin permissions to add restaurants.');
      return;
    }

    // Track button click
    trackUserEngagement('restaurant', 'add_button', 'click', {
      userType: isAdmin ? 'admin' : 'user'
    });

    // Navigate to restaurant creation page
    if (isAdmin) {
      window.location.href = `/${country}/admin/restaurants/create`;
    } else {
      // For regular users, show a dialog or redirect to a request form
      setShowDialog(true);
    }
  };

  // Handle restaurant creation request (for non-admin users)
  const handleRestaurantRequest = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would submit a restaurant creation request
      // For now, we'll just show a success message
      
      trackUserEngagement('restaurant', 'creation_request', 'submit', {
        userId: user.id
      });

      alert('Restaurant creation request submitted! We\'ll review it and get back to you.');
      setShowDialog(false);
      
      if (onRestaurantAdded) {
        onRestaurantAdded();
      }
    } catch (err) {
      console.error('Error submitting restaurant request:', err);
      alert('Failed to submit restaurant request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get button text
  const getButtonText = () => {
    if (!isAuthenticated) {
      return 'Sign In to Add Restaurant';
    }
    if (requiresAdmin && !isAdmin) {
      return 'Admin Required';
    }
    if (isAdmin) {
      return 'Add Restaurant';
    }
    return 'Request Restaurant';
  };

  // Get button icon
  const getButtonIcon = () => {
    if (!showIcon) return null;
    
    if (!isAuthenticated) {
      return '🔐';
    }
    if (requiresAdmin && !isAdmin) {
      return '👑';
    }
    return '🏪';
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        disabled={requiresAdmin && !isAdmin && isAuthenticated}
        className={className}
      >
        {getButtonIcon() && (
          <span className="mr-2">{getButtonIcon()}</span>
        )}
        {getButtonText()}
      </Button>

      {/* Restaurant Request Dialog (for non-admin users) */}
      {showDialog && !isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Request Restaurant Addition
              </h3>
              <p className="text-gray-600 mb-6">
                We'll review your request to add a new restaurant to Bellyfed. 
                Our team will verify the information and add it to our platform.
              </p>
              
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter restaurant name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter restaurant location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any additional details about the restaurant..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowDialog(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestaurantRequest}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddRestaurantButton;
