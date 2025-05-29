import { useCognitoUser, useUserProfile } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Custom toast
interface UserRanking {
  rankingId?: string;
  'user-123'?: string;
  dishId: string;
  restaurantId: string;
  restaurantName?: string;
  restaurantAddress?: string;
  dishType?: string;
  rank?: number | null;
  tasteStatus?: string | null;
  notes?: string;
  photoUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface DishDetails {
  dishId: string;
  name: string;
  description: string;
  restaurantId: string;
  restaurantName: string;
  category: string;
  imageUrl: string;
  isVegetarian: boolean;
  spicyLevel: number;
  price: number;
  countryCode: string;
}

interface RankingStats {
  totalRankings: number;
  averageRank: number;
  ranks: Record<string, number>;
  tasteStatuses: Record<string, number>;
}

interface UseUserRankingResult {
  userRanking: UserRanking | null;
  dishDetails: DishDetails | null;
  rankingStats: RankingStats | null;
  isLoading: boolean;
  error: Error | null;
  createOrUpdateRanking: (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    restaurantId?: string;
    restaurantName?: string;
  }) => Promise<void>;
  deleteRanking: () => Promise<void>;
}

// Define query keys
const USER_RANKING_KEY = 'userRanking';

export function useUserRanking(
  dishSlug: string,
  dishId?: string,
): UseUserRankingResult {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: cognitoUser } = useCognitoUser();
  const { profile } = useUserProfile();

  // Use React Query for fetching user ranking data
  const {
    data: userRankingData,
    isLoading: isLoadingUserRanking,
    error: userRankingError,
  } = useQuery({
    queryKey: [USER_RANKING_KEY, dishSlug, dishId],
    queryFn: async () => {
      if (!dishSlug) throw new Error('Dish slug is required');

      const response = await fetch(
        `/api/rankings/my/${dishSlug}${dishId ? `?dishId=${dishId}` : ''}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user ranking');
      }

      return await response.json();
    },
    enabled: !!dishSlug && (!!cognitoUser || !!profile),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: () => {
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          userRanking: {
            rankingId: 'ranking1',
            userId: 'user1',
            dishId: dishId || 'dish1',
            restaurantId: 'restaurant1',
            restaurantName: 'Village Park Restaurant',
            restaurantAddress:
              '5, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya, Selangor',
            dishType: 'Malaysian',
            rank: 1,
            tasteStatus: null,
            notes:
              'This is the best Nasi Lemak I have ever had! The sambal is perfectly balanced with just the right amount of spice.',
            photoUrls: ['/images/placeholder-dish.jpg'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          dishDetails: {
            dishId: dishId || 'dish1',
            name: 'Nasi Lemak Special',
            description:
              'Fragrant coconut rice served with spicy sambal, crispy anchovies, roasted peanuts, cucumber slices, and a perfectly cooked egg',
            restaurantId: 'restaurant1',
            restaurantName: 'Village Park Restaurant',
            category: 'Malaysian',
            imageUrl:
              'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000',
            isVegetarian: false,
            spicyLevel: 2,
            price: 15.9,
            countryCode: 'my',
          },
          rankingStats: {
            totalRankings: 1250,
            averageRank: 4.8,
            ranks: { '1': 850, '2': 250, '3': 100, '4': 30, '5': 20 },
            tasteStatuses: {
              ACCEPTABLE: 950,
              SECOND_CHANCE: 250,
              DISSATISFIED: 50,
            },
          },
        };
      }
      return undefined;
    },
  });

  // Extract data from the query result
  const userRanking = userRankingData?.userRanking || null;
  const dishDetails = userRankingData?.dishDetails || null;
  const rankingStats = userRankingData?.rankingStats || null;

  // Create or update ranking mutation
  const { mutate: mutateRanking } = useMutation({
    mutationFn: async (data: {
      rank: number | null;
      tasteStatus: string | null;
      notes: string;
      photoUrls: string[];
      restaurantId?: string;
      restaurantName?: string;
    }) => {
      if (!dishDetails) {
        throw new Error('Dish details not available');
      }

      const method = userRanking?.rankingId ? 'PUT' : 'POST';
      const response = await fetch(`/api/rankings/my/${dishSlug}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishId: dishDetails.dishId,
          restaurantId: data.restaurantId || dishDetails.restaurantId,
          restaurantName: data.restaurantName || dishDetails.restaurantName,
          dishType: dishDetails.category,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${userRanking?.rankingId ? 'update' : 'create'} ranking`,
        );
      }

      return await response.json();
    },
    onSuccess: (data: React.ChangeEvent<HTMLInputElement>) => {
      // Update the cache with the new data
      queryClient.setQueryData([USER_RANKING_KEY, dishSlug, dishId], data);

      // Show success message
      toast({
        title: userRanking?.rankingId ? 'Ranking Updated' : 'Ranking Created',
        description: `Your ranking for ${dishDetails?.name} has been ${userRanking?.rankingId ? 'updated' : 'created'}.`,
      });
    },
    onError: (error: React.ChangeEvent<HTMLInputElement>) => {
      console.error(
        `Error ${userRanking?.rankingId ? 'updating' : 'creating'} ranking:`,
        error,
      );

      // Show error message
      toast({
        title: 'Error',
        description: `Failed to ${userRanking?.rankingId ? 'update' : 'create'} ranking. Please try again.`,
        variant: 'destructive',
      });
    },
  });

  // Delete ranking mutation
  const { mutate: mutateDeleteRanking } = useMutation({
    mutationFn: async () => {
      if (!userRanking?.rankingId) {
        throw new Error('No ranking to delete');
      }

      const response = await fetch(`/api/rankings/my/${dishSlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rankingId: userRanking.rankingId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete ranking');
      }

      return await response.json();
    },
    onSuccess: () => {
      // Update the cache to remove the ranking
      queryClient.setQueryData(
        [USER_RANKING_KEY, dishSlug, dishId],
        (oldData: Record<string, unknown>) => ({
          ...oldData,
          userRanking: null,
        }),
      );

      // Show success message
      toast({
        title: 'Ranking Deleted',
        description: `Your ranking for ${dishDetails?.name} has been deleted.`,
      });
    },
    onError: (error: React.ChangeEvent<HTMLInputElement>) => {
      console.error('Error deleting ranking:', error);

      // Show error message
      toast({
        title: 'Error',
        description: 'Failed to delete ranking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Wrapper functions to maintain the same API
  const createOrUpdateRanking = async (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    restaurantId?: string;
    restaurantName?: string;
  }) => {
    mutateRanking(data);
  };

  const deleteRanking = async () => {
    mutateDeleteRanking();
  };

  return {
    userRanking,
    dishDetails,
    rankingStats,
    isLoading: isLoadingUserRanking,
    error: userRankingError as Error | null,
    createOrUpdateRanking,
    deleteRanking,
  };
}
