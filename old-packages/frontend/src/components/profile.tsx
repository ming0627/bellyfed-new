'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Utensils } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { Suspense, lazy, useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CustomTabs, TabsContent } from '@/components/ui/custom-tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useCognitoUser, useUser, useUserProfile } from '@/hooks';
import { restaurantService } from '@/services/restaurantService';
import { Achievement, User } from '@/types';

// Type definition for ProfileStatsProps
interface ProfileStatsProps {
  reviews: number | string;
  followers: number | string;
  cities: number | string;
}

// Lazy load tab content components
const ReviewsTab = lazy(() => import('@/components/profile/ReviewsTab'));
const PostsTab = lazy(() => import('@/components/profile/PostsTab'));
const RankingsTab = lazy(() => import('@/components/profile/RankingsTab'));
const GalleryTab = lazy(() => import('@/components/profile/GalleryTab'));

export const ProfileHeader = React.memo(function ProfileHeader({
  user,
  onFollow,
  isFollowing,
  isCurrentUser = false,
}: {
  user: User;
  onFollow: () => void;
  isFollowing: boolean;
  isCurrentUser?: boolean;
}) {
  const router = useRouter();
  const { country } = router.query;

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative">
      <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-start pt-4">
          <button
            onClick={() => router.push(`/${country || 'my'}`)}
            className="text-white hover:text-orange-100 transition-colors flex items-center gap-2 text-sm z-10"
          >
            ← Back to Home
          </button>
        </div>
      </div>
      <div className="content-container">
        <div className="relative -mt-24 sm:-mt-32 flex flex-col sm:flex-row items-center gap-6 mb-8 px-6 sm:px-8">
          <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-xl ring-2 ring-orange-100">
            <AvatarImage
              src={user.avatar?.key || '/bellyfed.png'}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-16">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {user.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              {user.email ? `@${user.email.split('@')[0]}` : ''}
            </p>
            <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center sm:justify-start">
              <MapPin className="w-4 h-4 mr-2" />{' '}
              {user.location || 'Location not specified'}
            </p>
            {user.bio && (
              <p className="text-sm text-gray-600 mt-2 max-w-md">{user.bio}</p>
            )}
          </div>
          <div className="flex gap-3 mt-4 sm:mt-16">
            {isCurrentUser ? (
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all"
                onClick={() => router.push(`/${country || 'my'}/profile/edit`)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all"
                  onClick={onFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50 shadow-sm hover:shadow-md transition-all"
                >
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const ProfileStats = React.memo(function ProfileStats({
  stats,
}: {
  stats: ProfileStatsProps;
}): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-orange-600">
          <Utensils className="w-4 h-4" />
          <span className="font-semibold text-xl">{stats.reviews}</span>
        </div>
        <p className="text-sm text-gray-600">Reviews</p>
      </div>
      <div className="text-center border-x border-orange-200">
        <div className="flex items-center justify-center gap-1 text-orange-600">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-xl">{stats.followers}</span>
        </div>
        <p className="text-sm text-gray-600">Followers</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-orange-600">
          <MapPin className="w-4 h-4" />
          <span className="font-semibold text-xl">{stats.cities}</span>
        </div>
        <p className="text-sm text-gray-600">Cities</p>
      </div>
    </div>
  );
});

export function Profile({
  userId = 'user-123',
}: {
  userId?: string;
}): JSX.Element {
  const [activeTab, setActiveTab] = useState('reviews');
  const {
    user,
    isLoading: isLoadingUser,
    error,
    followers,
    following,
    followUser,
    unfollowUser,
  } = useUser(userId);

  // Add React Query hooks for Cognito user data
  const { isLoading: isLoadingCognitoUser } = useCognitoUser();
  const { isLoading: isLoadingProfile } = useUserProfile();

  // Combine loading states
  const isLoading = isLoadingUser || isLoadingCognitoUser || isLoadingProfile;

  const tabs = ['reviews', 'posts', 'rankings', 'gallery'];

  const { data: establishments } = useQuery({
    queryKey: ['establishments', user?.reviews?.map((r) => r.establishmentId)],
    queryFn: async () => {
      if (!user?.reviews) return [];
      const establishmentIds =
        user?.reviews.map((r) => r.establishmentId) || [];
      const establishments = await Promise.all(
        establishmentIds.map((id) => restaurantService.getRestaurantById(id)),
      );
      return establishments;
    },
    enabled: !!user?.reviews?.length,
  });

  const stats = useMemo(() => {
    // Get all cities from establishments
    const cities = new Set<string>();
    establishments?.forEach((est) => {
      if (est.address) {
        cities.add(est.address);
      }
    });

    return {
      reviews: user?.reviews?.length || 0,
      followers: followers?.length || 0,
      cities: cities.size || 0,
    };
  }, [user, followers, establishments]);

  const isFollowing = useMemo(() => {
    if (!user || !following) return false;
    return following.some((f) => f.id === user.id);
  }, [user, following]);

  const handleFollow = (): void => {
    if (isFollowing) {
      unfollowUser();
    } else {
      followUser();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton for header */}
        <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="relative -mt-24 sm:-mt-32 flex flex-col sm:flex-row items-center gap-6 mb-8">
            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full" />
            <div className="flex-1 space-y-4 mt-4 sm:mt-16 w-full max-w-md">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="flex gap-3 mt-4 sm:mt-16">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-6">
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Error loading profile
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load this profile. Please try again later.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Check if this is the current user's profile
  const isCurrentUser = userId === 'user-123'; // If userId is 'user-123', it's the current user's profile

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        user={user}
        onFollow={handleFollow}
        isFollowing={isFollowing}
        isCurrentUser={isCurrentUser}
      />

      <div className="content-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="sm:p-6 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Statistics
                </h2>
              </div>
              <div className="sm:p-6 p-4 pt-0">
                <ProfileStats stats={stats} />
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="sm:p-6 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Achievements
                </h2>
              </div>
              <div className="sm:p-6 p-4 pt-0">
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-2">
                    {user?.achievements?.map((achievement: Achievement) => (
                      <div
                        key={achievement.name}
                        className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100"
                      >
                        <div className="w-5 h-5 text-orange-500" />
                        <span className="text-gray-700 text-sm">
                          {achievement.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="sm:p-6 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  About Me
                </h2>
              </div>
              <div className="sm:p-6 p-4 pt-0">
                <p className="text-gray-600 leading-relaxed">{user.bio}</p>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="sm:p-6 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Interests
                </h2>
              </div>
              <div className="sm:p-6 p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {user.interests?.map((interest) => (
                    <div
                      key={interest}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-white shadow-sm">
              <CustomTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              >
                <TabsContent value={activeTab}>
                  <Suspense
                    fallback={
                      <div className="space-y-4 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    }
                  >
                    {activeTab === 'reviews' && <ReviewsTab />}
                    {activeTab === 'posts' && <PostsTab />}
                    {activeTab === 'rankings' && <RankingsTab />}
                    {activeTab === 'gallery' && <GalleryTab />}
                  </Suspense>
                </TabsContent>
              </CustomTabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
