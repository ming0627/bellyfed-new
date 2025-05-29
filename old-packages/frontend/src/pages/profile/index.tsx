import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { withServerAuth } from '@/utils/serverAuth';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useCognitoUser } from '@/hooks/useCognitoUser';
import { useUserProfile } from '@/hooks/useUserProfile';

import Head from 'next/head';

import React from 'react';

// Define the props type
type ProfilePageProps = {
  user: {
    id: string;
    username: string;
    email?: string;
    name?: string;
    location?: string;
    bio?: string;
  };
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user: serverUser }) => {
  const router = useRouter();
  const { user: cognitoUser, isLoading: isLoadingCognitoUser } =
    useCognitoUser();
  const { profile, isLoading: isLoadingProfile } = useUserProfile();

  // Determine if we're loading
  const isLoading = isLoadingCognitoUser || isLoadingProfile;

  // Use profile from useUserProfile if available, then cognitoUser, then serverUser
  const displayUser = profile || cognitoUser || serverUser;

  return (
    <>
      <Head>
        <title>User Profile | BellyFed</title>
        <meta name="description" content="View and edit your profile" />
      </Head>

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>

        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Actual content
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Username
                    </h3>
                    <p className="mt-1">
                      {displayUser?.username || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">
                      {displayUser?.email || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1">
                      {displayUser?.name || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      User ID
                    </h3>
                    <p className="mt-1">{displayUser?.id || 'Not available'}</p>
                  </div>
                  {displayUser?.location && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Location
                      </h3>
                      <p className="mt-1">{displayUser.location}</p>
                    </div>
                  )}
                  {displayUser?.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                      <p className="mt-1">{displayUser.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={() => router.push('/profile/edit')}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push('/profile/change-password')}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withServerAuth(
  async () => {
    // Any additional server-side props logic can go here
    return {
      props: {
        // Additional props will be merged with the user prop from withServerAuth
        serverTime: new Date().toISOString(),
      },
    };
  },
  {
    redirectUrl: '/signin',
    returnTo: true,
  },
);

export default ProfilePage;
