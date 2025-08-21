import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  try {
    const latest = await prisma.ga4Timeseries.findFirst({
      orderBy: { date_time: 'desc' },
      select: { date_time: true },
    })
    if (!latest) {
      return NextResponse.json({ status: 'critical', minutes_since_last: null })
    }

    const now = Date.now()
    const last = new Date(latest.date_time).getTime()
    const diffMin = Math.floor((now - last) / 60000)
    let status: 'ok' | 'warning' | 'critical' = 'ok'
    if (diffMin >= 20) status = 'critical'
    else if (diffMin >= 10) status = 'warning'

    return NextResponse.json({ status, minutes_since_last: diffMin })
  } catch (e: any) {
    console.error('ga4 health error', e)
    return NextResponse.json({ status: 'critical', error: 'internal' }, { status: 500 })
  }
}


