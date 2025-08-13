import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    // Dual-active secret verification (optional)
    const providedSecret = request.headers.get('x-webhook-secret') || ''
    const providedSecretId = (request.headers.get('x-secret-id') || '').toLowerCase()
    const primarySecret = process.env.WEBHOOK_SECRET
    const secondarySecret = process.env.WEBHOOK_SECRET_SECONDARY
    let authorized = false
    let verifiedSecretId: 'primary' | 'secondary' | null = null

    if (primarySecret || secondarySecret) {
      if (providedSecretId) {
        if ((providedSecretId === 'primary' || providedSecretId === '1') && primarySecret && providedSecret === primarySecret) {
          authorized = true
          verifiedSecretId = 'primary'
        } else if ((providedSecretId === 'secondary' || providedSecretId === '2') && secondarySecret && providedSecret === secondarySecret) {
          authorized = true
          verifiedSecretId = 'secondary'
        }
      } else {
        if (primarySecret && providedSecret === primarySecret) {
          authorized = true
          verifiedSecretId = 'primary'
        } else if (secondarySecret && providedSecret === secondarySecret) {
          authorized = true
          verifiedSecretId = 'secondary'
        }
      }
      if (!authorized) {
        const res = NextResponse.json({ error: 'Unauthorized health check' }, { status: 401 })
        res.headers.set('X-Request-Id', requestId)
        return res
      }
    }

    const checks: any = {
      status: 'ok',
      time: new Date().toISOString(),
      baseUrlSet: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      db: { connected: false },
      idempotencyTable: false,
      secretId: verifiedSecretId,
    }

    // DB connectivity
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.db.connected = true
    } catch (e) {
      checks.db.connected = false
      checks.db.error = e instanceof Error ? e.message : 'Unknown DB error'
    }

    // Idempotency table existence
    try {
      const result: Array<{ exists: boolean }> = await prisma.$queryRawUnsafe(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='IdempotencyKey') AS exists;"
      )
      checks.idempotencyTable = Boolean(result?.[0]?.exists)
    } catch (e) {
      checks.idempotencyTable = false
    }

    const res = NextResponse.json(checks)
    res.headers.set('X-Request-Id', requestId)
    return res
  } catch (error) {
    const res = NextResponse.json({ status: 'error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    res.headers.set('X-Request-Id', requestId)
    return res
  }
}


