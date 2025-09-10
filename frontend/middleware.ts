import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/admin/jobs': ['admin'],
  '/admin/matches': ['admin'],
  '/admin/applications': ['admin'],
  '/admin/dashboard': ['admin'],
  '/my-matches': ['talent', 'admin'],
  '/profile': ['talent', 'admin'],
  '/settings': ['talent', 'admin'],
};

// Routes that require authentication but no specific role
const authRequiredRoutes = [
  '/my-matches',
  '/profile',
  '/settings',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/jobs',
  '/jobs/',
  '/auth/login',
  '/auth/register',
];

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    // Make a request to your backend to verify the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data; // Return user data
    }
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/jobs/') {
      return pathname.startsWith('/jobs/') || pathname === '/jobs';
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token and get user data
  const user = await verifyToken(token);
  
  if (!user) {
    // Invalid token, clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Check role-based access for protected routes
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect to unauthorized page or home
        return NextResponse.redirect(new URL('/', request.url));
      }
      break;
    }
  }

  // Add user data to request headers so it can be accessed in the page
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-data', JSON.stringify(user));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
