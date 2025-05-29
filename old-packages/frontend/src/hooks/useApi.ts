import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { ApiService, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: UseQueryOptions<T>,
) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return useQuery({
    queryKey: key,
    queryFn: () => ApiService.get<T>(endpoint),
    enabled: isAuthenticated && (options?.enabled ?? true),
    retry: (failureCount, error) => {
      // Handle auth errors by redirecting to login
      if (ApiError.isAuthError(error)) {
        router.push('/signin');
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    ...options,
  });
}
