import { COUNTRIES } from '@/config/countries';
import RestaurantManagementPage from '@/pages/restaurant-management';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CountryRestaurantManagement(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/restaurant-management');
    }
  }, [country, router]);

  return <RestaurantManagementPage />;
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
