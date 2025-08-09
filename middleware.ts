import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Unified middleware: base URL enforcement + role-based routing
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static and special files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Enforce base URL if configured
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (base) {
    try {
      const url = new URL(request.url);
      const wanted = new URL(base);
      if (url.hostname !== wanted.hostname || url.protocol !== wanted.protocol) {
        url.protocol = wanted.protocol;
        url.hostname = wanted.hostname;
        url.port = wanted.port || '';
        return NextResponse.redirect(url, { status: 308 });
      }
    } catch {
      // ignore
    }
  }

  // Role-based access control
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userRole = (token?.role as string) || null;

    // Admin routes
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      return NextResponse.next();
    }

    // User routes
    if (pathname.startsWith('/user-area')) {
      if (userRole !== 'user' && pathname !== '/user-area/login') {
        return NextResponse.redirect(new URL('/user-area/login', request.url));
      }
      return NextResponse.next();
    }

    // Company routes (allow public alias /company/profile)
    if (pathname === '/company/profile') {
      return NextResponse.next();
    }
    if (pathname.startsWith('/company/')) {
      if (userRole !== 'company') {
        return NextResponse.redirect(new URL('/company', request.url));
      }
      return NextResponse.next();
    }

    // Public
    return NextResponse.next();
  } catch (error) {
    console.log('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico|robots.txt|sitemap.xml).*)'],
};