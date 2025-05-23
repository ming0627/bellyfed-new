/**
 * User Hook
 *
 * This hook provides functionality for fetching and managing user data.
 * It uses React Query for data fetching and caching.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@bellyfed/types';
import { userService } from '@bellyfed/services';
import { useToast } from './useToast.js';

// Query keys for React Query
const USER_QUERY_KEY = 'user';

/**
 * Interface for user state
 */
export interface UserState {
  /**
   * The user data
   */
  user: User | null;

  /**
   * Whether user data is loading
   */
  isLoading: boolean;

  /**
   * Any error that occurred during user operations
   */
  error: Error | null;

  /**
   * User's followers
   */
  followers: User[];

  /**
   * Users that the user is following
   */
  following: User[];

  /**
   * Whether followers are loading
   */
  isLoadingFollowers: boolean;

  /**
   * Whether following users are loading
   */
  isLoadingFollowing: boolean;
}

/**
 * Interface for user methods
 */
export interface UserMethods {
  /**
   * Update the user's profile
   */
  updateUser: (userData: Partial<User>) => Promise<void>;

  /**
   * Follow a user
   */
  followUser: () => Promise<void>;

  /**
   * Unfollow a user
   */
  unfollowUser: () => Promise<void>;

  /**
   * Search for users
   */
  searchUsers: (query: string) => Promise<User[]>;

  /**
   * Reset the user state
   */
  reset: () => void;
}

/**
 * Hook for managing user data
 *
 * @param userId Optional user ID. If not provided, the current user is used.
 * @returns User state and methods
 */
export function useUser(userId?: string): UserState & UserMethods {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Initialize state
  const [state, setState] = useState<UserState>({
    user: null,
    isLoading: false,
    error: null,
    followers: [],
    following: [],
    isLoadingFollowers: false,
    isLoadingFollowing: false,
  });

  /**
   * Fetch user data
   */
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User, Error>({
    queryKey: [USER_QUERY_KEY, userId || 'current-user'],
    queryFn: async () => {
      try {
        return userId
          ? await userService.getUserById(userId)
          : await userService.getCurrentUser();
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch user data';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Update user mutation
   */
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      try {
        if (!user?.id) {
          throw new Error('User ID is required');
        }

        return await userService.updateUser(user.id, userData);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to update user';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(
        [USER_QUERY_KEY, userId || 'current-user'],
        updatedUser,
      );

      toast.success('User profile updated successfully');
    },
  });

  /**
   * Fetch user followers
   */
  const {
    data: followers,
    isLoading: isLoadingFollowers,
  } = useQuery<User[], Error>({
    queryKey: [USER_QUERY_KEY, userId || 'current-user', 'followers'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          return [];
        }

        return await userService.getUserFollowers(user.id);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch followers';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: !!user?.id,
  });

  /**
   * Fetch users that the user is following
   */
  const {
    data: following,
    isLoading: isLoadingFollowing,
  } = useQuery<User[], Error>({
    queryKey: [USER_QUERY_KEY, userId || 'current-user', 'following'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          return [];
        }

        return await userService.getUserFollowing(user.id);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to fetch following users';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    enabled: !!user?.id,
  });

  /**
   * Follow user mutation
   */
  const followUserMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!userId) {
          throw new Error('User ID is required');
        }

        await userService.followUser(userId);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to follow user';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY, userId, 'followers'],
      });

      toast.success('User followed successfully');
    },
  });

  /**
   * Unfollow user mutation
   */
  const unfollowUserMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!userId) {
          throw new Error('User ID is required');
        }

        await userService.unfollowUser(userId);
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to unfollow user';

        toast.error(errorMessage);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY, userId, 'followers'],
      });

      toast.success('User unfollowed successfully');
    },
  });

  /**
   * Search users
   */
  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    try {
      if (!query) {
        return [];
      }

      return await userService.searchUsers(query);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to search users';

      toast.error(errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }, [toast]);

  /**
   * Update user
   */
  const updateUser = useCallback(async (userData: Partial<User>): Promise<void> => {
    await updateUserMutation.mutateAsync(userData);
  }, [updateUserMutation]);

  /**
   * Follow user
   */
  const followUser = useCallback(async (): Promise<void> => {
    await followUserMutation.mutateAsync();
  }, [followUserMutation]);

  /**
   * Unfollow user
   */
  const unfollowUser = useCallback(async (): Promise<void> => {
    await unfollowUserMutation.mutateAsync();
  }, [unfollowUserMutation]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      user: null,
      isLoading: false,
      error: null,
      followers: [],
      following: [],
      isLoadingFollowers: false,
      isLoadingFollowing: false,
    });
  }, []);

  /**
   * Update state when data changes
   */
  useEffect(() => {
    setState({
      user: user || null,
      isLoading,
      error: error || null,
      followers: followers || [],
      following: following || [],
      isLoadingFollowers,
      isLoadingFollowing,
    });
  }, [user, isLoading, error, followers, following, isLoadingFollowers, isLoadingFollowing]);

  return {
    ...state,
    updateUser,
    followUser,
    unfollowUser,
    searchUsers,
    reset,
  };
}
