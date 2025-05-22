import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Heart, Award, Utensils } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RestaurantCardProps {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  location: string;
  distance?: string;
  isOpen?: boolean;
  isFavorite?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isNew?: boolean;
  popularDish?: string;
  onToggleFavorite?: (id: string) => void;
  className?: string;
  variant?: 'default' | 'horizontal' | 'minimal';
}

/**
 * RestaurantCard component displays information about a restaurant
 * Modern, minimalist design with refined aesthetics
 */
const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  cuisine,
  priceRange,
  location,
  distance,
  isOpen = true,
  isFavorite = false,
  isVerified = false,
  isPremium = false,
  isNew = false,
  popularDish,
  onToggleFavorite,
  className,
  variant = 'default',
}) => {
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  // Get price range color - updated for better contrast
  const getPriceRangeColor = () => {
    switch (priceRange) {
      case '$':
        return 'text-success';
      case '$$':
        return 'text-info';
      case '$$$':
        return 'text-secondary-600';
      case '$$$$':
        return 'text-premium';
      default:
        return 'text-neutral-700 dark:text-neutral-300';
    }
  };

  // Get rating color - updated for better contrast
  const getRatingColor = () => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4.0) return 'text-accent-gold-600 dark:text-accent-gold-500';
    if (rating >= 3.5) return 'text-info';
    if (rating >= 3.0) return 'text-neutral-700 dark:text-neutral-300';
    return 'text-error';
  };

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Card
        className={`overflow-hidden group ${className}`}
        variant="default"
        hover="lift"
        padding="none"
        radius="lg"
      >
        <Link href={`/restaurants/${id}`} className="flex h-full">
          <div className="relative w-1/3 flex-shrink-0">
            <div className="h-full w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt={name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Status badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isNew && (
                <Badge
                  variant="soft"
                  className="bg-new text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm"
                >
                  <span className="flex items-center">
                    <span className="mr-1">●</span> New
                  </span>
                </Badge>
              )}
              {isPremium && (
                <Badge
                  variant="soft"
                  className="bg-premium text-neutral-900 text-xs px-1.5 py-0.5 rounded-md shadow-sm"
                >
                  <Award size={10} className="mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-3 right-3 p-1.5 bg-white/90 dark:bg-neutral-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-neutral-700 transition-all hover:scale-110 focus:outline-none"
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Heart
                size={16}
                className={`transition-colors ${isFavorite ? 'fill-primary-600 text-primary-600' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-primary-600'}`}
              />
            </button>

            {/* Bottom gradient overlay with Open/Closed badge */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
              <Badge
                variant="soft"
                className={`${
                  isOpen ? 'bg-success text-white' : 'bg-error text-white'
                } text-xs px-1.5 py-0.5 rounded-md shadow-sm backdrop-blur-sm flex items-center`}
              >
                <Clock size={10} className="mr-1" />
                {isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 flex-grow">
            <div>
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-heading font-semibold text-neutral-800 dark:text-neutral-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
                    {name}
                  </h3>

                  <div className="mt-1 flex items-center flex-wrap gap-1.5">
                    <Badge
                      variant="soft"
                      size="xs"
                      className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {cuisine}
                    </Badge>

                    <span className="mx-1 text-neutral-400">•</span>

                    <span
                      className={`text-xs font-medium ${getPriceRangeColor()}`}
                    >
                      {priceRange}
                    </span>

                    {isVerified && (
                      <>
                        <span className="mx-1 text-neutral-400">•</span>
                        <Badge
                          variant="soft"
                          className="bg-verified/10 text-verified text-xs px-1.5 py-0.5 rounded-md flex items-center"
                        >
                          <Award size={10} className="mr-1" />
                          Verified
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center ml-2 flex-shrink-0 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                  <Star
                    size={14}
                    className={`${getRatingColor()} mr-1`}
                    fill="currentColor"
                  />
                  <span className={`font-medium text-sm ${getRatingColor()}`}>
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">
                    ({reviewCount})
                  </span>
                </div>
              </div>

              {popularDish && (
                <div className="mt-2 flex items-center text-xs text-neutral-700 dark:text-neutral-300">
                  <Utensils
                    size={12}
                    className="mr-1.5 text-primary-600 dark:text-primary-500"
                  />
                  <span>
                    Popular: <span className="font-medium">{popularDish}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 min-w-0">
                <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
              {distance && (
                <span className="ml-2 text-xs bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {distance}
                </span>
              )}
            </div>
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
        hover="lift"
        padding="sm"
        radius="md"
      >
        <Link href={`/restaurants/${id}`} className="flex items-center">
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md shadow-sm">
            <Image
              src={imageUrl}
              alt={name}
              width={96}
              height={96}
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="ml-4 flex-grow min-w-0">
            <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
              {name}
            </h3>

            <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
              <span className="truncate">{cuisine}</span>
              <span className="mx-1.5 text-neutral-400 dark:text-neutral-600">
                •
              </span>
              <span className={`font-medium ${getPriceRangeColor()}`}>
                {priceRange}
              </span>
              <span className="mx-1.5 text-neutral-400 dark:text-neutral-600">
                •
              </span>
              <div className="flex items-center">
                <Star
                  size={10}
                  className={`${getRatingColor()} mr-0.5`}
                  fill="currentColor"
                />
                <span className={`${getRatingColor()}`}>
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="ml-2 flex-shrink-0">
            {isOpen ? (
              <Badge
                variant="soft"
                className="bg-success/10 text-success text-xs px-1.5 py-0.5 rounded-full"
              >
                Open
              </Badge>
            ) : (
              <Badge
                variant="soft"
                className="bg-error/10 text-error text-xs px-1.5 py-0.5 rounded-full"
              >
                Closed
              </Badge>
            )}
          </div>
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
      padding="none"
      radius="xl"
    >
      <Link href={`/restaurants/${id}`} className="block h-full">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge
              variant="soft"
              className="bg-new text-white text-xs px-2 py-1 rounded-md shadow-sm"
            >
              <span className="flex items-center">
                <span className="mr-1">●</span> New
              </span>
            </Badge>
          )}
          {isPremium && (
            <Badge
              variant="soft"
              className="bg-premium text-neutral-900 text-xs px-2 py-1 rounded-md shadow-sm"
            >
              <Award size={12} className="mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-neutral-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-neutral-700 transition-all hover:scale-110 focus:outline-none"
          aria-label={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <Heart
            size={18}
            className={`transition-colors ${isFavorite ? 'fill-primary-600 text-primary-600' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-primary-600'}`}
          />
        </button>

        {/* Bottom gradient overlay with badges */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <div className="flex justify-between items-center">
            <Badge
              variant="soft"
              className={`${
                isOpen ? 'bg-success text-white' : 'bg-error text-white'
              } text-xs px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm flex items-center`}
            >
              <Clock size={12} className="mr-1.5" />
              {isOpen ? 'Open Now' : 'Closed'}
            </Badge>

            <Badge
              variant="soft"
              className="bg-white/90 text-primary-600 dark:bg-neutral-800/90 dark:text-primary-500 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm"
            >
              {priceRange}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-heading font-semibold text-neutral-800 dark:text-neutral-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
                {name}
              </h3>

              <div className="mt-1 flex items-center flex-wrap gap-2">
                <Badge
                  variant="soft"
                  size="sm"
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  {cuisine}
                </Badge>

                {isVerified && (
                  <Badge
                    variant="soft"
                    className="bg-verified/10 text-verified text-xs px-2 py-0.5 rounded-md flex items-center"
                  >
                    <Award size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center ml-2 flex-shrink-0 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
              <Star
                size={16}
                className={`${getRatingColor()} mr-1`}
                fill="currentColor"
              />
              <span className={`font-medium ${getRatingColor()}`}>
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">
                ({reviewCount})
              </span>
            </div>
          </div>

          {popularDish && (
            <div className="mt-3 flex items-center text-sm text-neutral-700 dark:text-neutral-300">
              <Utensils
                size={14}
                className="mr-1.5 text-primary-600 dark:text-primary-500"
              />
              <span>
                Popular: <span className="font-medium">{popularDish}</span>
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 min-w-0">
              <MapPin size={14} className="mr-1.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            {distance && (
              <span className="ml-2 text-xs bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-400 px-2 py-0.5 rounded-full flex-shrink-0">
                {distance}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default RestaurantCard;
