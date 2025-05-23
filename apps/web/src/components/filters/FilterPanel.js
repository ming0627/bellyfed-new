/**
 * Filter Panel Component
 * 
 * Provides comprehensive filtering functionality for search results,
 * restaurant listings, and other content with multiple filter types.
 * 
 * Features:
 * - Multiple filter types (checkboxes, ranges, dropdowns)
 * - Real-time filter application
 * - Filter persistence and URL sync
 * - Clear all filters functionality
 * - Responsive design with collapsible sections
 * - Filter count indicators
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const FilterPanel = ({
  filters = [],
  values = {},
  onChange,
  showClearAll = true,
  collapsible = true,
  className = ''
}) => {
  // State
  const [filterValues, setFilterValues] = useState(values);
  const [collapsedSections, setCollapsedSections] = useState({});

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Handle filter change
  const handleFilterChange = (filterId, value, type = 'replace') => {
    let newValues = { ...filterValues };

    switch (type) {
      case 'toggle':
        // For checkbox arrays
        const currentArray = newValues[filterId] || [];
        if (currentArray.includes(value)) {
          newValues[filterId] = currentArray.filter(v => v !== value);
        } else {
          newValues[filterId] = [...currentArray, value];
        }
        break;
      case 'range':
        // For range filters
        newValues[filterId] = value;
        break;
      default:
        // For single value filters
        newValues[filterId] = value;
    }

    setFilterValues(newValues);
    
    if (onChange) {
      onChange(newValues);
    }

    // Track filter usage
    trackUserEngagement('filters', filterId, 'change', {
      value,
      type,
      totalFilters: Object.keys(newValues).filter(key => 
        newValues[key] && 
        (Array.isArray(newValues[key]) ? newValues[key].length > 0 : true)
      ).length
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedValues = {};
    setFilterValues(clearedValues);
    
    if (onChange) {
      onChange(clearedValues);
    }

    trackUserEngagement('filters', 'clear_all', 'action');
  };

  // Toggle section collapse
  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.keys(filterValues).filter(key => {
      const value = filterValues[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
  };

  // Render checkbox filter
  const renderCheckboxFilter = (filter) => {
    const selectedValues = filterValues[filter.id] || [];

    return (
      <div className="space-y-2">
        {filter.options.map(option => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleFilterChange(filter.id, option.value, 'toggle')}
              className="mr-2 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 flex-1">{option.label}</span>
            {option.count && (
              <span className="text-xs text-gray-500">({option.count})</span>
            )}
          </label>
        ))}
      </div>
    );
  };

  // Render range filter
  const renderRangeFilter = (filter) => {
    const value = filterValues[filter.id] || { min: filter.min, max: filter.max };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Min</label>
            <input
              type="number"
              value={value.min || ''}
              onChange={(e) => handleFilterChange(filter.id, {
                ...value,
                min: e.target.value ? parseFloat(e.target.value) : null
              }, 'range')}
              min={filter.min}
              max={filter.max}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder={filter.min?.toString()}
            />
          </div>
          <span className="text-gray-400 mt-5">-</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Max</label>
            <input
              type="number"
              value={value.max || ''}
              onChange={(e) => handleFilterChange(filter.id, {
                ...value,
                max: e.target.value ? parseFloat(e.target.value) : null
              }, 'range')}
              min={filter.min}
              max={filter.max}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder={filter.max?.toString()}
            />
          </div>
        </div>
        
        {filter.showSlider && (
          <div className="px-1">
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={value.max || filter.max}
              onChange={(e) => handleFilterChange(filter.id, {
                ...value,
                max: parseFloat(e.target.value)
              }, 'range')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}
      </div>
    );
  };

  // Render select filter
  const renderSelectFilter = (filter) => {
    const value = filterValues[filter.id] || '';

    return (
      <select
        value={value}
        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <option value="">All {filter.label}</option>
        {filter.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.count && ` (${option.count})`}
          </option>
        ))}
      </select>
    );
  };

  // Render radio filter
  const renderRadioFilter = (filter) => {
    const value = filterValues[filter.id] || '';

    return (
      <div className="space-y-2">
        {filter.options.map(option => (
          <label key={option.value} className="flex items-center">
            <input
              type="radio"
              name={filter.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => handleFilterChange(filter.id, option.value)}
              className="mr-2 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 flex-1">{option.label}</span>
            {option.count && (
              <span className="text-xs text-gray-500">({option.count})</span>
            )}
          </label>
        ))}
      </div>
    );
  };

  // Render filter section
  const renderFilterSection = (filter) => {
    const isCollapsed = collapsedSections[filter.id];
    const hasActiveFilters = filterValues[filter.id] && 
      (Array.isArray(filterValues[filter.id]) 
        ? filterValues[filter.id].length > 0 
        : filterValues[filter.id] !== '');

    return (
      <div key={filter.id} className="border-b border-gray-200 last:border-b-0">
        <div className="p-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{filter.label}</h3>
              {hasActiveFilters && (
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  {Array.isArray(filterValues[filter.id]) 
                    ? filterValues[filter.id].length 
                    : '1'
                  }
                </Badge>
              )}
            </div>
            
            {collapsible && (
              <button
                onClick={() => toggleSection(filter.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
            )}
          </div>

          {/* Section Content */}
          {(!collapsible || !isCollapsed) && (
            <div>
              {filter.type === 'checkbox' && renderCheckboxFilter(filter)}
              {filter.type === 'range' && renderRangeFilter(filter)}
              {filter.type === 'select' && renderSelectFilter(filter)}
              {filter.type === 'radio' && renderRadioFilter(filter)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update local state when values prop changes
  useEffect(() => {
    setFilterValues(values);
  }, [values]);

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={className}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">🔍 Filters</h2>
            {activeFilterCount > 0 && (
              <Badge className="bg-orange-100 text-orange-700">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          
          {showClearAll && activeFilterCount > 0 && (
            <Button
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div>
        {filters.map(renderFilterSection)}
      </div>

      {/* Footer */}
      {activeFilterCount > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 text-center">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </div>
        </div>
      )}
    </Card>
  );
};

export default FilterPanel;
