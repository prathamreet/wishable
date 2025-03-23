import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define protected routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/profile');
  
  // Skip the public profile paths that match /profile/[slug]
  if (path.match(/^\/profile\/[^\/]+$/)) {
    return NextResponse.next();
  }
  
  // Check for the token in cookies
  const token = request.cookies.get('token')?.value;
  
  // If trying to access a protected route without being authenticated
  if (isProtectedRoute && !token) {
    // Store the current URL to redirect back after login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all dashboard and profile routes
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
  ],
}; 