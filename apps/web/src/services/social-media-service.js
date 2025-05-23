/**
 * Social Media Service
 *
 * This module handles operations related to social media posts and interactions.
 * It provides functionality for creating posts, managing likes, comments,
 * and generating promotional content.
 */

import { getEnvironmentName } from '../utils/environment.js'

/**
 * S3 Object interface
 */
export const S3Object = {
  bucket: '',
  region: '',
  key: ''
}

/**
 * Posted By enum
 */
export const PostedBy = {
  USER: 'USER',
  ESTABLISHMENT: 'ESTABLISHMENT',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM'
}

/**
 * Post Type enum
 */
export const PostType = {
  NEARBY: 'NEARBY',
  RECOMMENDATION: 'RECOMMENDATION',
  FOLLOWING: 'FOLLOWING',
  TRENDING: 'TRENDING',
  PROMOTIONAL: 'PROMOTIONAL'
}

/**
 * Post interface
 */
export const Post = {
  id: '',
  content: '',
  photos: [],
  video: null,
  hashtags: [],
  location: '',
  userId: '',
  taggedUserIds: [],
  taggedEstablishmentIds: [],
  createdAt: '',
  updatedAt: '',
  likeCount: 0,
  commentCount: 0,
  postedBy: PostedBy.USER,
  postType: PostType.FOLLOWING,
  isLiked: false
}

/**
 * Social Media Post Options interface
 */
export const SocialMediaPostOptions = {
  content: '',
  photos: [],
  video: null,
  location: '',
  taggedEstablishmentIds: [],
  taggedUserIds: [],
  hashtags: [],
  postType: PostType.FOLLOWING
}

/**
 * Social Media Service class
 */
export class SocialMediaService {
  constructor() {
    this.environment = getEnvironmentName()
    this.baseApiUrl = '/api/social'
  }

  /**
   * Generate a unique post ID
   * @returns {string} Unique post ID
   */
  generatePostId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    return `post_${timestamp}_${random}`
  }

  /**
   * Create a post
   * @param {string} postedBy Who posted the content
   * @param {object} options Post options
   * @returns {object} The created post
   */
  createPost(postedBy, options) {
    try {
      if (!postedBy || !Object.values(PostedBy).includes(postedBy)) {
        throw new Error('Valid postedBy value is required')
      }

      if (!options || typeof options !== 'object') {
        throw new Error('Post options are required')
      }

      if (!options.content || typeof options.content !== 'string') {
        throw new Error('Post content is required and must be a string')
      }

      const now = new Date().toISOString()

      return {
        id: this.generatePostId(),
        content: options.content,
        photos: Array.isArray(options.photos) ? options.photos : [],
        video: options.video || null,
        hashtags: Array.isArray(options.hashtags) ? options.hashtags : [],
        location: options.location || '',
        userId: options.userId || '',
        taggedEstablishmentIds: Array.isArray(options.taggedEstablishmentIds) ? options.taggedEstablishmentIds : [],
        taggedUserIds: Array.isArray(options.taggedUserIds) ? options.taggedUserIds : [],
        createdAt: now,
        updatedAt: now,
        likeCount: 0,
        commentCount: 0,
        postedBy,
        postType: options.postType || PostType.FOLLOWING,
        isLiked: false
      }
    } catch (error) {
      console.error('Error creating post:', error)
      throw new Error(`Failed to create post: ${error.message}`)
    }
  }

  /**
   * Generate default hashtags based on type and name
   * @param {string} type The type of entity
   * @param {string} name The name of the entity
   * @returns {Array} The generated hashtags
   */
  generateDefaultHashtags(type, name) {
    try {
      const baseHashtags = ['Malaysia', 'KualaLumpur', 'MalaysianFood']
      const nameHashtag = name.replace(/\s+/g, '')
      
      const typeHashtags = {
        event: ['Event', 'FoodEvent', 'MalaysianEvent'],
        establishment: ['Restaurant', 'FoodPlace', 'Dining'],
        market: ['Market', 'FoodMarket', 'LocalMarket']
      }

      const specificHashtags = typeHashtags[type] || []
      
      return [
        ...baseHashtags,
        ...specificHashtags,
        nameHashtag
      ].filter(tag => tag && tag.length > 0)
    } catch (error) {
      console.error('Error generating hashtags:', error)
      return ['Malaysia', 'Food']
    }
  }

  /**
   * Generate promotional content
   * @param {string} type The type of entity
   * @param {object} details The entity details
   * @returns {string} The generated promotional content
   */
  generatePromotionalContent(type, details) {
    try {
      if (!details || typeof details !== 'object') {
        throw new Error('Details object is required')
      }

      const { name, description, location, operatingHours, specialOffer } = details
      
      if (!name || typeof name !== 'string') {
        throw new Error('Name is required and must be a string')
      }

      let content = `📢 ${name}\n\n`

      if (description && typeof description === 'string') {
        content += `${description}\n\n`
      }

      if (location && typeof location === 'string') {
        content += `📍 Location: ${location}\n`
      }

      if (operatingHours && typeof operatingHours === 'string') {
        content += `⏰ Hours: ${operatingHours}\n`
      }

      if (specialOffer && typeof specialOffer === 'string') {
        content += `\n🎉 Special Offer: ${specialOffer}\n`
      }

      content += '\nCome visit us! 🌟'
      return content
    } catch (error) {
      console.error('Error generating promotional content:', error)
      return `📢 ${details?.name || 'Special Offer'}\n\nCome visit us! 🌟`
    }
  }

  /**
   * Create a promotional post
   * @param {string} type The type of entity
   * @param {object} details The entity details
   * @param {Array} photos Optional photos
   * @returns {object} The created promotional post
   */
  createPromotionalPost(type, details, photos = []) {
    try {
      if (!details || !details.userId) {
        throw new Error('Details with userId are required')
      }

      const content = this.generatePromotionalContent(type, details)
      const hashtags = this.generateDefaultHashtags(type, details.name)

      return this.createPost(PostedBy.ESTABLISHMENT, {
        content,
        photos: Array.isArray(photos) ? photos : [],
        hashtags,
        location: details.location,
        postType: PostType.PROMOTIONAL,
        userId: details.userId
      })
    } catch (error) {
      console.error('Error creating promotional post:', error)
      throw new Error(`Failed to create promotional post: ${error.message}`)
    }
  }

  /**
   * Like a post
   * @param {string} postId The post ID
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async likePost(postId) {
    try {
      if (!postId || typeof postId !== 'string') {
        throw new Error('Post ID is required and must be a string')
      }

      const response = await fetch(`${this.baseApiUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error liking post:', error)
      return false
    }
  }

  /**
   * Unlike a post
   * @param {string} postId The post ID
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async unlikePost(postId) {
    try {
      if (!postId || typeof postId !== 'string') {
        throw new Error('Post ID is required and must be a string')
      }

      const response = await fetch(`${this.baseApiUrl}/posts/${postId}/unlike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error unliking post:', error)
      return false
    }
  }

  /**
   * Comment on a post
   * @param {string} postId The post ID
   * @param {string} content The comment content
   * @returns {Promise<object|null>} The created comment or null if failed
   */
  async commentOnPost(postId, content) {
    try {
      if (!postId || typeof postId !== 'string') {
        throw new Error('Post ID is required and must be a string')
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Comment content is required and must be a string')
      }

      const response = await fetch(`${this.baseApiUrl}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error commenting on post:', error)
      return null
    }
  }

  /**
   * Get comments for a post
   * @param {string} postId The post ID
   * @param {number} limit The maximum number of comments to return
   * @param {number} offset The offset for pagination
   * @returns {Promise<object>} The comments data
   */
  async getPostComments(postId, limit = 10, offset = 0) {
    try {
      if (!postId || typeof postId !== 'string') {
        throw new Error('Post ID is required and must be a string')
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })

      const response = await fetch(`${this.baseApiUrl}/posts/${postId}/comments?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching post comments:', error)
      return { comments: [], total: 0 }
    }
  }

  /**
   * Get feed posts
   * @param {number} limit The maximum number of posts to return
   * @param {number} offset The offset for pagination
   * @param {string} type The type of feed
   * @returns {Promise<object>} The feed posts
   */
  async getFeedPosts(limit = 10, offset = 0, type = PostType.FOLLOWING) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        type: type
      })

      const response = await fetch(`${this.baseApiUrl}/feed?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching feed posts:', error)
      return { posts: [], total: 0 }
    }
  }

  /**
   * Create a new post via API
   * @param {object} postData The post data
   * @returns {Promise<object|null>} The created post or null if failed
   */
  async createPostViaAPI(postData) {
    try {
      if (!postData || typeof postData !== 'object') {
        throw new Error('Post data is required and must be an object')
      }

      const response = await fetch(`${this.baseApiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating post via API:', error)
      return null
    }
  }

  /**
   * Delete a post
   * @param {string} postId The post ID
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async deletePost(postId) {
    try {
      if (!postId || typeof postId !== 'string') {
        throw new Error('Post ID is required and must be a string')
      }

      const response = await fetch(`${this.baseApiUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      return false
    }
  }

  /**
   * Get service health status
   * @returns {Promise<object>} Service health information
   */
  async getHealthStatus() {
    try {
      // Test the feed endpoint
      const testResult = await this.getFeedPosts(1, 0)
      const isHealthy = Array.isArray(testResult.posts)

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        canFetchFeed: isHealthy,
        environment: this.environment,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting social media service health status:', error)
      return {
        status: 'unhealthy',
        canFetchFeed: false,
        error: error.message,
        environment: this.environment,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Extract hashtags from text
   * @param {string} text The text to extract hashtags from
   * @returns {Array} Array of hashtags
   */
  extractHashtags(text) {
    try {
      if (!text || typeof text !== 'string') {
        return []
      }

      const hashtagRegex = /#[\w\u0590-\u05ff]+/g
      const matches = text.match(hashtagRegex)
      
      return matches ? matches.map(tag => tag.substring(1)) : []
    } catch (error) {
      console.error('Error extracting hashtags:', error)
      return []
    }
  }

  /**
   * Extract mentions from text
   * @param {string} text The text to extract mentions from
   * @returns {Array} Array of mentions
   */
  extractMentions(text) {
    try {
      if (!text || typeof text !== 'string') {
        return []
      }

      const mentionRegex = /@[\w\u0590-\u05ff]+/g
      const matches = text.match(mentionRegex)
      
      return matches ? matches.map(mention => mention.substring(1)) : []
    } catch (error) {
      console.error('Error extracting mentions:', error)
      return []
    }
  }
}

// Export a singleton instance
export const socialMediaService = new SocialMediaService()
