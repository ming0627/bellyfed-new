import React, { useState, useEffect, memo } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * FilterSection component for displaying a collapsible filter section
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content
 * @param {boolean} props.defaultExpanded - Whether section is expanded by default
 * @returns {JSX.Element} - Rendered component
 */
const FilterSection = memo(function FilterSection({
  title,
  children,
  defaultExpanded = true,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Toggle section expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4 last:border-0">
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isExpanded}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <LucideClientIcon
          icon={isExpanded ? ChevronUp : ChevronDown}
          className="w-5 h-5 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      </button>

      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  );
});

/**
 * SearchFilters component for filtering search results
 *
 * @param {Object} props - Component props
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element} - Rendered component
 */
const SearchFilters = memo(function SearchFilters({ onFilterChange }) {
  // Filter state
  const [filters, setFilters] = useState({
    priceRange: [],
    cuisineTypes: [],
    dietaryOptions: [],
    ratings: [],
    features: [],
    openNow: false,
    offerDelivery: false,
    offerTakeout: false,
  });

  // Active filters count
  const activeFiltersCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value ? 1 : 0);
    },
    0,
  );

  // Update parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Handle checkbox filter change
  const handleCheckboxChange = (filterType, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[filterType] || [];

      // Toggle value
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return {
        ...prevFilters,
        [filterType]: newValues,
      };
    });
  };

  // Handle boolean filter change
  const handleBooleanChange = filterType => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: !prevFilters[filterType],
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: [],
      cuisineTypes: [],
      dietaryOptions: [],
      ratings: [],
      features: [],
      openNow: false,
      offerDelivery: false,
      offerTakeout: false,
    });
  };

  // Mock cuisine types for demo
  const cuisineTypes = [
    'Malaysian',
    'Japanese',
    'Chinese',
    'Indian',
    'Italian',
    'Mexican',
    'Thai',
    'Korean',
    'Western',
    'Fusion',
  ];

  // Mock dietary options for demo
  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Halal',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
  ];

  // Mock features for demo
  const features = [
    'Parking',
    'Wifi',
    'Outdoor Seating',
    'Air Conditioning',
    'Wheelchair Accessible',
    'Family Friendly',
    'Pet Friendly',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Filters
        </h2>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Active Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                return value.map(item => (
                  <div
                    key={`${key}-${item}`}
                    className="flex items-center bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full px-3 py-1"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleCheckboxChange(key, item)}
                      className="ml-1 text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100"
                      aria-label={`Remove ${item} filter`}
                    >
                      <LucideClientIcon icon={X} className="w-3 h-3" />
                    </button>
                  </div>
                ));
              }

              if (typeof value === 'boolean' && value) {
                const label =
                  key === 'openNow'
                    ? 'Open Now'
                    : key === 'offerDelivery'
                      ? 'Offers Delivery'
                      : key === 'offerTakeout'
                        ? 'Offers Takeout'
                        : key;

                return (
                  <div
                    key={key}
                    className="flex items-center bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full px-3 py-1"
                  >
                    <span>{label}</span>
                    <button
                      onClick={() => handleBooleanChange(key)}
                      className="ml-1 text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100"
                      aria-label={`Remove ${label} filter`}
                    >
                      <LucideClientIcon icon={X} className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <FilterSection title="Price Range">
        <div className="flex flex-wrap gap-2">
          {['$', '$$', '$$$', '$$$$'].map(price => (
            <button
              key={price}
              onClick={() => handleCheckboxChange('priceRange', price)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filters.priceRange.includes(price)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-pressed={filters.priceRange.includes(price)}
            >
              {price}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Cuisine Types Filter */}
      <FilterSection title="Cuisine Types">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {cuisineTypes.map(cuisine => (
            <label key={cuisine} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                checked={filters.cuisineTypes.includes(cuisine)}
                onChange={() => handleCheckboxChange('cuisineTypes', cuisine)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {cuisine}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Dietary Options Filter */}
      <FilterSection title="Dietary Options">
        <div className="space-y-2">
          {dietaryOptions.map(option => (
            <label key={option} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                checked={filters.dietaryOptions.includes(option)}
                onChange={() => handleCheckboxChange('dietaryOptions', option)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {option}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Ratings Filter */}
      <FilterSection title="Ratings">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                checked={filters.ratings.includes(rating)}
                onChange={() => handleCheckboxChange('ratings', rating)}
              />
              <div className="ml-2 flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    className={`w-4 h-4 ${
                      index < rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <span className="ml-1 text-gray-700 dark:text-gray-300">
                  {rating}+
                </span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Features Filter */}
      <FilterSection title="Features">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {features.map(feature => (
            <label key={feature} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                checked={filters.features.includes(feature)}
                onChange={() => handleCheckboxChange('features', feature)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Additional Filters */}
      <FilterSection title="Additional Filters">
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              checked={filters.openNow}
              onChange={() => handleBooleanChange('openNow')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Open Now
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              checked={filters.offerDelivery}
              onChange={() => handleBooleanChange('offerDelivery')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Offers Delivery
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              checked={filters.offerTakeout}
              onChange={() => handleBooleanChange('offerTakeout')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Offers Takeout
            </span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
});

export default SearchFilters;
