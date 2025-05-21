/**
 * Updated index page to use dynamic country routing instead of hardcoded 'my'
 *
 * IMPORTANT: Do not use redirect in getStaticProps as it causes errors in static generation.
 * Instead, use client-side redirects (useEffect + meta refresh) as implemented below.
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home(): JSX.Element {
  const router = useRouter();

  // Default country to use - could be set from browser locale, user preferences, etc.
  const defaultCountry = 'my';

  useEffect(() => {
    // Redirect to the default country page
    router.replace(`/${defaultCountry}`);
  }, [router]);

  // Return a minimal div instead of null to ensure index.html generation
  return (
    <div style={{ display: 'none' }}>
      <Head>
        <title>Bellyfed - Redirecting...</title>
        <meta name="description" content="Redirecting to Bellyfed" />
        {/* Add meta refresh as a fallback for static export */}
        <meta httpEquiv="refresh" content={`0;url=/${defaultCountry}`} />
      </Head>
      Redirecting to country page...
    </div>
  );
}

// Add getStaticProps to ensure the page is pre-rendered
// IMPORTANT: Do NOT add a redirect here as it will break static generation
export async function getStaticProps() {
  return {
    props: {},
    // DO NOT add redirect here - it will cause errors in static builds
  };
}
