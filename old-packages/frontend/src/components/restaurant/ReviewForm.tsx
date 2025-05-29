import { Medal, ThumbsDown, ThumbsUp, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { reviewService } from '@/services/reviewService';
import { Review, VisitStatus } from '@/types';

interface ReviewFormProps {
  restaurantId: string;
  cuisineTypes: string[];
  onSubmit: (review: Partial<Review>) => void;
  onCancel: () => void;
}

export const ReviewForm = ({
  restaurantId,
  cuisineTypes,
  onSubmit,
  onCancel,
}: ReviewFormProps): JSX.Element => {
  const [newReview, setNewReview] = useState<Partial<Review>>({
    comment: '',
    dishName: '',
    notes: '',
    visitStatus: undefined,
    photos: [] as string[],
    rank: 0,
    establishmentId: restaurantId,
  });

  // Get list of dishes that haven't been reviewed yet
  const availableDishes = useMemo(() => {
    const reviewedDishes = reviewService.getReviewedDishes(restaurantId);
    return cuisineTypes.filter((dish) => !reviewedDishes.includes(dish));
  }, [restaurantId, cuisineTypes]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newReview.dishName || !newReview.comment) return;

    onSubmit({
      dishName: newReview.dishName,
      comment: newReview.comment,
      visitStatus: newReview.visitStatus,
      rank: newReview.rank,
      notes: newReview.notes,
      photos: newReview.photos,
    });
  };

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
    <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800">
          Share Your Dining Experience
        </h3>
        <p className="text-sm text-gray-500">
          Help others discover great dishes by sharing your thoughts
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Dish Name
            </label>
            <Select
              value={newReview.dishName}
              onValueChange={(value: string) =>
                setNewReview((prev) => ({ ...prev, dishName: value }))
              }
            >
              <SelectTrigger className="bg-white border-gray-200 hover:border-blue-200 transition-colors">
                <SelectValue placeholder="Select a dish" />
              </SelectTrigger>
              <SelectContent>
                {availableDishes.map((dish) => (
                  <SelectItem key={dish} value={dish}>
                    {dish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rate this Dish
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-gray-600 font-medium">
                    Is this one of your top dishes?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <Button
                        key={rank}
                        type="button"
                        variant={
                          newReview.rank === rank ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() =>
                          setNewReview((prev) => ({
                            ...prev,
                            rank,
                            visitStatus: undefined,
                          }))
                        }
                        className={cn(
                          'flex-1 hover:shadow-sm transition-all duration-200',
                          newReview.rank === rank ? 'shadow-sm' : '',
                          rank === 1 &&
                            'hover:border-yellow-400 hover:text-yellow-600',
                          rank === 2 &&
                            'hover:border-gray-400 hover:text-gray-600',
                          rank === 3 &&
                            'hover:border-amber-600 hover:text-amber-700',
                          rank === 4 &&
                            'hover:border-blue-400 hover:text-blue-600',
                          rank === 5 &&
                            'hover:border-green-400 hover:text-green-600',
                        )}
                      >
                        {getRankIcon(rank)}
                        <span className="ml-1">#{rank}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="w-px bg-gray-200 self-stretch mx-2" />

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-gray-600 font-medium">
                    Or rate the taste
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'STANDARD',
                        'NEEDS_IMPROVEMENT',
                        'DISAPPOINTING',
                      ] as VisitStatus[]
                    ).map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={
                          newReview.visitStatus === status
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() =>
                          setNewReview((prev) => ({
                            ...prev,
                            visitStatus: status,
                            rank: 0,
                          }))
                        }
                        className={cn(
                          'min-w-[100px] h-9 px-2 py-1.5 flex items-center justify-center gap-1.5 hover:shadow-sm transition-all duration-200',
                          newReview.visitStatus === status && 'shadow-sm',
                          status === 'STANDARD' &&
                            'hover:border-green-500 hover:text-green-600',
                          status === 'NEEDS_IMPROVEMENT' &&
                            'hover:border-yellow-500 hover:text-yellow-600',
                          status === 'DISAPPOINTING' &&
                            'hover:border-red-500 hover:text-red-600',
                        )}
                      >
                        {getVisitStatusIcon(status)}
                        <span className="capitalize text-sm">
                          {status.toLowerCase().replace('_', ' ')}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Your Review
            </label>
            <div className="relative">
              <textarea
                className="min-h-[150px] bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors resize-none w-full p-4 text-base"
                value={newReview.comment || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                }
              />
              {!newReview.comment && (
                <div className="absolute inset-0 pointer-events-none p-4 text-gray-400">
                  <div className="space-y-2">
                    <p>Share your thoughts about this dish!</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>What did you like or dislike?</li>
                      <li>How was the taste and presentation?</li>
                      <li>Would you recommend it to others?</li>
                      <li>Any special preparation or pairing suggestions?</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !newReview.dishName ||
                !newReview.comment ||
                (!newReview.rank && !newReview.visitStatus)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              Post Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
