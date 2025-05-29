import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientOnly } from '@/components/ui/client-only';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Portal } from '@radix-ui/react-portal';

import Image from 'next/image';

interface Comment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
}

interface Badge {
  type: 'reviewer' | 'expertise' | 'regional' | 'fineDining' | 'michelin';
  name: string;
  icon: string;
  tooltip: string;
  category?: string;
  region?: string;
  level?: 'junior' | 'regular' | 'senior' | 'lead' | 'director';
  reviewCount?: number;
}

interface SocialPost {
  id: string;
  username: string;
  userId: string;
  avatar: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  verified?: boolean;
  badges?: Badge[];
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    username: 'tokyo_foodie',
    userId: 'tokyo_foodie_123',
    avatar: 'https://ui-avatars.com/api/?name=Tokyo+Foodie&background=random',
    timestamp: '34m',
    content:
      'Exploring the hidden gems of Shibuya! 🍜✨ Found this amazing local ramen spot!',
    image:
      'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=1470&auto=format&fit=crop',
    likes: 163,
    comments: [
      {
        id: 'c1',
        username: 'ramen_expert',
        avatar:
          'https://ui-avatars.com/api/?name=Ramen+Expert&background=random',
        content: 'Great find! Love the authentic atmosphere!',
        timestamp: '30m',
      },
    ],
    shares: 21,
    verified: true,
    badges: [
      {
        type: 'regional',
        name: 'Lead District Reviewer',
        icon: '🏙️',
        tooltip: 'Leadership role in Shibuya district reviews',
        region: 'Shibuya, Tokyo',
        level: 'lead',
        reviewCount: 52,
      },
      {
        type: 'expertise',
        name: 'Senior Ramen Expert',
        icon: '🍜',
        tooltip: 'Senior expert in ramen cuisine',
        category: 'Japanese',
        level: 'senior',
      },
    ],
  },
  {
    id: '2',
    username: 'fine_dining_pro',
    userId: 'fine_dining_789',
    avatar:
      'https://ui-avatars.com/api/?name=Fine+Dining+Pro&background=random',
    timestamp: '2h',
    content:
      'Another exceptional evening at the newest 3-star Michelin restaurant in Orchard Road 🌟',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1470&auto=format&fit=crop',
    likes: 245,
    comments: [],
    shares: 42,
    verified: true,
    badges: [
      {
        type: 'fineDining',
        name: 'Fine Dining Director',
        icon: '🍽️',
        tooltip: 'Top authority in fine dining with 80+ exceptional reviews',
        region: 'Orchard Road, Singapore',
        level: 'director',
        reviewCount: 82,
      },
      {
        type: 'michelin',
        name: 'Lead Michelin Guide Reviewer',
        icon: '⭐⭐⭐',
        tooltip: 'Authority on Michelin dining experiences with 35+ reviews',
        level: 'lead',
        reviewCount: 35,
      },
    ],
  },
  {
    id: '3',
    username: 'dessert_queen',
    userId: 'dessert_queen_789',
    avatar: 'https://ui-avatars.com/api/?name=Dessert+Queen&background=random',
    timestamp: '2h',
    content:
      'Fresh out of the oven! These macarons are perfect for afternoon tea 🍪☕',
    image:
      'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1470&auto=format&fit=crop',
    likes: 89,
    comments: [],
    shares: 5,
    verified: true,
    badges: [
      {
        type: 'reviewer',
        name: 'Rising Reviewer',
        icon: '🌟',
        tooltip: 'Rising Reviewer - 50+ quality reviews',
      },
      {
        type: 'expertise',
        name: 'Dessert Expert',
        icon: '🍰',
        tooltip: 'Specialized in desserts and pastries',
      },
    ],
  },
];

interface StoryUser {
  name: string;
  avatar: string;
  hasNewStory?: boolean;
  storyCategory?: 'food' | 'review' | 'recipe' | 'restaurant';
  storyCount?: number;
  viewed?: boolean;
}

const storyUsers: StoryUser[] = [
  {
    name: 'Sarah Chen',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random',
    hasNewStory: true,
    storyCategory: 'food',
    storyCount: 3,
  },
  {
    name: 'Mike Wong',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Wong&background=random',
    hasNewStory: true,
    storyCategory: 'review',
    storyCount: 2,
  },
  {
    name: 'Lisa Park',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Park&background=random',
    hasNewStory: true,
    storyCategory: 'recipe',
    storyCount: 1,
  },
  {
    name: 'John Lee',
    avatar: 'https://ui-avatars.com/api/?name=John+Lee&background=random',
    viewed: true,
    storyCategory: 'restaurant',
    storyCount: 4,
  },
  {
    name: 'Emma Liu',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Liu&background=random',
    hasNewStory: true,
    storyCategory: 'food',
    storyCount: 2,
  },
  {
    name: 'David Kim',
    avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random',
    viewed: true,
    storyCategory: 'review',
    storyCount: 1,
  },
];

function StoryRing({ user }: { user: StoryUser }): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  const categoryColors = {
    food: ['#FF6B6B', '#FFA06B'],
    review: ['#4ECDC4', '#45B7AF'],
    recipe: ['#96CEB4', '#FFEEAD'],
    restaurant: ['#D4A5A5', '#9E7777'],
  };

  const gradientColors = categoryColors[user.storyCategory || 'food'];

  return (
    <div
      className="relative flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Story ring */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 ${user.viewed ? 'bg-gray-300' : 'bg-gradient-to-tr'}`}
          style={
            !user.viewed
              ? {
                  backgroundImage: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
                }
              : undefined
          }
        >
          <div className="bg-white p-0.5 rounded-full h-full">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Story count badge */}
        {user.storyCount && user.storyCount > 1 && (
          <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {user.storyCount}
          </div>
        )}

        {/* New story indicator */}
        {user.hasNewStory && (
          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Story preview on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-20 bg-white rounded-lg shadow-lg p-2 z-10 w-48"
          >
            <div className="text-xs font-medium mb-1">{user.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span className="capitalize">{user.storyCategory}</span>
              <span>•</span>
              <span>{user.storyCount} stories</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
        {user.name.split(' ')[0]}
      </span>
    </div>
  );
}

function StoriesSection(): JSX.Element {
  return (
    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Stories</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
        {storyUsers.map((user, index) => (
          <StoryRing key={index} user={user} />
        ))}
      </div>
    </div>
  );
}

function Post({ post }: { post: SocialPost }): JSX.Element {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localComments, setLocalComments] = useState(post.comments);

  const handleLike = (): void => {
    setIsLiked(!isLiked);
    setLocalLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSave = (): void => {
    setIsSaved(!isSaved);
    // You can add toast notification here
  };

  const handleShare = async (platform: string) => {
    // Close share menu
    setShowShareMenu(false);

    // Create share text
    const shareText = `Check out this amazing food post by ${post.username}! ${post.content}`;

    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(shareText);
        // You can add toast notification here
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
          '_blank',
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
          '_blank',
        );
        break;
      case 'whatsapp':
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
          '_blank',
        );
        break;
    }
  };

  const handleComment = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      username: 'current_user',
      avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random',
      content: newComment,
      timestamp: 'Just now',
    };

    setLocalComments([...localComments, comment]);
    setNewComment('');
  };

  const handleProfileClick = (userId: string): void => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleProfileClick(post.userId)}
            className="flex items-center space-x-3 hover:opacity-80"
          >
            <Avatar>
              <AvatarImage src={post.avatar} />
              <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <p className="font-semibold text-sm hover:underline">
                  {post.username}
                </p>
                {post.verified && (
                  <ClientOnly>
                    <svg
                      className="w-4 h-4 ml-1 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </ClientOnly>
                )}
                {post.badges && (
                  <div className="flex items-center gap-1.5 ml-2">
                    {post.badges.map((badge, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              inline-flex items-center text-sm font-medium
                              ${
                                badge.type === 'reviewer'
                                  ? 'text-blue-600'
                                  : badge.type === 'fineDining'
                                    ? 'text-orange-600'
                                    : badge.type === 'regional'
                                      ? 'text-green-600'
                                      : badge.type === 'michelin'
                                        ? 'text-yellow-600'
                                        : 'text-amber-600'
                              }
                              hover:opacity-80 transition-opacity cursor-help
                            `}
                          >
                            <span className="mr-0.5">{badge.icon}</span>
                            <span className="text-xs">{badge.name}</span>
                          </div>
                        </TooltipTrigger>
                        <Portal>
                          <TooltipContent
                            sideOffset={5}
                            className="bg-white border border-gray-100 shadow-lg rounded-lg p-3 z-50 max-w-[250px]"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{badge.icon}</span>
                                <span
                                  className={`
                                  ${badge.level === 'director' ? 'font-bold' : ''}
                                  ${badge.level === 'lead' ? 'font-semibold' : ''}
                                  ${badge.level === 'senior' ? 'font-medium' : ''}
                                `}
                                >
                                  {badge.name}
                                </span>
                                {badge.level === 'director' && (
                                  <span className="text-yellow-500">✨</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {badge.tooltip}
                                {badge.category && (
                                  <span className="block">
                                    Category: {badge.category}
                                  </span>
                                )}
                                {badge.region && (
                                  <span className="block">
                                    Region: {badge.region}
                                  </span>
                                )}
                                {badge.reviewCount && (
                                  <span className="block">
                                    Reviews: {badge.reviewCount}
                                  </span>
                                )}
                                {badge.level && (
                                  <span className="block font-medium">
                                    Level:{' '}
                                    {badge.level.charAt(0).toUpperCase() +
                                      badge.level.slice(1)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </TooltipContent>
                        </Portal>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </button>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-4 py-2">
        <p className="text-sm text-gray-800">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative aspect-square w-full mt-2">
          <Image
            src={post.image}
            alt="Post content"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t">
        <div className="flex items-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
          >
            <motion.div
              animate={
                isLiked
                  ? {
                      scale: [1, 1.2, 0.95, 1],
                      transition: { duration: 0.3 },
                    }
                  : {}
              }
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
            <span>{localLikes}</span>
          </motion.button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            <span>{localComments.length}</span>
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="h-5 w-5 mr-1" />
              <span>{post.shares}</span>
            </Button>

            {/* Share Menu */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                >
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <ClientOnly>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    </ClientOnly>
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <ClientOnly>
                      <svg
                        className="w-4 h-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </ClientOnly>
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <ClientOnly>
                      <svg
                        className="w-4 h-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </ClientOnly>
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <ClientOnly>
                      <svg
                        className="w-4 h-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </ClientOnly>
                    Share on WhatsApp
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleSave}
          className={`text-gray-600 ${isSaved ? 'text-orange-500' : ''}`}
        >
          <motion.div
            animate={
              isSaved
                ? {
                    scale: [1, 1.2, 0.95, 1],
                    transition: { duration: 0.3 },
                  }
                : {}
            }
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.div>
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Comments List */}
              <div className="space-y-3">
                {localComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-2xl px-4 py-2">
                        <p className="font-semibold text-sm hover:underline cursor-pointer">
                          {comment.username}
                        </p>
                        <p className="text-sm text-gray-800">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-4">
                        {comment.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Comment Input */}
              <form
                onSubmit={handleComment}
                className="flex items-center space-x-2"
              >
                <Input
                  value={newComment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewComment(e.target.value)
                  }
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700"
                  variant="ghost"
                  disabled={!newComment.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SocialFeed(): JSX.Element {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
            <button
              onClick={() => router.push('/')}
              className="text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-2 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Stories Section */}
        <StoriesSection />
        {/* Posts */}
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialPage(): JSX.Element {
  return (
    <TooltipProvider>
      <SocialFeed />
    </TooltipProvider>
  );
}

export default SocialPage;
