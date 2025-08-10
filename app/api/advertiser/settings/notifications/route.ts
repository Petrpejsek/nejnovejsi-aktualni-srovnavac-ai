import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NotificationPrefs = {
  emailLowBalance: boolean
  emailInvoice: boolean
  emailWeeklySummary: boolean
  emailNewsletter: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailLowBalance: true,
  emailInvoice: true,
  emailWeeklySummary: true,
  emailNewsletter: false,
}

function parseSettingsBlob(description: string | null) {
  if (!description) return {}
  // Prefer explicit SETTINGS marker
  const marker = ' SETTINGS:'
  const idx = description.lastIndexOf(marker)
  if (idx !== -1) {
    try {
      const jsonText = description.substring(idx + marker.length).trim()
      return JSON.parse(jsonText)
    } catch {}
  }
  // Try to find a JSON object containing "settings"
  const match = description.match(/\{[\s\S]*"settings"[\s\S]*\}$/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  return {}
}

function stringifySettings(description: string | null, settings: any) {
  const base = (description || '').replace(/ SETTINGS:\s*\{[\s\S]*\}$/,'').trim()
  return `${base}${base ? ' ' : ''}SETTINGS:${JSON.stringify(settings)}`
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token || token.role !== 'company' || !token.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true, description: true } })
    if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
    const blob = parseSettingsBlob(company.description)
    const prefs: NotificationPrefs = { ...DEFAULT_PREFS, ...(blob.settings?.notifications || {}) }
    return NextResponse.json({ success: true, data: prefs })
  } catch (e) {
    console.error('Notifications GET error', e)
    return NextResponse.json({ success: false, error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token || token.role !== 'company' || !token.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true, description: true } })
    if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })

    const blob = parseSettingsBlob(company.description)
    const nextBlob = {
      ...blob,
      settings: {
        ...(blob.settings || {}),
        notifications: { ...DEFAULT_PREFS, ...(blob.settings?.notifications || {}), ...body }
      }
    }

    await prisma.company.update({ where: { id: company.id }, data: { description: stringifySettings(company.description, nextBlob) } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Notifications POST error', e)
    return NextResponse.json({ success: false, error: 'Failed to save notifications' }, { status: 500 })
  }
}


