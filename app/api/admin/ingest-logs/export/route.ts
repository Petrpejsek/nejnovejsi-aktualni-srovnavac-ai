import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '5000', 10) || 5000, 20000)

    const where: any = {}
    if (q) {
      where.OR = [
        { requestId: { contains: q } },
        { idempotencyKey: { contains: q } },
        { endpoint: { contains: q } },
        { slug: { contains: q } },
        { language: { contains: q } },
        { error: { contains: q } },
      ]
    }
    if (status) {
      const code = parseInt(status, 10)
      if (!Number.isNaN(code)) where.statusCode = code
    }

    const rows = await prisma.webhookLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const header = [
      'createdAt','statusCode','endpoint','requestId','idempotencyKey','slug','language','secretId','signatureTimestamp','signatureValid','payloadHash','error'
    ]
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([
        csvEscape(r.createdAt.toISOString()),
        csvEscape(r.statusCode),
        csvEscape(r.endpoint),
        csvEscape(r.requestId),
        csvEscape(r.idempotencyKey || ''),
        csvEscape(r.slug || ''),
        csvEscape(r.language || ''),
        csvEscape(r.secretId || ''),
        csvEscape(r.signatureTimestamp || ''),
        csvEscape(r.signatureValid == null ? '' : r.signatureValid),
        csvEscape(r.payloadHash || ''),
        csvEscape(r.error || ''),
      ].join(','))
    }

    const csv = lines.join('\n')
    const filename = `ingest-logs-${new Date().toISOString().replace(/[:T]/g,'-').slice(0,19)}.csv`
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Export failed', details: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


