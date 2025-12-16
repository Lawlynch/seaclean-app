import { NextResponse } from 'next/server';

export function middleware(request) {
  console.log("🔒 Middleware is checking access to:", request.nextUrl.pathname);

  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    const roleCookie = request.cookies.get('user_role');
    const role = roleCookie?.value;

    console.log("👤 User Role detected:", role);

    if (role !== 'Admin') {
      console.log("⛔ Access Denied. Redirecting to login.");
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log("✅ Access Granted.");
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};