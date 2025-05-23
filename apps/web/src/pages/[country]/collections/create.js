import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Layout from '../../../components/layout/Layout.js';
import CollectionForm from '../../../components/collections/CollectionForm.js';
import { LucideClientIcon } from '../../../components/ui/lucide-icon.js';
import { useCountry } from '../../../contexts/index.js';

/**
 * CreateCollectionPage component for creating a new collection
 * This page is protected by authentication middleware
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function CreateCollectionPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to generate country-specific links
  const getCountryLink = useCallback(
    path => {
      if (!isInitialized || !currentCountry?.code) return path;
      return `/${currentCountry.code}${path}`;
    },
    [currentCountry, isInitialized],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async data => {
      try {
        setIsSubmitting(true);

        // In a real app, this would call an API to create the collection
        console.log('Creating collection:', data);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success message
        alert('Collection created successfully!');

        // Redirect to collections page
        router.push(getCountryLink('/collections'));
      } catch (error) {
        console.error('Error creating collection:', error);
        alert('Failed to create collection. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, getCountryLink],
  );

  return (
    <Layout
      title="Create Collection | Bellyfed"
      description="Create a new restaurant collection on Bellyfed"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={getCountryLink('/collections')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6"
        >
          <LucideClientIcon icon={ChevronLeft} className="w-4 h-4 mr-1" />
          Back to Collections
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Collection
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share your favorite restaurants with the community by creating a
            curated collection.
          </p>
        </div>

        {/* Collection Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <CollectionForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Create Collection"
            getCountryLink={getCountryLink}
          />
        </div>
      </div>
    </Layout>
  );
}
