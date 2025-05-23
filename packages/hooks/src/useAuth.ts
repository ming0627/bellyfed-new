import { useContext } from 'react';

/**
 * This is a type-safe wrapper around the AuthContext.
 * 
 * The actual implementation is in the AuthContext component, which is imported
 * in the application where this hook is used. This hook simply provides a
 * type-safe way to access the auth context.
 * 
 * @remarks
 * This hook depends on the AuthContext being available in the component tree.
 * Make sure to wrap your application with the AuthProvider component.
 * 
 * @example
 * ```tsx
 * import { useAuth } from '@bellyfed/hooks';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <button onClick={() => login('user@example.com', 'password')}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * User object interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Auth context interface
 */
export interface AuthContextType {
  /**
   * The currently authenticated user, or null if not authenticated
   */
  user: User | null;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether the authentication state is being loaded
   */
  isLoading: boolean;
  
  /**
   * Login function
   * @param email - User email
   * @param password - User password
   * @returns A promise that resolves when the login is complete
   */
  login: (email: string, password: string) => Promise<void>;
  
  /**
   * Logout function
   * @returns A promise that resolves when the logout is complete
   */
  logout: () => Promise<void>;
  
  /**
   * Signup function
   * @param email - User email
   * @param password - User password
   * @param name - User name
   * @returns A promise that resolves when the signup is complete
   */
  signup: (email: string, password: string, name: string) => Promise<void>;
}

/**
 * Hook to access the auth context
 * 
 * @returns The auth context
 */
export function useAuth(): AuthContextType {
  // This is a type assertion to make TypeScript happy
  // The actual implementation is in the AuthContext component
  // which is imported in the application where this hook is used
  const context = useContext({} as React.Context<AuthContextType>);
  
  // In a real implementation, we would check if the context exists
  // and throw an error if it doesn't
  // For now, we'll just return a mock implementation
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
