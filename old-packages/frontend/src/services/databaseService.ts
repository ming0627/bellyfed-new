import cognitoAuthService from './cognitoAuthService';
// ApiService is imported but used in the PostgreSQL service
import { postgresService, RankingStats, VoteStats } from './postgresService';

export interface DatabaseError extends Error {
  code?: string;
  statusCode?: number;
}

export class DatabaseService {
  // User data methods
  // Define user data interface
  async getUserData(userId: string): Promise<Record<string, unknown>> {
    // Use PostgreSQL service exclusively
    const userData = await postgresService.getUserById(userId);
    // Convert User type to Record<string, unknown> by first converting to unknown
    return userData as unknown as Record<string, unknown>;
  }

  async saveUserData(userData: Record<string, unknown>): Promise<void> {
    // Use PostgreSQL service exclusively
    await postgresService.createUser(userData);
  }

  async updateUserData(
    userId: string,
    userData: Record<string, unknown>,
  ): Promise<void> {
    // Use PostgreSQL service exclusively
    await postgresService.updateUser(userId, userData);
  }

  // Dish ranking methods
  // Define dish rankings interface
  async getDishRankings(dishId: string): Promise<RankingStats> {
    // Use PostgreSQL service exclusively
    return await postgresService.getDishRankings(dishId);
  }

  // For backward compatibility
  async getDishVotes(dishId: string): Promise<VoteStats> {
    return await postgresService.getDishVotes(dishId);
  }

  async createRanking(
    dishId: string,
    restaurantId: string,
    dishType: string,
    rank: number | null,
    tasteStatus: string | null,
    notes: string,
    photoUrls: string[],
  ): Promise<Record<string, unknown>> {
    const session = cognitoAuthService.getCurrentSession();
    if (!session.isSignedIn) {
      throw new Error('User must be authenticated to create a ranking');
    }

    const user = await cognitoAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User information is required');
    }

    // Validate input
    if (!notes || notes.trim() === '') {
      throw new Error('Notes are required for rankings');
    }

    if (!photoUrls || photoUrls.length === 0) {
      throw new Error('At least one photo is required for rankings');
    }

    if (
      (rank !== null && tasteStatus !== null) ||
      (rank === null && tasteStatus === null)
    ) {
      throw new Error(
        'A ranking must have either a rank or a taste status, but not both',
      );
    }

    if (rank !== null && (rank < 1 || rank > 5)) {
      throw new Error('Rank must be between 1 and 5');
    }

    if (
      tasteStatus !== null &&
      !['ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED'].includes(tasteStatus)
    ) {
      throw new Error(
        'Taste status must be one of: ACCEPTABLE, SECOND_CHANCE, DISSATISFIED',
      );
    }

    // Use PostgreSQL service exclusively
    const result = await postgresService.createRanking({
      userId: user.username,
      dishId,
      restaurantId,
      dishType,
      rank,
      tasteStatus,
      notes,
      photoUrls,
      timestamp: new Date().toISOString(),
    });

    // Convert DishRanking to Record<string, unknown>
    return result as unknown as Record<string, unknown>;
  }

  // For backward compatibility
  async voteDish(
    dishId: string,
    restaurantId: string,
    rating: number,
  ): Promise<Record<string, unknown>> {
    // Convert the rating to a rank
    const rank = Math.min(Math.max(Math.round(rating), 1), 5);

    return this.createRanking(
      dishId,
      restaurantId,
      'Unknown', // Default dish type
      rank,
      null, // No taste status for backward compatibility
      'Voted via app', // Default notes
      ['/images/placeholder-dish.jpg'], // Default photo
    );
  }

  async getTopDishes(
    limit: number = 10,
    category?: string,
  ): Promise<Array<Record<string, unknown>>> {
    // Use PostgreSQL service exclusively
    const result = await postgresService.getTopDishes(limit, category);
    // Convert the result to the expected type
    return result.dishes.map(
      (dish) => dish as unknown as Record<string, unknown>,
    );
  }

  async getUserVotes(userId?: string): Promise<{
    userId: string;
    user: Record<string, unknown> | null;
    totalRankings: number;
    rankCounts: Record<string, number>;
    tasteStatusCounts: Record<string, number>;
    rankings: Array<Record<string, unknown>>;
    topRankings: Array<Record<string, unknown>>;
  }> {
    const user =
      userId || (await cognitoAuthService.getCurrentUser())?.username;
    if (!user) {
      throw new Error('User ID is required');
    }

    // Use PostgreSQL service exclusively
    const result = await postgresService.getUserVotes(user);

    // Transform the result to match the expected return type
    return {
      userId: user,
      user: null, // Default value if not provided by the service
      totalRankings: result.votes.length,
      rankCounts: {}, // Default value if not provided by the service
      tasteStatusCounts: {}, // Default value if not provided by the service
      rankings: result.votes.map(
        (vote) => vote as unknown as Record<string, unknown>,
      ),
      topRankings: result.votes
        .slice(0, 5)
        .map((vote) => vote as unknown as Record<string, unknown>),
    };
  }
}

// Export a singleton instance
export const databaseService: DatabaseService = new DatabaseService();
