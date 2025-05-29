/**
 * Dynamic Country Page Template
 *
 * Usage:
 * 1. Copy this file to src/pages/[country]/your-page-name.tsx
 * 2. Replace BasePageComponent with your actual page component
 * 3. Customize getStaticProps for additional data fetching if needed
 * 4. Uncomment and use the actual COUNTRIES import
 *
 * NOTE: This is a template file - when implementing your page:
 * - Replace placeholder imports with actual ones
 * - Replace the placeholder component with your component
 * - Update the page name in the router.replace path
 * - Add any page-specific data fetching logic in getStaticProps
 */

import { useRouter } from 'next/router';
import React, { Suspense, useEffect } from 'react';
// Uncomment this import in your implementation:
// import { COUNTRIES } from '@/config/countries';
// import YourComponent from '@/components/your-component';

// For template purposes only - replace with the actual import above
// The actual COUNTRIES object has more properties (see src/config/countries.ts)
const COUNTRIES: Record<string, { name: string; code: string }> = {
  my: { name: 'Malaysia', code: 'my' },
  sg: { name: 'Singapore', code: 'sg' },
};

// Placeholder component - replace with your actual component
// Example: import YourPageComponent from '@/components/your-component';
const BasePageComponent: React.FC = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Your Page Title</h1>
    <p className="text-gray-700 mb-4">
      Replace this with your actual page content
    </p>
    <div className="bg-gray-100 p-4 rounded-lg">
      <p>The country code is available via the router's query parameters</p>
    </div>
  </div>
);

export default function DynamicCountryPage(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code and redirect to default if invalid
  useEffect(() => {
    if (country && typeof country === 'string' && !COUNTRIES[country]) {
      // Redirect to default country if invalid code is provided
      router.replace('/my/your-page-name');
    }
  }, [country, router]);

  // Optional: Wrap in Suspense for loading states
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <BasePageComponent />
    </Suspense>
  );
}

// Pre-render pages for all valid country codes
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true, // Allow for dynamic paths
    // Alternative: use 'blocking' if you want to wait for generation
  };
}

// Provide country-specific props
export async function getStaticProps({
  params,
}: {
  params: { country: string };
}): Promise<any> {
  // Validate country code and use default if invalid
  const countryCode = params.country;

  // Add your data fetching logic here
  // Example:
  // const pageData = await fetchDataForCountry(countryCode);

  return {
    props: {
      // Your props here
      countryCode,
    },
    // Optional: revalidate every hour
    // revalidate: 3600,
  };
}
