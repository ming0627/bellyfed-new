import { useQuery } from '@tanstack/react-query';
import {
  Camera,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trophy,
} from 'lucide-react';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantService } from '@/services/restaurantService';
// Define the FoodCategory interface locally to avoid namespace conflicts
interface FoodCategory {
  id: string;
  name: string;
  icon?: string;
  isExisting?: boolean;
  [key: string]: any;
}

// Define the Post interface locally to avoid namespace conflicts
interface Post {
  id: string;
  userId: string;
  content: string;
  date?: string;
  photos?: any[];
  video?: any;
  hashtags?: string[];
  location?: string;
  likeCount?: number;
  postedBy?: any;
  createdAt: string;
  updatedAt?: string;
  taggedEstablishmentIds?: string[];
  commentIds?: string[];
  rating?: number;
  [key: string]: any;
}

interface FeedContentProps {
  foodCategories?: FoodCategory[];
  isSidebarExpanded: boolean;
}

export function FeedContent({
  isSidebarExpanded,
}: FeedContentProps): JSX.Element {
  const { user } = useAuth();

  // Fetch posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // This would typically come from a PostService
      // For now, return an empty array
      return [] as Post[];
    },
  });

  // Fetch establishments for tagged posts
  const { data: establishments } = useQuery({
    queryKey: [
      'establishments',
      posts?.map((p) => p.taggedEstablishmentIds?.[0]),
    ],
    queryFn: async () => {
      const establishmentIds =
        posts?.flatMap((p) => p.taggedEstablishmentIds || []).filter(Boolean) ||
        [];
      if (!establishmentIds.length) return [];
      const establishments = await Promise.all(
        establishmentIds.map((id) => restaurantService.getRestaurantById(id)),
      );
      return establishments;
    },
    enabled: !!posts?.length,
  });

  // Function to format date consistently
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to get establishment name by ID
  const getEstablishmentName = (establishmentId: string): string => {
    return (
      establishments?.find((e) => e.restaurantId === establishmentId)?.name ||
      'Unknown Establishment'
    );
  };

  if (isLoadingPosts) {
    return <div>Loading posts...</div>;
  }

  return (
    <>
      <Card className="mb-4 minimalist-card">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src="/bellyfed.png" alt="@user" />
            <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <Input
            placeholder="Share your food experience..."
            className="flex-1"
          />
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Photo
          </Button>
          <Button variant="ghost" size="sm">
            <Trophy className="mr-2 h-4 w-4" />
            Rank
          </Button>
          <Button variant="ghost" size="sm">
            <MapPin className="mr-2 h-4 w-4" />
            Location
          </Button>
        </CardFooter>
      </Card>

      <div
        className={`grid gap-4 ${
          isSidebarExpanded
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {posts && posts.length > 0 ? (
          posts.map((post, i) => (
            <Card key={post.id} className="minimalist-card overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar>
                  <AvatarImage src="/bellyfed.png" alt={`User ${i + 1}`} />
                  <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {`FoodieExplorer${i + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {post.photos && post.photos.length > 0 && (
                  <Image
                    src={post.photos[0].key}
                    alt="Post image"
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="text-sm mb-2">{post.content}</p>
                  {post.rating && (
                    <div className="flex items-center mb-2">
                      <Trophy className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm font-semibold">
                        Rating: {post.rating} / 5
                      </span>
                    </div>
                  )}
                  {post.taggedEstablishmentIds?.[0] && (
                    <p className="text-sm text-muted-foreground">
                      {`Tagged establishment: ${getEstablishmentName(post.taggedEstablishmentIds[0])}`}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="text-xs">Like ({post.likeCount || 0})</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">
                    Comment ({post.commentIds?.length || 0})
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Share</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No posts to display.</p>
        )}
      </div>
    </>
  );
}
