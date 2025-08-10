import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'
import crypto from 'crypto'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token || token.role !== 'company' || !token.email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true, description: true } })
    if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
    const key = (company.description || '').match(/APIKEY:([A-Za-z0-9_-]{24,})/)?.[1] || null
    return NextResponse.json({ success: true, data: { apiKey: key } })
  } catch (e) {
    console.error('API Keys GET error', e)
    return NextResponse.json({ success: false, error: 'Failed to load API Key' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token || token.role !== 'company' || !token.email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true, description: true } })
    if (!company) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })

    const newKey = `cmp_${crypto.randomBytes(24).toString('base64url')}`
    const desc = company.description || ''
    const nextDesc = desc.includes('APIKEY:') ? desc.replace(/APIKEY:[^\s]+/, `APIKEY:${newKey}`) : `${desc}${desc ? ' ' : ''}APIKEY:${newKey}`
    await prisma.company.update({ where: { id: company.id }, data: { description: nextDesc } })
    return NextResponse.json({ success: true, data: { apiKey: newKey } })
  } catch (e) {
    console.error('API Keys POST error', e)
    return NextResponse.json({ success: false, error: 'Failed to regenerate API Key' }, { status: 500 })
  }
}


