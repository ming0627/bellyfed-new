import { useQuery } from '@tanstack/react-query';
import { MapPin, Medal, Star, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { reviewService } from '@/services/reviewService';

export default function RankingsTab(): JSX.Element {
  const { user } = useAuth();
  const userId = user?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['userReviews', 'user-123'],
    queryFn: () => reviewService.getUserReviews(userId || ''),
    enabled: !!userId,
  });

  const categories = useMemo(() => {
    if (!reviews) return [];
    const uniqueCategories = new Set(
      reviews.map((review) => review.dishName.split(' ')[0]),
    );
    return Array.from(uniqueCategories);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews
      .filter((review) => review.rank !== undefined && review.rank > 0)
      .filter(
        (review) =>
          selectedCategory === 'All' ||
          review.dishName.startsWith(selectedCategory),
      )
      .filter(
        (review) =>
          review.dishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.comment &&
            review.comment.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [reviews, searchTerm, selectedCategory]);

  const getRankIcon = (rank: number): JSX.Element => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-700" />;
    return <Medal className="w-5 h-5 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded flex-1"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded w-[180px]"></div>
        </div>
        <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Food Rankings</CardTitle>
        <Badge variant="outline" className="bg-orange-50 text-orange-600">
          {filteredReviews.length} Ranked Items
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="border-orange-200 focus:border-orange-400"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] border-orange-200 focus:border-orange-400">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No ranked dishes found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search or category
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border-b pb-6 flex gap-4">
                  <div className="flex-shrink-0 flex items-start pt-1">
                    {getRankIcon(review.rank || 0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {review.dishName}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-600"
                      >
                        Rank #{review.rank}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>
                          {review.establishmentId.replace(
                            'restaurant-',
                            'Restaurant ',
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {review.comment}
                    </p>

                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {review.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative w-16 h-16 flex-shrink-0"
                          >
                            <Image
                              src={
                                photo.startsWith('/')
                                  ? photo
                                  : '/food-sample.jpg'
                              }
                              alt={`Photo ${index + 1} for ${review.dishName}`}
                              width={64}
                              height={64}
                              className="rounded-md object-cover w-full h-full"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
