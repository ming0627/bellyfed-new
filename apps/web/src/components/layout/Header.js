import React, { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Menu, X, MapPin, User, Bell, LogOut, Settings } from 'lucide-react';
import { useCountry, useAuth } from '../../contexts/index.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import ThemeToggle from '../ui/ThemeToggle.js';
import CountrySelector from './CountrySelector.js';

/**
 * Header component for the main site navigation
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Header variant (default, transparent, etc.)
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const Header = memo(function Header({
  variant = 'default',
  getCountryLink
}) {
  const router = useRouter();
  const { currentCountry } = useCountry();
  const { isAuthenticated, user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine header background style based on variant
  const headerBgClass = variant === 'transparent'
    ? 'bg-transparent'
    : 'bg-white dark:bg-gray-900 shadow-sm';

  // Determine text color based on variant
  const textColorClass = variant === 'transparent'
    ? 'text-white'
    : 'text-gray-700 dark:text-gray-200';

  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to search results page
    router.push(getCountryLink(`/search?q=${encodeURIComponent(searchQuery)}`));
  }, [searchQuery, router, getCountryLink]);

  // Memoize the menu toggle handler
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Memoize the user menu toggle handler
  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  // Navigation links - could be moved to a configuration file in a real app
  const navLinks = [
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/explore', label: 'Explore' },
    { href: '/social', label: 'Social' },
    { href: '/competitions', label: 'Competitions' },
  ];

  // Handle sign out
  const handleSignOut = useCallback(() => {
    // Call the auth context to sign out
    signOut().catch(error => {
      console.error('Error signing out:', error);
    });
  }, [signOut]);

  return (
    <header className={`sticky top-0 z-50 ${headerBgClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Country Selector */}
          <div className="flex items-center">
            <Link href={getCountryLink('/')} className="flex items-center">
              <span className={`text-xl font-bold text-orange-500 ${variant === 'transparent' ? 'text-white' : ''}`}>
                Bellyfed
              </span>
              {currentCountry?.flagUrl && (
                <img
                  src={currentCountry.flagUrl}
                  alt={currentCountry.name || 'Country flag'}
                  className="w-6 h-4 ml-2"
                  loading="lazy"
                />
              )}
            </Link>
            <div className="ml-4">
              <CountrySelector />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getCountryLink(link.href)}
                className={`${textColorClass} hover:text-orange-500 transition-colors`}
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
                className="pl-8 pr-4 py-1 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-48 lg:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LucideClientIcon
                icon={Search}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4"
                aria-hidden="true"
              />
            </form>

            <button
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
              aria-label="Find restaurants near me"
            >
              <LucideClientIcon icon={MapPin} className="w-5 h-5" />
            </button>

            <button
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
              aria-label="Notifications"
            >
              <LucideClientIcon icon={Bell} className="w-5 h-5" />
            </button>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={`${textColorClass} hover:text-orange-500 transition-colors rounded-full overflow-hidden`}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <LucideClientIcon icon={User} className="w-5 h-5" />
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                    <Link
                      href={getCountryLink('/profile')}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <LucideClientIcon icon={User} className="w-4 h-4 mr-2" />
                        Profile
                      </div>
                    </Link>
                    <Link
                      href={getCountryLink('/settings')}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <LucideClientIcon icon={Settings} className="w-4 h-4 mr-2" />
                        Settings
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <LucideClientIcon icon={LogOut} className="w-4 h-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={getCountryLink('/signin')}
                className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
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
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 px-4"
        >
          <form onSubmit={handleSearch} className="relative mb-4">
            <label htmlFor="mobile-search" className="sr-only">
              Search restaurants and dishes
            </label>
            <input
              id="mobile-search"
              type="text"
              placeholder="Search restaurants, dishes..."
              className="pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <LucideClientIcon
              icon={Search}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4"
              aria-hidden="true"
            />
          </form>

          <nav className="flex flex-col space-y-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getCountryLink(link.href)}
                className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <Link
                href={getCountryLink('/signin')}
                className="w-full py-2 mt-2 text-center rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}

            {isAuthenticated && (
              <>
                <Link
                  href={getCountryLink('/profile')}
                  className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href={getCountryLink('/settings')}
                  className="text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
});

export default Header;
