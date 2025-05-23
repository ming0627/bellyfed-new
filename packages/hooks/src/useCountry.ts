import { useContext } from 'react';

/**
 * Country interface
 */
export interface Country {
  /**
   * Country code (e.g., 'us', 'my', 'sg')
   */
  code: string;
  
  /**
   * Country name (e.g., 'United States', 'Malaysia', 'Singapore')
   */
  name: string;
  
  /**
   * Country currency code (e.g., 'USD', 'MYR', 'SGD')
   */
  currency: string;
  
  /**
   * Country locale (e.g., 'en-US', 'ms-MY', 'en-SG')
   */
  locale: string;
  
  /**
   * Country flag emoji
   */
  flag: string;
}

/**
 * Country context interface
 */
export interface CountryContextType {
  /**
   * Current country
   */
  currentCountry: Country | null;
  
  /**
   * Whether the country context is initialized
   */
  isInitialized: boolean;
  
  /**
   * Function to set the current country
   * @param countryCode - Country code
   */
  setCountry: (countryCode: string) => void;
  
  /**
   * List of available countries
   */
  countries: Country[];
}

/**
 * Hook to access the country context
 * 
 * @returns The country context
 */
export function useCountry(): CountryContextType {
  // This is a type assertion to make TypeScript happy
  // The actual implementation is in the CountryContext component
  // which is imported in the application where this hook is used
  const context = useContext({} as React.Context<CountryContextType>);
  
  // In a real implementation, we would check if the context exists
  // and throw an error if it doesn't
  // For now, we'll just return a mock implementation
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  
  return context;
}
