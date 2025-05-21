import React, { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { Search, Menu, X, MapPin, User, Bell } from 'lucide-react';
import { useCountry } from '../../contexts/CountryContext.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * Navigation component for the main site header
 *
 * @param {Object} props - Component props
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
export const Navigation = memo(function Navigation({ getCountryLink }) {
  const { currentCountry } = useCountry();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Validate required props
  if (typeof getCountryLink !== 'function') {
    console.error('Navigation component missing required getCountryLink function');
    return null;
  }

  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
    // In a real app, this would navigate to search results page
  }, [searchQuery]);

  // Memoize the menu toggle handler
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Memoize the menu close handler
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Navigation links - could be moved to a configuration file in a real app
  const navLinks = [
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/explore', label: 'Explore' },
    { href: '/social', label: 'Social' },
    { href: '/competitions', label: 'Competitions' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Country Selector */}
          <div className="flex items-center">
            <Link href={getCountryLink('/')} className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Bellyfed</span>
              {currentCountry?.flagUrl && (
                <img
                  src={currentCountry.flagUrl}
                  alt={currentCountry.name || 'Country flag'}
                  className="w-6 h-4 ml-2"
                  loading="lazy"
                />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getCountryLink(link.href)}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search, Location, and User */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <label htmlFor="desktop-search" className="sr-only">
                Search restaurants and dishes
              </label>
              <input
                id="desktop-search"
                type="text"
                placeholder="Search restaurants, dishes..."
                className="pl-8 pr-4 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LucideClientIcon
                icon={Search}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                aria-hidden="true"
              />
            </form>
            <button
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Find restaurants near me"
            >
              <LucideClientIcon icon={MapPin} className="w-5 h-5" />
            </button>
            <button
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Notifications"
            >
              <LucideClientIcon icon={Bell} className="w-5 h-5" />
            </button>
            <Link
              href={getCountryLink('/my')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="My profile"
            >
              <LucideClientIcon icon={User} className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <LucideClientIcon icon={X} className="w-6 h-6" aria-hidden="true" />
              ) : (
                <LucideClientIcon icon={Menu} className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t border-gray-200 py-2 px-4"
        >
          <form onSubmit={handleSearch} className="relative mb-4">
            <label htmlFor="mobile-search" className="sr-only">
              Search restaurants and dishes
            </label>
            <input
              id="mobile-search"
              type="text"
              placeholder="Search restaurants, dishes..."
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <LucideClientIcon
              icon={Search}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              aria-hidden="true"
            />
          </form>
          <nav className="flex flex-col space-y-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getCountryLink(link.href)}
                className="text-gray-600 hover:text-blue-600 transition-colors py-1"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={getCountryLink('/my')}
              className="text-gray-600 hover:text-blue-600 transition-colors py-1"
              onClick={closeMenu}
            >
              My Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
});

// Default export for easier imports
export default Navigation;
