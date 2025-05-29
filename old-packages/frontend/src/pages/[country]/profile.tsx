import { Profile } from '@/components/profile';
import { COUNTRIES } from '@/config/countries';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CountryProfile(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;
  const { isAuthenticated, isLoading } = useAuth();

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/profile');
    }
  }, [country, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | BellyFed</title>
        <meta
          name="description"
          content="View and manage your BellyFed profile"
        />
      </Head>
      <main className="min-h-screen bg-gray-50">
        <Profile />
      </main>
    </>
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
    revalidate: 60, // Revalidate every 60 seconds
  };
}
