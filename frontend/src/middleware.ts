import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Check if user has access to admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Check if user has access to teacher routes
    if (pathname.startsWith('/teacher') && token?.role !== 'TEACHER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Check if user has access to student routes
    if (pathname.startsWith('/student') && token?.role !== 'STUDENT' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Ensure user is authenticated
    },
  }
);

// Specify the paths that need authentication
export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/dashboard/:path*',
    '/profile',
  ],
}; 