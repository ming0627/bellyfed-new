/**
 * Data Table Component
 * 
 * Provides a comprehensive data table with sorting, filtering, pagination,
 * and selection capabilities for displaying structured data.
 * 
 * Features:
 * - Column sorting (ascending/descending)
 * - Row selection (single/multiple)
 * - Pagination with customizable page sizes
 * - Search and filtering
 * - Responsive design with horizontal scroll
 * - Custom cell renderers
 * - Export functionality
 * - Loading and empty states
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, LoadingSpinner, Badge } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  showExport = false,
  emptyMessage = 'No data available',
  className = ''
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm && searchable) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;

    const startIndex = (currentPage - 1) * currentPageSize;
    return processedData.slice(startIndex, startIndex + currentPageSize);
  }, [processedData, currentPage, currentPageSize, pagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(processedData.length / currentPageSize);
  const startRow = (currentPage - 1) * currentPageSize + 1;
  const endRow = Math.min(currentPage * currentPageSize, processedData.length);

  // Handle sorting
  const handleSort = (columnKey) => {
    if (!sortable) return;

    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));

    trackUserEngagement('table', 'sort', 'column', {
      column: columnKey,
      direction: sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Handle row selection
  const handleRowSelect = (rowId, isSelected) => {
    if (!selectable) return;

    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }
      return newSelection;
    });

    trackUserEngagement('table', 'select', 'row', {
      rowId,
      isSelected,
      totalSelected: selectedRows.size + (isSelected ? 1 : -1)
    });
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (!selectable) return;

    if (isSelected) {
      setSelectedRows(new Set(paginatedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }

    trackUserEngagement('table', 'select', 'all', {
      isSelected,
      rowCount: paginatedData.length
    });
  };

  // Handle export
  const handleExport = () => {
    if (!showExport) return;

    try {
      // Create CSV content
      const headers = columns.map(col => col.header).join(',');
      const rows = processedData.map(row =>
        columns.map(col => {
          const value = row[col.key];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      );

      const csvContent = [headers, ...rows].join('\n');
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      trackUserEngagement('table', 'export', 'csv', {
        rowCount: processedData.length,
        columnCount: columns.length
      });
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedRows(new Set()); // Clear selection on page change
    
    trackUserEngagement('table', 'paginate', 'page_change', {
      fromPage: currentPage,
      toPage: page
    });
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
    setSelectedRows(new Set());

    trackUserEngagement('table', 'paginate', 'page_size_change', {
      fromSize: currentPageSize,
      toSize: newPageSize
    });
  };

  // Render cell content
  const renderCell = (row, column) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'badge') {
      return (
        <Badge 
          variant={value === 'active' ? 'default' : 'outline'}
          className="text-xs"
        >
          {value}
        </Badge>
      );
    }

    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }

    if (column.type === 'currency') {
      return value ? `$${value.toFixed(2)}` : '-';
    }

    return value || '-';
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [data, searchTerm]);

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="flex-1 max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRows.size} selected
              </span>
            )}
            
            {showExport && (
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : paginatedData.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`
                      px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                    `}
                    onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {sortable && column.sortable !== false && (
                        <span className="text-gray-400">
                          {getSortIcon(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr 
                  key={row.id || index}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${selectedRows.has(row.id) ? 'bg-orange-50' : ''}
                  `}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td 
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium mb-2">No Data Found</p>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && processedData.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">Show:</span>
              <select
                value={currentPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-gray-700">entries</span>
            </div>

            {/* Page Info */}
            <div className="text-sm text-gray-700">
              Showing {startRow} to {endRow} of {processedData.length} entries
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`
                        w-8 h-8 text-sm rounded transition-colors
                        ${currentPage === pageNum
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DataTable;
