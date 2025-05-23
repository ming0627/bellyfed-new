/**
 * Ranking Service
 * Handles calculations and operations related to dish and restaurant rankings
 */

/**
 * Ranking Category enum
 * Defines the different categories for rankings
 */
export enum RankingCategory {
  TOP = 'Top',
  TRENDING = 'Trending',
  RECOMMENDED = 'Recommended',
  POPULAR = 'Popular',
  GENERAL = 'General',
  VISITED = 'Visited',
  SECOND_CHANCE = 'Second Chance',
  DISSATISFIED = 'Dissatisfied',
  PLAN_TO_VISIT = 'Plan to Visit',
}

/**
 * Ranking Item interface
 * Represents an item that can be ranked
 */
export interface RankingItem {
  id: string;
  name: string;
  category: RankingCategory;
  menuItem: string;
  rankPosition?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Ranking Points interface
 * Represents the points associated with a ranking
 */
interface RankingPoints {
  rankingPoints?: number;
  normalizedPoints?: number;
  interactionPoints?: number;
  totalScore?: number;
}

/**
 * Ranking Item with Score interface
 * Extends RankingItem with score information
 */
export type RankingItemWithScore = RankingItem & RankingPoints;

/**
 * Ranking Service class
 * Provides methods for calculating and managing rankings
 */
export class RankingService {
  private readonly exponent = 1.5;
  private readonly interactionWeights: { [key: string]: number } = {
    DISSATISFIED: -1.0,
    SECOND_CHANCE: -0.5,
    PLAN_TO_VISIT: 0.3,
    VISITED: 0.0,
    TOP: 0, // Will be calculated based on position
  };

  /**
   * Calculate ranking points for items in the TOP category
   * @param items The items to calculate ranking points for
   * @returns The items with ranking points
   */
  private calculateRankingPoints(items: RankingItem[]): RankingItemWithScore[] {
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
      0,
    );

    // Normalize ranking points
    return rankingPoints.map((r) => {
      const normalizedPoints = (r.rankingPoints || 0) / userTotalPoints;
      return { ...r, normalizedPoints };
    });
  }

  /**
   * Calculate interaction points based on category weights
   * @param items The items to calculate interaction points for
   * @returns The items with interaction points
   */
  private calculateInteractionPoints(
    items: RankingItem[],
  ): RankingItemWithScore[] {
    return items.map((r) => {
      const interactionPoint = this.interactionWeights[r.category] || 0;
      return { ...r, interactionPoints: interactionPoint };
    });
  }

  /**
   * Calculate total scores for all items
   * @param items The items to calculate scores for
   * @returns The items with total scores
   */
  public calculateScores(items: RankingItem[]): RankingItemWithScore[] {
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
   * @param items The items to get top items from
   * @param menuItem The menu item to filter by
   * @param limit The maximum number of items to return
   * @returns The top items
   */
  public getTopItems(
    items: RankingItem[],
    menuItem: string,
    limit: number = 5,
  ): RankingItemWithScore[] {
    const menuItems = items.filter((item) => item.menuItem === menuItem);
    const itemsWithScores = this.calculateScores(menuItems);

    return itemsWithScores
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }

  /**
   * Get items by category for a specific menu item
   * @param items The items to get items by category from
   * @param menuItem The menu item to filter by
   * @param category The category to filter by
   * @returns The items in the specified category
   */
  public getItemsByCategory(
    items: RankingItem[],
    menuItem: string,
    category: RankingCategory,
  ): RankingItemWithScore[] {
    const menuItems = items.filter(
      (item) => item.menuItem === menuItem && item.category === category,
    );

    return this.calculateScores(menuItems);
  }

  /**
   * Get trending items based on recent activity
   * @param items The items to get trending items from
   * @param menuItem The menu item to filter by
   * @param limit The maximum number of items to return
   * @returns The trending items
   */
  public getTrendingItems(
    items: RankingItem[],
    menuItem: string,
    limit: number = 5,
  ): RankingItemWithScore[] {
    // Filter items by menu item and trending category
    const trendingItems = items.filter(
      (item) => 
        item.menuItem === menuItem && 
        item.category === RankingCategory.TRENDING
    );
    
    const itemsWithScores = this.calculateScores(trendingItems);

    return itemsWithScores
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }

  /**
   * Get recommended items for a user
   * @param items The items to get recommended items from
   * @param menuItem The menu item to filter by
   * @param limit The maximum number of items to return
   * @returns The recommended items
   */
  public getRecommendedItems(
    items: RankingItem[],
    menuItem: string,
    limit: number = 5,
  ): RankingItemWithScore[] {
    // Filter items by menu item and recommended category
    const recommendedItems = items.filter(
      (item) => 
        item.menuItem === menuItem && 
        item.category === RankingCategory.RECOMMENDED
    );
    
    const itemsWithScores = this.calculateScores(recommendedItems);

    return itemsWithScores
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }

  /**
   * Get popular items based on overall popularity
   * @param items The items to get popular items from
   * @param menuItem The menu item to filter by
   * @param limit The maximum number of items to return
   * @returns The popular items
   */
  public getPopularItems(
    items: RankingItem[],
    menuItem: string,
    limit: number = 5,
  ): RankingItemWithScore[] {
    // Filter items by menu item and popular category
    const popularItems = items.filter(
      (item) => 
        item.menuItem === menuItem && 
        item.category === RankingCategory.POPULAR
    );
    
    const itemsWithScores = this.calculateScores(popularItems);

    return itemsWithScores
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, limit);
  }
}

// Export a singleton instance
export const rankingService = new RankingService();
