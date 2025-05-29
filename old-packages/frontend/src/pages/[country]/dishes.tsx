import { DishRestaurants } from '@/components/dish-restaurants';
import { DynamicDishRanking } from '@/components/dynamic-dish-ranking';
import { COUNTRIES } from '@/config/countries';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DishesPage(): JSX.Element {
  const router = useRouter();
  const { country, dishId } = router.query;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/dishes');
    }
  }, [country, router]);

  // Show dish rankings if no dish is selected, otherwise show restaurants for the selected dish
  return dishId ? (
    <DishRestaurants
      dishId={dishId as string}
      dishName={(router.query.dishName as string) || 'Selected Dish'}
    />
  ) : (
    <DynamicDishRanking />
  );
}
