import { NextRequest, NextResponse } from 'next/server'

export function readEnrollmentStatus() {
  const enabled = process.env.OAUTH_ENROLLMENT_ENABLED === 'true'
  return {
    enabled,
    hasStartRoute: true,
    hasCallbackRoute: true,
    requiresAdmin: true,
  }
}

export async function GET(_request: NextRequest) {
  const data = readEnrollmentStatus()
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    }
  })
}


