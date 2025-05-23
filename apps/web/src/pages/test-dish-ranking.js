/**
 * Test DishRanking Page
 *
 * This page demonstrates the use of the DishRanking component.
 */

import DishRankingExample from '../examples/DishRankingExample.js';

/**
 * Test DishRanking Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestDishRankingPage() {
  return <DishRankingExample />;
}

// Force client-side rendering to avoid SSR issues with auth context
export async function getServerSideProps() {
  return {
    props: {},
  };
}
