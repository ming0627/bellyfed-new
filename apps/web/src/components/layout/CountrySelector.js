import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronDown, Check } from 'lucide-react';
import { useCountry } from '../../contexts/index.js';
import { getCountryLink } from '../../utils/routing.js';

/**
 * Country selector dropdown component
 *
 * @returns {JSX.Element} CountrySelector component
 */
export default function CountrySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentCountry, countries, setCountry } = useCountry();
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle country selection
  const handleSelectCountry = (countryCode) => {
    setCountry(countryCode);
    setIsOpen(false);

    // Update URL to include country code
    const { pathname, query, asPath } = router;

    if (pathname.includes('[country]')) {
      // Handle dynamic routes
      const newPath = pathname.replace('[country]', countryCode);
      const newAsPath = asPath.replace(/\/[^\/]+(?=\/)/, `/${countryCode}`);

      router.push({
        pathname: newPath,
        query
      }, newAsPath);
    } else if (pathname === '/') {
      // Handle root path
      router.push(`/${countryCode}`);
    } else if (pathname.startsWith('/[country]')) {
      // Handle nested dynamic routes
      const pathWithoutCountry = pathname.replace(/^\/\[country\]/, '');
      const asPathWithoutCountry = asPath.replace(/^\/[^\/]+/, '');

      router.push({
        pathname: `/[country]${pathWithoutCountry}`,
        query: { ...query, country: countryCode }
      }, `/${countryCode}${asPathWithoutCountry}`);
    } else {
      // Handle other routes - redirect to the same route but with the new country code
      const currentPath = asPath.split('?')[0]; // Remove query params
      const queryString = asPath.includes('?') ? asPath.split('?')[1] : '';

      // Create new path with country code
      const newPath = getCountryLink(currentPath, countryCode);
      const newFullPath = queryString ? `${newPath}?${queryString}` : newPath;

      router.push(newFullPath);
    }
  };

  // If no current country is selected, don't render the selector
  if (!currentCountry) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentCountry.flag}</span>
        <span className="text-sm font-medium">{currentCountry.code.toUpperCase()}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelectCountry(country.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                  currentCountry.code === country.code
                    ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                </div>
                {currentCountry.code === country.code && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
