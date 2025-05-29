import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { COUNTRIES, CountryConfig } from '@/config/countries';

interface CountryContextType {
  currentCountry: CountryConfig;
  countryCode: string;
  setCountryByCode: (code: string) => void;
  isInitialized: boolean;
}

// Create a default context value to avoid undefined checks
const defaultContextValue: CountryContextType = {
  currentCountry: COUNTRIES.my,
  countryCode: 'my',
  setCountryByCode: () => {},
  isInitialized: false,
};

const CountryContext = createContext<CountryContextType>(defaultContextValue);

// Helper function to get country from path - works on both client and server
function getCountryFromPath(path: string): string {
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

export function CountryProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Define window with IS_STATIC_EXPORT property
  interface ExtendedWindow extends Window {
    IS_STATIC_EXPORT?: boolean;
  }

  // Check if we're in a static export environment
  const isStaticExport =
    typeof window !== 'undefined' &&
    ((window as ExtendedWindow).IS_STATIC_EXPORT || false);

  // Initialize with default country, but don't cause hydration mismatch
  const [currentCountry, setCurrentCountry] = useState<CountryConfig>(
    COUNTRIES.my,
  );
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
        if (countryCode && countryMap[countryCode as keyof typeof countryMap]) {
          setCurrentCountry(countryMap[countryCode as keyof typeof countryMap]);
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
      if (countryCode && countryMap[countryCode as keyof typeof countryMap]) {
        setCurrentCountry(countryMap[countryCode as keyof typeof countryMap]);
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
    return (code: string) => {
      if (!countryMap[code as keyof typeof countryMap]) return;

      try {
        setCurrentCountry(countryMap[code as keyof typeof countryMap]);
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

export function useCountry(): CountryContextType {
  const context = useContext(CountryContext);
  return context;
}
