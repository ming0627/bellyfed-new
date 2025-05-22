/**
 * Review types
 * This file contains type definitions for review-related functionality
 * 
 * Note: In JavaScript, we're using JSDoc for type annotations
 */

/**
 * @typedef {Object} Review
 * @property {string} id - Review ID
 * @property {string} establishmentId - Establishment ID
 * @property {string} userId - User ID
 * @property {number} rating - Review rating
 * @property {number} [rank] - Review rank
 * @property {string} dishName - Dish name
 * @property {string} comment - Review comment
 * @property {string} [notes] - Review notes
 * @property {VisitStatus} [visitStatus] - Visit status
 * @property {string} visitDate - Visit date
 * @property {string[]} [photos] - Review photos
 * @property {string} createdAt - Review creation date
 * @property {string} updatedAt - Review update date
 */

/**
 * @typedef {Object} RankHistory
 * @property {number} rank - Rank
 * @property {string} date - Date
 * @property {string} [note] - Note
 * @property {number} [previousRank] - Previous rank
 */

/**
 * @enum {string}
 */
export const VisitStatus = {
  NEEDS_IMPROVEMENT: 'NEEDS_IMPROVEMENT',
  DISAPPOINTING: 'DISAPPOINTING',
  STANDARD: 'STANDARD',
  VISITED: 'VISITED',
  PLAN_TO_VISIT: 'PLAN_TO_VISIT',
  SECOND_CHANCE: 'SECOND_CHANCE',
  DISSATISFIED: 'DISSATISFIED',
};
