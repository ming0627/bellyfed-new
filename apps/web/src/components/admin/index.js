/**
 * Admin Components Index
 * 
 * Exports all admin-related components for easy importing.
 * These components provide comprehensive admin functionality
 * including access control, dashboard, and management features.
 */

export { default as AdminGuard, withAdminGuard, useAdminPermissions } from './AdminGuard.js';
export { default as AdminDashboard } from './AdminDashboard.js';
