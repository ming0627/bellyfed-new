/**
 * Ranking types
 * This file contains type definitions for ranking-related functionality
 * 
 * Note: In JavaScript, we're using JSDoc for type annotations
 */

/**
 * @enum {string}
 */
export const RankingCategory = {
  TOP: 'Top',
  TRENDING: 'Trending',
  RECOMMENDED: 'Recommended',
  POPULAR: 'Popular',
  GENERAL: 'General',
  VISITED: 'Visited',
  SECOND_CHANCE: 'Second Chance',
  DISSATISFIED: 'Dissatisfied',
  PLAN_TO_VISIT: 'Plan to Visit',
};

/**
 * @enum {string}
 */
export const RankingTrend = {
  UP: 'Up',
  DOWN: 'Down',
  STABLE: 'Stable',
};

/**
 * @typedef {Object} RankingItem
 * @property {string} id - Item ID
 * @property {string} name - Item name
 * @property {string} category - Item category (from RankingCategory)
 * @property {string} menuItem - Menu item
 * @property {number} [rankPosition] - Rank position (1-5)
 */

/**
 * @typedef {Object} RankingPoints
 * @property {number} [rankingPoints] - Ranking points
 * @property {number} [normalizedPoints] - Normalized points
 * @property {number} [interactionPoints] - Interaction points
 * @property {number} [totalScore] - Total score
 */

/**
 * @typedef {RankingItem & RankingPoints} RankingItemWithScore
 */
