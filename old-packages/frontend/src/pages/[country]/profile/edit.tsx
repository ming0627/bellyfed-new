import { COUNTRIES } from '@/config/countries';
import ProfileEditPage from '@/pages/profile/edit';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CountryProfileEdit(): JSX.Element {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/profile/edit');
    }
  }, [country, router]);

  // Provide a mock user object for now
  const mockUser = {
    id: 'user-123',
    username: 'user123',
    email: 'user@example.com',
    name: 'User Name',
  };

  return <ProfileEditPage user={mockUser} />;
}

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true, // Changed to true to allow for dynamic paths
  };
}

// Use getStaticProps to pass any needed props
export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
