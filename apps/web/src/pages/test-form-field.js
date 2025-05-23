/**
 * Test FormField Page
 * 
 * This page demonstrates the use of the FormField component.
 */

import FormFieldExample from '../examples/FormFieldExample.js';

/**
 * Test FormField Page component
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function TestFormFieldPage() {
  return <FormFieldExample />;
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
