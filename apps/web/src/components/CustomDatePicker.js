/**
 * Custom Date Picker Component
 * 
 * A flexible date picker component with calendar interface.
 * Supports single dates, date ranges, and various customization options.
 * 
 * Features:
 * - Single date and date range selection
 * - Custom date formatting
 * - Min/max date restrictions
 * - Disabled dates
 * - Time selection (optional)
 * - Responsive design
 * - Keyboard navigation
 */

import React, { useState, useRef, useEffect } from 'react'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'

const CustomDatePicker = ({
  value = null,
  onChange,
  placeholder = 'Select date',
  format = 'MM/DD/YYYY',
  minDate = null,
  maxDate = null,
  disabledDates = [],
  showTime = false,
  isRange = false,
  disabled = false,
  className = ''
}) => {
  // State
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(value)
  const [hoveredDate, setHoveredDate] = useState(null)

  // Refs
  const pickerRef = useRef(null)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update selected date when value prop changes
  useEffect(() => {
    setSelectedDate(value)
  }, [value])

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (!date) return true
    
    const dateStr = date.toDateString()
    
    // Check min/max dates
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    
    // Check disabled dates
    if (disabledDates.some(disabledDate => 
      new Date(disabledDate).toDateString() === dateStr
    )) return true
    
    return false
  }

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false
    
    if (isRange && Array.isArray(selectedDate)) {
      const [start, end] = selectedDate
      if (start && end) {
        return date >= start && date <= end
      }
      return start && date.toDateString() === start.toDateString()
    }
    
    return date.toDateString() === selectedDate.toDateString()
  }

  // Check if date is in range (for range selection)
  const isDateInRange = (date) => {
    if (!isRange || !Array.isArray(selectedDate) || !hoveredDate) return false
    
    const [start] = selectedDate
    if (!start) return false
    
    const rangeStart = start < hoveredDate ? start : hoveredDate
    const rangeEnd = start < hoveredDate ? hoveredDate : start
    
    return date >= rangeStart && date <= rangeEnd
  }

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return

    let newValue
    
    if (isRange) {
      if (!selectedDate || !Array.isArray(selectedDate)) {
        newValue = [date, null]
      } else {
        const [start] = selectedDate
        if (!start) {
          newValue = [date, null]
        } else {
          newValue = start <= date ? [start, date] : [date, start]
          setIsOpen(false) // Close picker after range selection
        }
      }
    } else {
      newValue = date
      setIsOpen(false) // Close picker after single date selection
    }

    setSelectedDate(newValue)
    if (onChange) {
      onChange(newValue)
    }

    // Track date selection
    trackUserEngagement('date_picker', 'select', 'date', {
      isRange,
      selectedDate: date.toISOString()
    })
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Format display value
  const getDisplayValue = () => {
    if (!selectedDate) return placeholder
    
    if (isRange && Array.isArray(selectedDate)) {
      const [start, end] = selectedDate
      if (start && end) {
        return `${formatDate(start)} - ${formatDate(end)}`
      }
      if (start) {
        return `${formatDate(start)} - Select end date`
      }
      return placeholder
    }
    
    return formatDate(selectedDate)
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return ''
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'MMM DD, YYYY':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      default:
        return `${month}/${day}/${year}`
    }
  }

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* Input */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-orange-500 border-transparent' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayValue()}
          </span>
          <span className="text-gray-400">📅</span>
        </div>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8" />
              }

              const disabled = isDateDisabled(date)
              const selected = isDateSelected(date)
              const inRange = isDateInRange(date)

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={disabled}
                  className={`
                    h-8 w-8 text-sm rounded transition-all
                    ${disabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-orange-100 cursor-pointer'
                    }
                    ${selected 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : ''
                    }
                    ${inRange && !selected 
                      ? 'bg-orange-100 text-orange-700' 
                      : ''
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Today Button */}
          <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomDatePicker
