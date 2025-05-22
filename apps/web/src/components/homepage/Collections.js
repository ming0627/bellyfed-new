import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowRight } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * CollectionCard component for displaying individual collection information
 *
 * @param {Object} props - Component props
 * @param {Object} props.collection - Collection data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const CollectionCard = memo(function CollectionCard({
  collection,
  getCountryLink,
}) {
  if (!collection) return null;

  return (
    <Link
      href={getCountryLink(`/collections/${collection.id}`)}
      className="block group"
      aria-label={`View ${collection.title} collection`}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative h-48">
          {collection.imageUrl ? (
            <Image
              src={collection.imageUrl}
              alt={collection.title}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <LucideClientIcon
                icon={BookOpen}
                className="w-8 h-8 text-gray-400"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="font-semibold text-lg">{collection.title}</h3>
            <p className="text-sm text-white/80">
              {collection.count} restaurants
            </p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {collection.description}
          </p>
          <p className="text-gray-500 text-xs">
            Curated by {collection.curator}
          </p>
        </div>
      </div>
    </Link>
  );
});

/**
 * Collections component displays a grid of curated restaurant collections
 *
 * @param {Object} props - Component props
 * @param {string} props.countryName - Name of the current country
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
export const Collections = memo(function Collections({
  countryName,
  getCountryLink,
}) {
  // Mock data for collections - in a real app, this would come from an API
  const collections = useMemo(
    () => [
      {
        id: '1',
        title: 'Best Street Food in KL',
        description:
          'Discover the most authentic street food experiences in Kuala Lumpur',
        imageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
        count: 12,
        curator: 'Sarah Chen',
      },
      {
        id: '2',
        title: 'Hidden Gems',
        description: 'Off-the-beaten-path restaurants that locals love',
        imageUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&h=400&fit=crop',
        count: 8,
        curator: 'Mike Wong',
      },
      {
        id: '3',
        title: 'Best Date Night Spots',
        description: 'Romantic restaurants perfect for special occasions',
        imageUrl:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&h=400&fit=crop',
        count: 10,
        curator: 'Lisa Tan',
      },
      {
        id: '4',
        title: 'Family-Friendly Restaurants',
        description: 'Kid-approved places with great food for adults too',
        imageUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&h=400&fit=crop',
        count: 15,
        curator: 'David Lim',
      },
    ],
    [],
  );

  // Early return if no collections are available
  if (!collections || collections.length === 0) {
    return null;
  }

  // Validate required props
  if (!countryName || typeof getCountryLink !== 'function') {
    console.error('Collections component missing required props');
    return null;
  }

  return (
    <section className="mb-12" aria-labelledby="collections-heading">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <LucideClientIcon
            icon={BookOpen}
            className="w-5 h-5 text-purple-600 mr-2"
            aria-hidden="true"
          />
          <h2 id="collections-heading" className="text-xl font-bold">
            Popular Collections in {countryName}
          </h2>
        </div>
        <Link
          href={getCountryLink('/collections')}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          aria-label="View all collections"
        >
          View All
          <LucideClientIcon
            icon={ArrowRight}
            className="w-4 h-4 ml-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map(collection => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            getCountryLink={getCountryLink}
          />
        ))}
      </div>
    </section>
  );
});

// Default export for easier imports
export default Collections;
