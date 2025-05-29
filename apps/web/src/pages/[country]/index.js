import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Homepage from '../../components/homepage.js';

export default function CountryHomePage({ country }) {
  const router = useRouter();
  const routerCountry = router.query.country || country;

  // Validate country code
  useEffect(() => {
    if (routerCountry && !['us', 'my', 'sg', 'jp'].includes(routerCountry)) {
      router.replace('/my');
    }
  }, [routerCountry, router]);

  return <Homepage />;
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'us' } },
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
      { params: { country: 'jp' } }
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
  };
}
