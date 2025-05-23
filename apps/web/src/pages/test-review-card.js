/**
 * Test ReviewCard Page
 *
 * This page demonstrates the use of the ReviewCard component.
 */

import ReviewCardExample from '../examples/ReviewCardExample.js';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test ReviewCard Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestReviewCardPage() {
  return (
    <TestWrapper>
      <ReviewCardExample />
    </TestWrapper>
  );
}
