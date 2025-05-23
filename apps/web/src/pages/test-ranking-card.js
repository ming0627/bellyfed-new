/**
 * Test RankingCard Page
 * 
 * This page demonstrates the use of the RankingCard component.
 */

import RankingCardExample from '../examples/RankingCardExample.js';

/**
 * Test RankingCard Page component
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function TestRankingCardPage() {
  return <RankingCardExample />;
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
