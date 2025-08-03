import { useSession } from 'next-auth/react';

// 🚀 JEDNODUCHÝ AUTH HOOK - JEDNA PRAVDA PRO VŠECHNY ROLE
export function useAuth() {
  const { data: session, status } = useSession();

  // DEBUG: Add console logging to diagnose client-side session issues
  console.log('🔍 useAuth DEBUG:', { 
    status, 
    hasSession: !!session, 
    user: session?.user,
    role: (session?.user as any)?.role,
    isAdmin: (session?.user as any)?.isAdmin 
  });

  const role = (session?.user as any)?.role || null;
  const isAdmin = Boolean((session?.user as any)?.isAdmin);

  return {
    // Basic session info
    user: session?.user || null,
    session,
    status,
    
    // Role information
    role,
    isAdmin,
    isUser: role === 'user',
    isCompany: role === 'company',
    
    // Authentication status
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isUnauthenticated: status === 'unauthenticated',
    
    // Helper functions
    hasRole: (requiredRole: 'user' | 'admin' | 'company') => role === requiredRole,
    hasAnyRole: (roles: Array<'user' | 'admin' | 'company'>) => roles.includes(role),
    
    // Debug info
    debug: {
      email: session?.user?.email,
      role,
      isAdmin,
      status
    }
  };
}

// 🔒 ROLE GUARDS - TypeScript types for better type safety
export type Role = 'user' | 'admin' | 'company';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  isAdmin: boolean;
}

export interface AuthSession {
  user: AuthUser;
}