import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OAuth2Client } from 'google-auth-library'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (process.env.OAUTH_ENROLLMENT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Enrollment disabled' }, { status: 403 })
  }
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri = 'https://comparee.ai/oauth2callback'
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing Google client env' }, { status: 500 })
  }
  try {
    const client = new OAuth2Client({ clientId, clientSecret, redirectUri })
    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri })
    const refresh = tokens.refresh_token
    if (!refresh) {
      return NextResponse.json({ error: 'No refresh_token returned. Ensure prompt=consent & access_type=offline' }, { status: 400 })
    }
    // Show a minimal HTML with the token and copy button; do NOT log/save secrets
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>GSC Refresh Token</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding:24px">
        <h1 style="margin-bottom:16px">Google Search Console Refresh Token</h1>
        <p>Copy this token into your production .env as <code>GOOGLE_REFRESH_TOKEN</code> and then set <code>OAUTH_ENROLLMENT_ENABLED=false</code> and redeploy.</p>
        <textarea id="t" rows="4" style="width:100%;font-family:monospace">${refresh}</textarea>
        <div style="margin-top:12px">
          <button onclick="navigator.clipboard.writeText(document.getElementById('t').value)">Copy</button>
        </div>
      </body></html>`
    return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'exchange failed' }, { status: 500 })
  }
}


