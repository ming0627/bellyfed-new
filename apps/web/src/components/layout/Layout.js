import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from './Header.js';
import Footer from './Footer.js';

/**
 * Layout component that wraps all pages
 * Consolidated from .js and .tsx versions - preserving best features from both.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {boolean} props.withPadding - Whether to add padding to the main content
 * @param {string} props.maxWidth - Maximum width constraint for the content
 * @param {string} props.spacing - Spacing size for the main content
 * @param {boolean} props.withPattern - Whether to add a subtle background pattern
 * @param {boolean} props.withTransition - Whether to add page transition animations
 * @param {Object} props.meta - Additional meta tags
 * @returns {JSX.Element} Layout component
 */
export default function Layout({
  children,
  title = 'Bellyfed - Discover Great Food',
  description = 'Discover and share great food experiences with Bellyfed',
  withPadding = true,
  maxWidth = 'max-w-7xl',
  spacing = 'default',
  withPattern = false,
  withTransition = true,
  meta = {}
}) {
  const router = useRouter();

  // Scroll to top on route change - enhanced from .tsx version
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Determine spacing classes - enhanced from .tsx version
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

  // Determine pattern classes - enhanced from .tsx version
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

        {/* Enhanced meta tags from .tsx version */}
        {meta.keywords && <meta name="keywords" content={meta.keywords} />}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://bellyfed.com${router.asPath}`} />
        <meta property="og:type" content={meta.ogType || 'website'} />
        <meta property="og:image" content={meta.ogImage || 'https://bellyfed.com/og-image.jpg'} />
        <meta name="twitter:card" content={meta.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>

      <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 ${getPatternClasses()}`}>
        <Header />

        <main className={`flex-grow ${withPadding ? getSpacingClasses() : ''} ${withTransition ? 'animate-fade-in' : ''}`}>
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
}
