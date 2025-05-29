import { ReactNode, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';

/**
 * AuthStateManager - Component to help maintain authentication state during page transitions
 *
 * This component handles:
 * 1. Early detection of authentication state across page refreshes
 * 2. Proactive token refresh when needed
 * 3. Server-side authentication state management
 */
// Define props interface for better type checking
interface AuthStateManagerProps {
  children: ReactNode;
}

export const AuthStateManager: React.FC<AuthStateManagerProps> = ({
  children,
}) => {
  const { checkUser } = useAuth();

  // Check auth state on page load and focus
  useEffect(() => {
    // Check auth state on component mount
    checkUser();

    // Set up event listeners for page visibility and focus changes
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        checkUser();
      }
    };

    const handleFocus = (): void => {
      checkUser();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Clean up event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkUser]);

  // Set up periodic check for session validity
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Only check if the page is visible to avoid unnecessary checks
      if (document.visibilityState === 'visible') {
        checkUser();
      }
    }, 120000); // Check every 2 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [checkUser]);

  // Return children
  return <>{children}</>;
};

// Remove PropTypes validation as it's not needed with TypeScript
// TypeScript already provides type checking through the interface

export default AuthStateManager;
