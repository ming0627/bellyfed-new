/**
 * Country related type definitions
 */

import { ReactNode } from 'react';

/**
 * Country object representing a supported country
 */
export interface Country {
  /** Country code (e.g., 'sg', 'my', 'id') */
  code: string;
  /** Full country name (e.g., 'Singapore', 'Malaysia', 'Indonesia') */
  name: string;
  /** Country flag emoji */
  flag: string;
  /** Country currency code */
  currency: string;
  /** Country currency symbol */
  currencySymbol: string;
  /** Default language code */
  language: string;
  /** Whether the country is active */
  active: boolean;
}

/**
 * Country context type definition
 */
export interface CountryContextType {
  /** List of all supported countries */
  countries: Country[];
  /** Currently selected country */
  currentCountry: Country | null;
  /** Whether the country context is initialized */
  isInitialized: boolean;
  /** Whether the country data is loading */
  isLoading: boolean;
  /** Set the current country by code */
  setCountryByCode: (code: string) => void;
  /** Get a country-specific link */
  getCountryLink: (path: string) => string;
  /** Validate a country code */
  isValidCountryCode: (code: string) => boolean;
}

/**
 * Props for the CountryProvider component
 */
export interface CountryProviderProps {
  /** Child components */
  children: ReactNode;
  /** Initial country code */
  initialCountryCode?: string;
}

/**
 * Default countries data
 */
export const DEFAULT_COUNTRIES: Country[] = [
  {
    code: 'sg',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    language: 'en',
    active: true,
  },
  {
    code: 'my',
    name: 'Malaysia',
    flag: '🇲🇾',
    currency: 'MYR',
    currencySymbol: 'RM',
    language: 'en',
    active: true,
  },
  {
    code: 'id',
    name: 'Indonesia',
    flag: '🇮🇩',
    currency: 'IDR',
    currencySymbol: 'Rp',
    language: 'id',
    active: true,
  },
  {
    code: 'th',
    name: 'Thailand',
    flag: '🇹🇭',
    currency: 'THB',
    currencySymbol: '฿',
    language: 'th',
    active: true,
  },
  {
    code: 'vn',
    name: 'Vietnam',
    flag: '🇻🇳',
    currency: 'VND',
    currencySymbol: '₫',
    language: 'vi',
    active: true,
  },
  {
    code: 'ph',
    name: 'Philippines',
    flag: '🇵🇭',
    currency: 'PHP',
    currencySymbol: '₱',
    language: 'en',
    active: true,
  },
];
