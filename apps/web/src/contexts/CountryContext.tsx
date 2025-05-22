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
import { 
  Country, 
  CountryContextType, 
  CountryProviderProps 
} from '../types/country';

// Create a default context value to avoid undefined checks
const defaultContextValue: CountryContextType = {
  countries: Object.values(COUNTRIES),
  currentCountry: COUNTRIES.my,
  isInitialized: false,
  isLoading: false,
  setCountryByCode: () => {},
  getCountryLink: (path) => path,
  isValidCountryCode: () => false,
};

const CountryContext = createContext<CountryContextType>(defaultContextValue);

/**
 * Helper function to get country from path - works on both client and server
 * 
 * @param path - URL path
 * @returns Country code
 */
function getCountryFromPath(path: string): string {
  try {
    if (!path) return 'my';
    const pathSegments = path.split('/').filter(Boolean);
    const countryCode = pathSegments[0];
    return COUNTRIES[countryCode as keyof typeof COUNTRIES] ? countryCode : 'my'; // Default to 'my' if invalid
  } catch (error) {
    console.error('Error parsing country from path:', error);
    return 'my';
  }
}

/**
 * Helper function to validate a country code
 * 
 * @param code - Country code to validate
 * @returns Whether the country code is valid
 */
function isValidCountryCode(code: string): boolean {
  return !!COUNTRIES[code as keyof typeof COUNTRIES];
}

/**
 * Helper function to get a country-specific link
 * 
 * @param countryCode - Country code
 * @param path - Path to link to
 * @returns Country-specific link
 */
function getCountryLink(countryCode: string, path: string): string {
  if (!countryCode) return path;
  return `/${countryCode}${path}`;
}

// Create a static country map to avoid repeated calculations
const countryMap: Record<string, Country> = {
  my: COUNTRIES.my,
  sg: COUNTRIES.sg,
  id: COUNTRIES.id,
  th: COUNTRIES.th,
  vn: COUNTRIES.vn,
  ph: COUNTRIES.ph,
};

/**
 * CountryProvider component for managing country state
 * 
 * @param props - Component props
 * @returns Rendered component
 */
export function CountryProvider({ 
  children, 
  initialCountryCode 
}: CountryProviderProps): JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if we're in a static export environment
  const isStaticExport =
    typeof window !== 'undefined' &&
    (window.IS_STATIC_EXPORT || false);

  // Initialize with default country, but don't cause hydration mismatch
  const [currentCountry, setCurrentCountry] = useState<Country>(COUNTRIES.my);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Track if we've already set the country to avoid unnecessary updates
  const [hasSetInitialCountry, setHasSetInitialCountry] = useState<boolean>(false);

  // Handle country initialization based on URL or default
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;

    // Skip if we've already initialized
    if (hasSetInitialCountry) return;

    // If initialCountryCode is provided, use it
    if (initialCountryCode && isValidCountryCode(initialCountryCode)) {
      setCurrentCountry(countryMap[initialCountryCode]);
      setHasSetInitialCountry(true);
      setIsInitialized(true);
      return;
    }

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
  }, [router.isReady, router.asPath, hasSetInitialCountry, isStaticExport, initialCountryCode]);

  // Memoize the setCountryByCode function to prevent unnecessary re-renders
  const setCountryByCode = useMemo(() => {
    return (code: string): void => {
      if (!countryMap[code]) return;

      try {
        setIsLoading(true);
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
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error setting country by code:', error);
        setIsLoading(false);
      }
    };
  }, [queryClient, isStaticExport]);

  // Memoize the getCountryLink function to prevent unnecessary re-renders
  const getCountryLinkMemo = useMemo(() => {
    return (path: string): string => {
      return getCountryLink(currentCountry.code, path);
    };
  }, [currentCountry.code]);

  // Memoize the isValidCountryCode function to prevent unnecessary re-renders
  const isValidCountryCodeMemo = useMemo(() => {
    return (code: string): boolean => {
      return isValidCountryCode(code);
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo((): CountryContextType => {
    return {
      countries: Object.values(COUNTRIES),
      currentCountry,
      isInitialized,
      isLoading,
      setCountryByCode,
      getCountryLink: getCountryLinkMemo,
      isValidCountryCode: isValidCountryCodeMemo,
    };
  }, [currentCountry, isInitialized, isLoading, setCountryByCode, getCountryLinkMemo, isValidCountryCodeMemo]);

  return (
    <CountryContext.Provider value={contextValue}>
      {children}
    </CountryContext.Provider>
  );
}

/**
 * Custom hook to use the country context
 * 
 * @returns Country context value
 */
export function useCountry(): CountryContextType {
  const context = useContext(CountryContext);
  
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  
  return context;
}
