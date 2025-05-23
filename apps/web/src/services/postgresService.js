/**
 * PostgreSQL Service
 *
 * This module provides methods for interacting with the PostgreSQL database
 * through API endpoints. It handles all database operations with proper
 * error handling, retry logic, and connection management.
 */

import { apiService } from './api.js'
import { getEnvironmentName } from '../utils/environment.js'

/**
 * PostgreSQL Error interface
 */
export const PostgresError = {
  code: '',
  statusCode: 0,
  message: ''
}

/**
 * User interface
 */
export const User = {
  id: '',
  cognito_id: '',
  email: '',
  name: '',
  phone: '',
  email_verified: false,
  created_at: '',
  updated_at: ''
}

/**
 * Dish interface
 */
export const Dish = {
  id: '',
  name: '',
  description: '',
  price: 0,
  restaurant_id: '',
  dish_type: '',
  photo_url: '',
  created_at: '',
  updated_at: ''
}

/**
 * Dish Ranking interface
 */
export const DishRanking = {
  id: '',
  user_id: '',
  dish_id: '',
  restaurant_id: '',
  dish_type: '',
  rank: null,
  taste_status: '',
  notes: '',
  photo_urls: [],
  timestamp: '',
  created_at: '',
  updated_at: ''
}

/**
 * Ranking Stats interface
 */
export const RankingStats = {
  dishId: '',
  totalRankings: 0,
  averageRank: 0,
  rankDistribution: {},
  tasteStatusDistribution: {}
}

/**
 * Vote Stats interface
 */
export const VoteStats = {
  dishId: '',
  totalVotes: 0,
  averageRating: 0,
  ratingDistribution: {}
}

/**
 * PostgreSQL Service class
 * Provides methods for interacting with the PostgreSQL database
 */
export class PostgresService {
  constructor() {
    this.MAX_RETRIES = 3
    this.BASE_DELAY_MS = 1000
    this.BASE_PATH = '/api/proxy/db'
    this.environment = getEnvironmentName()
    this.connectionPool = null
  }

  /**
   * Execute a request with retry logic
   * @param {Function} requestFn The request function to execute
   * @param {number} retries Number of retries remaining
   * @returns {Promise<any>} The request result
   */
  async executeWithRetry(requestFn, retries = this.MAX_RETRIES) {
    try {
      return await requestFn()
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        const delay = this.BASE_DELAY_MS * (this.MAX_RETRIES - retries + 1)
        console.warn(`Request failed, retrying in ${delay}ms. Retries left: ${retries - 1}`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.executeWithRetry(requestFn, retries - 1)
      }
      throw error
    }
  }

  /**
   * Check if an error is retryable
   * @param {Error} error The error to check
   * @returns {boolean} Whether the error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504]
    
    return (
      retryableCodes.includes(error.code) ||
      retryableStatusCodes.includes(error.statusCode) ||
      (error.message && error.message.includes('timeout'))
    )
  }

  /**
   * Create a PostgreSQL error
   * @param {Error} originalError The original error
   * @param {string} message The error message
   * @returns {Error} The PostgreSQL error
   */
  createPostgresError(originalError, message) {
    const error = new Error(message)
    error.code = originalError.code || 'POSTGRES_ERROR'
    error.statusCode = originalError.statusCode || 500
    error.originalError = originalError
    return error
  }

  /**
   * Get user by ID
   * @param {string} userId The user ID
   * @returns {Promise<object>} The user data
   */
  async getUserById(userId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/users/${userId}`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get user')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting user by ID:', error)
        throw this.createPostgresError(error, `Failed to get user with ID: ${userId}`)
      }
    })
  }

  /**
   * Get user by Cognito ID
   * @param {string} cognitoId The Cognito ID
   * @returns {Promise<object>} The user data
   */
  async getUserByCognitoId(cognitoId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/users/cognito/${cognitoId}`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get user')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting user by Cognito ID:', error)
        throw this.createPostgresError(error, `Failed to get user with Cognito ID: ${cognitoId}`)
      }
    })
  }

  /**
   * Create a new user
   * @param {object} userData The user data
   * @returns {Promise<object>} The created user
   */
  async createUser(userData) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.post(`${this.BASE_PATH}/users`, userData)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to create user')
        }
        
        return response.data
      } catch (error) {
        console.error('Error creating user:', error)
        throw this.createPostgresError(error, 'Failed to create user')
      }
    })
  }

  /**
   * Update a user
   * @param {string} userId The user ID
   * @param {object} userData The user data to update
   * @returns {Promise<object>} The updated user
   */
  async updateUser(userId, userData) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.put(`${this.BASE_PATH}/users/${userId}`, userData)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to update user')
        }
        
        return response.data
      } catch (error) {
        console.error('Error updating user:', error)
        throw this.createPostgresError(error, `Failed to update user with ID: ${userId}`)
      }
    })
  }

  /**
   * Get dish by ID
   * @param {string} dishId The dish ID
   * @returns {Promise<object>} The dish data
   */
  async getDishById(dishId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/dishes/${dishId}`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get dish')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting dish by ID:', error)
        throw this.createPostgresError(error, `Failed to get dish with ID: ${dishId}`)
      }
    })
  }

  /**
   * Get dishes by restaurant
   * @param {string} restaurantId The restaurant ID
   * @returns {Promise<Array>} Array of dish data
   */
  async getDishesByRestaurant(restaurantId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/restaurants/${restaurantId}/dishes`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get dishes')
        }
        
        return response.data || []
      } catch (error) {
        console.error('Error getting dishes by restaurant:', error)
        throw this.createPostgresError(error, `Failed to get dishes for restaurant: ${restaurantId}`)
      }
    })
  }

  /**
   * Get dish rankings
   * @param {string} dishId The dish ID
   * @returns {Promise<object>} The ranking stats
   */
  async getDishRankings(dishId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/dishes/${dishId}/rankings`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get dish rankings')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting dish rankings:', error)
        throw this.createPostgresError(error, `Failed to get rankings for dish: ${dishId}`)
      }
    })
  }

  /**
   * Get dish votes
   * @param {string} dishId The dish ID
   * @returns {Promise<object>} The vote stats
   */
  async getDishVotes(dishId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/dishes/${dishId}/votes`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get dish votes')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting dish votes:', error)
        throw this.createPostgresError(error, `Failed to get votes for dish: ${dishId}`)
      }
    })
  }

  /**
   * Create a ranking
   * @param {object} rankingData The ranking data
   * @returns {Promise<object>} The created ranking
   */
  async createRanking(rankingData) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.post(`${this.BASE_PATH}/rankings`, rankingData)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to create ranking')
        }
        
        return response.data
      } catch (error) {
        console.error('Error creating ranking:', error)
        throw this.createPostgresError(error, 'Failed to create ranking')
      }
    })
  }

  /**
   * Vote on a dish
   * @param {string} dishId The dish ID
   * @param {string} userId The user ID
   * @param {string} restaurantId The restaurant ID
   * @param {number} rating The rating
   * @returns {Promise<object>} The vote result
   */
  async voteDish(dishId, userId, restaurantId, rating) {
    return this.executeWithRetry(async () => {
      try {
        const voteData = {
          userId,
          dishId,
          restaurantId,
          rating
        }
        
        const response = await apiService.post(`${this.BASE_PATH}/dishes/${dishId}/vote`, voteData)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to vote on dish')
        }
        
        return response.data
      } catch (error) {
        console.error('Error voting on dish:', error)
        throw this.createPostgresError(error, `Failed to vote on dish: ${dishId}`)
      }
    })
  }

  /**
   * Get user votes
   * @param {string} userId The user ID
   * @returns {Promise<object>} The user votes
   */
  async getUserVotes(userId) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.get(`${this.BASE_PATH}/users/${userId}/votes`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get user votes')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting user votes:', error)
        throw this.createPostgresError(error, `Failed to get votes for user: ${userId}`)
      }
    })
  }

  /**
   * Get top dishes
   * @param {number} limit The limit of dishes to return
   * @param {string} category The category filter
   * @returns {Promise<object>} The top dishes
   */
  async getTopDishes(limit = 10, category = null) {
    return this.executeWithRetry(async () => {
      try {
        const params = new URLSearchParams({ limit: limit.toString() })
        if (category) {
          params.append('category', category)
        }
        
        const response = await apiService.get(`${this.BASE_PATH}/dishes/top?${params}`)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to get top dishes')
        }
        
        return response.data
      } catch (error) {
        console.error('Error getting top dishes:', error)
        throw this.createPostgresError(error, 'Failed to get top dishes')
      }
    })
  }

  /**
   * Check database connection
   * @returns {Promise<boolean>} Whether the connection is successful
   */
  async checkConnection() {
    try {
      const response = await apiService.get(`${this.BASE_PATH}/health`)
      return response.success && response.data?.status === 'connected'
    } catch (error) {
      console.error('Database connection check failed:', error)
      return false
    }
  }

  /**
   * Get connection statistics
   * @returns {Promise<object>} Connection statistics
   */
  async getConnectionStats() {
    try {
      const response = await apiService.get(`${this.BASE_PATH}/stats`)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get connection stats')
      }
      
      return response.data
    } catch (error) {
      console.error('Error getting connection stats:', error)
      return {
        activeConnections: 0,
        totalConnections: 0,
        maxConnections: 0,
        environment: this.environment
      }
    }
  }

  /**
   * Execute a raw SQL query (for admin operations)
   * @param {string} query The SQL query
   * @param {Array} params Query parameters
   * @returns {Promise<object>} Query result
   */
  async executeQuery(query, params = []) {
    return this.executeWithRetry(async () => {
      try {
        const response = await apiService.post(`${this.BASE_PATH}/query`, {
          query,
          params
        })
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to execute query')
        }
        
        return response.data
      } catch (error) {
        console.error('Error executing query:', error)
        throw this.createPostgresError(error, 'Failed to execute query')
      }
    })
  }
}

// Export a singleton instance
export const postgresService = new PostgresService()
