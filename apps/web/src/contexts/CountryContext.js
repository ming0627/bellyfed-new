import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Define the shape of a country
// Country: { code: string, name: string, currency: string, locale: string, flag: string }

// Define the shape of the country context
// CountryContextType: {
//   currentCountry: Country | null,
//   isInitialized: boolean,
//   setCountry: (countryCode: string) => void,
//   countries: Country[]
// }

// Mock countries data
const COUNTRIES = [
  {
    code: 'us',
    name: 'United States',
    currency: 'USD',
    locale: 'en-US',
    flag: '🇺🇸',
  },
  {
    code: 'my',
    name: 'Malaysia',
    currency: 'MYR',
    locale: 'ms-MY',
    flag: '🇲🇾',
  },
  {
    code: 'sg',
    name: 'Singapore',
    currency: 'SGD',
    locale: 'en-SG',
    flag: '🇸🇬',
  },
  {
    code: 'jp',
    name: 'Japan',
    currency: 'JPY',
    locale: 'ja-JP',
    flag: '🇯🇵',
  },
];

// Create the context with a default value
const CountryContext = createContext({
  currentCountry: null,
  isInitialized: false,
  setCountry: () => {},
  countries: COUNTRIES,
});

export const CountryProvider = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Initialize country from URL or default to US
  useEffect(() => {
    if (!router.isReady) return;

    const { country } = router.query;
    const countryCode = Array.isArray(country) ? country[0] : country;

    if (countryCode) {
      const foundCountry = COUNTRIES.find(c => c.code === countryCode);
      if (foundCountry) {
        setCurrentCountry(foundCountry);
      } else {
        // If country code is invalid, default to US
        setCurrentCountry(COUNTRIES[0]);
        // Redirect to valid country
        router.replace(`/${COUNTRIES[0].code}${router.pathname.replace('[country]', COUNTRIES[0].code)}`);
      }
    } else if (router.pathname === '/') {
      // On root path, default to US
      setCurrentCountry(COUNTRIES[0]);
    }

    setIsInitialized(true);
  }, [router.isReady, router.query, router.pathname]);

  // Function to change country
  const setCountry = (countryCode) => {
    const foundCountry = COUNTRIES.find(c => c.code === countryCode);
    if (foundCountry) {
      setCurrentCountry(foundCountry);

      // In a real app, you might want to redirect to the same page but with the new country
      if (router.pathname.includes('[country]')) {
        const newPath = router.pathname.replace('[country]', countryCode);
        router.push(newPath);
      }
    }
  };

  return (
    <CountryContext.Provider
      value={{
        currentCountry,
        isInitialized,
        setCountry,
        countries: COUNTRIES,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

// Custom hook to use the country context
export const useCountry = () => useContext(CountryContext);

export default CountryContext;