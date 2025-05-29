// Type declarations for hook modules
declare module '@/hooks/useAuth' {
  export const useAuth: () => any;
}

declare module '@/hooks/useAnalytics' {
  export const useAnalytics: () => any;
}

declare module '@/hooks/useApi' {
  export const useApiQuery: (key: string[], endpoint: string, options?: any) => any;
}

declare module '@/hooks/useCognitoUser' {
  export const useCognitoUser: () => any;
}

declare module '@/hooks/useDebounce' {
  export function useDebounce<T>(value: T, delay: number): T;
}

declare module '@/hooks/useDishVotes' {
  export const useDishVotes: () => any;
}

declare module '@/hooks/useGeolocation' {
  export const useGeolocation: () => any;
}

declare module '@/hooks/useRestaurant' {
  export const useRestaurant: () => any;
}

declare module '@/hooks/useReviews' {
  export const useReviews: () => any;
}

declare module '@/hooks/useUser' {
  export const useUser: () => any;
}

declare module '@/hooks/useUserProfile' {
  export const useUserProfile: () => any;
}

declare module '@/hooks/useUserRanking' {
  export const useUserRanking: () => any;
}
