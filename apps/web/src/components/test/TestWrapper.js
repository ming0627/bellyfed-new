/**
 * TestWrapper Component
 *
 * This component provides necessary context providers for test pages.
 * It wraps test components with CountryProvider and other required providers
 * to prevent "useX must be used within a XProvider" errors during static generation.
 */

import React from 'react';

// Mock country data for testing
const mockCountryData = {
  code: 'sg',
  name: 'Singapore',
  flag: '🇸🇬',
  currency: 'SGD',
  languages: ['en'],
  isActive: true,
};

// Mock CountryContext
export const CountryContext = React.createContext({
  country: mockCountryData,
  setCountry: () => {},
  countries: [mockCountryData],
  isLoading: false,
});

// Mock RankingContext
export const RankingContext = React.createContext({
  ranking: {
    id: '1',
    rank: 1,
    userId: 'user1',
    dishId: 'dish1',
    restaurantId: 'restaurant1',
    score: 5,
    comment: 'Great dish!',
    photoUrl: 'https://example.com/photo.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  setRanking: () => {},
  isLoading: false,
});

/**
 * CountryProvider component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Rendered component
 */
export const CountryProvider = ({ children }) => {
  return (
    <CountryContext.Provider
      value={{
        country: mockCountryData,
        setCountry: () => {},
        countries: [mockCountryData],
        isLoading: false,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

/**
 * RankingProvider component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Rendered component
 */
export const RankingProvider = ({ children }) => {
  return (
    <RankingContext.Provider
      value={{
        ranking: {
          id: '1',
          rank: 1,
          userId: 'user1',
          dishId: 'dish1',
          restaurantId: 'restaurant1',
          score: 5,
          comment: 'Great dish!',
          photoUrl: 'https://example.com/photo.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        setRanking: () => {},
        isLoading: false,
      }}
    >
      {children}
    </RankingContext.Provider>
  );
};

// Mock data for testing
const mockData = {
  // Add any mock data needed for testing here
};

/**
 * TestWrapper component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Rendered component
 */
const TestWrapper = ({ children }) => {
  return (
    <CountryProvider>
      <RankingProvider>
        {children}
      </RankingProvider>
    </CountryProvider>
  );
};

export default TestWrapper;
