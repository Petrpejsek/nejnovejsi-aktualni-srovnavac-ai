import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Check if the request is for the company-admin area
  if (request.nextUrl.pathname.startsWith('/company-admin')) {
    const token = request.cookies.get('advertiser-token')?.value

    if (!token) {
      // Redirect to homepage with modal trigger
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
      
      // Token is valid, continue to the requested page
      return NextResponse.next()
    } catch (error) {
      // Token is invalid, redirect to homepage
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('advertiser-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/company-admin/:path*']
} 