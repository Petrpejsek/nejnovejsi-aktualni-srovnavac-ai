import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getToken } from 'next-auth/jwt'

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

  // Check if the request is for the admin area
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Middleware: Checking admin access...')
    
    try {
      // Zkus nejdříve admin cookie
      const adminCookieName = 'next-auth.admin'
      
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: adminCookieName
      })

      console.log('🔒 Admin token found:', !!token)
      
      if (!token) {
        console.log('🔒 Admin access DENIED: { hasToken: false, isAdmin: undefined, email: undefined, userType: undefined, reason: "No token" }')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('reason', 'admin_required')
        return NextResponse.redirect(loginUrl)
      }
      
      const isAdmin = Boolean(token.isAdmin)
      const email = token.email as string
      const userType = token.userType as string
      const loginType = token.loginType as string
      
      console.log('🔒 Token details:', { isAdmin, email, userType, loginType })
      
      // Strict admin check: musí být isAdmin: true AND email: (admin@admin.com OR root@admin.com) AND loginType: admin
      const isValidAdminEmail = email === 'admin@admin.com' || email === 'root@admin.com'
      if (!isAdmin || !isValidAdminEmail || loginType !== 'admin') {
        console.log('🔒 Admin access DENIED:', {
          hasToken: true,
          isAdmin,
          email,
          userType,
          loginType,
          reason: !isAdmin ? 'Not admin' : !isValidAdminEmail ? 'Wrong email' : 'Wrong login type'
        })
        
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('reason', 'admin_required')
        return NextResponse.redirect(loginUrl)
      }
      
      console.log('✅ Admin access GRANTED for:', email, '{ isAdmin: true }')
      return NextResponse.next()
      
    } catch (error) {
      console.log('🔒 Admin middleware error:', error)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('reason', 'admin_required')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check if the request is for the user-area
  if (request.nextUrl.pathname.startsWith('/user-area')) {
    console.log('🔒 Middleware: Checking user access...')
    
    try {
      // Zkus user cookie
      const userCookieName = 'next-auth.user'
      
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: userCookieName
      })

      console.log('🔒 User token found:', !!token)
      
      if (!token) {
        console.log('🔒 User access DENIED: { hasToken: false, reason: "No token" }')
        const loginUrl = new URL('/user-area/login', request.url)
        loginUrl.searchParams.set('reason', 'user_required')
        return NextResponse.redirect(loginUrl)
      }
      
      const email = token.email as string
      const userType = token.userType as string
      const loginType = token.loginType as string
      const isAdmin = Boolean(token.isAdmin)
      
      console.log('🔒 User token details:', { email, userType, loginType, isAdmin })
      
      // User area check: loginType musí být 'user' a nesmí být admin
      if (loginType !== 'user' || isAdmin) {
        console.log('🔒 User access DENIED:', {
          hasToken: true,
          email,
          userType,
          loginType,
          isAdmin,
          reason: isAdmin ? 'Admin cannot access user area' : 'Wrong login type'
        })
        
        const loginUrl = new URL('/user-area/login', request.url)
        loginUrl.searchParams.set('reason', 'user_required')
        return NextResponse.redirect(loginUrl)
      }
      
      console.log('✅ User access GRANTED for:', email, '{ loginType: user }')
      return NextResponse.next()
      
    } catch (error) {
      console.log('🔒 User middleware error:', error)
      const loginUrl = new URL('/user-area/login', request.url)
      loginUrl.searchParams.set('reason', 'user_required')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/user-area/:path*', '/company-admin/:path*']
} 