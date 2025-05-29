/**
 * User Profile Hook
 *
 * This hook provides functionality for fetching and managing user profile data.
 * It uses React Query for data fetching and caching.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CognitoUserData } from '@bellyfed/types';
import { userProfileService, AvatarUploadResponse, FileUploadOptions } from '@bellyfed/services';
import { useAuth } from './useAuth.js';
import { useToast } from './useToast.js';

// Define query keys
export const USER_PROFILE_QUERY_KEY = 'userProfile';
export const USER_FOLLOWERS_QUERY_KEY = 'userFollowers';
export const USER_FOLLOWING_QUERY_KEY = 'userFollowing';

/**
 * Interface for user profile state
 */
export interface UserProfileState {
  /**
   * The user profile data
   */
  profile: CognitoUserData | null;

  /**
   * Whether profile data is loading
   */
  isLoading: boolean;

  /**
   * Whether profile is being updated
   */
  isUpdating: boolean;

  /**
   * Any error that occurred during profile operations
   */
  error: Error | null;

  /**
   * User's followers
   */
  followers: CognitoUserData[];

  /**
   * Users that the user is following
   */
  following: CognitoUserData[];

  /**
   * Whether followers are loading
   */
  isLoadingFollowers: boolean;

  /**
   * Whether following users are loading
   */
  isLoadingFollowing: boolean;

  /**
   * User statistics
   */
  stats: {
    reviews: number;
    followers: number;
    following: number;
    cities: number;
  } | null;

  /**
   * Whether stats are loading
   */
  isLoadingStats: boolean;
}

/**
 * Interface for user profile methods
 */
export interface UserProfileMethods {
  /**
   * Refetch the user profile
   */
  refetch: () => Promise<void>;

  /**
   * Update the user profile
   */
  updateProfile: (userData: Partial<CognitoUserData>) => Promise<void>;

  /**
   * Follow a user
   */
  followUser: (userId: string) => Promise<void>;

  /**
   * Unfollow a user
   */
  unfollowUser: (userId: string) => Promise<void>;

  /**
   * Update user preferences
   */
  updatePreferences: (preferences: Record<string, unknown>) => Promise<void>;

  /**
   * Search for users
   */
  searchUsers: (query: string) => Promise<CognitoUserData[]>;

  /**
   * Upload avatar image
   */
  uploadAvatar: (file: File, options?: FileUploadOptions) => Promise<AvatarUploadResponse>;

  /**
   * Delete avatar image
   */
  deleteAvatar: () => Promise<void>;

  /**
   * Reset the user profile state
   */
  reset: () => void;
}

/**
 * Hook for managing user profile data
 *
 * @returns User profile state and methods
 */
export function useUserProfile(): UserProfileState & UserProfileMethods {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Initialize state
  const [state, setState] = useState<UserProfileState>({
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    followers: [],
    following: [],
    isLoadingFollowers: false,
    isLoadingFollowing: false,
    stats: null,
    isLoadingStats: false,
  });

  /**
   * Get current user profile
   */
  const {
    data: profile,
    isLoading,
    error,
    refetch: refetchProfile,
  } = useQuery<CognitoUserData, Error>({
    queryKey: [USER_PROFILE_QUERY_KEY],
    queryFn: async () => {
      try {
        return await userProfileService.getCurrentUserProfile();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch user profile';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Update user profile
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: Partial<CognitoUserData>) => {
      try {
        return await userProfileService.updateUserProfile(userData);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to update user profile';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: (updatedProfile: CognitoUserData) => {
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY], updatedProfile);
      toast.success('Profile updated successfully');
    },
  });

  /**
   * Get user followers
   */
  const {
    data: followers,
    isLoading: isLoadingFollowers,
  } = useQuery<CognitoUserData[], Error>({
    queryKey: [USER_FOLLOWERS_QUERY_KEY],
    queryFn: async () => {
      try {
        return await userProfileService.getUserFollowers();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch followers';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Get user following
   */
  const {
    data: following,
    isLoading: isLoadingFollowing,
  } = useQuery<CognitoUserData[], Error>({
    queryKey: [USER_FOLLOWING_QUERY_KEY],
    queryFn: async () => {
      try {
        return await userProfileService.getUserFollowing();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch following';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Get user stats
   */
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery<{
    reviews: number;
    followers: number;
    following: number;
    cities: number;
  }, Error>({
    queryKey: [USER_PROFILE_QUERY_KEY, 'stats'],
    queryFn: async () => {
      try {
        return await userProfileService.getUserStats();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch user stats';

        console.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Follow user mutation
   */
  const followUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        await userProfileService.followUser(userId);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to follow user';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_FOLLOWING_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY, 'stats'] });
      toast.success('User followed successfully');
    },
  });

  /**
   * Unfollow user mutation
   */
  const unfollowUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        await userProfileService.unfollowUser(userId);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to unfollow user';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_FOLLOWING_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY, 'stats'] });
      toast.success('User unfollowed successfully');
    },
  });

  /**
   * Update preferences mutation
   */
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Record<string, unknown>) => {
      try {
        return await userProfileService.updateUserPreferences(preferences);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to update preferences';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: (updatedProfile: CognitoUserData) => {
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY], updatedProfile);
      toast.success('Preferences updated successfully');
    },
  });

  /**
   * Upload avatar mutation
   */
  const uploadAvatarMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: FileUploadOptions }) => {
      try {
        return await userProfileService.uploadAvatar(file, options);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to upload avatar';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: (response: AvatarUploadResponse) => {
      // Update the profile with new avatar URL
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY], (oldData: CognitoUserData | undefined) => {
        if (oldData) {
          return {
            ...oldData,
            avatarUrl: response.avatarUrl,
            updated_at: new Date().toISOString(),
          };
        }
        return oldData;
      });
      toast.success('Avatar uploaded successfully');
    },
  });

  /**
   * Delete avatar mutation
   */
  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      try {
        return await userProfileService.deleteAvatar();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to delete avatar';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: (updatedProfile: CognitoUserData) => {
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY], updatedProfile);
      toast.success('Avatar deleted successfully');
    },
  });

  /**
   * Refetch user profile
   */
  const refetch = useCallback(async (): Promise<void> => {
    await refetchProfile();
  }, [refetchProfile]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData: Partial<CognitoUserData>): Promise<void> => {
    await updateProfileMutation.mutateAsync(userData);
  }, [updateProfileMutation]);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (userId: string): Promise<void> => {
    await followUserMutation.mutateAsync(userId);
  }, [followUserMutation]);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (userId: string): Promise<void> => {
    await unfollowUserMutation.mutateAsync(userId);
  }, [unfollowUserMutation]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (preferences: Record<string, unknown>): Promise<void> => {
    await updatePreferencesMutation.mutateAsync(preferences);
  }, [updatePreferencesMutation]);

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file: File, options?: FileUploadOptions): Promise<AvatarUploadResponse> => {
    return await uploadAvatarMutation.mutateAsync({ file, options });
  }, [uploadAvatarMutation]);

  /**
   * Delete avatar
   */
  const deleteAvatar = useCallback(async (): Promise<void> => {
    await deleteAvatarMutation.mutateAsync();
  }, [deleteAvatarMutation]);

  /**
   * Search for users
   */
  const searchUsers = useCallback(async (query: string): Promise<CognitoUserData[]> => {
    try {
      return await userProfileService.searchUsers(query);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to search users';

      toast.error(errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }, [toast]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      profile: null,
      isLoading: false,
      isUpdating: false,
      error: null,
      followers: [],
      following: [],
      isLoadingFollowers: false,
      isLoadingFollowing: false,
      stats: null,
      isLoadingStats: false,
    });
  }, []);

  /**
   * Update state when data changes
   */
  useEffect(() => {
    setState({
      profile: profile || null,
      isLoading,
      isUpdating: updateProfileMutation.isLoading || false,
      error: error || null,
      followers: followers || [],
      following: following || [],
      isLoadingFollowers,
      isLoadingFollowing,
      stats: stats || null,
      isLoadingStats,
    });
  }, [
    profile,
    isLoading,
    error,
    followers,
    following,
    isLoadingFollowers,
    isLoadingFollowing,
    updateProfileMutation.isLoading,
    stats,
    isLoadingStats,
  ]);

  return {
    ...state,
    refetch,
    updateProfile,
    followUser,
    unfollowUser,
    updatePreferences,
    uploadAvatar,
    deleteAvatar,
    searchUsers,
    reset,
  };
}
