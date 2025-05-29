import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { AnalyticsProvider } from '../analytics';

interface PageLayoutProps {
  children: React.ReactNode;
  handleTabChange?: (tab: string) => void;
  activeTab?: string;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  handleTabChange = () => {},
  activeTab = '',
  searchTerm: propSearchTerm = '',
  setSearchTerm: propSetSearchTerm,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const router = useRouter();
  // We need auth context but don't use it directly
  useAuth();

  const searchTerm = propSearchTerm ?? localSearchTerm;
  const setSearchTerm = propSetSearchTerm ?? setLocalSearchTerm;

  const isAuthPage =
    router.pathname === '/signin' || router.pathname === '/signup';

  // Get authentication state and loading state
  const { isAuthenticated, isInitialized } = useAuth();

  // Log for debugging
  console.log('PageLayout Auth State:', {
    isAuthPage,
    isAuthenticated,
    isInitialized,
  });

  // Determine if we should show sign in/sign up buttons
  const showAuthButtons = !isAuthPage && isInitialized && !isAuthenticated;

  // Log for debugging
  console.log('Should show auth buttons:', showAuthButtons);

  const headerContent = useMemo(
    () => (
      <div className="flex items-center gap-2">
        {showAuthButtons && (
          <>
            <Link href="/signin" passHref>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm md:text-base px-2 sm:px-4"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" passHref>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm md:text-base px-2 sm:px-4"
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    ),
    [showAuthButtons],
  );

  return (
    <AnalyticsProvider trackPageViews={!isAuthPage}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {!isAuthPage && (
          <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
            <Header
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm || (() => {})}
            >
              {headerContent}
            </Header>
          </header>
        )}

        <div className={`flex-1 ${!isAuthPage ? 'pt-16' : ''}`}>
          <main className="minimalist-container content-buffer">
            {children}
          </main>
        </div>

        {!isAuthPage && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
            <MobileNavigation
              handleTabChange={handleTabChange}
              activeTab={activeTab}
            />
          </div>
        )}
      </div>
    </AnalyticsProvider>
  );
};
