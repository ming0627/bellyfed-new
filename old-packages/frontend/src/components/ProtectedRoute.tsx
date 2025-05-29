import { useAuth } from '@/contexts/AuthContext';
import { redirectToSignin } from '@/utils/authRedirect';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if we're authenticated according to the AuthContext
    if (isAuthenticated) {
      setIsChecking(false);
    } else {
      // If not authenticated, redirect to signin
      redirectToSignin(router);
    }
  }, [router, isAuthenticated]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
