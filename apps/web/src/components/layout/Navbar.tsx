import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Search, Menu, X, Sun, Moon, MapPin, Compass, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleTheme = () => {
    // Use resolvedTheme instead of theme to get the actual applied theme
    const currentTheme = resolvedTheme || theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  // Check if the current route matches
  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-md'
          : 'bg-white dark:bg-neutral-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Bellyfed
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive('/')
                    ? 'border-primary-500 text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300'
                }`}
              >
                <Home className="w-4 h-4 mr-1.5" />
                Home
              </Link>

              <Link
                href="/restaurants"
                className={`inline-flex items-center px-1 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive('/restaurants')
                    ? 'border-primary-500 text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300'
                }`}
              >
                <MapPin className="w-4 h-4 mr-1.5" />
                Restaurants
              </Link>

              <Link
                href="/explore"
                className={`inline-flex items-center px-1 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive('/explore')
                    ? 'border-primary-500 text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300'
                }`}
              >
                <Compass className="w-4 h-4 mr-1.5" />
                Explore
                <Badge variant="new" size="xs" className="ml-2">New</Badge>
              </Link>

              <Link
                href="/social"
                className={`inline-flex items-center px-1 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActive('/social')
                    ? 'border-primary-500 text-primary-700 dark:text-primary-400'
                    : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300'
                }`}
              >
                <Users className="w-4 h-4 mr-1.5" />
                Social
              </Link>
            </div>
          </div>

          {/* Desktop Right Side - Search, Theme Toggle, Auth */}
          <div className="hidden md:flex items-center space-x-5">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search restaurants, dishes..."
                className="pl-10 pr-4 py-2 w-64 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            </form>

            <Button
              variant="ghost"
              size="icon.sm"
              shape="rounded"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {mounted && (resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </Button>

            <div className="flex items-center space-x-3">
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-medium"
                  withRipple
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon.sm"
              shape="rounded"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-neutral-600 dark:text-neutral-400"
            >
              {mounted && (resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </Button>

            <Button
              variant="ghost"
              size="icon.sm"
              shape="rounded"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-neutral-600 dark:text-neutral-400"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Animated Slide Down */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-5 space-y-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search restaurants, dishes..."
              className="pl-10 pr-4 py-2.5 w-full bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          </form>

          <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
            <Link
              href="/"
              className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>

            <Link
              href="/restaurants"
              className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/restaurants')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <MapPin className="w-5 h-5 mr-3" />
              Restaurants
            </Link>

            <Link
              href="/explore"
              className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/explore')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Compass className="w-5 h-5 mr-3" />
              Explore
              <Badge variant="new" size="xs" className="ml-2">New</Badge>
            </Link>

            <Link
              href="/social"
              className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                isActive('/social')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-5 h-5 mr-3" />
              Social
            </Link>
          </nav>

          <div className="pt-5 border-t border-neutral-200 dark:border-neutral-700 flex flex-col space-y-3">
            <Link href="/signin" className="w-full">
              <Button
                variant="outline"
                width="full"
                className="py-2.5"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button
                variant="primary"
                width="full"
                className="py-2.5"
                withRipple
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
