/**
 * ProtectedRouteExample
 * 
 * This is an example of how to use the ProtectedRoute component in a page.
 * It demonstrates how to protect a route and handle authentication.
 */

import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute.js';
import Layout from '../components/layout/Layout.js';

/**
 * Example of a protected page
 * 
 * @returns {JSX.Element} - Rendered component
 */
const ProtectedPage = () => {
  const router = useRouter();

  return (
    <ProtectedRoute
      // Redirect to signin page if not authenticated
      redirectPath="/signin"
      // Preserve the return URL in query params
      preserveReturnUrl={true}
      // Optional: Specify allowed roles
      // allowedRoles={['admin', 'editor']}
    >
      <Layout
        title="Protected Page"
        description="This page is protected and requires authentication"
      >
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                Protected Content
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Welcome to the Protected Page
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                This content is only visible to authenticated users.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Your Profile
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    This section would display user profile information.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Your Settings
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    This section would display user settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProtectedPage;
