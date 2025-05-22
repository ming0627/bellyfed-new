import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useRouter } from 'next/router';
import { ChevronDown, Check } from 'lucide-react';
import { useCountry } from '../../contexts/index.js';
import { COUNTRIES } from '../../config/countries.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * CountrySelector component for switching between country versions
 * 
 * @returns {JSX.Element} - Rendered component
 */
const CountrySelector = memo(function CountrySelector() {
  const router = useRouter();
  const { currentCountry, setCountryByCode } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Convert countries object to array for easier mapping
  const countriesArray = Object.values(COUNTRIES);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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
  const handleSelectCountry = useCallback((countryCode) => {
    if (countryCode === currentCountry?.code) {
      setIsOpen(false);
      return;
    }

    // Update country in context
    setCountryByCode(countryCode);
    
    // Update URL to reflect the new country
    const path = router.asPath;
    const newPath = path.replace(/^\/[^\/]+/, `/${countryCode}`);
    
    router.push(newPath);
    setIsOpen(false);
  }, [currentCountry, setCountryByCode, router]);

  // If no current country is set, don't render the selector
  if (!currentCountry) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select country"
      >
        <img
          src={currentCountry.flagUrl}
          alt={currentCountry.name}
          className="w-5 h-3.5 object-cover"
          loading="lazy"
        />
        <span className="text-sm font-medium">{currentCountry.name}</span>
        <LucideClientIcon
          icon={ChevronDown}
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
          <ul
            className="py-1 max-h-60 overflow-auto"
            role="listbox"
            aria-labelledby="country-selector"
            tabIndex={-1}
          >
            {countriesArray.map((country) => (
              <li
                key={country.code}
                role="option"
                aria-selected={country.code === currentCountry.code}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  country.code === currentCountry.code ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleSelectCountry(country.code)}
              >
                <div className="flex items-center">
                  <img
                    src={country.flagUrl}
                    alt={country.name}
                    className="w-5 h-3.5 object-cover mr-3"
                    loading="lazy"
                  />
                  <span className={`block truncate ${
                    country.code === currentCountry.code ? 'font-medium text-orange-500' : 'font-normal text-gray-700 dark:text-gray-200'
                  }`}>
                    {country.name}
                  </span>
                </div>

                {country.code === currentCountry.code && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-500">
                    <LucideClientIcon icon={Check} className="w-4 h-4" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default CountrySelector;
