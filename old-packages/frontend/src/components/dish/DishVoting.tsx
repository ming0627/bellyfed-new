'use client';

import { Award, Star, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
// Custom toast
interface DishVotingProps {
  dishId: string;
  dishName: string;
  restaurantId: string;
  restaurantName: string;
  initialVoteStats?: {
    totalVotes: number;
    averageRating: number;
    userRating?: number;
  };
  onVoteSuccess?: () => void;
}

export function DishVoting({
  dishId,
  dishName,
  restaurantId,
  restaurantName,
  initialVoteStats = { totalVotes: 0, averageRating: 0 },
  onVoteSuccess,
}: DishVotingProps): React.ReactElement {
  const { data: session } = useSession();
  const [voteStats, setVoteStats] = useState(initialVoteStats);
  const [userRating, setUserRating] = useState<number | undefined>(
    initialVoteStats.userRating,
  );
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // If initialVoteStats changes (e.g., from server), update local state
    setVoteStats(initialVoteStats);
    setUserRating(initialVoteStats.userRating);
  }, [initialVoteStats]);

  const handleRatingClick = (rating: number): void => {
    if (!session) {
      toast({
        message: 'Please log in to vote for dishes',
        type: 'error',
      });
      router.push('/login');
      return;
    }

    setPendingRating(rating);
    setShowConfirmDialog(true);
  };

  const confirmVote = async () => {
    if (!pendingRating || !session) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/dishes/${dishId}/rankings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          rating: pendingRating,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const data = await response.json();

      // Update local state with new vote stats
      setVoteStats({
        totalVotes: data.totalVotes,
        averageRating: data.averageRating,
      });
      setUserRating(pendingRating);

      toast({
        message: `You rated ${dishName} with ${pendingRating} star${pendingRating !== 1 ? 's' : ''}`,
        type: 'success',
      });

      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        message: 'Failed to submit your vote. Please try again.',
        type: 'error',
      });
    } finally {
      setIsVoting(false);
      setShowConfirmDialog(false);
      setPendingRating(null);
    }
  };

  const cancelVote = (): void => {
    setShowConfirmDialog(false);
    setPendingRating(null);
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" />
            Rate this dish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
                  onMouseEnter={() => setHoverRating(rating)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      rating <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300',
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {!userRating
                ? 'Click to rate this dish'
                : `You rated this dish ${userRating} star${userRating !== 1 ? 's' : ''}`}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {voteStats.totalVotes} vote{voteStats.totalVotes !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {voteStats.averageRating > 0 && (
              <>
                <span className="text-sm font-medium">
                  {voteStats.averageRating.toFixed(1)}
                </span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Rating</DialogTitle>
            <DialogDescription>
              You are about to rate &quot;{dishName}&quot; at {restaurantName}{' '}
              with {pendingRating} star{pendingRating !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={cn(
                    'h-8 w-8',
                    rating <= (pendingRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300',
                  )}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelVote} disabled={isVoting}>
              Cancel
            </Button>
            <Button onClick={confirmVote} disabled={isVoting}>
              {isVoting ? 'Submitting...' : 'Confirm Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DishVoting;
