/**
 * useCountry Hook
 * 
 * Custom hook for country context management.
 * Provides current country, country data, and country switching methods.
 */

import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router.js';

// Create Country Context
const CountryContext = createContext(null);

// Country Provider Component
export const CountryProvider = ({ children }) => {
  const router = useRouter();
  const [country, setCountry] = useState('us');
  const [countryData, setCountryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Available countries
  const countries = [
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'sg', name: 'Singapore', flag: '🇸🇬' }
  ];

  // Get country from router
  useEffect(() => {
    if (router.query.country) {
      const routerCountry = router.query.country;
      if (countries.find(c => c.code === routerCountry)) {
        setCountry(routerCountry);
      }
    }
  }, [router.query.country]);

  // Load country data when country changes
  useEffect(() => {
    const loadCountryData = async () => {
      setIsLoading(true);
      try {
        const data = countries.find(c => c.code === country);
        setCountryData(data);
      } catch (error) {
        console.error('Error loading country data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountryData();
  }, [country]);

  // Switch country
  const switchCountry = (newCountry) => {
    if (countries.find(c => c.code === newCountry)) {
      setCountry(newCountry);
      
      // Update URL if we're on a country-specific route
      if (router.pathname.includes('[country]')) {
        const newPath = router.pathname.replace('[country]', newCountry);
        router.push(newPath);
      }
    }
  };

  const value = {
    country,
    countryData,
    countries,
    isLoading,
    switchCountry
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

// useCountry hook
export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    // Return default values if not in provider
    return {
      country: 'us',
      countryData: { code: 'us', name: 'United States', flag: '🇺🇸' },
      countries: [
        { code: 'us', name: 'United States', flag: '🇺🇸' },
        { code: 'ca', name: 'Canada', flag: '🇨🇦' },
        { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'au', name: 'Australia', flag: '🇦🇺' },
        { code: 'sg', name: 'Singapore', flag: '🇸🇬' }
      ],
      isLoading: false,
      switchCountry: () => {}
    };
  }
  return context;
};

export default useCountry;
