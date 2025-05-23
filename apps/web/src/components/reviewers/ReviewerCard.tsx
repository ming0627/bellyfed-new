import React from 'react';
import Link from 'next/link';
import {
  Star,
  Award,
  MapPin,
  UserCheck,
  Utensils,
  ThumbsUp,
  Check,
} from 'lucide-react';
import { Card, AvatarWithInitials, Badge, Button } from '@bellyfed/ui';

interface ReviewerCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  reviewCount: number;
  rank: number;
  specialty?: string;
  location?: string;
  isFollowing?: boolean;
  isVerified?: boolean;
  bio?: string;
  favoriteFood?: string;
  helpfulCount?: number;
  onFollow?: (id: string) => void;
  className?: string;
  variant?: 'default' | 'horizontal' | 'minimal';
}

/**
 * ReviewerCard component displays information about a food reviewer
 * Modern, minimalist design with refined aesthetics
 */
const ReviewerCard: React.FC<ReviewerCardProps> = ({
  id,
  name,
  avatarUrl,
  reviewCount,
  rank,
  specialty,
  location,
  isFollowing = false,
  isVerified = false,
  bio,
  favoriteFood,
  helpfulCount,
  onFollow,
  className,
  variant = 'default',
}) => {
  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFollow) {
      onFollow(id);
    }
  };

  // Get rank badge styling
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <Badge
          variant="premium"
          size="sm"
          className="absolute -top-2 -right-2 shadow-sm"
        >
          <Award size={12} className="mr-1" />
          #1 Reviewer
        </Badge>
      );
    } else if (rank <= 3) {
      return (
        <Badge
          variant="premium"
          size="sm"
          className="absolute -top-2 -right-2 shadow-sm"
        >
          <Award size={12} className="mr-1" />
          Top {rank}
        </Badge>
      );
    } else if (rank <= 10) {
      return (
        <Badge
          variant="soft-secondary"
          size="sm"
          className="absolute -top-2 -right-2 shadow-sm"
        >
          <Award size={12} className="mr-1" />
          Top {rank}
        </Badge>
      );
    }
    return null;
  };

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Card
        className={`overflow-hidden group ${className}`}
        variant="default"
        hover="lift"
        padding="md"
        radius="lg"
      >
        <Link href={`/reviewers/${id}`} className="flex items-start">
          <div className="relative flex-shrink-0">
            <AvatarWithInitials
              src={avatarUrl}
              name={name}
              className="mr-4 w-12 h-12"
            />
            {isVerified && (
              <Badge
                variant="verified"
                size="xs"
                className="absolute -bottom-1 -right-1 shadow-sm"
              >
                <Check size={8} />
              </Badge>
            )}
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-heading font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-primary-600 transition-colors flex items-center">
                  {name}
                  {rank <= 10 && (
                    <Badge
                      variant={rank <= 3 ? 'premium' : 'soft-secondary'}
                      size="xs"
                      className="ml-2"
                    >
                      <Award size={10} className="mr-1" />#{rank}
                    </Badge>
                  )}
                </h3>

                <div className="mt-1 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <Star size={14} className="text-accent-cream-800 mr-1" />
                  <span className="font-medium">{reviewCount}</span>
                  <span className="ml-1">reviews</span>

                  {helpfulCount && (
                    <>
                      <span className="mx-2 text-neutral-300">•</span>
                      <ThumbsUp size={12} className="text-primary-500 mr-1" />
                      <span className="font-medium">{helpfulCount}</span>
                      <span className="ml-1">helpful</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant={isFollowing ? 'soft' : 'outline-primary'}
                size="xs"
                onClick={handleFollow}
                className="flex-shrink-0"
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={12} className="mr-1" />
                    Following
                  </>
                ) : (
                  'Follow'
                )}
              </Button>
            </div>

            {specialty && (
              <div className="mt-2 flex items-center flex-wrap gap-2">
                <Badge variant="soft" size="xs">
                  {specialty}
                </Badge>

                {favoriteFood && (
                  <Badge variant="soft-plum" size="xs">
                    <Utensils size={10} className="mr-1" />
                    {favoriteFood}
                  </Badge>
                )}
              </div>
            )}

            {bio && (
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {bio}
              </p>
            )}

            {location && (
              <div className="mt-2 flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                <MapPin size={10} className="mr-1" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </Link>
      </Card>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <Card
        className={`overflow-hidden group ${className}`}
        variant="flat"
        hover="grow"
        padding="sm"
        radius="md"
      >
        <Link href={`/reviewers/${id}`} className="flex items-center">
          <AvatarWithInitials
            src={avatarUrl}
            name={name}
            className="mr-3 w-8 h-8"
          />

          <div className="flex-grow min-w-0">
            <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate group-hover:text-primary-600 transition-colors flex items-center">
              {name}
              {isVerified && <span className="ml-1 text-verified">•</span>}
            </h3>

            <div className="flex items-center text-xs text-neutral-500">
              <Star size={10} className="text-accent-cream-800 mr-1" />
              <span>{reviewCount}</span>

              {specialty && (
                <>
                  <span className="mx-1.5">•</span>
                  <span className="truncate">{specialty}</span>
                </>
              )}
            </div>
          </div>

          <Button
            variant={isFollowing ? 'soft' : 'outline-primary'}
            size="xs"
            onClick={handleFollow}
            className="ml-2 flex-shrink-0"
          >
            {isFollowing ? <UserCheck size={12} /> : 'Follow'}
          </Button>
        </Link>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={`overflow-hidden group ${className}`}
      variant="default"
      hover="lift"
      padding="md"
      radius="xl"
    >
      <div className="flex flex-col items-center p-2">
        <div className="relative mb-4">
          <AvatarWithInitials
            src={avatarUrl}
            name={name}
            className="mb-2 w-20 h-20"
          />

          {getRankBadge()}

          {isVerified && !getRankBadge() && (
            <Badge
              variant="verified"
              size="sm"
              className="absolute -bottom-1 right-0 shadow-sm"
            >
              <Check size={10} className="mr-1" />
              Verified
            </Badge>
          )}
        </div>

        <Link href={`/reviewers/${id}`} className="group">
          <h3 className="text-xl font-heading font-semibold text-neutral-800 dark:text-neutral-100 text-center group-hover:text-primary-600 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          <Star size={14} className="text-accent-cream-800 mr-1" />
          <span className="font-medium">{reviewCount}</span>
          <span className="ml-1">reviews</span>
        </div>

        {helpfulCount && (
          <div className="flex items-center mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            <ThumbsUp size={12} className="text-primary-500 mr-1" />
            <span className="font-medium">{helpfulCount}</span>
            <span className="ml-1">helpful ratings</span>
          </div>
        )}

        <div className="mt-3 flex items-center flex-wrap gap-2 justify-center">
          {specialty && (
            <Badge variant="soft" size="sm">
              {specialty}
            </Badge>
          )}

          {favoriteFood && (
            <Badge variant="soft-plum" size="sm">
              <Utensils size={12} className="mr-1" />
              {favoriteFood}
            </Badge>
          )}
        </div>

        {bio && (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center line-clamp-2">
            {bio}
          </p>
        )}

        {location && (
          <div className="flex items-center mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            <MapPin size={12} className="mr-1" />
            <span>{location}</span>
          </div>
        )}

        <div className="mt-5 w-full">
          <Button
            variant={isFollowing ? 'soft' : 'primary'}
            width="full"
            size="md"
            onClick={handleFollow}
            withRipple
          >
            {isFollowing ? (
              <>
                <UserCheck size={16} className="mr-2" />
                Following
              </>
            ) : (
              'Follow'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReviewerCard;
