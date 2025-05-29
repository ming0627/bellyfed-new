import { reviewService } from '@/services/reviewService';
import { Review, VisitStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useReviews = (restaurantId: string) => {
  const queryClient = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ['reviews', restaurantId],
    queryFn: () => reviewService.getReviews(restaurantId),
    enabled: !!restaurantId,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (review: Partial<Review>) => {
      if (!review.establishmentId) {
        throw new Error('establishmentId is required');
      }
      const result = await reviewService.addReview(
        review.establishmentId,
        review,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] });
    },
  });

  const clearReviewsMutation = useMutation({
    mutationFn: () => reviewService.clearAllReviews(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] });
    },
  });

  const updateVisitStatusMutation = useMutation({
    mutationFn: ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: VisitStatus;
    }) => reviewService.updateVisitStatus(reviewId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] });
    },
  });

  const promoteToRankMutation = useMutation({
    mutationFn: ({ reviewId, rank }: { reviewId: string; rank: number }) =>
      reviewService.updateRanking(reviewId, rank),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] });
    },
  });

  return {
    reviews,
    addReview: (review: Partial<Review>) => {
      console.log('Adding review:', {
        ...review,
        establishmentId: restaurantId,
      });
      return addReviewMutation.mutateAsync({
        ...review,
        establishmentId: restaurantId,
      });
    },
    clearReviews: () => clearReviewsMutation.mutate(),
    updateVisitStatus: updateVisitStatusMutation.mutate,
    promoteToRank: promoteToRankMutation.mutate,
    isLoading: addReviewMutation.isPending,
    error: addReviewMutation.error,
  };
};
