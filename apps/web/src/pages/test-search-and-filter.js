/**
 * Test SearchAndFilter Page
 *
 * This page demonstrates the use of the SearchAndFilter component.
 */

import SearchAndFilterExample from '../examples/SearchAndFilterExample.js';
import TestWrapper from '../components/test/TestWrapper.js';

/**
 * Test SearchAndFilter Page component
 *
 * @returns {JSX.Element} - Rendered component
 */
export default function TestSearchAndFilterPage() {
  return (
    <TestWrapper>
      <SearchAndFilterExample />
    </TestWrapper>
  );
}
