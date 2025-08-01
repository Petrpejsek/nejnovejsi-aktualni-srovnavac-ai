import { NextRequest, NextResponse } from 'next/server';

// 🚨 DEPRECATED API ENDPOINT
// This endpoint is no longer used. All admin authentication is handled by NextAuth.

export async function POST(request: NextRequest) {
  console.log('⚠️  DEPRECATED: /api/admin/login called - redirecting to NextAuth');
  
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Please use NextAuth for admin login.',
    migrationInfo: {
      message: 'Admin login has been migrated to NextAuth',
      newEndpoint: '/api/auth/signin',
      loginPage: '/auth/login',
      credentials: {
        role: 'admin',
        email: 'admin@admin.com', 
        password: 'admin123'
      }
    }
  }, { status: 410 });
}

// Also handle GET requests
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Admin authentication has been migrated to NextAuth.',
    redirectTo: '/auth/login'
  }, { status: 410 });
}