/**
 * Test RestaurantList Page
 *
 * This page demonstrates the use of the RestaurantList component.
 */

import RestaurantListExample from '../examples/RestaurantListExample.js';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test RestaurantList Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestRestaurantListPage() {
  return (
    <TestWrapper>
      <RestaurantListExample />
    </TestWrapper>
  );
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
