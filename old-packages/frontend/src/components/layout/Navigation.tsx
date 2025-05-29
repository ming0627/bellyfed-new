import { Button } from '@/components/ui/button';
import {
  Heart,
  Home,
  Menu,
  MessageSquare,
  Search,
  Trophy,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const navigationItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/restaurants', icon: Utensils, label: 'Restaurants' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/social', icon: MessageSquare, label: 'Social' },
  { href: '/rankings', icon: Trophy, label: 'Rankings' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
];

export const Navigation = (): React.ReactElement => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-5 py-3 border-b-2 transition-colors
                  ${
                    isActive
                      ? 'text-orange-600 border-orange-600'
                      : 'text-gray-600 border-transparent hover:text-orange-600 hover:border-orange-600'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-2"
          >
            <span className="font-medium">Menu</span>
            <Menu className="h-5 w-5" />
          </Button>

          {mobileMenuOpen && (
            <div className="border-t">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3
                      ${
                        isActive
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
