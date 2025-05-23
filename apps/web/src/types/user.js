/**
 * User types
 * This file contains type definitions for user-related functionality
 * 
 * Note: In JavaScript, we're using JSDoc for type annotations
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {Object} avatar - User avatar
 * @property {string} avatar.bucket - Avatar S3 bucket
 * @property {string} avatar.region - Avatar S3 region
 * @property {string} avatar.key - Avatar S3 key
 * @property {string} bio - User bio
 * @property {string} location - User location
 * @property {string[]} interests - User interests
 * @property {string} createdAt - User creation date
 * @property {string} updatedAt - User update date
 * @property {number} points - User points
 * @property {Achievement[]} achievements - User achievements
 * @property {Object} stats - User stats
 * @property {number} stats.reviews - Number of reviews
 * @property {number} stats.followers - Number of followers
 * @property {number} stats.following - Number of following
 * @property {number} stats.cities - Number of cities visited
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id - Achievement ID
 * @property {string} name - Achievement name
 * @property {string} [description] - Achievement description
 * @property {number} points - Achievement points
 * @property {string} dateEarned - Date achievement was earned
 * @property {string} category - Achievement category
 * @property {string} createdAt - Achievement creation date
 * @property {string} updatedAt - Achievement update date
 */

/**
 * @typedef {Object} Post
 * @property {string} id - Post ID
 * @property {string} content - Post content
 * @property {Object[]} [photos] - Post photos
 * @property {string[]} hashtags - Post hashtags
 * @property {string} [location] - Post location
 * @property {string} userId - User ID
 * @property {string} createdAt - Post creation date
 * @property {string} updatedAt - Post update date
 * @property {number} likeCount - Number of likes
 * @property {string} postedBy - Who posted (USER, RESTAURANT, etc.)
 */

/**
 * @typedef {Object} Review
 * @property {string} id - Review ID
 * @property {string} content - Review content
 * @property {number} rating - Review rating
 * @property {string[]} photos - Review photos
 * @property {string} establishmentId - Establishment ID
 * @property {string} dishName - Dish name
 * @property {string} createdAt - Review creation date
 * @property {string} updatedAt - Review update date
 */

/**
 * @enum {string}
 */
export const Interest = {
  HALAL: 'halal',
  ORGANIC: 'organic',
  SUSTAINABLE: 'sustainable',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
};
