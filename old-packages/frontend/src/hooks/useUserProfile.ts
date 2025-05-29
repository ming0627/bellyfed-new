import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfileService';
import { CognitoUserData } from './useCognitoUser';

// Define query keys
export const USER_PROFILE_QUERY_KEY = 'userProfile';
export const USER_FOLLOWERS_QUERY_KEY = 'userFollowers';
export const USER_FOLLOWING_QUERY_KEY = 'userFollowing';

/**
 * Hook for managing user profile data
 */
export function useUserProfile() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get current user profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<CognitoUserData>({
    queryKey: [USER_PROFILE_QUERY_KEY],
    queryFn: () => UserProfileService.getCurrentUserProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update user profile
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (userData: Partial<CognitoUserData>) =>
      UserProfileService.updateUserProfile(userData),
    onSuccess: (updatedProfile: CognitoUserData) => {
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY], updatedProfile);
    },
  });

  // Get user followers
  const { data: followers, isLoading: isLoadingFollowers } = useQuery<
    CognitoUserData[]
  >({
    queryKey: [USER_FOLLOWERS_QUERY_KEY],
    queryFn: () => UserProfileService.getUserFollowers(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user following
  const { data: following, isLoading: isLoadingFollowing } = useQuery<
    CognitoUserData[]
  >({
    queryKey: [USER_FOLLOWING_QUERY_KEY],
    queryFn: () => UserProfileService.getUserFollowing(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Follow a user
  const { mutate: followUser } = useMutation({
    mutationFn: (userId: string) => UserProfileService.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_FOLLOWING_QUERY_KEY] });
    },
  });

  // Unfollow a user
  const { mutate: unfollowUser } = useMutation({
    mutationFn: (userId: string) => UserProfileService.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_FOLLOWING_QUERY_KEY] });
    },
  });

  // Update user preferences
  const { mutate: updatePreferences } = useMutation({
    mutationFn: (preferences: Record<string, unknown>) =>
      UserProfileService.updateUserPreferences(preferences),
    onSuccess: (updatedProfile: CognitoUserData) => {
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY], updatedProfile);
    },
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile,
    isUpdating,
    followers,
    following,
    isLoadingFollowers,
    isLoadingFollowing,
    followUser,
    unfollowUser,
    updatePreferences,
  };
}
