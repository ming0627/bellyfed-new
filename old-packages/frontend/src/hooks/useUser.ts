import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { UserService } from '@/services/userService';

const USER_QUERY_KEY = 'user';

export function useUser(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: [USER_QUERY_KEY, userId || 'current-user'],
    queryFn: () =>
      userId ? UserService.getUserById(userId) : UserService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: (userData: Partial<User>) =>
      UserService.updateUser(user?.id || '', userData),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(
        [USER_QUERY_KEY, userId || 'current-user'],
        updatedUser,
      );
    },
  });

  const { data: followers, isLoading: isLoadingFollowers } = useQuery<User[]>({
    queryKey: [USER_QUERY_KEY, userId, 'followers'],
    queryFn: () => UserService.getUserFollowers(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: following, isLoading: isLoadingFollowing } = useQuery<User[]>({
    queryKey: [USER_QUERY_KEY, userId, 'following'],
    queryFn: () => UserService.getUserFollowing(user?.id || ''),
    enabled: !!user?.id,
  });

  const { mutate: followUser } = useMutation({
    mutationFn: () => UserService.followUser(userId || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY, userId, 'followers'],
      });
    },
  });

  const { mutate: unfollowUser } = useMutation({
    mutationFn: () => UserService.unfollowUser(userId || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY, userId, 'followers'],
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    updateUser,
    followers,
    following,
    isLoadingFollowers,
    isLoadingFollowing,
    followUser,
    unfollowUser,
  };
}
