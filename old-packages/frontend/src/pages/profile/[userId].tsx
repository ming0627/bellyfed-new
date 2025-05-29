import { Profile } from '@/components/profile';
import { useCognitoUser, useUserProfile } from '@/hooks';
import Head from 'next/head';
// import { useRouter } from 'next/router';

export default function ProfilePage(): JSX.Element {
  // Commented out until needed
  // const router = useRouter();
  // const { userId } = router.query;

  // Use React Query hooks for user data
  const { isLoading: isLoadingCognitoUser } = useCognitoUser();
  const { isLoading: isLoadingProfile } = useUserProfile();

  // Combine loading states
  const isLoading = isLoadingCognitoUser || isLoadingProfile;

  return (
    <>
      <Head>
        <title>User Profile | BellyFed</title>
        <meta name="description" content="View user profile" />
      </Head>

      {isLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p>Loading user profile...</p>
          </div>
        </div>
      ) : (
        <div>
          <Profile userId={'user-123' as string} />
        </div>
      )}
    </>
  );
}
