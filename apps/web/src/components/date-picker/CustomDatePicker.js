/**
 * Custom Date Picker Component
 * 
 * A customizable date picker with calendar interface.
 * Supports date ranges, restrictions, and custom styling.
 * 
 * Features:
 * - Single date and date range selection
 * - Date restrictions and validation
 * - Custom styling and themes
 * - Keyboard navigation
 * - Accessibility support
 * - Mobile-friendly interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

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
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Refs
  const pickerRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    const dateString = date.toDateString();
    
    // Check min/max dates
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    // Check disabled dates
    if (disabledDates.some(disabledDate => 
      new Date(disabledDate).toDateString() === dateString
    )) {
      return true;
    }
    
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    
    if (isRange && Array.isArray(selectedDate)) {
      const [start, end] = selectedDate;
      if (start && end) {
        return date >= start && date <= end;
      }
      return start && date.toDateString() === start.toDateString();
    }
    
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if date is in range (for hover effect)
  const isDateInRange = (date) => {
    if (!isRange || !Array.isArray(selectedDate) || !hoveredDate) return false;
    
    const [start] = selectedDate;
    if (!start) return false;
    
    const rangeStart = start < hoveredDate ? start : hoveredDate;
    const rangeEnd = start < hoveredDate ? hoveredDate : start;
    
    return date >= rangeStart && date <= rangeEnd;
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    let newValue;
    
    if (isRange) {
      if (!selectedDate || !Array.isArray(selectedDate)) {
        newValue = [date, null];
      } else {
        const [start, end] = selectedDate;
        if (!start || (start && end)) {
          newValue = [date, null];
        } else {
          newValue = start <= date ? [start, date] : [date, start];
          setIsOpen(false);
        }
      }
    } else {
      newValue = date;
      setIsOpen(false);
    }

    setSelectedDate(newValue);
    if (onChange) {
      onChange(newValue);
    }

    // Track date selection
    trackUserEngagement('date_picker', 'select', 'date', {
      isRange,
      hasValue: !!newValue
    });
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);

    trackUserEngagement('date_picker', 'navigate', 'month', {
      direction: direction > 0 ? 'next' : 'previous'
    });
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  };

  // Get display value
  const getDisplayValue = () => {
    if (!selectedDate) return placeholder;
    
    if (isRange && Array.isArray(selectedDate)) {
      const [start, end] = selectedDate;
      if (start && end) {
        return `${formatDate(start)} - ${formatDate(end)}`;
      } else if (start) {
        return `${formatDate(start)} - Select end date`;
      }
      return placeholder;
    }
    
    return formatDate(selectedDate);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected date when value prop changes
  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  const days = getDaysInMonth(currentMonth);

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
        <Card className="absolute top-full left-0 mt-1 z-50 p-4 shadow-lg">
          <div className="w-80">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => navigateMonth(-1)}
                variant="outline"
                size="sm"
                className="p-1"
              >
                ←
              </Button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <Button
                onClick={() => navigateMonth(1)}
                variant="outline"
                size="sm"
                className="p-1"
              >
                →
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-10"></div>;
                }

                const isDisabled = isDateDisabled(date);
                const isSelected = isDateSelected(date);
                const isInRange = isDateInRange(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    disabled={isDisabled}
                    className={`
                      h-10 text-sm rounded-md transition-colors
                      ${isDisabled 
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-900 hover:bg-orange-100 cursor-pointer'
                      }
                      ${isSelected 
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : isInRange
                        ? 'bg-orange-100 text-orange-700'
                        : ''
                      }
                      ${isToday && !isSelected 
                        ? 'border-2 border-orange-500'
                        : ''
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setSelectedDate(isRange ? [null, null] : null);
                  if (onChange) {
                    onChange(isRange ? [null, null] : null);
                  }
                }}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
              
              <Button
                onClick={() => {
                  const today = new Date();
                  if (!isDateDisabled(today)) {
                    const newValue = isRange ? [today, today] : today;
                    setSelectedDate(newValue);
                    if (onChange) {
                      onChange(newValue);
                    }
                    setIsOpen(false);
                  }
                }}
                variant="outline"
                size="sm"
              >
                Today
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomDatePicker;
