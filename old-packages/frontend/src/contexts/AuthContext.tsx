import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import cognitoAuthService from '../services/cognitoAuthService';

// Define query keys
const COGNITO_USER_QUERY_KEY = 'cognitoUser';
const USER_PROFILE_QUERY_KEY = 'userProfile';
const USER_FOLLOWERS_QUERY_KEY = 'userFollowers';
const USER_FOLLOWING_QUERY_KEY = 'userFollowing';

type User = {
  id: string;
  username: string;
  email?: string;
  name?: string;
  location?: string;
  bio?: string;
  stats?: {
    reviews: number;
    followers: number;
    following: number;
    cities: number;
  };
} | null;

type AuthContextType = {
  user: User;
  signOut: () => Promise<void>;
  updateUser: (username: string) => void;
  updateUserProfile: (userData: Partial<User>) => Promise<User | null>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  checkUser: () => Promise<void>;
  resendVerificationCode: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Add a new function to refresh tokens using the server-side API
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh tokens...');

      // If we're in development, check for visible cookies
      if (process.env.NODE_ENV === 'development') {
        // This only checks for non-HttpOnly cookies, which won't include our auth cookies
        // but it's useful for debugging in development
        const cookies = document.cookie
          .split(';')
          .map((cookie) => cookie.trim());
        const hasCookies = {
          refreshToken: cookies.some((c) => c.startsWith('refresh_token=')),
          accessToken: cookies.some((c) => c.startsWith('access_token=')),
          idToken: cookies.some((c) => c.startsWith('id_token=')),
          authEmail: cookies.some((c) => c.startsWith('auth_email=')),
        };

        if (Object.values(hasCookies).some(Boolean)) {
          console.log('Visible cookies before refresh:', hasCookies);
        }
      }

      // Get CSRF token first to ensure the request is protected
      let csrfToken = '';
      try {
        const csrfResponse = await fetch('/api/csrf', {
          method: 'GET',
          credentials: 'include',
        });

        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.token;
        }
      } catch (csrfError) {
        console.warn('Could not fetch CSRF token:', csrfError);
        // Continue without CSRF token as it's not critical for this endpoint
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
      });

      console.log('Refresh token response status:', response.status);

      // Get the response data regardless of status code
      let data: unknown;
      try {
        data = await response.json();
        console.log('Refresh token response data:', data);
      } catch (parseError) {
        console.error('Error parsing refresh token response:', parseError);
        data = { isAuthenticated: false, message: 'Invalid response format' };
      }

      if (!response.ok) {
        // Type assertion for data
        const errorData = data as { message?: string; code?: string };
        console.error(
          'Token refresh failed with status:',
          response.status,
          'Error:',
          errorData.message || 'Unknown error',
        );

        // Log detailed error information
        if (errorData.code) {
          console.error('Error code:', errorData.code);
        }

        // If refresh fails, clear auth state
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setIsInitialized(true);
        return false;
      }

      // Type assertion for data
      const authData = data as { isAuthenticated?: boolean };
      if (authData.isAuthenticated) {
        console.log('Token refresh successful');

        // No need to update client-side state here since we'll call checkUser() after this
        return true;
      }

      console.warn('Token refresh returned success but not authenticated');
      // Clear auth state since we're not authenticated
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
      return false;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      // Clear auth state on any error
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
      return false;
    }
  }, []);

  const checkUser = useCallback(async () => {
    // Prevent multiple rapid checks (debounce)
    const now = Date.now();
    if (now - lastCheckTime < 1000) {
      console.log('Skipping auth check - too soon since last check');
      return;
    }

    setLastCheckTime(now);
    setIsLoading(true);

    try {
      console.log('Checking user authentication status...');

      // Get auth status from the server - this will also attempt to refresh tokens if needed
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include', // Important to include cookies
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      console.log('Auth status response status:', response.status);

      // Parse the response
      let data: unknown;
      try {
        data = await response.json();
        console.log('Auth status response data:', data);
      } catch (parseError) {
        console.error('Error parsing auth status response:', parseError);
        data = { isAuthenticated: false, message: 'Invalid response format' };
      }

      // Type assertion for data
      const { isAuthenticated: authStatus, user: serverUser } = data as {
        isAuthenticated?: boolean;
        user?: {
          id?: string;
          username?: string;
          email?: string;
          name?: string;
        };
      };

      if (authStatus && serverUser) {
        // User is authenticated and we have their info
        console.log('User is authenticated:', serverUser);
        setUser({
          id: serverUser.id || 'unknown',
          username: serverUser.username || serverUser.email || 'user',
          email: serverUser.email,
          name: serverUser.name,
        });
        setIsAuthenticated(true);
        setIsInitialized(true);
        setIsLoading(false);

        // Invalidate user queries to trigger a refetch
        queryClient.invalidateQueries({ queryKey: [COGNITO_USER_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
        return;
      }

      // If server says not authenticated, try refreshing token once
      if (!authStatus) {
        console.log('User not authenticated, attempting token refresh');

        try {
          const refreshed = await refreshTokens();
          console.log('Token refresh result:', refreshed);

          if (refreshed) {
            // Check status again after refresh
            const refreshResponse = await fetch('/api/auth/status', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
              },
            });

            let refreshData: unknown;
            try {
              refreshData = await refreshResponse.json();
              console.log('Auth status after refresh:', refreshData);
            } catch (parseError) {
              console.error(
                'Error parsing auth status after refresh:',
                parseError,
              );
              refreshData = { isAuthenticated: false };
            }

            // Type assertion for refreshData
            const { isAuthenticated: refreshedStatus, user: refreshedUser } =
              refreshData as {
                isAuthenticated?: boolean;
                user?: {
                  id?: string;
                  username?: string;
                  email?: string;
                  name?: string;
                };
              };

            if (refreshedStatus && refreshedUser) {
              console.log(
                'User authenticated after token refresh:',
                refreshedUser,
              );
              setUser({
                id: refreshedUser.id || 'unknown',
                username:
                  refreshedUser.username || refreshedUser.email || 'user',
                email: refreshedUser.email,
                name: refreshedUser.name,
              });
              setIsAuthenticated(true);
              setIsInitialized(true);
              setIsLoading(false);

              // Invalidate user queries to trigger a refetch
              queryClient.invalidateQueries({
                queryKey: [COGNITO_USER_QUERY_KEY],
              });
              queryClient.invalidateQueries({
                queryKey: [USER_PROFILE_QUERY_KEY],
              });
              return;
            }
          }
        } catch (refreshError) {
          console.error('Error during token refresh:', refreshError);
        }

        // If still not authenticated after refresh, clear state
        console.log('User not authenticated after token refresh');
        setUser(null);
        setIsAuthenticated(false);
        setIsInitialized(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [lastCheckTime, refreshTokens, queryClient]);

  // Initial check on component mount
  useEffect(() => {
    // Check authentication status on initial render
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    // Set up event listener for page visibility changes
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, checking auth state');
        checkUser();
      }
    };

    // Set up event listener for focus changes
    const handleFocus = (): void => {
      console.log('Window focused, checking auth state');
      checkUser();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Set up periodic check for session validity
    const intervalId = setInterval(() => {
      // Only check if the page is visible to avoid unnecessary checks
      if (document.visibilityState === 'visible') {
        checkUser();
      }
    }, 120000); // Check every 2 minutes

    return () => {
      // Clean up event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [checkUser]);

  const signOut = useCallback(async () => {
    try {
      // Call server-side logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      setIsInitialized(true);

      // Clear user data from React Query cache
      queryClient.removeQueries({ queryKey: [COGNITO_USER_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [USER_FOLLOWERS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [USER_FOLLOWING_QUERY_KEY] });

      // Navigate to sign in page
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out: ', error);

      // Still redirect to signin even if there's an error
      router.push('/signin');
    }
  }, [router, queryClient]);

  const updateUser = useCallback(
    async (username: string) => {
      // First set basic user info
      setUser({ id: 'loading', username });
      setIsAuthenticated(true);

      // Then try to fetch complete profile
      try {
        const response = await fetch('/api/proxy/user/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userProfile = await response.json();
          console.log('User profile loaded after update:', userProfile);
          setUser({
            id: userProfile.id,
            username: userProfile.email,
            email: userProfile.email,
            name: userProfile.name,
            location: userProfile.location,
            bio: userProfile.bio,
            stats: userProfile.stats,
          });

          // Invalidate user queries to trigger a refetch
          queryClient.invalidateQueries({ queryKey: [COGNITO_USER_QUERY_KEY] });
          queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
        }
      } catch (error) {
        console.error('Error fetching user profile after update:', error);
        // Keep the basic user info set above
      }
    },
    [queryClient],
  );

  const updateUserProfile = useCallback(
    async (userData: Partial<User>) => {
      try {
        // Call the API to update the user profile
        const response = await fetch('/api/proxy/user/update-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          console.error('Error updating user profile:', response.statusText);
          return null;
        }

        const updatedProfile = await response.json();
        console.log('User profile updated:', updatedProfile);

        // Update the user state with the new profile data
        setUser((prevUser) => {
          if (!prevUser) return updatedProfile;
          return {
            ...prevUser,
            ...updatedProfile,
          };
        });

        // Invalidate user queries to trigger a refetch
        queryClient.invalidateQueries({ queryKey: [COGNITO_USER_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });

        return updatedProfile;
      } catch (error) {
        console.error('Error updating user profile:', error);
        return null;
      }
    },
    [queryClient],
  );

  const resendVerificationCode = useCallback(async (email: string) => {
    try {
      return await cognitoAuthService.resendConfirmationCode(email);
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  }, []);

  // Log authentication state for debugging
  useEffect(() => {
    console.log('Auth Context State:', {
      isAuthenticated,
      isInitialized,
      hasUser: !!user,
    });
  }, [isAuthenticated, isInitialized, user]);

  const contextValue = useMemo(
    () => ({
      user,
      signOut,
      updateUser,
      updateUserProfile,
      isAuthenticated,
      isInitialized,
      isLoading,
      checkUser,
      resendVerificationCode,
    }),
    [
      user,
      signOut,
      updateUser,
      updateUserProfile,
      isAuthenticated,
      isInitialized,
      isLoading,
      checkUser,
      resendVerificationCode,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
