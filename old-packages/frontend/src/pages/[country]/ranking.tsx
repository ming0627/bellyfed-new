import { COUNTRIES } from '@/config/countries';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CountryRanking(): JSX.Element {
  const router = useRouter();
  const { country, dish } = router.query;

  // Redirect to the new rankings page
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace(`/my/rankings${dish ? `?dish=${dish}` : ''}`);
    } else {
      router.replace(`/${country}/rankings${dish ? `?dish=${dish}` : ''}`);
    }
  }, [country, router, dish]);

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirecting to new rankings page...</p>
    </div>
  );
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
