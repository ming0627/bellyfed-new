import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from './Header.js';
import Footer from './Footer.js';
import { useCountry } from '../../contexts/index.js';

/**
 * Main layout component that wraps all pages
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description for SEO
 * @param {boolean} props.hideHeader - Whether to hide the header
 * @param {boolean} props.hideFooter - Whether to hide the footer
 * @param {string} props.headerVariant - Header variant (default, transparent, etc.)
 * @returns {JSX.Element} - Rendered component
 */
export default function Layout({
  children,
  title = 'Bellyfed - Discover Food',
  description = 'Discover the best food experiences around you',
  hideHeader = false,
  hideFooter = false,
  headerVariant = 'default',
}) {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();

  // Generate country-specific title if available
  const pageTitle = isInitialized && currentCountry?.name
    ? `${title} | ${currentCountry.name}`
    : title;

  // Generate country-specific description if available
  const pageDescription = isInitialized && currentCountry?.name
    ? `${description} in ${currentCountry.name}`
    : description;

  // Function to generate country-specific links
  const getCountryLink = (path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content="Bellyfed" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      {!hideHeader && (
        <Header variant={headerVariant} getCountryLink={getCountryLink} />
      )}

      <main className="flex-grow w-full">
        {children}
      </main>

      {!hideFooter && <Footer getCountryLink={getCountryLink} />}
    </div>
  );
}
