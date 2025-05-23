/**
 * Test RankingsTab Page
 *
 * This page demonstrates the use of the RankingsTab component.
 */

import RankingsTabExample from '../examples/RankingsTabExample.js';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test RankingsTab Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestRankingsTabPage() {
  return (
    <TestWrapper>
      <RankingsTabExample />
    </TestWrapper>
  );
}
