import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 🚀 ČISTÉ JEDNODUCHÉ MIDDLEWARE - JEN ROUTING PODLE ROLE
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for auth endpoints and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Get user token and role
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    const userRole = token?.role as string | null;
    console.log(`🔍 Middleware: ${pathname} | Role: ${userRole || 'none'}`);

    // 🔐 ADMIN ROUTES - require admin role
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        console.log(`❌ Access denied: Admin route requires admin role (current: ${userRole})`);
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      console.log('✅ Admin access granted');
      return NextResponse.next();
    }

    // 👤 USER ROUTES - require user role (except login page)
    if (pathname.startsWith('/user-area')) {
      if (userRole !== 'user' && pathname !== '/user-area/login') {
        console.log(`❌ Access denied: User route requires user role (current: ${userRole})`);
        return NextResponse.redirect(new URL('/user-area/login', request.url));
      }
      console.log('✅ User access granted');
      return NextResponse.next();
    }

    // 🏢 COMPANY ROUTES - require company role (except main page)
    if (pathname.startsWith('/company/')) {
      if (userRole !== 'company') {
        console.log(`❌ Access denied: Company route requires company role (current: ${userRole})`);
        return NextResponse.redirect(new URL('/company', request.url));
      }
      console.log('✅ Company access granted');
      return NextResponse.next();
    }

    // 📄 PUBLIC ROUTES - allow everyone
    console.log('🌐 Public route access');
    return NextResponse.next();

  } catch (error) {
    console.log('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/user-area/:path*', 
    '/company/:path*'
  ]
};