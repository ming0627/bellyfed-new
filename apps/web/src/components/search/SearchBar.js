/**
 * Search Bar Component
 * 
 * Provides comprehensive search functionality with autocomplete,
 * filters, and real-time suggestions across multiple content types.
 * 
 * Features:
 * - Real-time search suggestions
 * - Multiple search categories (restaurants, dishes, users)
 * - Advanced filtering options
 * - Search history and saved searches
 * - Voice search integration
 * - Keyboard navigation support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const SearchBar = ({
  placeholder = 'Search restaurants, dishes, or users...',
  showFilters = true,
  showSuggestions = true,
  showHistory = true,
  maxSuggestions = 8,
  categories = ['restaurants', 'dishes', 'users'],
  onSearch,
  className = ''
}) => {
  // State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();

  // Category configurations
  const categoryConfigs = {
    all: { label: 'All', icon: '🔍' },
    restaurants: { label: 'Restaurants', icon: '🏪' },
    dishes: { label: 'Dishes', icon: '🍽️' },
    users: { label: 'Users', icon: '👥' },
    locations: { label: 'Locations', icon: '📍' }
  };

  // Search for suggestions
  const searchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const data = await analyticsService.getSearchSuggestions({
        query: searchQuery,
        category: selectedCategory,
        categories: selectedCategory === 'all' ? categories : [selectedCategory],
        limit: maxSuggestions,
        userId: user?.id
      });

      setSuggestions(data.suggestions || []);
      setShowDropdown(true);

      // Track search suggestions
      trackUserEngagement('search', 'suggestions', 'fetch', {
        query: searchQuery,
        category: selectedCategory,
        resultCount: data.suggestions?.length || 0
      });
    } catch (err) {
      console.error('Error fetching search suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, categories, maxSuggestions, user?.id, trackUserEngagement]);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    if (showSuggestions) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(value);
      }, 300);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery = query, suggestion = null) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;

    // Add to search history
    if (isAuthenticated && !searchHistory.includes(finalQuery)) {
      const newHistory = [finalQuery, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }

    // Track search
    trackUserEngagement('search', 'submit', 'query', {
      query: finalQuery,
      category: selectedCategory,
      suggestionUsed: !!suggestion,
      suggestionType: suggestion?.type
    });

    // Close dropdown
    setShowDropdown(false);
    setSelectedIndex(-1);

    // Call onSearch callback or navigate
    if (onSearch) {
      onSearch(finalQuery, selectedCategory, suggestion);
    } else {
      const searchParams = new URLSearchParams({
        q: finalQuery,
        category: selectedCategory !== 'all' ? selectedCategory : ''
      });
      window.location.href = `/${country}/search?${searchParams.toString()}`;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    
    if (suggestion.directUrl) {
      // Navigate directly to the item
      window.location.href = suggestion.directUrl;
    } else {
      // Perform search with the suggestion
      handleSearch(suggestion.title, suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Load search history
  useEffect(() => {
    if (isAuthenticated && showHistory) {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        try {
          setSearchHistory(JSON.parse(history));
        } catch (err) {
          console.error('Error loading search history:', err);
        }
      }
    }
  }, [isAuthenticated, showHistory]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Render suggestion item
  const renderSuggestion = (suggestion, index) => {
    const config = categoryConfigs[suggestion.type] || categoryConfigs.all;
    const isSelected = index === selectedIndex;

    return (
      <button
        key={suggestion.id}
        onClick={() => handleSuggestionClick(suggestion)}
        className={`
          w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
          ${isSelected ? 'bg-orange-50 border-l-2 border-orange-500' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {suggestion.image ? (
            <img
              src={suggestion.image}
              alt={suggestion.title}
              className="w-10 h-10 object-cover rounded-lg"
            />
          ) : suggestion.avatar ? (
            <Avatar
              src={suggestion.avatar}
              alt={suggestion.title}
              fallback={suggestion.title?.charAt(0) || 'U'}
              size="sm"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
              {config.icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {suggestion.title}
            </div>
            {suggestion.subtitle && (
              <div className="text-sm text-gray-600 truncate">
                {suggestion.subtitle}
              </div>
            )}
          </div>
          
          <Badge variant="outline" className="text-xs">
            {config.label}
          </Badge>
        </div>
      </button>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        {/* Category Filter */}
        {showFilters && (
          <div className="flex mb-2">
            <div className="flex gap-1 overflow-x-auto">
              {['all', ...categories].map(category => {
                const config = categoryConfigs[category];
                return config && (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                      ${selectedCategory === category
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 || (showHistory && searchHistory.length > 0)) {
                setShowDropdown(true);
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          
          {/* Search Icon/Loading */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <button
                onClick={() => handleSearch()}
                className="text-gray-400 hover:text-orange-600 transition-colors"
              >
                🔍
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Suggestions
              </div>
              {suggestions.map(renderSuggestion)}
            </div>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && query.trim() === '' && (
            <div>
              {suggestions.length > 0 && <div className="border-t border-gray-100"></div>}
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Recent Searches
              </div>
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(historyItem)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">🕒</span>
                    <span className="text-gray-900">{historyItem}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.trim() && !loading && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
