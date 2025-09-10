'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'talent';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Add current path as redirect parameter
      const currentPath = window.location.pathname;
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }

    if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.push(fallbackPath);
      return;
    }
  }, [user, loading, requiredRole, fallbackPath, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-300 animate-ping"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if user doesn't have access
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
