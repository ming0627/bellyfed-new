/**
 * Homepage Navigation Component
 *
 * Enhanced navigation for food review app with modern design
 * Features logo, search, user profile, and food-centric navigation
 */

import {
  Heart,
  Menu,
  MessageSquare,
  Search,
  Trophy,
  User,
  Utensils,
  X,
  Shield,
  LogOut,
  Settings,
  BookOpen,
  Camera,
  Bell,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

function Navigation({ getCountryLink }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const profileRef = useRef(null);

  // Mock authentication state - replace with actual auth context
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&fit=crop',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the user is an admin - simplified for migration
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/status');
        setIsAdmin(response.ok);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    {
      href: getCountryLink('/explore'),
      icon: Search,
      label: 'Discover',
      description: 'Find new places',
    },
    {
      href: getCountryLink('/restaurants'),
      icon: Utensils,
      label: 'Restaurants',
      description: 'Browse all',
    },
    {
      href: getCountryLink('/ranking'),
      icon: Trophy,
      label: 'Top Rated',
      description: 'Best of the best',
    },
    {
      href: getCountryLink('/social'),
      icon: MessageSquare,
      label: 'Community',
      description: 'Connect & share',
    },
  ];

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        getCountryLink(`/search?q=${encodeURIComponent(searchQuery)}`),
      );
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              href={getCountryLink('/')}
              className="flex items-center space-x-2"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Bellyfed</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${
                      router.pathname === item.href
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                >
                  <Icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Write Review Button */}
            {isAuthenticated && (
              <Link
                href={getCountryLink('/write-review')}
                className="hidden md:flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Write Review</span>
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <button className="relative p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                <Bell className="w-5 h-5" />
                {hasNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            )}

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                      href={getCountryLink('/profile')}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href={getCountryLink('/favorites')}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="w-4 h-4" />
                      <span>My Favorites</span>
                    </Link>

                    <Link
                      href={getCountryLink('/my-reviews')}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>My Reviews</span>
                    </Link>

                    <Link
                      href={getCountryLink('/settings')}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-gray-100">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={getCountryLink('/login')}
                className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 shadow-lg">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search restaurants, dishes, or cuisines..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium
                    ${
                      router.pathname === item.href
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <span className="block">{item.label}</span>
                    <span className="text-xs text-gray-500">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}

            {isAuthenticated && (
              <Link
                href={getCountryLink('/write-review')}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-orange-500 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Camera className="w-5 h-5" />
                <span>Write Review</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
