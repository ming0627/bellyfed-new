# 4. State Management Implementation

This document outlines the implementation plan for state management for the Rankings feature.

## Overview

The state management implementation will provide a centralized way to manage rankings data across the application. It will handle:

- Fetching and caching rankings data
- Managing user rankings
- Handling optimistic updates
- Syncing with the backend API

## Implementation Tasks

### 1. Rankings Context

- [ ] Create Rankings Context
    - File: `src/context/RankingsContext.tsx`
    - Implement context provider
    - Add state for rankings data
    - Create actions for CRUD operations

### 2. Rankings Hooks

- [ ] Create custom hooks for rankings
    - File: `src/hooks/useRankings.ts`
    - Implement hook for accessing rankings data
    - Add hook for managing user rankings
    - Create hook for rankings statistics

### 3. Caching Strategy

- [ ] Implement caching for rankings data
    - File: `src/lib/cache/rankingsCache.ts`
    - Add functions for caching rankings data
    - Implement cache invalidation
    - Create utility for optimistic updates

## Implementation Details

### Rankings Context

```tsx
// src/context/RankingsContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getUserRankings } from '@/lib/api/rankingsApi';
import { UserRanking, RankingInput } from '@/types/ranking';
import { Dish } from '@/types/dish';

// Define the state shape
interface RankingsState {
    userRankings: UserRanking[];
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

// Define action types
type RankingsAction =
    | { type: 'FETCH_RANKINGS_START' }
    | { type: 'FETCH_RANKINGS_SUCCESS'; payload: UserRanking[] }
    | { type: 'FETCH_RANKINGS_ERROR'; payload: string }
    | { type: 'ADD_RANKING'; payload: UserRanking }
    | { type: 'UPDATE_RANKING'; payload: UserRanking }
    | { type: 'DELETE_RANKING'; payload: string }; // payload is ranking ID

// Create the context
interface RankingsContextType {
    state: RankingsState;
    fetchUserRankings: () => Promise<void>;
    addRanking: (ranking: UserRanking) => void;
    updateRanking: (ranking: UserRanking) => void;
    deleteRanking: (rankingId: string) => void;
}

const RankingsContext = createContext<RankingsContextType | undefined>(undefined);

// Create the reducer
const rankingsReducer = (state: RankingsState, action: RankingsAction): RankingsState => {
    switch (action.type) {
        case 'FETCH_RANKINGS_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'FETCH_RANKINGS_SUCCESS':
            return {
                ...state,
                userRankings: action.payload,
                loading: false,
                error: null,
                initialized: true,
            };
        case 'FETCH_RANKINGS_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload,
                initialized: true,
            };
        case 'ADD_RANKING':
            return {
                ...state,
                userRankings: [...state.userRankings, action.payload],
            };
        case 'UPDATE_RANKING':
            return {
                ...state,
                userRankings: state.userRankings.map((ranking) =>
                    ranking.id === action.payload.id ? action.payload : ranking
                ),
            };
        case 'DELETE_RANKING':
            return {
                ...state,
                userRankings: state.userRankings.filter((ranking) => ranking.id !== action.payload),
            };
        default:
            return state;
    }
};

// Create the provider
interface RankingsProviderProps {
    children: ReactNode;
}

export const RankingsProvider: React.FC<RankingsProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(rankingsReducer, {
        userRankings: [],
        loading: false,
        error: null,
        initialized: false,
    });

    // Fetch user rankings on mount
    useEffect(() => {
        if (!state.initialized) {
            fetchUserRankings();
        }
    }, [state.initialized]);

    // Fetch user rankings
    const fetchUserRankings = async () => {
        dispatch({ type: 'FETCH_RANKINGS_START' });

        try {
            const response = await getUserRankings();

            if (response.success) {
                dispatch({ type: 'FETCH_RANKINGS_SUCCESS', payload: response.data });
            } else {
                dispatch({ type: 'FETCH_RANKINGS_ERROR', payload: 'Failed to fetch rankings' });
            }
        } catch (error) {
            console.error('Error fetching rankings:', error);
            dispatch({ type: 'FETCH_RANKINGS_ERROR', payload: 'Failed to fetch rankings' });
        }
    };

    // Add a ranking
    const addRanking = (ranking: UserRanking) => {
        dispatch({ type: 'ADD_RANKING', payload: ranking });
    };

    // Update a ranking
    const updateRanking = (ranking: UserRanking) => {
        dispatch({ type: 'UPDATE_RANKING', payload: ranking });
    };

    // Delete a ranking
    const deleteRanking = (rankingId: string) => {
        dispatch({ type: 'DELETE_RANKING', payload: rankingId });
    };

    const value = {
        state,
        fetchUserRankings,
        addRanking,
        updateRanking,
        deleteRanking,
    };

    return <RankingsContext.Provider value={value}>{children}</RankingsContext.Provider>;
};

// Create a hook to use the context
export const useRankingsContext = () => {
    const context = useContext(RankingsContext);

    if (context === undefined) {
        throw new Error('useRankingsContext must be used within a RankingsProvider');
    }

    return context;
};
```

### Rankings Hooks

```tsx
// src/hooks/useRankings.ts
import { useState, useEffect, useCallback } from 'react';
import { useRankingsContext } from '@/context/RankingsContext';
import {
    createRanking,
    updateRanking as updateRankingApi,
    deleteRanking as deleteRankingApi,
    getUserRankingForDish,
    getLocalRankings,
    getGlobalRankings,
} from '@/lib/api/rankingsApi';
import { UserRanking, RankingInput, RankingStats } from '@/types/ranking';
import { Dish } from '@/types/dish';
import {
    getRankingFromCache,
    cacheRanking,
    invalidateRankingCache,
} from '@/lib/cache/rankingsCache';

// Hook for managing user rankings
export const useUserRankings = () => {
    const { state, fetchUserRankings } = useRankingsContext();

    return {
        rankings: state.userRankings,
        loading: state.loading,
        error: state.error,
        refetch: fetchUserRankings,
    };
};

// Hook for managing a single dish ranking
export interface UseDishRankingResult {
    userRanking: UserRanking | null;
    loading: boolean;
    error: string | null;
    createOrUpdateRanking: (data: RankingInput) => Promise<UserRanking>;
    deleteRanking: () => Promise<void>;
}

export const useDishRanking = (dishSlug: string): UseDishRankingResult => {
    const {
        addRanking,
        updateRanking,
        deleteRanking: deleteRankingFromContext,
    } = useRankingsContext();
    const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user ranking for dish
    const fetchUserRanking = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Check cache first
            const cachedRanking = getRankingFromCache(dishSlug);

            if (cachedRanking) {
                setUserRanking(cachedRanking);
                setLoading(false);
                return;
            }

            // Fetch from API
            const response = await getUserRankingForDish(dishSlug);

            if (response.success) {
                setUserRanking(response.data.ranking);
                // Cache the ranking
                cacheRanking(dishSlug, response.data.ranking);
            }
        } catch (err) {
            // User might not have a ranking yet, which is fine
            setUserRanking(null);
        } finally {
            setLoading(false);
        }
    }, [dishSlug]);

    // Fetch on mount and when dishSlug changes
    useEffect(() => {
        fetchUserRanking();
    }, [fetchUserRanking]);

    // Create or update ranking
    const createOrUpdateRanking = async (data: RankingInput): Promise<UserRanking> => {
        setLoading(true);
        setError(null);

        try {
            if (userRanking) {
                // Update existing ranking
                const response = await updateRankingApi(dishSlug, data);

                if (response.success) {
                    setUserRanking(response.data.ranking);
                    updateRanking(response.data.ranking);
                    // Update cache
                    cacheRanking(dishSlug, response.data.ranking);
                    return response.data.ranking;
                } else {
                    throw new Error('Failed to update ranking');
                }
            } else {
                // Create new ranking
                const response = await createRanking(dishSlug, data);

                if (response.success) {
                    setUserRanking(response.data.ranking);
                    addRanking(response.data.ranking);
                    // Update cache
                    cacheRanking(dishSlug, response.data.ranking);
                    return response.data.ranking;
                } else {
                    throw new Error('Failed to create ranking');
                }
            }
        } catch (err) {
            console.error('Error saving ranking:', err);
            setError('Failed to save ranking');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete ranking
    const deleteRankingHandler = async (): Promise<void> => {
        if (!userRanking) return;

        setLoading(true);
        setError(null);

        try {
            const response = await deleteRankingApi(dishSlug);

            if (response.success) {
                setUserRanking(null);
                deleteRankingFromContext(userRanking.id);
                // Invalidate cache
                invalidateRankingCache(dishSlug);
            } else {
                throw new Error('Failed to delete ranking');
            }
        } catch (err) {
            console.error('Error deleting ranking:', err);
            setError('Failed to delete ranking');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        userRanking,
        loading,
        error,
        createOrUpdateRanking,
        deleteRanking: deleteRankingHandler,
    };
};

// Hook for fetching dish rankings
export interface UseDishRankingsResult {
    rankings: any[];
    stats: RankingStats | null;
    loading: boolean;
    error: string | null;
    fetchRankings: (page: number, pageSize: number) => Promise<void>;
}

export const useDishRankings = (
    dishSlug: string,
    type: 'local' | 'global' = 'local'
): UseDishRankingsResult => {
    const [rankings, setRankings] = useState<any[]>([]);
    const [stats, setStats] = useState<RankingStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch rankings
    const fetchRankings = async (page: number = 1, pageSize: number = 10) => {
        setLoading(true);
        setError(null);

        try {
            const response =
                type === 'local'
                    ? await getLocalRankings(dishSlug, { page, pageSize })
                    : await getGlobalRankings(dishSlug, { page, pageSize });

            if (response.success) {
                setRankings(response.data.rankings);
                setStats(response.data.stats);
            } else {
                throw new Error(`Failed to fetch ${type} rankings`);
            }
        } catch (err) {
            console.error(`Error fetching ${type} rankings:`, err);
            setError(`Failed to fetch ${type} rankings`);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchRankings();
    }, [dishSlug, type]);

    return {
        rankings,
        stats,
        loading,
        error,
        fetchRankings,
    };
};
```

### Rankings Cache

```tsx
// src/lib/cache/rankingsCache.ts
import { UserRanking } from '@/types/ranking';

// Cache keys
const RANKINGS_CACHE_PREFIX = 'bellyfed_rankings_';
const RANKINGS_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Cache structure
interface CacheItem<T> {
    data: T;
    timestamp: number;
}

// Get ranking from cache
export const getRankingFromCache = (dishSlug: string): UserRanking | null => {
    try {
        const cacheKey = `${RANKINGS_CACHE_PREFIX}${dishSlug}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (!cachedData) {
            return null;
        }

        const { data, timestamp }: CacheItem<UserRanking> = JSON.parse(cachedData);

        // Check if cache is expired
        if (Date.now() - timestamp > RANKINGS_CACHE_EXPIRY) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error getting ranking from cache:', error);
        return null;
    }
};

// Cache ranking
export const cacheRanking = (dishSlug: string, ranking: UserRanking): void => {
    try {
        const cacheKey = `${RANKINGS_CACHE_PREFIX}${dishSlug}`;
        const cacheItem: CacheItem<UserRanking> = {
            data: ranking,
            timestamp: Date.now(),
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
        console.error('Error caching ranking:', error);
    }
};

// Invalidate ranking cache
export const invalidateRankingCache = (dishSlug: string): void => {
    try {
        const cacheKey = `${RANKINGS_CACHE_PREFIX}${dishSlug}`;
        localStorage.removeItem(cacheKey);
    } catch (error) {
        console.error('Error invalidating ranking cache:', error);
    }
};

// Clear all rankings cache
export const clearRankingsCache = (): void => {
    try {
        // Get all keys from localStorage
        const keys = Object.keys(localStorage);

        // Filter keys that start with the rankings cache prefix
        const rankingsCacheKeys = keys.filter((key) => key.startsWith(RANKINGS_CACHE_PREFIX));

        // Remove all rankings cache items
        rankingsCacheKeys.forEach((key) => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing rankings cache:', error);
    }
};

// Optimistic update helpers

// Optimistically add ranking
export const optimisticAddRanking = (dishSlug: string, ranking: UserRanking): void => {
    cacheRanking(dishSlug, ranking);
};

// Optimistically update ranking
export const optimisticUpdateRanking = (dishSlug: string, ranking: UserRanking): void => {
    cacheRanking(dishSlug, ranking);
};

// Optimistically delete ranking
export const optimisticDeleteRanking = (dishSlug: string): void => {
    invalidateRankingCache(dishSlug);
};
```

### Integration with App

To integrate the state management with the application, we need to wrap the app with the provider:

```tsx
// src/pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '@/context/AuthContext';
import { RankingsProvider } from '@/context/RankingsContext';
import { Layout } from '@/components/layout/Layout';
import theme from '@/styles/theme';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <RankingsProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </RankingsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default MyApp;
```

## Testing

- [ ] Write unit tests for Rankings Context

    - Test reducer functions
    - Test context provider
    - Test actions

- [ ] Write unit tests for Rankings Hooks

    - Test fetching rankings
    - Test creating/updating/deleting rankings
    - Test error handling

- [ ] Write unit tests for Caching Strategy
    - Test caching functions
    - Test cache invalidation
    - Test optimistic updates

## Dependencies

- React Context API for state management
- localStorage for caching
- API clients from previous step

## Estimated Time

- Rankings Context: 1 day
- Rankings Hooks: 1 day
- Caching Strategy: 1 day
- Testing: 1 day

Total: 4 days
