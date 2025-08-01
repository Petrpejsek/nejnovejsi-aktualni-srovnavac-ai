import { NextRequest, NextResponse } from 'next/server';

// 🚨 DEPRECATED API ENDPOINT
// This endpoint is no longer used. All user authentication is handled by NextAuth.

export async function POST(request: NextRequest) {
  console.log('⚠️  DEPRECATED: /api/users/login called - redirecting to NextAuth');
  
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Please use NextAuth for user login.',
    migrationInfo: {
      message: 'User login has been migrated to NextAuth',
      newEndpoint: '/api/auth/signin',
      loginPage: '/user-area/login',
      testCredentials: {
        role: 'user',
        email: 'petr@comparee.cz', 
        password: 'user123'
      }
    }
  }, { status: 410 });
}

// Also handle GET requests
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. User authentication has been migrated to NextAuth.',
    redirectTo: '/user-area/login'
  }, { status: 410 });
}