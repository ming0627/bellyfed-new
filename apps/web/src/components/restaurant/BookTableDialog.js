/**
 * Book Table Dialog Component
 * 
 * Modal dialog for restaurant table booking with date/time selection,
 * party size, and special requests functionality.
 * 
 * Features:
 * - Date and time selection
 * - Party size selection
 * - Special requests input
 * - Availability checking
 * - Booking confirmation
 * - Integration with restaurant booking systems
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner } from '../ui/index.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'
import { useAuth } from '../../hooks/useAuth.js'
import CustomDatePicker from '../CustomDatePicker.js'

const BookTableDialog = ({
  restaurant,
  isOpen = false,
  onClose,
  onBookingComplete = null,
  className = ''
}) => {
  // State
  const [bookingData, setBookingData] = useState({
    date: null,
    time: '',
    partySize: 2,
    specialRequests: '',
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    }
  })
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: DateTime, 2: Details, 3: Confirmation

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Available party sizes
  const partySizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  // Load available time slots when date changes
  useEffect(() => {
    if (bookingData.date) {
      loadAvailableSlots(bookingData.date)
    }
  }, [bookingData.date])

  // Pre-fill user info if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setBookingData(prev => ({
        ...prev,
        customerInfo: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        }
      }))
    }
  }, [isAuthenticated, user])

  // Load available time slots
  const loadAvailableSlots = async (date) => {
    setLoading(true)
    try {
      // Mock available slots (in real app, would fetch from API)
      const mockSlots = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
      ]

      // Simulate some slots being unavailable
      const availableSlots = mockSlots.filter(() => Math.random() > 0.3)
      
      setAvailableSlots(availableSlots)
    } catch (err) {
      console.error('Error loading available slots:', err)
      setError('Failed to load available time slots')
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    setError('')
  }

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      if (!bookingData.date || !bookingData.time) {
        setError('Please select date and time')
        return
      }
    } else if (step === 2) {
      if (!bookingData.customerInfo.name || !bookingData.customerInfo.email || !bookingData.customerInfo.phone) {
        setError('Please fill in all required fields')
        return
      }
    }
    
    setStep(step + 1)
    setError('')
  }

  // Handle previous step
  const handlePreviousStep = () => {
    setStep(step - 1)
    setError('')
  }

  // Handle booking submission
  const handleSubmitBooking = async () => {
    setSubmitting(true)
    setError('')

    try {
      // Mock booking submission (in real app, would call API)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Track booking
      trackUserEngagement('restaurant', restaurant.id, 'book_table', {
        date: bookingData.date.toISOString(),
        time: bookingData.time,
        partySize: bookingData.partySize,
        userId: user?.id
      })

      // Call completion callback
      if (onBookingComplete) {
        onBookingComplete({
          ...bookingData,
          restaurant,
          bookingId: `BK${Date.now()}`,
          status: 'confirmed'
        })
      }

      // Close dialog
      onClose()
    } catch (err) {
      console.error('Error submitting booking:', err)
      setError('Failed to submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!submitting) {
      setStep(1)
      setBookingData({
        date: null,
        time: '',
        partySize: 2,
        specialRequests: '',
        customerInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      })
      setError('')
      onClose()
    }
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Book a Table
              </h2>
              <p className="text-gray-600 mt-1">
                {restaurant.name}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-8 h-1 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Date & Time Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Date & Time
                </h3>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <CustomDatePicker
                    value={bookingData.date}
                    onChange={(date) => handleInputChange('date', date)}
                    minDate={new Date()}
                    placeholder="Select date"
                  />
                </div>

                {/* Party Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party Size
                  </label>
                  <select
                    value={bookingData.partySize}
                    onChange={(e) => handleInputChange('partySize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {partySizes.map(size => (
                      <option key={size} value={size}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Selection */}
                {bookingData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    {loading ? (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner size="sm" className="mr-2" />
                        <span className="text-gray-600">Loading available times...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => handleInputChange('time', slot)}
                            className={`
                              px-3 py-2 text-sm rounded-lg border transition-colors
                              ${bookingData.time === slot
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                              }
                            `}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        No available time slots for this date. Please select another date.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Customer Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Details
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={bookingData.customerInfo.name}
                      onChange={(e) => handleInputChange('customerInfo.name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={bookingData.customerInfo.email}
                      onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingData.customerInfo.phone}
                      onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Your Booking
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Restaurant:</span>
                    <span className="font-medium">{restaurant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(bookingData.date)}</span>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{bookingData.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{bookingData.customerInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{bookingData.customerInfo.phone}</span>
                  </div>
                  {bookingData.specialRequests && (
                    <div>
                      <span className="text-gray-600">Special Requests:</span>
                      <p className="font-medium mt-1">{bookingData.specialRequests}</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Please note:</strong> Your booking is subject to availability confirmation. 
                    You will receive a confirmation email within 24 hours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={submitting}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              
              {step < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default BookTableDialog
