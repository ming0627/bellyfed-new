/**
 * Test Protected Page
 *
 * This page demonstrates the use of the ProtectedRoute component.
 * It will redirect to the sign-in page if the user is not authenticated.
 */

import ProtectedRoute from '../components/ProtectedRoute.js';
import Layout from '../components/layout/Layout.js';
import { useAuth } from '@bellyfed/hooks';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test Protected Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestProtectedPage() {
  const { user } = useAuth();

  return (
    <TestWrapper>
      <ProtectedRoute>
        <Layout
          title="Protected Page Test"
          description="Testing the ProtectedRoute component"
        >
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Protected Page Test
              </h1>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                This page is protected and only visible to authenticated users.
              </p>
            </div>

            <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Information
              </h2>
              <div className="mt-4">
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Layout>
      </ProtectedRoute>
    </TestWrapper>
  );
}
