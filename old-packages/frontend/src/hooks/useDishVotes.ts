import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';
import { useAuth } from '@/contexts/AuthContext';

export interface DishVote {
  dishId: string;
  restaurantId: string;
  rating: number;
  timestamp: string;
}

export interface DishVoteStats {
  dishId: string;
  totalVotes: number;
  averageRating: number;
  ratings: Record<string, number>;
}

export function useDishVotes(dishId: string) {
  const [voteStats, setVoteStats] = useState<DishVoteStats | null>(null);
  const [userVote, setUserVote] = useState<DishVote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const loadVoteData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load vote statistics
        const stats = await databaseService.getDishVotes(dishId);

        // Convert VoteStats to DishVoteStats
        const dishVoteStats: DishVoteStats = {
          dishId,
          totalVotes: stats.total_votes,
          averageRating: stats.average_rating,
          ratings: stats.ratings,
        };

        setVoteStats(dishVoteStats);

        // If user is authenticated, check if they've already voted
        if (isAuthenticated && user) {
          try {
            const userVotes = await databaseService.getUserVotes();
            // The rankings property contains the user's votes
            const existingVote = userVotes.rankings.find(
              (vote: Record<string, unknown>) => vote.dish_id === dishId,
            );

            if (existingVote) {
              // Convert from database format to DishVote format
              setUserVote({
                dishId: String(existingVote.dish_id || ''),
                restaurantId: String(existingVote.restaurant_id || ''),
                rating:
                  typeof existingVote.rank === 'number' ? existingVote.rank : 0,
                timestamp: String(
                  existingVote.timestamp || new Date().toISOString(),
                ),
              });
            }
          } catch (userVoteError) {
            console.error('Error loading user votes:', userVoteError);
            // Don't set error state as this is not critical
          }
        }
      } catch (err) {
        console.error('Error loading dish votes:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to load vote data'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadVoteData();
  }, [dishId, isAuthenticated, user]);

  const voteDish = async (
    rating: number,
    restaurantId: string,
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      setError(new Error('User must be authenticated to vote'));
      return false;
    }

    try {
      await databaseService.voteDish(dishId, restaurantId, rating);

      // Update local state
      const newVote: DishVote = {
        dishId,
        restaurantId,
        rating,
        timestamp: new Date().toISOString(),
      };
      setUserVote(newVote);

      // Update vote statistics
      if (voteStats) {
        const newStats = { ...voteStats };

        // If user already voted, adjust the counts
        if (userVote) {
          newStats.ratings[userVote.rating.toString()] = Math.max(
            (newStats.ratings[userVote.rating.toString()] || 0) - 1,
            0,
          );
        } else {
          newStats.totalVotes += 1;
        }

        // Add the new vote
        newStats.ratings[rating.toString()] =
          (newStats.ratings[rating.toString()] || 0) + 1;

        // Recalculate average
        let totalScore = 0;
        let totalVotes = 0;
        Object.entries(newStats.ratings).forEach(([rating, count]) => {
          totalScore += parseInt(rating) * count;
          totalVotes += count;
        });
        newStats.averageRating = totalVotes > 0 ? totalScore / totalVotes : 0;

        setVoteStats(newStats);
      }

      return true;
    } catch (err) {
      console.error('Error voting for dish:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to vote for dish'),
      );
      return false;
    }
  };

  return {
    voteStats,
    userVote,
    isLoading,
    error,
    voteDish,
  };
}
