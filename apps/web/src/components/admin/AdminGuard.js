/**
 * Admin Guard Component
 * 
 * Protects admin routes and components by checking user permissions.
 * Redirects unauthorized users and shows appropriate error messages.
 * 
 * Features:
 * - Role-based access control
 * - Permission checking
 * - Unauthorized access handling
 * - Loading states
 * - Error boundaries
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router.js';
import { Card, LoadingSpinner } from '@bellyfed/ui';
import { useAuth } from '../../hooks/useAuth.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const AdminGuard = ({
  children,
  requiredRole = 'admin',
  requiredPermissions = [],
  fallbackComponent = null,
  redirectTo = '/unauthorized',
  showLoadingSpinner = true,
  className = ''
}) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { trackUserEngagement } = useAnalyticsContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check user authorization
  const checkAuthorization = async () => {
    setIsChecking(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        setIsAuthorized(false);
        return;
      }

      // Check role
      const userRole = user.role || user.userRole || 'user';
      const hasRequiredRole = checkRole(userRole, requiredRole);

      if (!hasRequiredRole) {
        setIsAuthorized(false);
        trackUserEngagement('admin', 'guard', 'role_denied', {
          userRole,
          requiredRole,
          userId: user.id
        });
        return;
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
          setIsAuthorized(false);
          trackUserEngagement('admin', 'guard', 'permission_denied', {
            userPermissions,
            requiredPermissions,
            userId: user.id
          });
          return;
        }
      }

      // User is authorized
      setIsAuthorized(true);
      trackUserEngagement('admin', 'guard', 'access_granted', {
        userRole,
        requiredRole,
        requiredPermissions,
        userId: user.id
      });

    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorized(false);
      trackUserEngagement('admin', 'guard', 'check_error', {
        error: error.message,
        userId: user?.id
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Check if user role meets requirement
  const checkRole = (userRole, requiredRole) => {
    const roleHierarchy = {
      'user': 0,
      'moderator': 1,
      'admin': 2,
      'super_admin': 3
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  // Handle unauthorized access
  const handleUnauthorizedAccess = () => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  // Check authorization when dependencies change
  useEffect(() => {
    if (!isLoading) {
      checkAuthorization();
    }
  }, [isLoading, isAuthenticated, user, requiredRole, requiredPermissions]);

  // Handle unauthorized access after checking
  useEffect(() => {
    if (!isChecking && !isAuthorized && !isLoading) {
      handleUnauthorizedAccess();
    }
  }, [isChecking, isAuthorized, isLoading]);

  // Show loading spinner while checking
  if (isLoading || isChecking) {
    if (!showLoadingSpinner) {
      return null;
    }

    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </Card>
    );
  }

  // Show unauthorized message if not authorized and no redirect
  if (!isAuthorized) {
    if (fallbackComponent) {
      return fallbackComponent;
    }

    if (!redirectTo) {
      return (
        <Card className={`p-8 ${className}`}>
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this area.
            </p>
            <div className="text-sm text-gray-500">
              <p>Required role: <span className="font-medium">{requiredRole}</span></p>
              {requiredPermissions.length > 0 && (
                <p>Required permissions: <span className="font-medium">{requiredPermissions.join(', ')}</span></p>
              )}
            </div>
          </div>
        </Card>
      );
    }

    // Will redirect, show nothing
    return null;
  }

  // User is authorized, render children
  return <>{children}</>;
};

// Higher-order component version
export const withAdminGuard = (WrappedComponent, guardOptions = {}) => {
  const AdminGuardedComponent = (props) => {
    return (
      <AdminGuard {...guardOptions}>
        <WrappedComponent {...props} />
      </AdminGuard>
    );
  };

  AdminGuardedComponent.displayName = `withAdminGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AdminGuardedComponent;
};

// Hook for checking admin permissions
export const useAdminPermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (requiredRole) => {
    if (!isAuthenticated || !user) return false;
    
    const userRole = user.role || user.userRole || 'user';
    const roleHierarchy = {
      'user': 0,
      'moderator': 1,
      'admin': 2,
      'super_admin': 3
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!isAuthenticated || !user) return false;
    
    const userPermissions = user.permissions || [];
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!isAuthenticated || !user) return false;
    
    const userPermissions = user.permissions || [];
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    isSuperAdmin: hasRole('super_admin'),
    userRole: user?.role || user?.userRole || 'user',
    userPermissions: user?.permissions || []
  };
};

export default AdminGuard;
