/**
 * Example Migration Page
 *
 * This file demonstrates a properly implemented dynamic country page
 * based on the template. It's meant as a reference for developers
 * migrating existing pages to the country-based routing system.
 */

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

// Mock COUNTRIES for example purposes (in real implementation, import from @/config/countries)
const COUNTRIES: Record<string, { name: string; code: string }> = {
  my: { name: 'Malaysia', code: 'my' },
  sg: { name: 'Singapore', code: 'sg' },
};

// Example component that would be imported from your components folder
const ExamplePageContent: React.FC<{ country: string }> = ({ country }) => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Example Migration Page</h1>
    <p className="text-gray-700 mb-4">
      This page demonstrates a successfully migrated page for country:{' '}
      <strong>{country}</strong>.
    </p>
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Implementation Details:</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Uses the dynamic [country] parameter</li>
        <li>Validates country against COUNTRIES configuration</li>
        <li>Redirects invalid countries to default country</li>
        <li>Pre-renders paths for known countries</li>
        <li>Passes country code to the content component</li>
      </ul>
    </div>
  </div>
);

const ExampleMigrationPage: React.FC = () => {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code and redirect to default if invalid
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      // Redirect to default country if invalid code is provided
      router.replace('/my/example-migration');
    }
  }, [country, router]);

  return <ExamplePageContent country={(country as string) || 'my'} />;
};

export default ExampleMigrationPage;

// Pre-render pages for all valid country codes
export async function getStaticPaths(): Promise<any> {
  // Only pre-render the Singapore page to avoid conflicts with the /my/example-migration page
  const paths = [{ params: { country: 'sg' } }];

  return {
    paths,
    fallback: 'blocking',
  };
}

// Provide country-specific props
export async function getStaticProps({
  params,
}: {
  params: { country: string };
}): Promise<any> {
  const countryCode = COUNTRIES[params.country] ? params.country : 'my';

  return {
    props: {
      country: countryCode,
    },
    revalidate: 3600,
  };
}
