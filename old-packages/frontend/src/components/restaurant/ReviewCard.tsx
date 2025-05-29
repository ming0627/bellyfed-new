import { format } from 'date-fns';
import { Clock } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Review, VisitStatus } from '@/types';

interface ReviewCardProps {
  review: Review;
  onRankChange: (reviewId: string, rank: number) => void;
  onVisitStatusChange: (reviewId: string, status: VisitStatus) => void;
  getRankIcon: (rank: number) => React.ReactNode;
  getVisitStatusIcon: (status: VisitStatus | undefined) => React.ReactNode;
}

export function ReviewCard({
  review,
  onRankChange,
  onVisitStatusChange,
  getRankIcon,
  getVisitStatusIcon,
}: ReviewCardProps): JSX.Element {
  const createdDate = format(new Date(review.createdAt), 'MMM d, yyyy h:mm a');
  const updatedDate = format(new Date(review.updatedAt), 'MMM d, yyyy h:mm a');
  const wasUpdated = review.updatedAt !== review.createdAt;
  const currentRank = review.rank || 0;
  const isRanked = currentRank > 0;

  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-2 p-4 bg-gradient-to-r from-gray-50 to-white border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/default-avatar.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {review.dishName}
              </h3>
              <div className="flex flex-col gap-1 text-sm">
                <div className="text-sm text-gray-500">
                  {createdDate}
                  {wasUpdated && (
                    <span className="ml-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {updatedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isRanked ? (
              <Badge
                variant="outline"
                className={cn(
                  'px-3 py-1 font-medium flex items-center gap-1.5',
                  currentRank === 1 && 'border-yellow-400 text-yellow-600',
                  currentRank === 2 && 'border-gray-400 text-gray-600',
                  currentRank === 3 && 'border-amber-600 text-amber-700',
                  currentRank === 4 && 'border-blue-400 text-blue-600',
                  currentRank === 5 && 'border-green-400 text-green-600',
                )}
              >
                {getRankIcon(currentRank)}
                <span>Rank #{currentRank}</span>
              </Badge>
            ) : (
              review.visitStatus && (
                <Badge
                  variant="outline"
                  className={cn(
                    'px-3 py-1 font-medium flex items-center gap-1.5',
                    review.visitStatus === VisitStatus.STANDARD &&
                      'border-green-500 text-green-600',
                    review.visitStatus === VisitStatus.NEEDS_IMPROVEMENT &&
                      'border-yellow-500 text-yellow-600',
                    review.visitStatus === VisitStatus.DISAPPOINTING &&
                      'border-red-500 text-red-600',
                  )}
                >
                  {review.visitStatus && getVisitStatusIcon(review.visitStatus)}
                  <span className="capitalize">
                    {review.visitStatus &&
                      review.visitStatus.toLowerCase().replace('_', ' ')}
                  </span>
                </Badge>
              )
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          {review.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">
                Additional notes: {review.notes}
              </p>
            </div>
          )}
        </div>

        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {review.photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 bg-gray-50 border-t">
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-1">
              {[1, 2, 3, 4, 5].map((rank) => (
                <Button
                  key={rank}
                  variant={currentRank === rank ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onRankChange(review.id, rank);
                    onVisitStatusChange(review.id, '' as VisitStatus);
                  }}
                  className={cn(
                    'h-8 min-w-[40px]',
                    rank === 1 &&
                      'hover:border-yellow-400 hover:text-yellow-600',
                    rank === 2 && 'hover:border-gray-400 hover:text-gray-600',
                    rank === 3 && 'hover:border-amber-600 hover:text-amber-700',
                    rank === 4 && 'hover:border-blue-400 hover:text-blue-600',
                    rank === 5 && 'hover:border-green-400 hover:text-green-600',
                  )}
                >
                  {getRankIcon(rank)}
                  <span className="ml-1">#{rank}</span>
                </Button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex flex-wrap items-center gap-1">
              {[
                {
                  status: VisitStatus.STANDARD,
                  label: 'Standard',
                  icon: '✓',
                  hoverClass: 'hover:border-green-500 hover:text-green-600',
                },
                {
                  status: VisitStatus.NEEDS_IMPROVEMENT,
                  label: 'Needs Improvement',
                  icon: '⚠️',
                  hoverClass: 'hover:border-yellow-500 hover:text-yellow-600',
                },
                {
                  status: VisitStatus.DISAPPOINTING,
                  label: 'Disappointing',
                  icon: '✗',
                  hoverClass: 'hover:border-red-500 hover:text-red-600',
                },
              ].map(({ status, label, icon, hoverClass }) => (
                <Button
                  key={status}
                  variant={
                    review.visitStatus === status ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    onVisitStatusChange(review.id, status);
                    onRankChange(review.id, 0);
                  }}
                  className={cn('h-8 min-w-[120px] relative group', hoverClass)}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{icon}</span>
                    <span className="capitalize text-sm">{label}</span>
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ReviewCardSimple({
  review,
  onRankChange,
  onVisitStatusChange,
  getRankIcon,
  getVisitStatusIcon,
}: ReviewCardProps): JSX.Element {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{review.dishName}</h3>
            <p className="text-gray-600 mt-1">{review.comment}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Rating:</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'text-lg',
                      index < review.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300',
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {review.rank && (
              <div className="flex items-center gap-2">
                {getRankIcon(review.rank)}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRankChange(review.id, review.rank! - 1)}
                    disabled={review.rank === 1}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRankChange(review.id, review.rank! + 1)}
                  >
                    ↓
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {review.visitStatus && getVisitStatusIcon(review.visitStatus)}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onVisitStatusChange(review.id, VisitStatus.STANDARD)
                  }
                  className={cn(
                    review.visitStatus === VisitStatus.STANDARD &&
                      'bg-green-100',
                  )}
                >
                  👍
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onVisitStatusChange(review.id, VisitStatus.DISAPPOINTING)
                  }
                  className={cn(
                    review.visitStatus === VisitStatus.DISAPPOINTING &&
                      'bg-red-100',
                  )}
                >
                  👎
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
