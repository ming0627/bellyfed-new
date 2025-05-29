# 1. API Integration

This document outlines the implementation plan for integrating the frontend with the backend API for the Rankings feature.

## Overview

The API integration layer will provide a clean interface for the frontend components to interact with the backend API. It will handle:

- Making API requests
- Error handling
- Data transformation
- Authentication

## Implementation Tasks

### 1. API Client Setup

- [ ] Create API client configuration
    - File: `src/lib/api/client.ts`
    - Implement base API client with axios
    - Add authentication token handling
    - Configure request/response interceptors

### 2. Dish API Integration

- [ ] Create dish API client
    - File: `src/lib/api/dishesApi.ts`
    - Implement functions for fetching dishes
    - Add filtering and pagination support
    - Handle error responses

### 3. Rankings API Integration

- [ ] Create rankings API client
    - File: `src/lib/api/rankingsApi.ts`
    - Implement CRUD operations for rankings
    - Add functions for fetching local and global rankings
    - Handle error responses

### 4. Photo Upload API Integration

- [ ] Create photo upload API client
    - File: `src/lib/api/photoUploadApi.ts`
    - Implement function to get pre-signed URL
    - Add function to upload photo to S3
    - Handle upload progress and errors

## Implementation Details

### API Client Configuration

```typescript
// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAuthToken } from '@/lib/auth';

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle specific error cases
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;

            if (status === 401) {
                // Handle unauthorized error (e.g., redirect to login)
                console.error('Unauthorized access. Please log in.');
                // Redirect to login page or show login modal
            } else if (status === 403) {
                // Handle forbidden error
                console.error('Access forbidden.');
            } else if (status === 404) {
                // Handle not found error
                console.error('Resource not found.');
            } else if (status === 429) {
                // Handle rate limit error
                console.error('Rate limit exceeded. Please try again later.');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
```

### Dish API Client

```typescript
// src/lib/api/dishesApi.ts
import apiClient from './client';
import { Dish } from '@/types/dish';

interface DishesResponse {
    success: boolean;
    data: Dish[];
    meta?: {
        pagination: {
            page: number;
            pageSize: number;
            totalPages: number;
            totalItems: number;
        };
    };
}

interface DishResponse {
    success: boolean;
    data: Dish;
}

interface DishesParams {
    page?: number;
    pageSize?: number;
    restaurant?: string;
    category?: string;
    search?: string;
    countryCode?: string;
}

/**
 * Get a list of dishes with filtering and pagination
 */
export async function getDishes(params: DishesParams = {}): Promise<DishesResponse> {
    try {
        const response = await apiClient.get('/dishes', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching dishes:', error);
        throw error;
    }
}

/**
 * Get a dish by ID
 */
export async function getDishById(id: string): Promise<DishResponse> {
    try {
        const response = await apiClient.get(`/dishes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching dish with ID ${id}:`, error);
        throw error;
    }
}

/**
 * Get a dish by slug
 */
export async function getDishBySlug(slug: string): Promise<DishResponse> {
    try {
        const response = await apiClient.get(`/dishes/slug/${slug}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching dish with slug ${slug}:`, error);
        throw error;
    }
}
```

### Rankings API Client

```typescript
// src/lib/api/rankingsApi.ts
import apiClient from './client';
import { UserRanking, RankingInput, RankingStats } from '@/types/ranking';
import { Dish } from '@/types/dish';

interface UserRankingsResponse {
    success: boolean;
    data: UserRanking[];
    meta?: {
        pagination: {
            page: number;
            pageSize: number;
            totalPages: number;
            totalItems: number;
        };
    };
}

interface UserRankingResponse {
    success: boolean;
    data: {
        ranking: UserRanking;
        dish: Dish;
    };
}

interface LocalRankingsResponse {
    success: boolean;
    data: {
        dish: Dish;
        userRanking?: UserRanking;
        rankings: Array<{
            id: string;
            userId: string;
            username: string;
            rank?: number;
            tasteStatus?: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED';
            notes?: string;
            photoCount: number;
            createdAt: string;
        }>;
        stats: RankingStats;
    };
    meta?: {
        pagination: {
            page: number;
            pageSize: number;
            totalPages: number;
            totalItems: number;
        };
    };
}

interface RankingsParams {
    page?: number;
    pageSize?: number;
    restaurant?: string;
    dishType?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'rank';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Get all rankings for the current user
 */
export async function getUserRankings(params: RankingsParams = {}): Promise<UserRankingsResponse> {
    try {
        const response = await apiClient.get('/rankings/my', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching user rankings:', error);
        throw error;
    }
}

/**
 * Get current user's ranking for a specific dish
 */
export async function getUserRankingForDish(dishSlug: string): Promise<UserRankingResponse> {
    try {
        const response = await apiClient.get(`/rankings/my/${dishSlug}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ranking for dish ${dishSlug}:`, error);
        throw error;
    }
}

/**
 * Create a new ranking
 */
export async function createRanking(
    dishSlug: string,
    data: RankingInput
): Promise<UserRankingResponse> {
    try {
        const response = await apiClient.post(`/rankings/my/${dishSlug}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error creating ranking for dish ${dishSlug}:`, error);
        throw error;
    }
}

/**
 * Update an existing ranking
 */
export async function updateRanking(
    dishSlug: string,
    data: RankingInput
): Promise<UserRankingResponse> {
    try {
        const response = await apiClient.put(`/rankings/my/${dishSlug}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating ranking for dish ${dishSlug}:`, error);
        throw error;
    }
}

/**
 * Delete a ranking
 */
export async function deleteRanking(dishSlug: string): Promise<{ success: boolean }> {
    try {
        const response = await apiClient.delete(`/rankings/my/${dishSlug}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting ranking for dish ${dishSlug}:`, error);
        throw error;
    }
}

/**
 * Get local rankings for a dish
 */
export async function getLocalRankings(
    dishSlug: string,
    params: { page?: number; pageSize?: number } = {}
): Promise<LocalRankingsResponse> {
    try {
        const response = await apiClient.get(`/rankings/local/${dishSlug}`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching local rankings for dish ${dishSlug}:`, error);
        throw error;
    }
}

/**
 * Get global rankings for a dish
 */
export async function getGlobalRankings(
    dishSlug: string,
    params: { page?: number; pageSize?: number } = {}
): Promise<LocalRankingsResponse> {
    try {
        const response = await apiClient.get(`/rankings/global/${dishSlug}`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching global rankings for dish ${dishSlug}:`, error);
        throw error;
    }
}
```

### Photo Upload API Client

```typescript
// src/lib/api/photoUploadApi.ts
import apiClient from './client';

interface UploadUrlResponse {
    success: boolean;
    data: {
        uploadUrl: string;
        photoUrl: string;
    };
}

/**
 * Get a pre-signed URL for uploading a photo
 */
export async function getPhotoUploadUrl(contentType: string): Promise<UploadUrlResponse> {
    try {
        const response = await apiClient.post('/upload/ranking-photo', { contentType });
        return response.data;
    } catch (error) {
        console.error('Error getting photo upload URL:', error);
        throw error;
    }
}

/**
 * Upload a photo to S3 using a pre-signed URL
 */
export async function uploadPhotoToS3(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    try {
        // Create a new XMLHttpRequest to track upload progress
        const xhr = new XMLHttpRequest();

        // Create a promise to handle the upload
        const uploadPromise = new Promise<string>((resolve, reject) => {
            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);

            // Set up progress tracking
            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        onProgress(progress);
                    }
                };
            }

            // Handle success
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Extract the photo URL from the upload URL
                    // The photo URL is the same as the upload URL without the query parameters
                    const photoUrl = uploadUrl.split('?')[0];
                    resolve(photoUrl);
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            // Handle error
            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            // Handle timeout
            xhr.ontimeout = () => {
                reject(new Error('Upload timed out'));
            };

            // Send the file
            xhr.send(file);
        });

        return uploadPromise;
    } catch (error) {
        console.error('Error uploading photo to S3:', error);
        throw error;
    }
}

/**
 * Get a pre-signed URL and upload a photo to S3
 */
export async function uploadPhoto(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    try {
        // Get a pre-signed URL
        const { data } = await getPhotoUploadUrl(file.type);

        // Upload the photo to S3
        await uploadPhotoToS3(data.uploadUrl, file, onProgress);

        // Return the photo URL
        return data.photoUrl;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
}
```

## Type Definitions

```typescript
// src/types/dish.ts
export interface Dish {
    id: string;
    name: string;
    slug: string;
    description?: string;
    restaurantId: string;
    restaurantName: string;
    category?: string;
    imageUrl?: string;
    isVegetarian: boolean;
    spicyLevel: number;
    price?: number;
    countryCode?: string;
    createdAt: string;
    updatedAt: string;
}
```

```typescript
// src/types/ranking.ts
export interface UserRanking {
    id: string;
    userId: string;
    dishId: string;
    restaurantId: string;
    dishType?: string;
    rank?: number; // 1-5, with 1 being the best
    tasteStatus?: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED';
    notes?: string;
    photos: Array<{
        id: string;
        photoUrl: string;
        createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface RankingInput {
    dishId: string;
    restaurantId: string;
    dishType?: string;
    rank?: number;
    tasteStatus?: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED';
    notes?: string;
    photoUrls?: string[];
}

export interface RankingStats {
    totalRankings: number;
    averageRank?: number;
    ranks: {
        [key: number]: number; // key is rank (1-5), value is count
    };
    tasteStatuses: {
        ACCEPTABLE: number;
        SECOND_CHANCE: number;
        DISSATISFIED: number;
    };
}
```

## Testing

- [ ] Write unit tests for API clients
    - Test success cases
    - Test error handling
    - Mock API responses

## Dependencies

- Axios for API requests
- Authentication library for token management

## Estimated Time

- API Client Setup: 0.5 day
- Dish API Integration: 0.5 day
- Rankings API Integration: 1 day
- Photo Upload API Integration: 1 day
- Testing: 1 day

Total: 4 days
