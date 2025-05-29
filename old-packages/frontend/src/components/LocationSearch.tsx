'use client';

import { useRouter } from 'next/router';
import React, { useState, FormEvent } from 'react';

import { SearchField } from '@/components/ui/search-field';
import { useAuth } from '@/contexts/AuthContext';
import { OpenAIService } from '@/services/openai';

interface LocationSearchProps {
  onLocationSelect?: (place: { cuisine: string; location: string }) => void;
  onSearchError?: (message: string) => void;
  className?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  onSearchError,
  className = '',
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchText.trim()) {
      setSearchMessage('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchMessage('Searching...');

    try {
      console.log('Extracting keywords from:', searchText);
      const keywords = await OpenAIService.extractKeywords(searchText);
      console.log('Extracted keywords:', keywords);

      if (keywords.message) {
        setSearchMessage(keywords.message);
        if (onSearchError) {
          onSearchError(keywords.message);
        }
        return;
      }

      // Use the router and onLocationSelect
      if (keywords.cuisine && keywords.location) {
        if (onLocationSelect) {
          onLocationSelect({
            cuisine: keywords.cuisine,
            location: keywords.location,
          });
        }
        router.push(
          `/search?cuisine=${encodeURIComponent(keywords.cuisine)}&location=${encodeURIComponent(keywords.location)}`,
        );
      }

      // If not authenticated, redirect to sign in
      if (!isAuthenticated) {
        const searchParams = new URLSearchParams({
          cuisine: keywords.cuisine || 'All',
          location: keywords.location || '',
          searchQuery: searchText,
        }).toString();

        const signInPath = `/signin?${new URLSearchParams({
          returnUrl: `/restaurants?${searchParams}`,
          message: 'Please sign in to view restaurants',
        }).toString()}`;

        console.log('Redirecting to:', signInPath);
        window.location.href = signInPath;
        return;
      }

      // If authenticated, go to restaurants page
      const restaurantsPath = `/restaurants?${new URLSearchParams({
        cuisine: keywords.cuisine || 'All',
        location: keywords.location || '',
        searchQuery: searchText,
      }).toString()}`;

      console.log('Redirecting to:', restaurantsPath);
      window.location.href = restaurantsPath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error searching location';
      console.error('Error searching location:', error);
      setSearchMessage(errorMessage);
      if (onSearchError) {
        onSearchError(errorMessage);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex gap-2">
        <SearchField
          label="Location"
          placeholder="Search for restaurants, cuisines, or locations..."
          value={searchText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchText(e.target.value)
          }
          className="flex-1"
        />
        <button
          type="submit"
          disabled={isSearching}
          className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 ${isSearching ? 'cursor-not-allowed' : ''}`}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      {searchMessage && (
        <div
          className={`mt-2 text-sm ${isSearching ? 'text-blue-600' : 'text-red-600'}`}
        >
          {searchMessage}
        </div>
      )}
    </form>
  );
};
