/**
 * Ranking Service
 * This service provides methods for calculating and managing rankings
 */

import { RankingCategory } from '../types/ranking.js';

/**
 * Ranking Service class
 */
class RankingService {
  constructor() {
    this.exponent = 1.5;
    this.interactionWeights = {
      DISSATISFIED: -1.0,
      SECOND_CHANCE: -0.5,
      PLAN_TO_VISIT: 0.3,
      VISITED: 0.0,
      TOP: 0, // Will be calculated based on position
    };
  }

  /**
   * Calculate ranking points for items in the TOP category
   * @param {Array} items - The items to calculate ranking points for
   * @returns {Array} The items with ranking points
   * @private
   */
  calculateRankingPoints(items) {
    const topItems = items.filter((r) => r.category === RankingCategory.TOP);
    const maxPositionsFilled = topItems.length;

    // Calculate raw ranking points
    const rankingPoints = topItems.map((item, index) => {
      const position = index + 1;
      const points = Math.pow(maxPositionsFilled + 1 - position, this.exponent);
      return { ...item, rankingPoints: points };
    });

    // Calculate total points for normalization
    const userTotalPoints = rankingPoints.reduce(
      (sum, r) => sum + (r.rankingPoints || 0),
      0
    );

    // Normalize ranking points
    return rankingPoints.map((r) => {
      const normalizedPoints = (r.rankingPoints || 0) / userTotalPoints;
      return { ...r, normalizedPoints };
    });
  }

  /**
   * Calculate interaction points based on category weights
   * @param {Array} items - The items to calculate interaction points for
   * @returns {Array} The items with interaction points
   * @private
   */
  calculateInteractionPoints(items) {
    return items.map((r) => {
      const interactionPoint = this.interactionWeights[r.category] || 0;
      return { ...r, interactionPoints: interactionPoint };
    });
  }

  /**
   * Calculate total scores for all items
   * @param {Array} items - The items to calculate scores for
   * @returns {Array} The items with scores
   */
  calculateScores(items) {
    const rankedItems = this.calculateRankingPoints(items);
    const interactedItems = this.calculateInteractionPoints(items);

    // Merge ranking and interaction points
    return items.map((item) => {
      const rankedItem = rankedItems.find((r) => r.id === item.id);
      const interactionItem = interactedItems.find((i) => i.id === item.id);

      const totalScore =
        (rankedItem?.normalizedPoints || 0) +
        (interactionItem?.interactionPoints || 0);

      return {
        ...item,
        normalizedPoints: rankedItem?.normalizedPoints || 0,
        interactionPoints: interactionItem?.interactionPoints || 0,
        totalScore,
      };
    });
  }

  /**
   * Get top N items for a specific menu item
   * @param {Array} items - The items to get top items from
   * @param {string} menuItem - The menu item
   * @param {number} limit - The maximum number of items to return
   * @returns {Array} The top items
   */
  getTopItems(items, menuItem, limit = 5) {
    const menuItems = items.filter((item) => item.menuItem === menuItem);
    const itemsWithScores = this.calculateScores(menuItems);

    return itemsWithScores
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }

  /**
   * Get items by category for a specific menu item
   * @param {Array} items - The items to get items by category from
   * @param {string} menuItem - The menu item
   * @param {string} category - The category
   * @returns {Array} The items in the category
   */
  getItemsByCategory(items, menuItem, category) {
    const menuItems = items.filter(
      (item) => item.menuItem === menuItem && item.category === category
    );

    return this.calculateScores(menuItems);
  }

  /**
   * Get top restaurants
   * @param {number} limit - The maximum number of restaurants to return
   * @returns {Promise<Array>} A promise that resolves to the top restaurants
   */
  async getTopRestaurants(limit = 5) {
    // In a real implementation, this would fetch from an API
    // For now, we'll return mock data
    return Array(limit)
      .fill(null)
      .map((_, index) => ({
        id: `restaurant-${index + 1}`,
        name: `Top Restaurant ${index + 1}`,
        category: RankingCategory.TOP,
        menuItem: 'restaurant',
        rankPosition: (index % 5) + 1,
        cuisine: index % 2 === 0 ? 'Japanese' : 'Italian',
        location: index % 2 === 0 ? 'Tokyo, Japan' : 'Rome, Italy',
        rating: 4.5 - index * 0.1,
        totalScore: 1 - index * 0.1,
      }));
  }

  /**
   * Get top dishes
   * @param {number} limit - The maximum number of dishes to return
   * @returns {Promise<Array>} A promise that resolves to the top dishes
   */
  async getTopDishes(limit = 5) {
    // In a real implementation, this would fetch from an API
    // For now, we'll return mock data
    return Array(limit)
      .fill(null)
      .map((_, index) => ({
        id: `dish-${index + 1}`,
        name: `Top Dish ${index + 1}`,
        category: RankingCategory.TOP,
        menuItem: 'dish',
        rankPosition: (index % 5) + 1,
        restaurant: `Restaurant ${index + 1}`,
        cuisine: index % 2 === 0 ? 'Japanese' : 'Italian',
        rating: 4.5 - index * 0.1,
        totalScore: 1 - index * 0.1,
      }));
  }

  /**
   * Get top reviewers
   * @param {number} limit - The maximum number of reviewers to return
   * @returns {Promise<Array>} A promise that resolves to the top reviewers
   */
  async getTopReviewers(limit = 5) {
    // In a real implementation, this would fetch from an API
    // For now, we'll return mock data
    return Array(limit)
      .fill(null)
      .map((_, index) => ({
        id: `user-${index + 1}`,
        name: `Top Reviewer ${index + 1}`,
        category: RankingCategory.TOP,
        menuItem: 'reviewer',
        rankPosition: (index % 5) + 1,
        reviewCount: 50 - index * 5,
        location: index % 2 === 0 ? 'Tokyo, Japan' : 'Rome, Italy',
        totalScore: 1 - index * 0.1,
      }));
  }
}

// Export a singleton instance
export const rankingService = new RankingService();
