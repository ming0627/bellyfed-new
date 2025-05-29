import { COUNTRIES } from '@/config/countries';
import DishRestaurantsPage from '@/pages/dish-restaurants';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CountryDishRestaurants(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/dish-restaurants');
    }
  }, [country, router]);

  const { dishId } = router.query;

  // Only render the component when dishId is available
  return dishId ? (
    <DishRestaurantsPage dishId={dishId as string} />
  ) : (
    <div>Loading...</div>
  );
}

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true, // Changed to true to allow for dynamic paths
  };
}

export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
