import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Hook = { id: string, url: string, event: string, enabled: boolean }

function parseHooks(desc: string | null): Hook[] {
  if (!desc) return []
  const match = desc.match(/WEBHOOKS:(\[.*\])/) // simple capture
  if (match) {
    try { return JSON.parse(match[1]) } catch {}
  }
  return []
}
function stringifyHooks(desc: string | null, hooks: Hook[]) {
  const base = (desc || '').replace(/WEBHOOKS:\[.*\]/, '').trim()
  return `${base}${base ? ' ' : ''}WEBHOOKS:${JSON.stringify(hooks)}`
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request })
  if (!token || token.role !== 'company' || !token.email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true, description: true } })
  if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: parseHooks(company.description) })
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request })
  if (!token || token.role !== 'company' || !token.email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true, description: true } })
  if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
  const body = await request.json()
  const hooks = parseHooks(company.description)
  if (body.action === 'add') {
    hooks.push({ id: crypto.randomUUID(), url: String(body.url), event: String(body.event), enabled: true })
  } else if (body.action === 'toggle') {
    const idx = hooks.findIndex(h => h.id === body.id)
    if (idx !== -1) hooks[idx].enabled = Boolean(body.enabled)
  } else if (body.action === 'delete') {
    const idx = hooks.findIndex(h => h.id === body.id)
    if (idx !== -1) hooks.splice(idx, 1)
  } else if (body.action === 'test') {
    // naive test without secret signing; can be extended
    try {
      await fetch(body.url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Comparee-Event': 'test' }, body: JSON.stringify({ ping: true }) })
    } catch {}
  }
  await prisma.company.update({ where: { id: company.id }, data: { description: stringifyHooks(company.description, hooks) } })
  return NextResponse.json({ success: true, data: hooks })
}


