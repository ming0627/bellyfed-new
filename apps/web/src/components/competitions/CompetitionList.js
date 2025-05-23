/**
 * Competition List Component
 * 
 * Displays a list of competitions with filtering, sorting, and pagination.
 * Supports different view modes and competition categories.
 * 
 * Features:
 * - Competition filtering and sorting
 * - Multiple view modes (grid/list)
 * - Pagination support
 * - Search functionality
 * - Category filtering
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, LoadingSpinner, Badge } from '@bellyfed/ui';
import CompetitionCard from './CompetitionCard.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const CompetitionList = ({
  competitions = [],
  loading = false,
  error = null,
  showFilters = true,
  showSearch = true,
  showViewToggle = true,
  defaultView = 'grid',
  itemsPerPage = 12,
  onLoadMore = null,
  hasMore = false,
  className = ''
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState(defaultView);
  const [currentPage, setCurrentPage] = useState(1);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' }
  ];

  const sortOptions = [
    { value: 'startDate', label: 'Start Date' },
    { value: 'endDate', label: 'End Date' },
    { value: 'participantCount', label: 'Participants' },
    { value: 'prize', label: 'Prize Value' },
    { value: 'title', label: 'Title' }
  ];

  // Extract unique categories from competitions
  const categories = useMemo(() => {
    const allCategories = competitions.flatMap(comp => comp.categories || []);
    const uniqueCategories = [...new Set(allCategories)];
    return [
      { value: 'all', label: 'All Categories' },
      ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [competitions]);

  // Filter and sort competitions
  const filteredCompetitions = useMemo(() => {
    let filtered = competitions.filter(competition => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          competition.title?.toLowerCase().includes(query) ||
          competition.description?.toLowerCase().includes(query) ||
          competition.categories?.some(cat => cat.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && competition.status !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (!competition.categories?.includes(selectedCategory)) {
          return false;
        }
      }

      return true;
    });

    // Sort competitions
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      if (sortBy === 'prize') {
        aValue = parseFloat(aValue?.replace(/[^0-9.]/g, '') || 0);
        bValue = parseFloat(bValue?.replace(/[^0-9.]/g, '') || 0);
      } else if (sortBy === 'startDate' || sortBy === 'endDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [competitions, searchQuery, selectedStatus, selectedCategory, sortBy, sortOrder]);

  // Paginated competitions
  const paginatedCompetitions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCompetitions.slice(0, endIndex);
  }, [filteredCompetitions, currentPage, itemsPerPage]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    trackUserEngagement('competitions', 'list', 'search', {
      query,
      resultCount: filteredCompetitions.length
    });
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    
    switch (filterType) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'category':
        setSelectedCategory(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      case 'order':
        setSortOrder(value);
        break;
    }

    trackUserEngagement('competitions', 'list', 'filter', {
      filterType,
      value,
      resultCount: filteredCompetitions.length
    });
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    trackUserEngagement('competitions', 'list', 'view_change', { mode });
  };

  // Handle load more
  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      setCurrentPage(prev => prev + 1);
    }
    
    trackUserEngagement('competitions', 'list', 'load_more', {
      page: currentPage + 1
    });
  };

  // Track initial view
  useEffect(() => {
    trackUserEngagement('competitions', 'list', 'view', {
      totalCompetitions: competitions.length,
      viewMode
    });
  }, []);

  if (loading && competitions.length === 0) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Competitions</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Competitions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredCompetitions.length} competition{filteredCompetitions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === 'grid' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === 'list' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            {showSearch && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search competitions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleFilterChange('order', sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Competition List */}
      {paginatedCompetitions.length > 0 ? (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          {paginatedCompetitions.map(competition => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Competitions Found</p>
            <p className="text-sm">
              {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters to see more competitions.'
                : 'No competitions are available at the moment.'
              }
            </p>
          </div>
        </Card>
      )}

      {/* Load More */}
      {(hasMore || paginatedCompetitions.length < filteredCompetitions.length) && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More Competitions'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompetitionList;
