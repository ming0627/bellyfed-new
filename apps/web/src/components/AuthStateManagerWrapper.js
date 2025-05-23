/**
 * AuthStateManagerWrapper Component
 * 
 * This component wraps the AuthStateManager component and provides it with the necessary context.
 * It's designed to be used in the _app.tsx file to ensure the AuthStateManager is available
 * throughout the application.
 */

import { memo } from 'react';
import AuthStateManager from './AuthStateManager.js';

/**
 * AuthStateManagerWrapper component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} - Rendered component
 */
const AuthStateManagerWrapper = memo(function AuthStateManagerWrapper({ children }) {
  return (
    <>
      <AuthStateManager />
      {children}
    </>
  );
});

export default AuthStateManagerWrapper;
