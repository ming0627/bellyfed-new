/**
 * Unauthorized Page
 *
 * This page is shown when a user tries to access a page they don't have permission to view.
 * It provides a friendly error message and a link to go back to the home page.
 */

import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout.js';
import { useCountry } from '@bellyfed/hooks';

/**
 * Unauthorized Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function UnauthorizedPage() {
  const router = useRouter();
  const { currentCountry } = useCountry();

  // Generate the home link based on the current country
  const homeLink = currentCountry?.code ? `/${currentCountry.code}` : '/';

  return (
    <Layout
      title="Unauthorized Access"
      description="You don't have permission to access this page"
    >
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Unauthorized Access
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              You don't have permission to access this page.
            </p>
          </div>

          <div className="mt-8">
            <svg
              className="mx-auto h-24 w-24 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              If you believe this is an error, please contact support.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go Back
              </button>

              <button
                onClick={() => router.push(homeLink)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
