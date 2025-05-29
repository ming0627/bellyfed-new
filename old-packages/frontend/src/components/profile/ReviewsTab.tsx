import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Star } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { reviewService } from '@/services/reviewService';

export default function ReviewsTab(): JSX.Element {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['userReviews', 'user-123'],
    queryFn: () => reviewService.getUserReviews(userId || ''),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No reviews yet</p>
            <Button variant="outline">Write your first review</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Reviews</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b last:border-b-0 pb-6 last:pb-0"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <h3 className="font-semibold text-lg">{review.dishName}</h3>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {review.rank && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-600"
                  >
                    Top {review.rank}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-3 gap-4">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span>
                  {review.establishmentId.replace('restaurant-', 'Restaurant ')}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>
                  {new Date(
                    review.visitDate || review.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            <p className="text-sm mb-3">{review.comment}</p>

            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {review.photos.map((photo, index) => (
                  <div key={index} className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={photo.startsWith('/') ? photo : '/food-sample.jpg'}
                      alt={`Photo ${index + 1} for ${review.dishName}`}
                      width={80}
                      height={80}
                      className="rounded-md object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
