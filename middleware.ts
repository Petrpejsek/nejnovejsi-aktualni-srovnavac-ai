import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Unified middleware: base URL enforcement + role-based routing
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early redirects
  // Normalize any i18n landing to non-prefixed variant: /{lang}/landing/* -> /landing/*
  const i18nLanding = pathname.match(/^\/(cs|en|de|fr|es)\/landing\/(.+)$/)
  if (i18nLanding) {
    const slug = i18nLanding[2]
    return NextResponse.redirect(new URL(`/landing/${slug}`, request.url), 308)
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

  // Canonicalize: pokud přijde požadavek na comparee.ai, přesměruj na NEXT_PUBLIC_BASE_URL (jen v produkci)
  // Přístup na IP ponech bez redirectu, v developmentu nikdy nedělej doménové redirecty
  if (process.env.NODE_ENV === 'production') {
    try {
      const url = new URL(request.url);
      const host = url.hostname.toLowerCase();
      const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
      if (!isLocalHost && (host === 'comparee.ai' || host === 'www.comparee.ai')) {
        const base = process.env.NEXT_PUBLIC_BASE_URL;
        if (!base) {
          // Bez BASE_URL nedělej doménové redirecty
          return NextResponse.next();
        }
        const wanted = new URL(base);
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