'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (loading) return;

    // If user is already logged in, redirect them based on role
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // For talents, use redirect parameter if it's not an auth route, otherwise go to jobs
        const redirect = searchParams.get('redirect');
        if (redirect && !redirect.includes('/auth/')) {
          router.push(redirect);
        } else {
          router.push('/jobs');
        }
      }
      return;
    }
  }, [user, loading, router, searchParams]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = await login(email, password);
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // Redirect talent to jobs page, or use redirect parameter if it's not an auth route
        const redirect = searchParams.get('redirect');
        if (redirect && !redirect.includes('/auth/')) {
          router.push(redirect);
        } else {
          router.push('/jobs');
        }
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-hidden flex flex-col justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 w-[90%] lg:w-4/5 h-[55%] flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>

  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen overflow-y-hidden flex flex-col justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 lg:w-4/5 h-[55%] flex flex-col justify-center">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
