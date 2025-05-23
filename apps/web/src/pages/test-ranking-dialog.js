/**
 * Test RankingDialog Page
 *
 * This page demonstrates the use of the RankingDialog component.
 */

import RankingDialogExample from '../examples/RankingDialogExample.js';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test RankingDialog Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestRankingDialogPage() {
  return (
    <TestWrapper>
      <RankingDialogExample />
    </TestWrapper>
  );
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
