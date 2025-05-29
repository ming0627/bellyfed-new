/**
 * Restaurant card component
 */
import { Clock, DollarSign, ExternalLink, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCountry } from '@/contexts/CountryContext';
import { Restaurant, formatPriceLevel } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
  showActions?: boolean;
}

export function RestaurantCard({
  restaurant,
  onClick,
  showActions = true,
}: RestaurantCardProps): JSX.Element {
  const { countryCode } = useCountry();

  // Get restaurant photo URL
  const getPhotoUrl = (): string => {
    if (restaurant.photos && restaurant.photos.length > 0) {
      return restaurant.photos[0].photoUrl;
    }

    if (restaurant.photoReference) {
      // This is a fallback and will only work if the API key is exposed to the client
      // In a real application, you would proxy this through your own API
      return `/api/restaurants/photo?reference=${restaurant.photoReference}`;
    }

    return '/images/restaurant-placeholder.jpg';
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={getPhotoUrl()}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
      </div>

      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold line-clamp-1">
          {restaurant.name}
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{restaurant.address}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-2">
          {restaurant.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          )}

          {restaurant.priceLevel !== undefined && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-500 mr-1" />
              <span>{formatPriceLevel(restaurant.priceLevel)}</span>
            </div>
          )}
        </div>

        {restaurant.hours && restaurant.hours.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Clock className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">
              {restaurant.hours[0].openTime.substring(0, 5)} -{' '}
              {restaurant.hours[0].closeTime.substring(0, 5)}
            </span>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Link
            href={`/${countryCode}/restaurant/${restaurant.restaurantId}`}
            passHref
          >
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>

          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Website
              </Button>
            </a>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
