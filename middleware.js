import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Check which page the user is trying to visit
  const path = request.nextUrl.pathname;

  // 2. If they are trying to visit the Admin Dashboard...
  if (path.startsWith('/admin')) {
    
    // 3. Check for the "user_role" cookie
    const roleCookie = request.cookies.get('user_role');
    const role = roleCookie?.value;

    // 4. If they are NOT an Admin, kick them out
    if (role !== 'Admin') {
      // Redirect them back to the homepage (login screen)
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Otherwise, let them pass
  return NextResponse.next();
}

// Only run this check on the admin routes
export const config = {
  matcher: '/admin/:path*',
};