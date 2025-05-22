import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout.js';
import SignUpForm from '../components/auth/SignUpForm.js';
import { useCountry, useAuth } from '../contexts/index.js';

/**
 * SignUpPage component for user registration
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function SignUpPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const { signIn } = useAuth();
  const { redirect } = router.query;

  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Handle sign up
  const handleSignUp = async (formData) => {
    try {
      // In a real app, this would register the user and then sign them in
      console.log('Signing up with:', formData);

      // Mock registration for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sign in the user after successful registration
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      // Redirect to the specified path or homepage
      const redirectPath = redirect || (currentCountry?.code ? `/${currentCountry.code}` : '/');
      router.push(redirectPath);
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  return (
    <Layout
      title="Sign Up"
      description="Create a Bellyfed account to discover and share food experiences"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Bellyfed
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Join our community of food lovers
              </p>
            </div>
          </div>

          <SignUpForm
            onSignUp={handleSignUp}
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
