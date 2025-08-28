import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (process.env.OAUTH_ENROLLMENT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Enrollment disabled' }, { status: 403 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = 'https://comparee.ai/oauth2callback'
  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID missing' }, { status: 500 })
  }
  const scope = encodeURIComponent('https://www.googleapis.com/auth/webmasters.readonly')
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('scope', scope)
  url.searchParams.set('include_granted_scopes', 'true')
  return NextResponse.redirect(url)
}


