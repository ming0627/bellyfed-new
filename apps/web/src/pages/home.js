import React from 'react';
import { useCountry } from '../contexts/CountryContext.js';
import Layout from '../components/layout/Layout.js';
import { Homepage } from '../components/homepage.js';

/**
 * HomePage component that wraps the Homepage component with the Layout
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function HomePage() {
  const { currentCountry } = useCountry();

  return (
    <Layout
      title={`Discover Food${currentCountry?.name ? ` in ${currentCountry.name}` : ''}`}
      description={`Discover the best food experiences ${currentCountry?.name ? `in ${currentCountry.name}` : 'around you'}`}
    >
      <Homepage />
    </Layout>
  );
}
