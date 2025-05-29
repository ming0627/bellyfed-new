import { RankingCategory } from '../types';

export interface RankingItem {
  id: string;
  name: string;
  category: RankingCategory;
  menuItem: string;
  rankPosition?: 1 | 2 | 3 | 4 | 5;
}

interface RankingPoints {
  rankingPoints?: number;
  normalizedPoints?: number;
  interactionPoints?: number;
  totalScore?: number;
}

export type RankingItemWithScore = RankingItem & RankingPoints;

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
}

// Export a singleton instance
export const rankingService = new RankingService();
