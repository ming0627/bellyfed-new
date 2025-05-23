/**
 * ReviewFilters Component
 * 
 * A component for filtering reviews by rating and date.
 */

import React, { memo } from 'react';
import { Star, Calendar } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * ReviewFilters component
 * 
 * @param {Object} props - Component props
 * @param {string} props.filterRating - Current rating filter
 * @param {string} props.filterDate - Current date filter
 * @param {Function} props.handleRatingFilterChange - Function to handle rating filter change
 * @param {Function} props.handleDateFilterChange - Function to handle date filter change
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {Function} props.clearFilters - Function to clear all filters
 * @returns {JSX.Element} - Rendered component
 */
const ReviewFilters = memo(function ReviewFilters({
  filterRating,
  filterDate,
  handleRatingFilterChange,
  handleDateFilterChange,
  hasActiveFilters,
  clearFilters,
}) {
  return (
    <div id="filter-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rating Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <LucideClientIcon
              icon={Star}
              className="w-4 h-4 mr-1 text-yellow-500"
              aria-hidden="true"
            />
            Rating
          </h4>
          <div className="space-y-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="rating-filter"
                className="border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={filterRating === 'all'}
                onChange={() => handleRatingFilterChange('all')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                All Ratings
              </span>
            </label>
            {[5, 4, 3, 2, 1].map(rating => (
              <label
                key={rating}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="rating-filter"
                  className="border-gray-300 text-orange-500 focus:ring-orange-500"
                  checked={filterRating === rating.toString()}
                  onChange={() => handleRatingFilterChange(rating.toString())}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  {rating} <LucideClientIcon icon={Star} className="w-3 h-3 ml-1 text-yellow-500" />
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Date Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <LucideClientIcon
              icon={Calendar}
              className="w-4 h-4 mr-1 text-blue-500"
              aria-hidden="true"
            />
            Date
          </h4>
          <div className="space-y-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="date-filter"
                className="border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={filterDate === 'all'}
                onChange={() => handleDateFilterChange('all')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                All Time
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="date-filter"
                className="border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={filterDate === 'last-week'}
                onChange={() => handleDateFilterChange('last-week')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Last Week
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="date-filter"
                className="border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={filterDate === 'last-month'}
                onChange={() => handleDateFilterChange('last-month')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Last Month
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="date-filter"
                className="border-gray-300 text-orange-500 focus:ring-orange-500"
                checked={filterDate === 'last-year'}
                onChange={() => handleDateFilterChange('last-year')}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Last Year
              </span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
});

export default ReviewFilters;
