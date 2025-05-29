import AuthStateManager from '@/components/AuthStateManager';
import { PageLayout } from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import HydrationErrorBoundary from '@/components/ui/hydration-error-boundary';
import SuspenseBoundaryFix from '@/components/ui/suspense-boundary-fix';
import { AuthProvider } from '@/contexts/AuthContext';
import { CountryProvider } from '@/contexts/CountryContext';
// Import all global styles directly
import '@/styles/calendar.css';
import '@/styles/environment-simple.css';
import '@/styles/globals.css';
import '@/styles/svg-fix.css';
import { setupEnvironment } from '@/utils/environmentHandler';
import { applyHydrationFix } from '@/utils/hydration-fix';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

// We've removed the SafeHydrate component as it's redundant with HydrationErrorBoundary
// The client-rendered class is now added in the applyHydrationFix function

// Public pages that don't require authentication
const publicPages = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/[country]', // Home page is public
  '/', // Root page is public (redirects to /[country])
];

// Create a client with more conservative settings for static export
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: false, // Don't refetch on mount for static export
      refetchOnWindowFocus: false, // Don't refetch on window focus for static export
      refetchOnReconnect: false, // Don't refetch on reconnect for static export
      retry: 0, // Don't retry for static export
      // Prevent queries from running during SSR/static export
      enabled: typeof window !== 'undefined',
    },
  },
});

function App({ Component, pageProps, router }: AppProps): JSX.Element {
  const isDevelopment = process.env.APP_ENV === 'development';
  // Define window with IS_STATIC_EXPORT property
  interface ExtendedWindow extends Window {
    IS_STATIC_EXPORT?: boolean;
  }

  const isStaticExport =
    typeof window !== 'undefined' &&
    ((window as ExtendedWindow).IS_STATIC_EXPORT || false);

  // Set up environment and apply hydration fix once at startup
  useEffect(() => {
    // Set up environment
    setupEnvironment();

    // Apply hydration fix
    if (typeof window !== 'undefined') {
      try {
        applyHydrationFix();
        console.log('Hydration fix applied successfully');

        // Server-side authentication is now used, no need for client-side diagnostics
      } catch (error) {
        console.error('Error applying hydration fix:', error);
      }
    }
  }, []);

  // Determine if we should protect the route
  const shouldProtectRoute =
    !publicPages.includes(router.pathname) && !isDevelopment && !isStaticExport;

  // Removed Amplify initialization code

  // Handle localStorage errors in static export
  useEffect(() => {
    if (typeof window !== 'undefined' && isStaticExport) {
      // Prevent localStorage errors during static export
      try {
        // Test localStorage access
        localStorage.getItem('test');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn('localStorage not available, using polyfill');
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: function (): string | null {
              return null;
            },
            setItem: function (): void {},
            removeItem: function (): void {},
          },
          writable: true,
        });
      }
    }
  }, [isStaticExport]);

  // Apply simple hydration fix that works in all environments
  useEffect(() => {
    // Apply the global hydration fix
    applyHydrationFix();
  }, []);

  // Simple fallback that won't cause hydration issues
  const Fallback = () => (
    <div className="min-h-screen bg-white" suppressHydrationWarning></div>
  );

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="description"
          content="BellyFed - Your Food Discovery Platform"
        />
        <title>BellyFed</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthStateManager>
            <CountryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {/* Enhanced error boundary with SuspenseBoundaryFix for hydration errors */}
                <HydrationErrorBoundary>
                  <SuspenseBoundaryFix fallback={<Fallback />}>
                    <div suppressHydrationWarning>
                      <PageLayout>
                        {shouldProtectRoute ? (
                          <ProtectedRoute>
                            <Component {...pageProps} />
                          </ProtectedRoute>
                        ) : (
                          <Component {...pageProps} />
                        )}
                      </PageLayout>
                    </div>
                  </SuspenseBoundaryFix>
                </HydrationErrorBoundary>
              </ThemeProvider>
            </CountryProvider>
          </AuthStateManager>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
