/**
 * API Route: Debug Logs
 * 
 * This API route provides access to application debug logs.
 * It requires admin authentication and supports log filtering.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import fs from 'fs';
import path from 'path';

/**
 * Handler for debug logs API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to access debug logs'
      });
    }

    // Check if user has admin privileges
    if (!session.user.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin privileges required to access debug logs'
      });
    }

    const { 
      level = 'all',
      limit = 100,
      offset = 0,
      startDate,
      endDate,
      source,
      search
    } = req.query;

    // Validate level parameter
    const validLevels = ['all', 'error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        error: 'Invalid level parameter',
        message: `Level must be one of: ${validLevels.join(', ')}`
      });
    }

    // Validate pagination parameters
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'Limit must be between 1 and 1000'
      });
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: 'Invalid offset parameter',
        message: 'Offset must be a non-negative integer'
      });
    }

    // Validate date parameters
    let startDateTime = null;
    let endDateTime = null;

    if (startDate) {
      startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({
          error: 'Invalid start date',
          message: 'Start date must be a valid ISO date string'
        });
      }
    }

    if (endDate) {
      endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({
          error: 'Invalid end date',
          message: 'End date must be a valid ISO date string'
        });
      }
    }

    if (startDateTime && endDateTime && startDateTime > endDateTime) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'Start date must be before end date'
      });
    }

    // Validate search parameter
    if (search && (typeof search !== 'string' || search.length > 200)) {
      return res.status(400).json({
        error: 'Invalid search parameter',
        message: 'Search must be a string with maximum 200 characters'
      });
    }

    // Get logs from various sources
    const logs = await getDebugLogs({
      level,
      limit: limitNum,
      offset: offsetNum,
      startDate: startDateTime,
      endDate: endDateTime,
      source,
      search
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        logs: logs.entries,
        total: logs.total,
        filtered: logs.filtered
      },
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: logs.hasMore
      },
      meta: {
        level,
        source: source || 'all',
        search: search || null,
        dateRange: {
          start: startDateTime?.toISOString() || null,
          end: endDateTime?.toISOString() || null
        },
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error retrieving debug logs:', error);
    
    // Handle specific error types
    if (error.message.includes('file not found')) {
      return res.status(404).json({
        error: 'Log file not found',
        message: 'Debug log files are not available'
      });
    }

    if (error.message.includes('permission')) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'Unable to access log files'
      });
    }

    // Handle general errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve debug logs'
    });
  }
}

/**
 * Get debug logs from various sources
 */
async function getDebugLogs(options) {
  const { level, limit, offset, startDate, endDate, source, search } = options;
  
  // Mock implementation - in a real app, this would read from actual log files or database
  const mockLogs = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'api',
      message: 'User authentication successful',
      metadata: { userId: 'user123', ip: '192.168.1.1' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'error',
      source: 'database',
      message: 'Connection timeout to PostgreSQL',
      metadata: { error: 'ETIMEDOUT', duration: 30000 }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'warn',
      source: 'api',
      message: 'Rate limit approaching for user',
      metadata: { userId: 'user456', requests: 95, limit: 100 }
    }
  ];

  // Filter logs based on criteria
  let filteredLogs = mockLogs;

  if (level !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }

  if (source) {
    filteredLogs = filteredLogs.filter(log => log.source === source);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.message.toLowerCase().includes(searchLower) ||
      log.source.toLowerCase().includes(searchLower)
    );
  }

  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
  }

  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
  }

  // Apply pagination
  const total = mockLogs.length;
  const filtered = filteredLogs.length;
  const paginatedLogs = filteredLogs.slice(offset, offset + limit);
  const hasMore = offset + limit < filtered;

  return {
    entries: paginatedLogs,
    total,
    filtered,
    hasMore
  };
}
