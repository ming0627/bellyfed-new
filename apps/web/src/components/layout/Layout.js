import React from 'react';
import Head from 'next/head';
import Header from './Header.js';
import Footer from './Footer.js';

/**
 * Layout component that wraps all pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @returns {JSX.Element} Layout component
 */
export default function Layout({ 
  children, 
  title = 'Bellyfed - Discover Great Food', 
  description = 'Discover and share great food experiences with Bellyfed'
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
}
