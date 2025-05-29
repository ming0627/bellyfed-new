# Frontend Integration Guide

This document outlines how to integrate the frontend components with the backend API for the rankings feature.

## Updating the useUserRanking Hook

The `useUserRanking` hook needs to be updated to use the real API endpoints instead of mock data:

```typescript
// src/hooks/useUserRanking.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UserRanking {
  rankingId?: string;
  userId?: string;
  dishId: string;
  restaurantId: string;
  dishType?: string;
  rank?: number | null;
  tasteStatus?: string | null;
  notes?: string;
  photoUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface DishDetails {
  dishId: string;
  name: string;
  description: string;
  restaurantId: string;
  restaurantName: string;
  category: string;
  imageUrl: string;
  isVegetarian: boolean;
  spicyLevel: number;
  price: number;
  countryCode: string;
}

interface RankingStats {
  totalRankings: number;
  averageRank: number;
  ranks: Record<string, number>;
  tasteStatuses: Record<string, number>;
}

interface UseUserRankingResult {
  userRanking: UserRanking | null;
  dishDetails: DishDetails | null;
  rankingStats: RankingStats | null;
  isLoading: boolean;
  error: Error | null;
  createOrUpdateRanking: (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
  }) => Promise<void>;
  deleteRanking: () => Promise<void>;
}

export function useUserRanking(
  dishSlug: string,
  dishId?: string,
): UseUserRankingResult {
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
  const [dishDetails, setDishDetails] = useState<DishDetails | null>(null);
  const [rankingStats, setRankingStats] = useState<RankingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRanking = async () => {
      if (!dishSlug) return;

      setIsLoading(true);
      setError(null);

      try {
        // Real API call
        const response = await fetch(`/api/rankings/my/${dishSlug}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user ranking');
        }

        const data = await response.json();

        setUserRanking(data.userRanking);
        setDishDetails(data.dishDetails);
        setRankingStats(data.rankingStats);
      } catch (err) {
        console.error('Error fetching user ranking:', err);
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred'),
        );

        // For development, we can still use mock data as fallback
        if (process.env.NODE_ENV === 'development') {
          // Mock data setup (same as before)
          // ...
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRanking();
  }, [dishSlug, dishId]);

  const createOrUpdateRanking = async (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
  }) => {
    if (!dishDetails) {
      throw new Error('Dish details not available');
    }

    try {
      // Determine if we're creating or updating
      const method = userRanking?.rankingId ? 'PUT' : 'POST';

      // Make the API call
      const response = await fetch(`/api/rankings/my/${dishSlug}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishId: dishDetails.dishId,
          restaurantId: dishDetails.restaurantId,
          dishType: dishDetails.category,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${userRanking?.rankingId ? 'update' : 'create'} ranking`,
        );
      }

      const responseData = await response.json();

      // Update local state with the response
      setUserRanking(responseData.userRanking);
      setRankingStats(responseData.rankingStats);

      // Show success toast
      toast({
        title: userRanking?.rankingId ? 'Ranking Updated' : 'Ranking Created',
        description: `Your ranking for ${dishDetails.name} has been ${userRanking?.rankingId ? 'updated' : 'saved'}.`,
      });
    } catch (err) {
      console.error(
        `Error ${userRanking?.rankingId ? 'updating' : 'creating'} ranking:`,
        err,
      );
      throw err;
    }
  };

  const deleteRanking = async () => {
    if (!userRanking?.rankingId) {
      throw new Error('No ranking to delete');
    }

    try {
      // Make the API call
      const response = await fetch(`/api/rankings/my/${dishSlug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete ranking');
      }

      // Update local state
      setUserRanking(null);

      // Get updated stats
      const statsResponse = await fetch(`/api/rankings/my/${dishSlug}`);
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setRankingStats(data.rankingStats);
      }

      // Show success toast
      toast({
        title: 'Ranking Deleted',
        description: `Your ranking for ${dishDetails?.name} has been deleted.`,
      });
    } catch (err) {
      console.error('Error deleting ranking:', err);
      throw err;
    }
  };

  return {
    userRanking,
    dishDetails,
    rankingStats,
    isLoading,
    error,
    createOrUpdateRanking,
    deleteRanking,
  };
}
```

## Implementing Photo Upload

Update the RankingDialog component to handle real photo uploads:

```typescript
// src/components/rankings/RankingDialog.tsx
// ... existing imports

// Add a new function to handle photo uploads
const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) {
    return;
  }

  const file = event.target.files[0];
  setIsUploading(true);

  try {
    // Get a pre-signed URL for the upload
    const response = await fetch('/api/upload/ranking-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, photoUrl } = await response.json();

    // Upload the file directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload photo');
    }

    // Add the new photo URL to the state
    setPhotoUrls([...photoUrls, photoUrl]);

    toast({
      title: 'Photo Uploaded',
      description: 'Your photo has been uploaded successfully.',
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    toast({
      title: 'Upload Failed',
      description: 'Failed to upload photo. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setIsUploading(false);
  }
};

// Replace the existing photo upload button with this:
<div className="space-y-2">
  <Label>Photos</Label>
  <div className="grid grid-cols-3 gap-2">
    {photoUrls.map((url, index) => (
      <div key={index} className="relative h-20 rounded-md overflow-hidden bg-gray-100">
        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== index))}
        >
          <span className="sr-only">Remove</span>
          &times;
        </Button>
      </div>
    ))}
    <label className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
        disabled={isUploading}
      />
      {isUploading ? (
        <div className="animate-pulse">Uploading...</div>
      ) : (
        <>
          <Camera className="h-6 w-6 mb-1" />
          <span className="text-xs">Add Photo</span>
        </>
      )}
    </label>
  </div>
</div>
```

## Implementing Local Rankings Page

Update the local rankings page to fetch real data:

```typescript
// src/pages/[country]/rankings/local/[dishSlug].tsx
// ... existing imports

export default function LocalDishRankingPage() {
  const router = useRouter();
  const { country, dishSlug } = router.query;
  const { currentCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true);
  const [dishDetails, setDishDetails] = useState<any>(null);
  const [localRankings, setLocalRankings] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace(`/my/rankings/local/${dishSlug}`);
    }
  }, [country, router, dishSlug]);

  // Fetch local rankings
  useEffect(() => {
    const fetchLocalRankings = async () => {
      if (!dishSlug || !country) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/rankings/local/${dishSlug}?country=${country}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch local rankings');
        }

        const data = await response.json();
        setDishDetails(data.dishDetails);
        setLocalRankings(data.localRankings);
      } catch (err) {
        console.error('Error fetching local rankings:', err);
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred'),
        );

        // For development, we can still use mock data as fallback
        if (process.env.NODE_ENV === 'development') {
          // Mock data setup
          // ...
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocalRankings();
  }, [dishSlug, country]);

  // Render the component with real data
  // ...
}
```

## Implementing Global Rankings Page

Update the global rankings page to fetch real data:

```typescript
// src/pages/[country]/rankings/global/[dishSlug].tsx
// ... existing imports

export default function GlobalDishRankingPage() {
  const router = useRouter();
  const { country, dishSlug } = router.query;
  const { currentCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true);
  const [dishDetails, setDishDetails] = useState<any>(null);
  const [globalRankings, setGlobalRankings] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace(`/my/rankings/global/${dishSlug}`);
    }
  }, [country, router, dishSlug]);

  // Fetch global rankings
  useEffect(() => {
    const fetchGlobalRankings = async () => {
      if (!dishSlug) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/rankings/global/${dishSlug}`);

        if (!response.ok) {
          throw new Error('Failed to fetch global rankings');
        }

        const data = await response.json();
        setDishDetails(data.dishDetails);
        setGlobalRankings(data.globalRankings);
      } catch (err) {
        console.error('Error fetching global rankings:', err);
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred'),
        );

        // For development, we can still use mock data as fallback
        if (process.env.NODE_ENV === 'development') {
          // Mock data setup
          // ...
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalRankings();
  }, [dishSlug]);

  // Render the component with real data
  // ...
}
```

## Error Handling and Loading States

Ensure all components handle loading states and errors gracefully:

```tsx
// Example of error handling in a component
{error ? (
  <div className="p-6 text-center">
    <p className="text-red-500 mb-2">Error: {error.message}</p>
    <Button onClick={() => window.location.reload()}>
      Retry
    </Button>
  </div>
) : isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
) : (
  // Actual content
)}
```

## Fallback Strategy

For development and testing, implement a fallback strategy that uses mock data when the API is not available:

```typescript
// Example fallback in a data fetching hook
try {
  // Real API call
  // ...
} catch (err) {
  console.error('Error fetching data:', err);

  // For development, use mock data as fallback
  if (process.env.NODE_ENV === 'development') {
    return mockData;
  } else {
    // In production, propagate the error
    throw err;
  }
}
```

## Progressive Enhancement

Implement progressive enhancement to ensure the app works even if some features are not available:

```typescript
// Example of progressive enhancement for photo uploads
const supportsPhotoUpload = async () => {
  try {
    const response = await fetch('/api/upload/ranking-photo', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Then in the component
useEffect(() => {
  const checkPhotoUploadSupport = async () => {
    const supported = await supportsPhotoUpload();
    setPhotoUploadSupported(supported);
  };

  checkPhotoUploadSupport();
}, []);

// And in the render
{photoUploadSupported ? (
  // Photo upload UI
) : (
  // Fallback UI without photo upload
)}
```

## Testing the Integration

Before deploying to production, thoroughly test the integration:

1. Test creating, updating, and deleting rankings
2. Test photo uploads
3. Test error handling and edge cases
4. Test with slow network connections
5. Test with different browsers and devices

Use the React Developer Tools to inspect the state and props of components during testing.
