import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

import React, { useEffect } from 'react';

import Link from 'next/link';

import ResendVerification from '@/components/ResendVerification';

const ResendVerificationPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  // Email from query params could be used to pre-fill the form
  // const { email } = router.query;

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <ResendVerification />
        <div className="mt-4 text-center">
          <Link href="/signin" passHref>
            <Button variant="link" className="text-sm">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
};

export default ResendVerificationPage;
