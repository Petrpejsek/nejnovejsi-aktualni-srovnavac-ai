import { NextRequest, NextResponse } from 'next/server'

function sanitizePath(p?: string) {
  if (!p) return ''
  try {
    return String(p).replace(/([?&]token)=([^&#]+)/gi, '$1=***')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, message, name, stack, path, ua } = await req.json().catch(() => ({}))
    // eslint-disable-next-line no-console
    console.error('client-error', {
      type: typeof type === 'string' ? type : 'unknown',
      message: typeof message === 'string' ? message : '',
      name: typeof name === 'string' ? name : '',
      stack: typeof stack === 'string' ? stack.slice(0, 1000) : '',
      path: sanitizePath(typeof path === 'string' ? path : ''),
      ua: typeof ua === 'string' ? ua.slice(0, 200) : ''
    })
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('client-error-endpoint-failed', { message: e?.message })
    return new NextResponse(null, { status: 204 })
  }
}
