/**
 * Restaurant Booking Component
 * 
 * Handles restaurant reservation booking with date/time selection,
 * party size, and special requests. Integrates with booking systems.
 * 
 * Features:
 * - Date and time selection
 * - Party size configuration
 * - Special requests and dietary requirements
 * - Real-time availability checking
 * - Booking confirmation and management
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const RestaurantBooking = ({
  restaurantId,
  restaurantName = 'Restaurant',
  showAvailability = true,
  showSpecialRequests = true,
  maxPartySize = 12,
  advanceBookingDays = 30,
  className = ''
}) => {
  // State
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
    dietaryRequirements: [],
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Details, 3: Confirmation

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Dietary requirements options
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy_free', label: 'Dairy Free', icon: '🥛' },
    { id: 'nut_allergy', label: 'Nut Allergy', icon: '🥜' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' }
  ];

  // Generate available dates
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= advanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return dates;
  };

  // Fetch availability for selected date
  const fetchAvailability = async (selectedDate) => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getRestaurantAvailability({
        restaurantId,
        date: selectedDate,
        partySize: bookingData.partySize
      });

      setAvailability(data.timeSlots || []);
      
      // Track availability check
      trackUserEngagement('restaurant', restaurantId, 'availability_check', {
        date: selectedDate,
        partySize: bookingData.partySize
      });
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to make a reservation');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const booking = await analyticsService.createRestaurantBooking({
        restaurantId,
        userId: user.id,
        ...bookingData,
        contactInfo: {
          ...bookingData.contactInfo,
          name: bookingData.contactInfo.name || user.name,
          email: bookingData.contactInfo.email || user.email
        }
      });

      // Track booking creation
      trackUserEngagement('restaurant', restaurantId, 'booking_created', {
        bookingId: booking.id,
        date: bookingData.date,
        time: bookingData.time,
        partySize: bookingData.partySize
      });

      setStep(3);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle dietary requirement toggle
  const handleDietaryToggle = (requirementId) => {
    setBookingData(prev => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(requirementId)
        ? prev.dietaryRequirements.filter(id => id !== requirementId)
        : [...prev.dietaryRequirements, requirementId]
    }));
  };

  // Load availability when date or party size changes
  useEffect(() => {
    if (bookingData.date) {
      fetchAvailability(bookingData.date);
    }
  }, [bookingData.date, bookingData.partySize]);

  // Pre-fill user info if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setBookingData(prev => ({
        ...prev,
        contactInfo: {
          name: user.name || '',
          email: user.email || '',
          phone: prev.contactInfo.phone
        }
      }));
    }
  }, [isAuthenticated, user]);

  const availableDates = getAvailableDates();

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          📅 Make a Reservation
        </h2>
        <p className="text-gray-600">
          Book a table at {restaurantName}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNum 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`
                  w-8 h-1 mx-2
                  ${step > stepNum ? 'bg-orange-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Date and Time Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Party Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Size
            </label>
            <select
              value={bookingData.partySize}
              onChange={(e) => setBookingData(prev => ({ 
                ...prev, 
                partySize: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Array.from({ length: maxPartySize }, (_, i) => i + 1).map(size => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableDates.slice(0, 12).map(date => (
                <button
                  key={date.value}
                  onClick={() => setBookingData(prev => ({ ...prev, date: date.value }))}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${bookingData.date === date.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${date.isWeekend ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="text-sm font-medium">{date.label}</div>
                  {date.isWeekend && (
                    <div className="text-xs text-blue-600">Weekend</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {bookingData.date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : availability.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availability.map(timeSlot => (
                    <button
                      key={timeSlot.time}
                      onClick={() => setBookingData(prev => ({ ...prev, time: timeSlot.time }))}
                      disabled={!timeSlot.available}
                      className={`
                        p-2 rounded-lg border text-center transition-all text-sm
                        ${bookingData.time === timeSlot.time
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : timeSlot.available
                          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {timeSlot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No availability for this date</p>
                  <p className="text-sm">Please select a different date</p>
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!bookingData.date || !bookingData.time}
            >
              Next: Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={bookingData.contactInfo.name}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={bookingData.contactInfo.email}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingData.contactInfo.phone}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Dietary Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dietary Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleDietaryToggle(option.id)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border text-left transition-all
                    ${bookingData.dietaryRequirements.includes(option.id)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          {showSpecialRequests && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData(prev => ({ 
                  ...prev, 
                  specialRequests: e.target.value 
                }))}
                placeholder="Any special requests or occasions we should know about?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={submitting || !bookingData.contactInfo.name || !bookingData.contactInfo.email}
            >
              {submitting ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="text-center space-y-6">
          <div className="text-6xl">✅</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-600">
              Your reservation has been successfully created.
            </p>
          </div>

          {/* Booking Summary */}
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant:</span>
                <span className="font-medium">{restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(bookingData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Party Size:</span>
                <span className="font-medium">
                  {bookingData.partySize} {bookingData.partySize === 1 ? 'person' : 'people'}
                </span>
              </div>
            </div>
          </Card>

          <p className="text-sm text-gray-600">
            A confirmation email has been sent to {bookingData.contactInfo.email}
          </p>

          <Button
            onClick={() => {
              setStep(1);
              setBookingData({
                date: '',
                time: '',
                partySize: 2,
                specialRequests: '',
                dietaryRequirements: [],
                contactInfo: {
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: ''
                }
              });
            }}
            variant="outline"
          >
            Make Another Booking
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Authentication Prompt */}
      {!isAuthenticated && step > 1 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <p className="mb-2">Sign in to save your booking preferences and manage reservations.</p>
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RestaurantBooking;
