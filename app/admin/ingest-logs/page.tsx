import prisma from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = {
  page?: string
  q?: string
  status?: string
}

export default async function IngestLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(parseInt(searchParams?.page || '1', 10) || 1, 1)
  const pageSize = 50
  const q = (searchParams?.q || '').trim()
  const status = (searchParams?.status || '').trim()

  const where: any = {}
  if (q) {
    // simple OR over key fields
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

  const [rows, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.webhookLog.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Ingest Logs</h1>
        <div className="flex items-center gap-3">
          <Link
            href={{ pathname: '/api/admin/ingest-logs/export', query: { q, status } } as any}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded border"
          >Export CSV</Link>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Zpět do adminu</Link>
        </div>
      </div>

      <form className="flex gap-2 mb-4" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Hledat (requestId, slug, endpoint, error...)"
          className="border rounded px-3 py-2 w-full"
        />
        <input
          name="status"
          defaultValue={status}
          placeholder="Status (např. 201, 409, 422, 401)"
          className="border rounded px-3 py-2 w-56"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Hledat</button>
      </form>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Endpoint</th>
              <th className="px-3 py-2 text-left">Slug</th>
              <th className="px-3 py-2 text-left">Lang</th>
              <th className="px-3 py-2 text-left">Idempotency-Key</th>
              <th className="px-3 py-2 text-left">RequestId</th>
              <th className="px-3 py-2 text-left">Error</th>
            </tr>
          </thead>
      <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">{r.statusCode}</td>
                <td className="px-3 py-2">{r.endpoint}</td>
                <td className="px-3 py-2">{r.slug || '-'}</td>
                <td className="px-3 py-2">{r.language || '-'}</td>
                <td className="px-3 py-2">{r.idempotencyKey || '-'}</td>
                <td className="px-3 py-2">{r.requestId}</td>
                <td className="px-3 py-2 max-w-[360px] truncate" title={r.error || ''}>{r.error || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">{total} záznamů</span>
        <div className="flex gap-2">
          <Link
            href={`?${new URLSearchParams({ q, status, page: String(Math.max(1, page - 1)) })}`}
            className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >Předchozí</Link>
          <span className="text-sm">{page}/{totalPages}</span>
          <Link
            href={`?${new URLSearchParams({ q, status, page: String(Math.min(totalPages, page + 1)) })}`}
            className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >Další</Link>
        </div>
      </div>
    </div>
  )
}


