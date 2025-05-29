import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { COUNTRIES } from '@/config/countries';
import SocialPage from '@/pages/social';

export default function CountrySocial(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/social');
    }
  }, [country, router]);

  return <SocialPage />;
}

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: false,
  };
}

export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
