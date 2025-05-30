/**
 * Homepage Navigation Component
 *
 * Migrated from old-packages to match the visual design and functionality.
 * Provides clean navigation with proper routing and authentication state.
 *
 * Features:
 * - Responsive navigation menu
 * - User authentication state
 * - Dynamic menu items based on user role
 * - Country-specific routing
 * - Mobile-friendly design
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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

function Navigation({ getCountryLink }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Mock authentication state - replace with actual auth context
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const navigationItems = [
    {
      href: getCountryLink('/restaurants'),
      icon: Utensils,
      label: 'Restaurants',
    },
    { href: getCountryLink('/explore'), icon: Search, label: 'Explore' },
    { href: getCountryLink('/social'), icon: MessageSquare, label: 'Social' },
    { href: getCountryLink('/ranking'), icon: Trophy, label: 'Ranking' },
    {
      href: getCountryLink('/my-foodie-leaderboard'),
      icon: Trophy,
      label: 'My Leaderboard',
    },
    { href: getCountryLink('/favorites'), icon: Heart, label: 'Favorites' },
    { href: getCountryLink('/profile'), icon: User, label: 'Profile' },
    {
      href: getCountryLink('/ai-center'),
      icon: MessageSquare,
      label: 'AI Center',
    },
    // Only show the Admin button if the user is an admin
    // Use absolute path for admin to bypass country code routing
    ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-center items-center h-16">
          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${
                      router.pathname === item.href
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-orange-600 hover:bg-orange-50 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium
                    ${
                      router.pathname === item.href
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
