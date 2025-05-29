import React from 'react';

import { useUserProfile } from '../hooks/useUserProfile';

interface UserProfileDisplayProps {
  minimal?: boolean;
}

export function UserProfileDisplay({
  minimal = false,
}: UserProfileDisplayProps): JSX.Element {
  const { profile, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-10 w-[250px] bg-gray-200 animate-pulse rounded"></div>
        {!minimal && (
          <>
            <div className="h-4 w-[200px] bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-[150px] bg-gray-200 animate-pulse rounded"></div>
          </>
        )}
      </div>
    );
  }

  if (error || !profile) {
    return <div className="text-red-500">Error loading profile data</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          {profile.name?.charAt(0) || profile.username.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {profile.name || profile.username}
          </h3>
          {!minimal && (
            <>
              <p className="text-gray-600">{profile.email}</p>
              {profile.location && (
                <p className="text-gray-600 text-sm">{profile.location}</p>
              )}
            </>
          )}
        </div>
      </div>

      {!minimal && profile.stats && (
        <div className="flex space-x-4 mt-4">
          <div className="text-center">
            <div className="font-bold">{profile.stats.reviews}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{profile.stats.followers}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{profile.stats.following}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
        </div>
      )}

      {!minimal && profile.bio && (
        <div className="mt-4">
          <p>{profile.bio}</p>
        </div>
      )}
    </div>
  );
}
