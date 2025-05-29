/**
 * Example Migration Page (Default Country)
 *
 * This is the fallback page for the default country (my).
 * It redirects users to the dynamic country route for consistency.
 */

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const DefaultCountryPage: React.FC = () => {
  const router = useRouter();

  // Redirect to the dynamic country route
  useEffect(() => {
    router.replace('/my', undefined, { shallow: true });
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">
        Redirecting to country-specific page...
      </p>
    </div>
  );
};

export default DefaultCountryPage;
