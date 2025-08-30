"use client";

export function GscBadge({ status, reason, propertyUrl, siteType, lastSyncAt, lastSyncStats }: {
  status?: string;
  reason?: string;
  propertyUrl?: string;
  siteType?: 'domain' | 'url-prefix' | 'unknown';
  lastSyncAt?: string | null;
  lastSyncStats?: Record<string, any> | null;
}) {
  const sRaw = (status || '').toLowerCase()
  const kind = sRaw === 'indexed' ? 'indexed'
    : (sRaw === 'queued' || sRaw === 'submitted') ? 'queued'
    : (sRaw.includes('error')) ? 'error'
    : (sRaw.includes('not') || sRaw.includes('exclude')) ? 'not_indexed'
    : 'unknown'

  const label = kind === 'indexed' ? 'Indexed'
    : kind === 'queued' ? 'Queued'
    : kind === 'not_indexed' ? 'Not indexed'
    : kind === 'error' ? 'Error'
    : '—'

  const cls = kind === 'indexed'
    ? 'bg-green-100 text-green-700 border-green-200'
    : kind === 'queued'
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : kind === 'not_indexed'
    ? 'bg-gray-100 text-gray-700 border-gray-200'
    : kind === 'error'
    ? 'bg-rose-100 text-rose-700 border-rose-200'
    : 'bg-gray-100 text-gray-700 border-gray-200'

  const rel = lastSyncAt ? timeAgo(new Date(lastSyncAt)) : 'Never'
  const errs = (lastSyncStats && (lastSyncStats.errors || lastSyncStats.ERROR || lastSyncStats.error)) || 0
  const tipLines = [
    `Status: ${label}`,
    `Property: ${propertyUrl || '—'} (type: ${siteType || 'unknown'})`,
    `Last sync: ${rel}`,
  ]
  if (errs > 0) tipLines.push(`Errors: ${errs}`)
  const title = (reason ? `${reason}\n` : '') + tipLines.join('\n')

  return (
    <span
      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium border ${cls}`}
      title={title}
      data-testid="gsc-badge"
    >
      {label}
    </span>
  )
}

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}
