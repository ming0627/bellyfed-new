import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/layout/Layout.js';
import SearchResults from '../../components/search/SearchResults.js';
import { useCountry } from '../../contexts/index.js';

// Mock restaurant data for search results
const mockRestaurants = [
  {
    id: '1',
    name: 'Nasi Lemak House',
    description: 'Authentic Malaysian cuisine specializing in Nasi Lemak',
    address: {
      street: '123 Jalan Bukit Bintang',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Malaysian', 'Halal'],
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 256,
    isFeatured: true,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Sushi Sensation',
    description: 'Premium Japanese sushi and sashimi restaurant',
    address: {
      street: '45 Jalan Sultan Ismail',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50250',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Japanese', 'Seafood'],
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 189,
    isFeatured: true,
    isVerified: true,
    isNew: true,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Taco Temple',
    description: 'Authentic Mexican street food with a modern twist',
    address: {
      street: '78 Jalan Petaling',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50000',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Mexican', 'Fusion'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 142,
    isFeatured: true,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Char Kuey Teow Corner',
    description: 'Famous for authentic Penang-style Char Kuey Teow',
    address: {
      street: '56 Jalan Alor',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50200',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Malaysian', 'Street Food'],
    priceRange: '$',
    rating: 4.6,
    reviewCount: 178,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1590759668628-05b0fc34bb70?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Curry House',
    description: 'Authentic Indian curries and tandoori specialties',
    address: {
      street: '23 Jalan Masjid India',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '50100',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Indian', 'Vegetarian'],
    priceRange: '$$',
    rating: 4.4,
    reviewCount: 156,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=600&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Dim Sum Palace',
    description: 'Traditional Hong Kong-style dim sum in an elegant setting',
    address: {
      street: '88 Jalan Pudu',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postalCode: '55100',
      country: 'Malaysia',
      countryCode: 'my',
    },
    cuisineTypes: ['Chinese', 'Dim Sum'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 203,
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&h=400&fit=crop',
  },
];

/**
 * SearchPage component for displaying search results
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function SearchPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  
  // Update search query from URL parameters
  useEffect(() => {
    if (router.isReady) {
      setSearchQuery(router.query.q || '');
      setLocationQuery(router.query.location || '');
    }
  }, [router.isReady, router.query]);
  
  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);
  
  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['searchResults', searchQuery, locationQuery, currentCountry?.code],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the search parameters
      // For now, we'll just filter the mock data
      let filtered = [...mockRestaurants];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(restaurant => 
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.description?.toLowerCase().includes(query) ||
          restaurant.cuisineTypes?.some(cuisine => cuisine.toLowerCase().includes(query))
        );
      }
      
      if (locationQuery) {
        const location = locationQuery.toLowerCase();
        filtered = filtered.filter(restaurant => 
          restaurant.address.city.toLowerCase().includes(location) ||
          restaurant.address.state.toLowerCase().includes(location) ||
          restaurant.address.street.toLowerCase().includes(location)
        );
      }
      
      return filtered;
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when search parameters are available
    enabled: router.isReady && (!!searchQuery || !!locationQuery),
  });
  
  // Handle search form submission
  const handleSearch = useCallback((newQuery, newLocation) => {
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newLocation) params.set('location', newLocation);
    
    router.push({
      pathname: router.pathname,
      query: { ...router.query, ...Object.fromEntries(params) },
    }, undefined, { shallow: true });
  }, [router]);
  
  return (
    <Layout
      title={`Search Results${searchQuery ? ` for "${searchQuery}"` : ''}`}
      description={`Search results${searchQuery ? ` for "${searchQuery}"` : ''}${locationQuery ? ` in "${locationQuery}"` : ''}`}
    >
      <div className="container mx-auto px-4">
        <SearchResults
          results={searchResults}
          isLoading={isLoading}
          searchQuery={searchQuery}
          locationQuery={locationQuery}
          onSearch={handleSearch}
          getCountryLink={getCountryLink}
        />
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
    ],
    fallback: true, // Generate pages for paths not returned by getStaticPaths
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
