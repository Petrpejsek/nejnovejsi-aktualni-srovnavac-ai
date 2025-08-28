import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getPublicBaseUrl, isProduction } from '@/lib/env'

// Unified middleware: base URL enforcement + role-based routing
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early redirects (prod only): i18n frozen
  // Any two-letter (optionally xx-XX) language prefix for /landing/* should redirect to canonical /landing/*
  if (isProduction()) {
    const i18nPattern = /^\/([a-z]{2}(?:-[A-Z]{2})?)\/landing\/(.+)$/
    const match = pathname.match(i18nPattern)
    if (match) {
      const slug = match[2]
      // Skip internal/admin/api paths (shouldn't match this pattern, but be safe)
      const skip = pathname.startsWith('/api/') || pathname.startsWith('/admin/') || pathname.startsWith('/company-admin/')
      if (!skip) {
        try { console.info(`[i18n-frozen] Redirecting prefixed landing "${pathname}" -> "/landing/${slug}"`) } catch {}
        return NextResponse.redirect(new URL(`/landing/${slug}`, request.url), 308)
      }
    }
  }

  // If accessing only language root -> redirect to homepage
  const langRoot = pathname.match(/^\/(cs|en|de|fr|es)\/?$/)
  if (langRoot) {
    return NextResponse.redirect(new URL('/', request.url), 308)
  }

  // If accessing /{lang}/landing without slug -> redirect to homepage
  const langLandingRoot = pathname.match(/^\/(cs|en|de|fr|es)\/landing\/?$/)
  if (langLandingRoot) {
    return NextResponse.redirect(new URL('/', request.url), 308)
  }

  // If accessing /landing (no slug) -> redirect to homepage
  if (pathname === '/landing' || pathname === '/landing/') {
    return NextResponse.redirect(new URL('/', request.url), 308)
  }

  // Legacy route normalization (server-side redirects)
  if (pathname === '/company') {
    return NextResponse.redirect(new URL('/advertise', request.url));
  }
  if (pathname.startsWith('/company/')) {
    const rest = pathname.replace(/^\/company/, '');
    return NextResponse.redirect(new URL('/company-admin' + rest, request.url));
  }
  if (pathname === '/advertiser' || pathname.startsWith('/advertiser/')) {
    const rest = pathname.replace(/^\/advertiser/, '');
    return NextResponse.redirect(new URL('/company-admin' + rest, request.url));
  }

  // Skip static and special files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/screenshots') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Canonicalize host (prod only): redirect to exact origin from getPublicBaseUrl()
  // Skip internal/static/API endpoints to avoid disrupting tooling and GSC fetches
  if (isProduction()) {
    try {
      const url = new URL(request.url)
      const pathname = url.pathname
      // Skip list
      const skipRedirect = (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/screenshots') ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/admin/') ||
        pathname.startsWith('/company-admin/')
      )
      if (!skipRedirect) {
        const wanted = new URL(getPublicBaseUrl())
        const currentHost = url.hostname
        const wantedHost = wanted.hostname
        const isLocalHost =
          currentHost === 'localhost' ||
          currentHost === '127.0.0.1' ||
          currentHost.endsWith('.local')
        if (!isLocalHost && currentHost !== wantedHost) {
          const redirectOrigin = `${wanted.protocol}//${wanted.host}`
          const redirectTo = new URL(url.pathname + url.search, redirectOrigin)
          return NextResponse.redirect(redirectTo, { status: 308 })
        }
      }
    } catch {
      // ignore
    }
  }

  // Public exceptions for auth-related public pages
  const publicAuthPattern = /^(\/forgot-password|\/account\/reset|\/account\/verify)(\/.*)?$/
  if (publicAuthPattern.test(pathname)) {
    return NextResponse.next();
  }

  // Role-based access control
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userRole = (token?.role as string) || null;

    // Admin routes
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        const url = new URL('/auth/login', request.url);
        url.searchParams.set('role', 'admin');
        url.searchParams.set('next', pathname + (request.nextUrl.search || ''));
        return NextResponse.redirect(url);
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

    // Public + bezpečnostní X-Robots-Tag pro interní cesty
    const res = NextResponse.next();
    if (
      pathname.startsWith('/new-search') ||
      pathname.startsWith('/ai-tools-test') ||
      pathname.startsWith('/test') ||
      pathname.startsWith('/simple-test')
    ) {
      res.headers.set('X-Robots-Tag', 'noindex, follow');
    }
    return res;
  } catch (error) {
    console.log('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next|api|static|screenshots|favicon.ico|robots.txt|sitemap.xml).*)'],
};