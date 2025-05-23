/**
 * Database Service
 *
 * This module provides a high-level interface for database operations.
 * It acts as a wrapper around the PostgreSQL service and provides
 * additional business logic and data transformation.
 */

import { postgresService } from './postgresService.js'
import { getEnvironmentName } from '../utils/environment.js'

/**
 * Database Error interface
 */
export const DatabaseError = {
  code: '',
  statusCode: 0,
  message: ''
}

/**
 * Database Service class
 * Provides methods for interacting with the database
 */
export class DatabaseService {
  constructor() {
    this.environment = getEnvironmentName()
    this.isInitialized = false
  }

  /**
   * Initialize the database service
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      if (this.isInitialized) return

      // Test database connection through postgres service
      await postgresService.checkConnection()
      this.isInitialized = true
      
      console.log('Database service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database service:', error)
      throw new Error(`Database service initialization failed: ${error.message}`)
    }
  }

  /**
   * Get user data by ID
   * @param {string} userId The user ID
   * @returns {Promise<object>} The user data
   */
  async getUserData(userId) {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required and must be a string')
      }

      // Use PostgreSQL service exclusively
      const userData = await postgresService.getUserById(userId)
      
      // Convert to plain object
      return {
        id: userData.id,
        cognitoId: userData.cognito_id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        emailVerified: userData.email_verified,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      }
    } catch (error) {
      console.error('Error getting user data:', error)
      throw this.createDatabaseError(error, 'Failed to get user data')
    }
  }

  /**
   * Save user data
   * @param {object} userData The user data to save
   * @returns {Promise<object>} The saved user data
   */
  async saveUserData(userData) {
    try {
      if (!userData || typeof userData !== 'object') {
        throw new Error('User data is required and must be an object')
      }

      // Transform data for postgres service
      const postgresUserData = {
        cognito_id: userData.cognitoId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        email_verified: userData.emailVerified
      }

      // Use PostgreSQL service exclusively
      const savedUser = await postgresService.createUser(postgresUserData)
      
      // Transform back to standard format
      return {
        id: savedUser.id,
        cognitoId: savedUser.cognito_id,
        email: savedUser.email,
        name: savedUser.name,
        phone: savedUser.phone,
        emailVerified: savedUser.email_verified,
        createdAt: savedUser.created_at,
        updatedAt: savedUser.updated_at
      }
    } catch (error) {
      console.error('Error saving user data:', error)
      throw this.createDatabaseError(error, 'Failed to save user data')
    }
  }

  /**
   * Update user data
   * @param {string} userId The user ID
   * @param {object} userData The user data to update
   * @returns {Promise<object>} The updated user data
   */
  async updateUserData(userId, userData) {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required and must be a string')
      }

      if (!userData || typeof userData !== 'object') {
        throw new Error('User data is required and must be an object')
      }

      // Transform data for postgres service
      const postgresUserData = {
        cognito_id: userData.cognitoId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        email_verified: userData.emailVerified
      }

      // Use PostgreSQL service exclusively
      const updatedUser = await postgresService.updateUser(userId, postgresUserData)
      
      // Transform back to standard format
      return {
        id: updatedUser.id,
        cognitoId: updatedUser.cognito_id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        emailVerified: updatedUser.email_verified,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }
    } catch (error) {
      console.error('Error updating user data:', error)
      throw this.createDatabaseError(error, 'Failed to update user data')
    }
  }

  /**
   * Get dish data by ID
   * @param {string} dishId The dish ID
   * @returns {Promise<object>} The dish data
   */
  async getDishData(dishId) {
    try {
      if (!dishId || typeof dishId !== 'string') {
        throw new Error('Dish ID is required and must be a string')
      }

      const dishData = await postgresService.getDishById(dishId)
      
      return {
        id: dishData.id,
        name: dishData.name,
        description: dishData.description,
        price: dishData.price,
        restaurantId: dishData.restaurant_id,
        dishType: dishData.dish_type,
        photoUrl: dishData.photo_url,
        createdAt: dishData.created_at,
        updatedAt: dishData.updated_at
      }
    } catch (error) {
      console.error('Error getting dish data:', error)
      throw this.createDatabaseError(error, 'Failed to get dish data')
    }
  }

  /**
   * Get dishes by restaurant
   * @param {string} restaurantId The restaurant ID
   * @returns {Promise<Array>} Array of dish data
   */
  async getDishesByRestaurant(restaurantId) {
    try {
      if (!restaurantId || typeof restaurantId !== 'string') {
        throw new Error('Restaurant ID is required and must be a string')
      }

      const dishes = await postgresService.getDishesByRestaurant(restaurantId)
      
      return dishes.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        restaurantId: dish.restaurant_id,
        dishType: dish.dish_type,
        photoUrl: dish.photo_url,
        createdAt: dish.created_at,
        updatedAt: dish.updated_at
      }))
    } catch (error) {
      console.error('Error getting dishes by restaurant:', error)
      throw this.createDatabaseError(error, 'Failed to get dishes by restaurant')
    }
  }

  /**
   * Create a ranking
   * @param {object} rankingData The ranking data
   * @returns {Promise<object>} The created ranking
   */
  async createRanking(rankingData) {
    try {
      if (!rankingData || typeof rankingData !== 'object') {
        throw new Error('Ranking data is required and must be an object')
      }

      const ranking = await postgresService.createRanking(rankingData)
      
      return {
        id: ranking.id,
        userId: ranking.user_id,
        dishId: ranking.dish_id,
        restaurantId: ranking.restaurant_id,
        dishType: ranking.dish_type,
        rank: ranking.rank,
        tasteStatus: ranking.taste_status,
        notes: ranking.notes,
        photoUrls: ranking.photo_urls,
        timestamp: ranking.timestamp,
        createdAt: ranking.created_at,
        updatedAt: ranking.updated_at
      }
    } catch (error) {
      console.error('Error creating ranking:', error)
      throw this.createDatabaseError(error, 'Failed to create ranking')
    }
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
    try {
      if (!dishId || !userId || !restaurantId) {
        throw new Error('Dish ID, user ID, and restaurant ID are required')
      }

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5')
      }

      const vote = await postgresService.voteDish(dishId, userId, restaurantId, rating)
      
      return {
        id: vote.id,
        userId: vote.user_id,
        dishId: vote.dish_id,
        restaurantId: vote.restaurant_id,
        rank: vote.rank,
        rating: rating,
        createdAt: vote.created_at,
        updatedAt: vote.updated_at
      }
    } catch (error) {
      console.error('Error voting on dish:', error)
      throw this.createDatabaseError(error, 'Failed to vote on dish')
    }
  }

  /**
   * Get user votes
   * @param {string} userId The user ID
   * @returns {Promise<object>} The user votes data
   */
  async getUserVotes(userId) {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('User ID is required and must be a string')
      }

      const result = await postgresService.getUserVotes(userId)
      
      return {
        userId: userId,
        user: null,
        totalRankings: result.votes.length,
        rankCounts: {},
        tasteStatusCounts: {},
        rankings: result.votes.map(vote => ({
          id: vote.id,
          userId: vote.user_id,
          dishId: vote.dish_id,
          restaurantId: vote.restaurant_id,
          rank: vote.rank,
          tasteStatus: vote.taste_status,
          notes: vote.notes,
          photoUrls: vote.photo_urls,
          timestamp: vote.timestamp,
          createdAt: vote.created_at,
          updatedAt: vote.updated_at
        })),
        topRankings: result.votes.slice(0, 5).map(vote => ({
          id: vote.id,
          userId: vote.user_id,
          dishId: vote.dish_id,
          restaurantId: vote.restaurant_id,
          rank: vote.rank,
          tasteStatus: vote.taste_status,
          notes: vote.notes,
          photoUrls: vote.photo_urls,
          timestamp: vote.timestamp,
          createdAt: vote.created_at,
          updatedAt: vote.updated_at
        }))
      }
    } catch (error) {
      console.error('Error getting user votes:', error)
      throw this.createDatabaseError(error, 'Failed to get user votes')
    }
  }

  /**
   * Get top dishes
   * @param {number} limit The limit of dishes to return
   * @param {string} category The category filter
   * @returns {Promise<object>} The top dishes data
   */
  async getTopDishes(limit = 10, category = null) {
    try {
      const result = await postgresService.getTopDishes(limit, category)
      
      return {
        dishes: result.dishes.map(dish => ({
          id: dish.id,
          name: dish.name,
          restaurantId: dish.restaurantId,
          restaurantName: dish.restaurantName,
          totalVotes: dish.totalVotes,
          averageRating: dish.averageRating,
          category: dish.category
        })),
        total: result.total
      }
    } catch (error) {
      console.error('Error getting top dishes:', error)
      throw this.createDatabaseError(error, 'Failed to get top dishes')
    }
  }

  /**
   * Create a database error with proper formatting
   * @param {Error} originalError The original error
   * @param {string} message The error message
   * @returns {Error} The formatted database error
   */
  createDatabaseError(originalError, message) {
    const error = new Error(message)
    error.code = originalError.code || 'DATABASE_ERROR'
    error.statusCode = originalError.statusCode || 500
    error.originalError = originalError
    return error
  }

  /**
   * Check database connection status
   * @returns {Promise<boolean>} Whether the database is connected
   */
  async checkConnection() {
    try {
      return await postgresService.checkConnection()
    } catch (error) {
      console.error('Database connection check failed:', error)
      return false
    }
  }

  /**
   * Get database health status
   * @returns {Promise<object>} Database health information
   */
  async getHealthStatus() {
    try {
      const isConnected = await this.checkConnection()
      const stats = await postgresService.getConnectionStats()
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        isConnected,
        connectionStats: stats,
        environment: this.environment,
        isInitialized: this.isInitialized,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting database health status:', error)
      return {
        status: 'unhealthy',
        isConnected: false,
        error: error.message,
        environment: this.environment,
        isInitialized: this.isInitialized,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService()
