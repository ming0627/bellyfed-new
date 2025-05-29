import { useQuery } from '@tanstack/react-query';
import { ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { restaurantService } from '@/services/restaurantService';

interface FeaturedRestaurantsProps {
  countryName: string;
  getCountryLink: (path: string) => string;
}

export function FeaturedRestaurants({
  countryName,
  getCountryLink,
}: FeaturedRestaurantsProps): JSX.Element {
  // Fetch featured restaurants based on country
  const { data: featuredRestaurants = [], isLoading: isLoadingFeatured } =
    useQuery({
      queryKey: ['featured-restaurants', countryName],
      queryFn: async () => {
        const response = await restaurantService.listRestaurants({
          limit: 5,
        });
        return response.restaurants;
      },
    });

  return (
    <section className="py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Featured Restaurants
          </h2>
          <p className="text-gray-500 mt-1">
            Discover our handpicked selection of top restaurants
          </p>
        </div>
        <Link
          href={getCountryLink('/restaurants')}
          className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
        >
          View all restaurants
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {isLoadingFeatured ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <CardContent className="pt-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.restaurantId}
              href={getCountryLink(`/restaurant/${restaurant.restaurantId}`)}
              className="block transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Card className="h-full">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={restaurant.photos?.[0]?.photoUrl || '/bellyfed.png'}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {restaurant.address}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
