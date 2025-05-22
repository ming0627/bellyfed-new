import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /**
   * Whether to add padding to the main content
   * @default true
   */
  withPadding?: boolean;
  /**
   * Maximum width constraint for the content
   * @default 'max-w-7xl'
   */
  maxWidth?: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  /**
   * Spacing size for the main content
   * @default 'default'
   */
  spacing?: 'none' | 'small' | 'default' | 'large';
  /**
   * Whether to add a subtle background pattern
   * @default false
   */
  withPattern?: boolean;
  /**
   * Whether to add page transition animations
   * @default true
   */
  withTransition?: boolean;
  /**
   * Additional meta tags
   */
  meta?: {
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
  };
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Bellyfed',
  description = 'Bellyfed - Discover the best food experiences around you',
  withPadding = true,
  maxWidth = 'max-w-7xl',
  spacing = 'default',
  withPattern = false,
  withTransition = true,
  meta,
}) => {
  const router = useRouter();

  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Determine spacing classes
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none':
        return '';
      case 'small':
        return 'py-4 px-4 sm:px-4 lg:px-6';
      case 'default':
        return 'py-8 px-4 sm:px-6 lg:px-8';
      case 'large':
        return 'py-12 px-4 sm:px-6 lg:px-8';
      default:
        return 'py-8 px-4 sm:px-6 lg:px-8';
    }
  };

  // Determine pattern classes
  const getPatternClasses = () => {
    if (!withPattern) return '';

    return 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]';
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFAE85" />
        <link rel="icon" href="/favicon.ico" />

        {/* Additional meta tags */}
        {meta?.keywords && <meta name="keywords" content={meta.keywords} />}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://bellyfed.com${router.asPath}`}
        />
        <meta property="og:type" content={meta?.ogType || 'website'} />
        <meta
          property="og:image"
          content={meta?.ogImage || 'https://bellyfed.com/og-image.jpg'}
        />
        <meta
          name="twitter:card"
          content={meta?.twitterCard || 'summary_large_image'}
        />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>

      <div
        className={`flex flex-col min-h-screen bg-neutral-background dark:bg-neutral-900 ${getPatternClasses()}`}
      >
        <Navbar />

        <main
          className={`flex-grow ${withPadding ? getSpacingClasses() : ''} ${withTransition ? 'animate-fade-in' : ''}`}
        >
          {withPadding ? (
            <div className={`${maxWidth} mx-auto`}>{children}</div>
          ) : (
            children
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;
