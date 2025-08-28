import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  try {
    if (!process.env.GCP_SA_JSON) {
      return NextResponse.json({ error: 'GSC not configured' }, { status: 503 })
    }
    const where = { url: { startsWith: 'https://comparee.ai/landing/' } }

    const [total, indexed, agg, byCoverageRaw, sampled] = await Promise.all([
      prisma.seo_gsc_status.count({ where }),
      prisma.seo_gsc_status.count({ where: { ...where, indexed: true } }),
      prisma.seo_gsc_status.aggregate({ where, _max: { checked_at: true } }),
      prisma.seo_gsc_status.groupBy({
        by: ['coverage_state'],
        where,
        _count: { _all: true },
      }),
      prisma.seo_gsc_status.findMany({
        where,
        orderBy: { checked_at: 'asc' },
        take: 10,
        select: {
          url: true,
          indexed: true,
          coverage_state: true,
          google_canonical: true,
          user_canonical: true,
          checked_at: true,
        },
      }),
    ])

    const by_coverage: Record<string, number> = {}
    for (const row of byCoverageRaw as any as Array<{ coverage_state: string | null, _count: { _all: number } }>) {
      const key = row.coverage_state || 'UNKNOWN'
      by_coverage[key] = row._count?._all || 0
    }

    return NextResponse.json({
      total,
      indexed,
      last_update: agg._max.checked_at,
      by_coverage,
      sampled,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal' }, { status: 500 })
  }
}


