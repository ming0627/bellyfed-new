import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { COUNTRIES } from '../config/countries.js';

// Create a default context value to avoid undefined checks
const defaultContextValue = {
  currentCountry: COUNTRIES.my,
  countryCode: 'my',
  setCountryByCode: () => {},
  isInitialized: false,
};

const CountryContext = createContext(defaultContextValue);

// Helper function to get country from path - works on both client and server
function getCountryFromPath(path) {
  try {
    if (!path) return 'my';
    const pathSegments = path.split('/').filter(Boolean);
    const countryCode = pathSegments[0];
    return COUNTRIES[countryCode] ? countryCode : 'my'; // Default to 'my' if invalid
  } catch (error) {
    console.error('Error parsing country from path:', error);
    return 'my';
  }
}

// Create a static country map to avoid repeated calculations
const countryMap = {
  my: COUNTRIES.my,
  sg: COUNTRIES.sg,
};

export function CountryProvider({ children }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if we're in a static export environment
  const isStaticExport =
    typeof window !== 'undefined' &&
    (window.IS_STATIC_EXPORT || false);

  // Initialize with default country, but don't cause hydration mismatch
  const [currentCountry, setCurrentCountry] = useState(COUNTRIES.my);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track if we've already set the country to avoid unnecessary updates
  const [hasSetInitialCountry, setHasSetInitialCountry] = useState(false);

  // Handle country initialization based on URL or default
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;

    // Skip if we've already initialized
    if (hasSetInitialCountry) return;

    // For static export, use a simpler approach
    if (isStaticExport) {
      try {
        const path = window.location.pathname;
        const countryCode = getCountryFromPath(path);
        if (countryCode && countryMap[countryCode]) {
          setCurrentCountry(countryMap[countryCode]);
          setHasSetInitialCountry(true);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error setting country in static export:', error);
        // Fallback to default
        setCurrentCountry(COUNTRIES.my);
        setHasSetInitialCountry(true);
        setIsInitialized(true);
      }
      return;
    }

    // For normal Next.js app, wait for router to be ready
    if (!router.isReady) return;

    try {
      const countryCode = getCountryFromPath(router.asPath);
      if (countryCode && countryMap[countryCode]) {
        setCurrentCountry(countryMap[countryCode]);
        setHasSetInitialCountry(true);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error setting country from router path:', error);
      // Fallback to default
      setCurrentCountry(COUNTRIES.my);
      setHasSetInitialCountry(true);
      setIsInitialized(true);
    }
  }, [router.isReady, router.asPath, hasSetInitialCountry, isStaticExport]);

  // Memoize the setCountryByCode function to prevent unnecessary re-renders
  const setCountryByCode = useMemo(() => {
    return (code) => {
      if (!countryMap[code]) return;

      try {
        setCurrentCountry(countryMap[code]);
        setHasSetInitialCountry(true);
        setIsInitialized(true);

        // Only invalidate queries in browser environment
        if (typeof window !== 'undefined' && !isStaticExport) {
          // Use a timeout to prevent immediate re-renders
          setTimeout(() => {
            try {
              queryClient.invalidateQueries();
            } catch (error) {
              console.error('Error invalidating queries:', error);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error setting country by code:', error);
      }
    };
  }, [queryClient, isStaticExport]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return {
      currentCountry,
      countryCode: currentCountry.code,
      setCountryByCode,
      isInitialized,
    };
  }, [currentCountry, setCountryByCode, isInitialized]);

  return (
    <CountryContext.Provider value={contextValue}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  return context;
}
