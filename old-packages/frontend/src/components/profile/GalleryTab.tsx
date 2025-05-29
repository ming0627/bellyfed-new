import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { reviewService } from '@/services/reviewService';

interface UserReview {
  id: string;
  dishName: string;
  photos?: string[];
}

// Interface for photo items displayed in the gallery
type PhotoItem = {
  id: string;
  url: string;
  title: string;
  likes: number;
};

export default function GalleryTab(): JSX.Element {
  const { user } = useAuth();
  const userId = user?.id;
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['userReviews', 'user-123'],
    queryFn: () => reviewService.getUserReviews(userId || ''),
    enabled: !!userId,
  });

  const filteredPhotos: PhotoItem[] =
    reviews
      ?.flatMap(
        (review: UserReview) =>
          review.photos?.map((photo) => ({
            id: `${review.id}-${photo}`,
            url: photo,
            title: review.dishName,
            likes: Math.floor(Math.random() * 20), // Mock likes for demo
          })) || [],
      )
      .filter((photo) =>
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded w-full max-w-sm"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!filteredPhotos.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Food Gallery</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No photos found</p>
            <p className="text-sm text-muted-foreground mb-6">
              Share your food experiences by adding photos to your reviews
            </p>
            <Button variant="outline">Add Your First Photo</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Food Gallery</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Input
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="max-w-sm border-orange-200 focus:border-orange-400"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filteredPhotos.length} photos
          </p>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Image
                  src={
                    photo.url.startsWith('/') ? photo.url : '/food-sample.jpg'
                  }
                  alt={photo.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-semibold mb-1">
                    {photo.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-white text-sm">{photo.likes}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                      >
                        <Heart className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
