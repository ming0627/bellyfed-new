import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, MapPin, User, Bell } from 'lucide-react';
import { useCountry } from '../../contexts/CountryContext.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';

interface NavigationProps {
  getCountryLink: (path: string) => string;
}

export function Navigation({ getCountryLink }: NavigationProps): JSX.Element {
  const { currentCountry } = useCountry();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Country Selector */}
          <div className="flex items-center">
            <Link href={getCountryLink('/')} className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Bellyfed</span>
              <img
                src={currentCountry.flagUrl}
                alt={currentCountry.name}
                className="w-6 h-4 ml-2"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href={getCountryLink('/restaurants')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Restaurants
            </Link>
            <Link
              href={getCountryLink('/explore')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Explore
            </Link>
            <Link
              href={getCountryLink('/social')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Social
            </Link>
            <Link
              href={getCountryLink('/competitions')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Competitions
            </Link>
          </nav>

          {/* Search, Location, and User */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search restaurants, dishes..."
                className="pl-8 pr-4 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LucideClientIcon
                icon={Search}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              />
            </form>
            <button className="text-gray-600 hover:text-blue-600 transition-colors">
              <LucideClientIcon icon={MapPin} className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-blue-600 transition-colors">
              <LucideClientIcon icon={Bell} className="w-5 h-5" />
            </button>
            <Link
              href={getCountryLink('/my')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <LucideClientIcon icon={User} className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <LucideClientIcon icon={X} className="w-6 h-6" />
              ) : (
                <LucideClientIcon icon={Menu} className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search restaurants, dishes..."
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <LucideClientIcon
              icon={Search}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
          </form>
          <nav className="flex flex-col space-y-3">
            <Link
              href={getCountryLink('/restaurants')}
              className="text-gray-600 hover:text-blue-600 transition-colors py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Restaurants
            </Link>
            <Link
              href={getCountryLink('/explore')}
              className="text-gray-600 hover:text-blue-600 transition-colors py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href={getCountryLink('/social')}
              className="text-gray-600 hover:text-blue-600 transition-colors py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Social
            </Link>
            <Link
              href={getCountryLink('/competitions')}
              className="text-gray-600 hover:text-blue-600 transition-colors py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Competitions
            </Link>
            <Link
              href={getCountryLink('/my')}
              className="text-gray-600 hover:text-blue-600 transition-colors py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              My Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
