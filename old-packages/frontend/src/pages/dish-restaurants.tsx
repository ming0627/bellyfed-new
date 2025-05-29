import { FoodEstablishment } from '@/types';
import { getImageUrl } from '@/utils/image';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

interface DishRestaurantsProps {
  dishId: string;
}

export default function DishRestaurants({
  dishId,
}: DishRestaurantsProps): JSX.Element {
  const { data: restaurants } = useQuery<FoodEstablishment[]>({
    queryKey: ['dish-restaurants', dishId],
  });

  const getRestaurantImage = (restaurant: FoodEstablishment): string => {
    if (!restaurant.images?.length) return '';
    const image = restaurant.images[0];
    return typeof image === 'string' ? image : getImageUrl(image);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurants serving this dish</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant) => (
          <div
            key={restaurant.id}
            className="rounded-lg shadow-md overflow-hidden"
          >
            {getRestaurantImage(restaurant) && (
              <div className="relative h-48">
                <Image
                  src={getRestaurantImage(restaurant)}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-2">
                {restaurant.locations?.[0]?.info.address},{' '}
                {restaurant.locations?.[0]?.info.city}
              </p>
              <p className="text-gray-600 mb-2">
                {restaurant.cuisineTypes?.join(', ')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{restaurant.priceRange}</span>
                <span className="text-gray-600">
                  {restaurant.ranking?.totalScore?.toFixed(1)} ( reviews)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
