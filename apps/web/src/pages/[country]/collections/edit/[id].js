import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Layout from '../../../../components/layout/Layout.js';
import CollectionForm from '../../../../components/collections/CollectionForm.js';

import { useCountry, useAuth } from '../../../../contexts/index.js';

/**
 * EditCollectionPage component for editing an existing collection
 * This page is protected by authentication middleware
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function EditCollectionPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentCountry, isInitialized } = useCountry();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to generate country-specific links
  const getCountryLink = useCallback(
    path => {
      if (!isInitialized || !currentCountry?.code) return path;
      return `/${currentCountry.code}${path}`;
    },
    [currentCountry, isInitialized],
  );

  // Fetch collection data
  const {
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      // In a real app, this would call an API to fetch the collection
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock collection data
      return {
        id,
        title: 'Best Brunch Spots in KL',
        description:
          'A curated list of the best places to enjoy brunch in Kuala Lumpur, from classic breakfast joints to trendy cafes.',
        location: 'Kuala Lumpur',
        imageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
        restaurants: [
          {
            id: '1',
            name: 'Spice Garden',
            imageUrl:
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&h=200&fit=crop',
            cuisine: 'Indian',
            location: 'Kuala Lumpur',
          },
          {
            id: '2',
            name: 'Sushi Express',
            imageUrl:
              'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200&h=200&fit=crop',
            cuisine: 'Japanese',
            location: 'Kuala Lumpur',
          },
        ],
        curator: user?.name || 'Anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    enabled: !!id,
  });

  // Handle form submission
  const handleSubmit = useCallback(
    async data => {
      try {
        setIsSubmitting(true);

        // In a real app, this would call an API to update the collection
        console.log('Updating collection:', data);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        alert('Collection updated successfully!');

        // Redirect to collection page
        router.push(getCountryLink(`/collections/${id}`));
      } catch (error) {
        console.error('Error updating collection:', error);
        alert('Failed to update collection. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, getCountryLink, id],
  );

  return (
    <Layout
      title="Edit Collection | Bellyfed"
      description="Edit your restaurant collection on Bellyfed"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={getCountryLink(`/collections/${id}`)}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Collection
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Collection
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update your curated collection of restaurants.
          </p>
        </div>

        {/* Collection Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading collection...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">
                Error loading collection. Please try again.
              </p>
              <button
                onClick={() => router.reload()}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Retry
              </button>
            </div>
          ) : (
            <CollectionForm
              initialData={collection}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitButtonText="Update Collection"
              getCountryLink={getCountryLink}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
