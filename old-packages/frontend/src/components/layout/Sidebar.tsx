import React from 'react';
import {
  Home,
  Compass,
  Utensils,
  Trophy,
  User,
  Bookmark,
  Settings,
  Store,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Export the SidebarProps interface
export interface SidebarProps {
  handleTabChange: (tab: string) => void;
  activeTab?: string;
  isSidebarOpen?: boolean;
}

const menuItems = [
  { icon: Home, label: 'Feed', value: 'feed' },
  { icon: Compass, label: 'Explore', value: 'explore' },
  { icon: Utensils, label: 'Restaurants', value: 'restaurants' },
  { icon: Trophy, label: 'Competitions', value: 'competitions' },
  {
    icon: Award,
    label: 'My Foodie Leaderboard',
    value: 'my-foodie-leaderboard',
  },
  { icon: User, label: 'Profile', value: 'profile' },
  { icon: Bookmark, label: 'Saved', value: 'saved' },
  { icon: Settings, label: 'Settings', value: 'settings' },
  {
    icon: Store,
    label: 'Restaurant Management',
    value: 'restaurant-management',
  },
];

// Mobile navigation items (limited to most important items)
const mobileMenuItems = menuItems.slice(0, 5);

export function Sidebar({ handleTabChange }: SidebarProps): React.ReactElement {
  const router = useRouter();
  const { pathname } = router;

  const getActiveTab = (): string => {
    if (pathname === '/') return 'feed';
    return pathname.split('/')[1] || 'feed';
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Desktop Sidebar - adjusted z-index */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-card overflow-y-auto pt-24">
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.value}>
                <Link
                  href={`/${item.value === 'feed' ? '' : item.value}`}
                  className={`flex items-center p-2 rounded-lg ${
                    activeTab === item.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => handleTabChange(item.value)}
                >
                  <item.icon className="w-6 h-6 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation - adjusted z-index */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex justify-around items-center h-16">
          {mobileMenuItems.map((item) => (
            <Link
              key={item.value}
              href={`/${item.value === 'feed' ? '' : item.value}`}
              className={`flex flex-col items-center justify-center flex-1 py-2 ${
                activeTab === item.value
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={() => handleTabChange(item.value)}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
