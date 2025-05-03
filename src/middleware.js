import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define protected routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard') || 
                          path.startsWith('/profile') || 
                          path.startsWith('/settings');
  
  // Define auth routes (login/signup) where authenticated users shouldn't go
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');
  
  // Skip the public profile paths that match /profile/[slug]
  if (path.match(/^\/profile\/[^\/]+$/)) {
    return NextResponse.next();
  }
  
  // Check for the token in cookies
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;
  
  // If trying to access a protected route without being authenticated
  if (isProtectedRoute && !isAuthenticated) {
    // Store the current URL to redirect back after login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', encodeURIComponent(path));
    
    // Set a response header to indicate authentication is required
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('X-Auth-Required', 'true');
    return response;
  }
  
  // If authenticated user tries to access login/signup pages
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all dashboard, profile, and settings routes
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};