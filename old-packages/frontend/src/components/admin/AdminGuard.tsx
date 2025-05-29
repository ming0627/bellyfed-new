/**
 * AdminGuard Component
 *
 * A wrapper component that only renders its children if the user is authenticated
 * and has admin privileges. This component is used to protect admin pages.
 */

import { Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGuard({
  children,
  fallback = (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page. Please contact an
        administrator if you believe this is an error.
      </p>
    </div>
  ),
}: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication is still loading, wait
    if (isLoading) {
      return;
    }

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/signin?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Check if user is an admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/status');

        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, isLoading, router, user]);

  // Show loading state while checking admin status
  if (isLoading || isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-600">Checking admin access...</p>
      </div>
    );
  }

  // If user is not an admin, show the fallback
  if (!isAdmin) {
    return fallback;
  }

  // User is authenticated and has admin privileges, render children
  return <>{children}</>;
}
