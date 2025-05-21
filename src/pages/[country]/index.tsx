import { useRouter } from 'next/router';
import { Suspense, useEffect } from 'react';
import { Homepage } from '../../components/homepage.js';

export default function CountryHomePage({
  country,
}: {
  country: string;
}): JSX.Element {
  const router = useRouter();
  const routerCountry = router.query.country || country;

  // Validate country code
  useEffect(() => {
    if (routerCountry && !['my', 'sg'].includes(routerCountry as string)) {
      router.replace('/my');
    }
  }, [routerCountry, router]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <Homepage />
    </Suspense>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: false,
  };
}

export async function getStaticProps({
  params,
}: {
  params: { country: string };
}) {
  return {
    props: {
      country: params.country,
    },
  };
}
