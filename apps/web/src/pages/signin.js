import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout.js';
import SignInForm from '../components/auth/SignInForm.js';
import { useCountry, useAuth } from '../contexts/index.js';

/**
 * SignInPage component for user authentication
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function SignInPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const { signIn } = useAuth();
  const { redirect } = router.query;

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Handle sign in
  const handleSignIn = async (formData) => {
    try {
      // Use the auth context to sign in
      await signIn(formData);

      // Redirect to the specified path or homepage
      const redirectPath = redirect || (currentCountry?.code ? `/${currentCountry.code}` : '/');
      router.push(redirectPath);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  return (
    <Layout
      title="Sign In"
      description="Sign in to your Bellyfed account to discover and share food experiences"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Bellyfed
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Discover and share food experiences
              </p>
            </div>
          </div>

          <SignInForm
            onSignIn={handleSignIn}
            redirectPath={redirect || '/'}
            getCountryLink={getCountryLink}
          />
        </div>
      </div>
    </Layout>
  );
}

// This page doesn't need to be pre-rendered
export async function getStaticProps() {
  return {
    props: {},
  };
}
