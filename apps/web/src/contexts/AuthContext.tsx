import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/router';
import { useCountry } from './CountryContext.js';
import cognitoAuthService from '../services/cognitoAuthService.js';
import { 
  AuthContextType, 
  AuthProviderProps, 
  SignInCredentials, 
  User,
  mapAuthStatusToUser
} from '../types/auth';

// Create a default context value to avoid undefined checks
const defaultContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  signIn: () => Promise.resolve(false),
  signOut: () => Promise.resolve(false),
  isLoading: true,
  checkUser: () => Promise.resolve(),
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

/**
 * AuthProvider component for managing authentication state
 *
 * @param props - Component props
 * @returns Rendered component
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to generate country-specific links
  const getCountryLink = useCallback((path: string): string => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);

  // Check authentication status
  const checkUser = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const authStatusResponse = await cognitoAuthService.getAuthStatus();
      
      if (authStatusResponse.isAuthenticated && authStatusResponse.user) {
        setIsAuthenticated(true);
        setUser(mapAuthStatusToUser(authStatusResponse));
      } else {
        // Try to refresh tokens if not authenticated
        const refreshed = await cognitoAuthService.refreshTokens();
        
        if (refreshed) {
          // Check status again after refresh
          const refreshedStatusResponse = await cognitoAuthService.getAuthStatus();
            
          if (refreshedStatusResponse.isAuthenticated && refreshedStatusResponse.user) {
            setIsAuthenticated(true);
            setUser(mapAuthStatusToUser(refreshedStatusResponse));
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Handle sign in
  const signIn = useCallback(async (credentials: SignInCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call Cognito authentication service
      await cognitoAuthService.signIn(credentials.email, credentials.password);
      
      // Refresh user data
      await checkUser();
      
      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkUser]);

  // Handle sign out
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call Cognito authentication service
      await cognitoAuthService.signOut();
      
      // Reset authentication state
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to home page
      router.push(getCountryLink('/'));
      
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, getCountryLink]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo((): AuthContextType => {
    return {
      isAuthenticated,
      user,
      signIn,
      signOut,
      isLoading,
      checkUser,
    };
  }, [isAuthenticated, user, signIn, signOut, isLoading, checkUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 *
 * @returns Auth context value
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
