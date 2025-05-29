import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';

// Define the query key for user data
export const COGNITO_USER_QUERY_KEY = 'cognitoUser';

// Define the user data type
export interface CognitoUserData {
  id: string;
  username: string;
  email: string;
  name?: string;
  nickname?: string;
  location?: string;
  bio?: string;
  phone?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  preferences?: Record<string, unknown>;
  interests?: string[];
  stats?: {
    reviews: number;
    followers: number;
    following: number;
    cities: number;
  };
}

/**
 * Hook to fetch and manage Cognito user data
 * This combines data from Cognito with user profile data from the database
 */
export function useCognitoUser() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Fetch user data from the API
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<CognitoUserData>({
    queryKey: [COGNITO_USER_QUERY_KEY],
    queryFn: async () => {
      const response = await ApiService.get<CognitoUserData>(
        '/proxy/user/profile',
      );
      return response;
    },
    enabled: isAuthenticated, // Only fetch if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Mutation to update user profile
  const { mutate: updateUserProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (userData: Partial<CognitoUserData>) => {
      const response = await ApiService.put<CognitoUserData>(
        '/proxy/user/update-profile',
        userData,
      );
      return response;
    },
    onSuccess: (updatedUser: CognitoUserData) => {
      // Update the cache with the new user data
      queryClient.setQueryData([COGNITO_USER_QUERY_KEY], updatedUser);
    },
  });

  return {
    user,
    isLoading,
    error,
    refetch,
    updateUserProfile,
    isUpdating,
  };
}
