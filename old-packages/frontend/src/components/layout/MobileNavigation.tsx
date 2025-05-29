import React from 'react';
import { Home, Compass, Utensils, Trophy, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  handleTabChange: (tab: string) => void;
  activeTab?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  handleTabChange,
}) => {
  const router = useRouter();
  const { pathname } = router;

  const getActiveTab = (): string => {
    if (pathname === '/') return 'feed';
    return pathname.split('/')[1] || 'feed';
  };

  const activeTab = getActiveTab();

  const navigationItems = [
    { icon: Home, label: 'Feed', value: 'feed' },
    { icon: Compass, label: 'Explore', value: 'explore' },
    { icon: Utensils, label: 'Restaurants', value: 'restaurants' },
    { icon: Trophy, label: 'Competitions', value: 'competitions' },
    {
      icon: Award,
      label: 'My Foodie Leaderboard',
      value: 'my-foodie-leaderboard',
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex justify-around items-center h-16">
        {navigationItems.map(({ icon: Icon, label, value }) => (
          <Link
            key={value}
            href={`/${value === 'feed' ? '' : value}`}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2',
              activeTab === value ? 'text-primary' : 'text-muted-foreground',
            )}
            onClick={() => handleTabChange(value)}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
