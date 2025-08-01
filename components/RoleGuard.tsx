'use client';

import React from 'react';
import { useAuth, type Role } from '@/hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  role?: Role;
  roles?: Role[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

// 🔒 UNIVERZÁLNÍ ROLE GUARD
export function RoleGuard({ 
  children, 
  role, 
  roles, 
  requireAuth = true, 
  fallback = null 
}: RoleGuardProps) {
  const auth = useAuth();

  // Loading state
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Authentication required but not authenticated
  if (requireAuth && !auth.isAuthenticated) {
    return fallback;
  }

  // Single role check
  if (role && !auth.hasRole(role)) {
    return fallback;
  }

  // Multiple roles check
  if (roles && !auth.hasAnyRole(roles)) {
    return fallback;
  }

  return <>{children}</>;
}

// 🔒 SPECIFIC ROLE GUARDS
export function AdminOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <RoleGuard role="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function UserOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <RoleGuard role="user" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function CompanyOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <RoleGuard role="company" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// 🔒 AUTHENTICATED GUARD (any role)
export function AuthGuard({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <RoleGuard requireAuth={true} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// 🔓 UNAUTHENTICATED GUARD (public only)
export function PublicOnly({ children, fallback = null }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return fallback;
  }

  return <>{children}</>;
}