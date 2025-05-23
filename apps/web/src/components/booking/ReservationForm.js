/**
 * Reservation Form Component
 * 
 * Provides a comprehensive restaurant reservation booking form with
 * date/time selection, party size management, and special requests.
 * 
 * Features:
 * - Date and time slot selection
 * - Party size configuration
 * - Special requests and dietary restrictions
 * - Real-time availability checking
 * - Confirmation and reminder system
 * - Integration with restaurant booking systems
 * - Guest information collection
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const ReservationForm = ({
  restaurantId,
  restaurantName = 'Restaurant',
  minPartySize = 1,
  maxPartySize = 12,
  advanceBookingDays = 30,
  timeSlotInterval = 30, // minutes
  operatingHours = { open: '11:00', close: '22:00' },
  onReservationComplete,
  className = ''
}) => {
  // State
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: 2,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    dietaryRestrictions: [],
    occasion: '',
    seatingPreference: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Dietary restrictions options
  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy',
    'Shellfish Allergy', 'Halal', 'Kosher', 'Low Sodium', 'Diabetic'
  ];

  // Occasion options
  const occasionOptions = [
    'Birthday', 'Anniversary', 'Date Night', 'Business Meeting',
    'Family Gathering', 'Celebration', 'Casual Dining', 'Special Event'
  ];

  // Seating preference options
  const seatingOptions = [
    'No Preference', 'Window Table', 'Quiet Area', 'Bar Seating',
    'Outdoor Patio', 'Private Room', 'High Top Table'
  ];

  // Generate available dates
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= advanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const [openHour, openMinute] = operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = operatingHours.close.split(':').map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(openHour, openMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(closeHour, closeMinute, 0, 0);
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      slots.push(timeString);
      currentTime.setMinutes(currentTime.getMinutes() + timeSlotInterval);
    }
    
    return slots;
  };

  // Check availability for selected date and party size
  const checkAvailability = async (date, partySize) => {
    if (!date || !partySize) return;

    setCheckingAvailability(true);

    try {
      const availability = await analyticsService.checkReservationAvailability({
        restaurantId,
        date,
        partySize
      });

      const allSlots = generateTimeSlots();
      const availableSlots = allSlots.filter(slot => 
        availability.availableSlots?.includes(slot)
      );

      setAvailableSlots(availableSlots);

      trackUserEngagement('reservation', 'availability_check', 'success', {
        restaurantId,
        date,
        partySize,
        availableSlots: availableSlots.length
      });
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailableSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Check availability when date or party size changes
    if (field === 'date' || field === 'partySize') {
      const newDate = field === 'date' ? value : formData.date;
      const newPartySize = field === 'partySize' ? value : formData.partySize;
      
      if (newDate && newPartySize) {
        checkAvailability(newDate, newPartySize);
      }
    }
  };

  // Handle dietary restrictions
  const handleDietaryChange = (restriction, isChecked) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: isChecked
        ? [...prev.dietaryRestrictions, restriction]
        : prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.time) {
      newErrors.time = 'Please select a time';
    }

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email address';
    }

    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = 'Phone number is required';
    }

    if (formData.partySize < minPartySize || formData.partySize > maxPartySize) {
      newErrors.partySize = `Party size must be between ${minPartySize} and ${maxPartySize}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        ...formData,
        restaurantId,
        userId: user?.id,
        timestamp: new Date().toISOString()
      };

      const result = await analyticsService.createReservation(reservationData);
      
      setReservationId(result.reservationId);
      setSubmitted(true);

      // Track reservation creation
      trackUserEngagement('reservation', 'create', 'success', {
        restaurantId,
        date: formData.date,
        time: formData.time,
        partySize: formData.partySize,
        hasSpecialRequests: !!formData.specialRequests,
        hasDietaryRestrictions: formData.dietaryRestrictions.length > 0
      });

      if (onReservationComplete) {
        onReservationComplete(result);
      }
    } catch (err) {
      console.error('Error creating reservation:', err);
      setErrors({ submit: err.message || 'Failed to create reservation. Please try again.' });
      
      trackUserEngagement('reservation', 'create', 'error', {
        error: err.message,
        restaurantId
      });
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill user info if authenticated
  useEffect(() => {
    if (isAuthenticated && user && !formData.guestName && !formData.guestEmail) {
      setFormData(prev => ({
        ...prev,
        guestName: user.name || '',
        guestEmail: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  if (submitted) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-green-600 mb-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-semibold mb-2">Reservation Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your table at {restaurantName} has been reserved.
          </p>
          {reservationId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                <strong>Reservation ID:</strong> {reservationId}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date & Time:</strong> {new Date(formData.date).toLocaleDateString()} at {formData.time}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Party Size:</strong> {formData.partySize} guest{formData.partySize !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-4">
            A confirmation email has been sent to {formData.guestEmail}
          </p>
        </div>
        <Button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              date: '',
              time: '',
              partySize: 2,
              guestName: user?.name || '',
              guestEmail: user?.email || '',
              guestPhone: '',
              specialRequests: '',
              dietaryRestrictions: [],
              occasion: '',
              seatingPreference: ''
            });
            setReservationId(null);
          }}
          variant="outline"
        >
          Make Another Reservation
        </Button>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🍽️ Make a Reservation
          </h2>
          <p className="text-gray-600">
            Reserve your table at {restaurantName}
          </p>
        </div>

        {/* Date and Party Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <select
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select a date</option>
              {getAvailableDates().map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Size *
            </label>
            <select
              value={formData.partySize}
              onChange={(e) => handleInputChange('partySize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Array.from({ length: maxPartySize - minPartySize + 1 }, (_, i) => {
                const size = minPartySize + i;
                return (
                  <option key={size} value={size}>
                    {size} guest{size !== 1 ? 's' : ''}
                  </option>
                );
              })}
            </select>
            {errors.partySize && (
              <p className="text-red-600 text-sm mt-1">{errors.partySize}</p>
            )}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time *
          </label>
          {checkingAvailability ? (
            <div className="flex items-center gap-2 py-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Checking availability...</span>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleInputChange('time', slot)}
                  className={`
                    px-3 py-2 text-sm rounded-md border transition-colors
                    ${formData.time === slot
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                    }
                  `}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : formData.date ? (
            <p className="text-sm text-gray-500 py-2">
              No available time slots for the selected date and party size.
            </p>
          ) : (
            <p className="text-sm text-gray-500 py-2">
              Please select a date and party size to see available times.
            </p>
          )}
          {errors.time && (
            <p className="text-red-600 text-sm mt-1">{errors.time}</p>
          )}
        </div>

        {/* Guest Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name *
            </label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => handleInputChange('guestName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Full name"
            />
            {errors.guestName && (
              <p className="text-red-600 text-sm mt-1">{errors.guestName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => handleInputChange('guestEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="email@example.com"
            />
            {errors.guestEmail && (
              <p className="text-red-600 text-sm mt-1">{errors.guestEmail}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.guestPhone}
            onChange={(e) => handleInputChange('guestPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="+1 (555) 123-4567"
          />
          {errors.guestPhone && (
            <p className="text-red-600 text-sm mt-1">{errors.guestPhone}</p>
          )}
        </div>

        {/* Occasion and Seating Preference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occasion (Optional)
            </label>
            <select
              value={formData.occasion}
              onChange={(e) => handleInputChange('occasion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select occasion</option>
              {occasionOptions.map(occasion => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seating Preference (Optional)
            </label>
            <select
              value={formData.seatingPreference}
              onChange={(e) => handleInputChange('seatingPreference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {seatingOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Restrictions (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {dietaryOptions.map(restriction => (
              <label key={restriction} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.dietaryRestrictions.includes(restriction)}
                  onChange={(e) => handleDietaryChange(restriction, e.target.checked)}
                  className="mr-2 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{restriction}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Any special requests or notes for the restaurant..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.specialRequests.length}/500
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !formData.date || !formData.time}
          className="w-full"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Reservation...
            </>
          ) : (
            'Reserve Table'
          )}
        </Button>
      </form>
    </Card>
  );
};

export default ReservationForm;
