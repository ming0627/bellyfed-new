/**
 * Test ReviewsTab Page
 *
 * This page demonstrates the use of the ReviewsTab component.
 */

import ReviewsTabExample from '../examples/ReviewsTabExample.js';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test ReviewsTab Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestReviewsTabPage() {
  return (
    <TestWrapper>
      <ReviewsTabExample />
    </TestWrapper>
  );
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
