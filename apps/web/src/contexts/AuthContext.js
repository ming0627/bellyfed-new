import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the user object
// User: { id: string, email: string, name: string, role: string }

// Define the shape of the auth context
// AuthContextType: {
//   user: User | null,
//   isAuthenticated: boolean,
//   isLoading: boolean,
//   login: (email, password) => Promise<void>,
//   logout: () => Promise<void>,
//   signup: (email, password, name) => Promise<void>
// }

// Create the context with a default value
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
});

// Mock user for development
const mockUser = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  role: 'user',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, this would check with your auth service
        // For now, we'll simulate a delay and set a mock user
        await new Promise(resolve => setTimeout(resolve, 500));

        // For development, always set the mock user
        // In production, this would check localStorage, cookies, or an API
        setUser(mockUser);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // In a real app, this would call your auth service
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call your auth service
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email, password, name) => {
    setIsLoading(true);
    try {
      // In a real app, this would call your auth service
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({
        ...mockUser,
        email,
        name,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;