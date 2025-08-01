import { NextRequest, NextResponse } from 'next/server';

// 🚨 DEPRECATED API ENDPOINT
// This endpoint is no longer used. All company authentication is handled by NextAuth.

export async function POST(request: NextRequest) {
  console.log('⚠️  DEPRECATED: /api/advertiser/login called - redirecting to NextAuth');
  
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Please use NextAuth for company login.',
    migrationInfo: {
      message: 'Company login has been migrated to NextAuth',
      newEndpoint: '/api/auth/signin',
      loginPage: '/company',
      testCredentials: {
        role: 'company',
        email: 'firma@firma.cz', 
        password: 'firma123'
      }
    }
  }, { status: 410 });
}

// Also handle GET requests
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Company authentication has been migrated to NextAuth.',
    redirectTo: '/company'
  }, { status: 410 });
}