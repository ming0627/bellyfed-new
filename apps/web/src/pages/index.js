import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Root homepage component that redirects to the default country
 * This handles the root route "/" and redirects to "/my" (Malaysia) as the default country
 */
export default function RootHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default country (Malaysia) on client-side
    router.replace('/my');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to homepage...</p>
      </div>
    </div>
  );
}

/**
 * Server-side redirect to default country
 * This provides better SEO and faster redirects
 */
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/my',
      permanent: false, // Use 302 redirect (temporary) since country preference might change
    },
  };
}
