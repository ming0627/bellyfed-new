import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, User, Search, LogIn } from 'lucide-react';
import { useAuth, useCountry } from '../../contexts/index.js';
import CountrySelector from './CountrySelector.js';
import ThemeToggle from '../ui/ThemeToggle.js';
import { getCountryLink, isRouteActive } from '../../utils/routing.js';

/**
 * Header component with navigation
 *
 * @returns {JSX.Element} Header component
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { currentCountry } = useCountry();
  const router = useRouter();

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Check if the current route is active
  const isActive = (path) => {
    return isRouteActive(path, router.pathname);
  };

  // Generate country-specific link
  const createCountryLink = (path) => {
    return getCountryLink(path, currentCountry?.code);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={currentCountry ? `/${currentCountry.code}` : "/"} className="flex items-center">
              <span className="text-xl font-bold text-orange-500">Bellyfed</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href={createCountryLink('/explore')}
              className={`text-sm font-medium ${
                isActive('/explore')
                  ? 'text-orange-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'
              }`}
            >
              Explore
            </Link>
            <Link
              href={createCountryLink('/restaurants')}
              className={`text-sm font-medium ${
                isActive('/restaurants')
                  ? 'text-orange-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'
              }`}
            >
              Restaurants
            </Link>
            <Link
              href={createCountryLink('/social')}
              className={`text-sm font-medium ${
                isActive('/social')
                  ? 'text-orange-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'
              }`}
            >
              Social
            </Link>
            <Link
              href={createCountryLink('/competitions')}
              className={`text-sm font-medium ${
                isActive('/competitions')
                  ? 'text-orange-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'
              }`}
            >
              Competitions
            </Link>
          </nav>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-700"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <CountrySelector />

            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                href={createCountryLink('/profile')}
                className="p-2 rounded-full text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-700"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href={createCountryLink('/signin')}
                className="flex items-center px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />

            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-700"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href={createCountryLink('/explore')}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/explore')
                  ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              Explore
            </Link>
            <Link
              href={createCountryLink('/restaurants')}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/restaurants')
                  ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              Restaurants
            </Link>
            <Link
              href={createCountryLink('/social')}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/social')
                  ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              Social
            </Link>
            <Link
              href={createCountryLink('/competitions')}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/competitions')
                  ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={closeMenu}
            >
              Competitions
            </Link>

            <div className="px-3 py-2">
              <CountrySelector />
            </div>

            <div className="px-3 py-2">
              {isAuthenticated ? (
                <Link
                  href={createCountryLink('/profile')}
                  className="flex items-center px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  onClick={closeMenu}
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>My Profile</span>
                </Link>
              ) : (
                <Link
                  href={createCountryLink('/signin')}
                  className="flex items-center px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  onClick={closeMenu}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
