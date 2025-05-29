import { useQuery } from '@tanstack/react-query';
import { Hash, MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';

export default function PostsTab(): JSX.Element {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: posts, isLoading } = useQuery({
    queryKey: ['userPosts', 'user-123'],
    queryFn: () => UserService.getUserPosts(userId || ''),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button variant="outline">Create your first post</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            {post.photos?.[0] && (
              <div className="relative w-full h-48">
                <Image
                  src={post.photos[0].key || '/food-sample.jpg'}
                  alt={post.content}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
              </div>
            )}
            <CardContent className="pt-6">
              <Badge variant="outline" className="mb-2">
                <Hash className="w-3 h-3 mr-1" />
                {post.taggedEstablishmentIds?.[0] || 'Food'}
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {post.content}
              </p>
              <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {post.likeCount || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {post.commentIds?.length || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />0
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
