import {
  Plus,
  Trash2,
  Trophy,
  Medal,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Review, VisitStatus } from '@/types';

import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

interface ReviewSectionProps {
  restaurantId: string;
  cuisineTypes: string[];
  reviews: Review[];
  isAddingReview: boolean;
  onAddReview: () => void;
  onCancelReview: () => void;
  onSubmitReview: (review: Partial<Review>) => void;
  onClearReviews: () => void;
  onRankChange: (params: { reviewId: string; rank: number }) => void;
  onVisitStatusChange: (params: {
    reviewId: string;
    status: VisitStatus;
  }) => void;
}

export const ReviewSection = ({
  restaurantId,
  cuisineTypes,
  reviews,
  isAddingReview,
  onAddReview,
  onCancelReview,
  onSubmitReview,
  onClearReviews,
  onRankChange,
  onVisitStatusChange,
}: ReviewSectionProps): React.ReactElement | null => {
  const rankedReviews =
    reviews?.filter((r) => typeof r.rank === 'number' && r.rank > 0) || [];
  const unrankedReviews = reviews?.filter((r) => !r.rank) || [];

  const getVisitStatusIcon = (
    status: VisitStatus | undefined,
  ): JSX.Element | null => {
    if (!status) return null;
    switch (status) {
      case VisitStatus.STANDARD:
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case VisitStatus.NEEDS_IMPROVEMENT:
        return <Medal className="w-4 h-4 text-yellow-500" />;
      case VisitStatus.DISAPPOINTING:
        return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getRankIcon = (rank: number): JSX.Element | null => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      case 4:
        return <Medal className="w-6 h-6 text-blue-400" />;
      case 5:
        return <Medal className="w-6 h-6 text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Reviews</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all reviews for this restaurant.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onClearReviews}
                className="bg-red-500 hover:bg-red-600"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={onAddReview}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {isAddingReview && (
        <ReviewForm
          restaurantId={restaurantId}
          cuisineTypes={cuisineTypes}
          onSubmit={async (review: Partial<Review>) => {
            try {
              await onSubmitReview({
                ...review,
                establishmentId: restaurantId,
              });

              // Review submitted successfully
            } catch (error) {
              console.error('Error submitting review:', error);
            }
          }}
          onCancel={onCancelReview}
        />
      )}

      <Tabs defaultValue="ranked" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="ranked" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Ranked ({rankedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="unranked" className="flex items-center gap-2">
            <Medal className="w-4 h-4" />
            Others ({unrankedReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ranked">
          <div className="space-y-4">
            {!rankedReviews.length ? (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow">
                No ranked reviews yet. Rank your favorite dishes!
              </div>
            ) : (
              rankedReviews.map((review: Review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onRankChange={(reviewId, rank) =>
                    onRankChange({ reviewId, rank })
                  }
                  onVisitStatusChange={(reviewId, status) =>
                    onVisitStatusChange({ reviewId, status })
                  }
                  getRankIcon={getRankIcon}
                  getVisitStatusIcon={getVisitStatusIcon}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="unranked">
          <div className="space-y-4">
            {!unrankedReviews.length ? (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow">
                No other reviews yet. Be the first to share your experience!
              </div>
            ) : (
              unrankedReviews.map((review: Review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onRankChange={(reviewId, rank) =>
                    onRankChange({ reviewId, rank })
                  }
                  onVisitStatusChange={(reviewId, status) =>
                    onVisitStatusChange({ reviewId, status })
                  }
                  getRankIcon={getRankIcon}
                  getVisitStatusIcon={getVisitStatusIcon}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
