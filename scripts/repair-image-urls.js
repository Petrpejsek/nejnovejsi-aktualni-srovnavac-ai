#!/usr/bin/env node

/**
 * Repairs broken product.imageUrl paths that point to non-existing screenshots.
 * Strategy:
 * - Find products whose imageUrl contains "/screenshots/" but the file is missing
 * - Derive a slug from product.name (same scheme as our screenshot generator)
 * - Find best matching file in public/screenshots (any extension: png/webp/jpeg/jpg)
 * - Update product.imageUrl to the exact existing filename
 */

import 'dotenv/config'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Prefer .env.local in development if present
try {
  const fs = await import('fs')
  if (fs.default.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' })
  } else {
    dotenv.config()
  }
} catch {}

const prisma = new PrismaClient()

function htmlDecodeLight(s) {
  return String(s || '')
    .replace(/&amp;/g, 'and')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#039;/g, "'")
    .replace(/&#x2D;/g, '-')
}

function normalizeKey(s) {
  return htmlDecodeLight(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function fileExists(relPath) {
  const full = path.join(process.cwd(), 'public', relPath.replace(/^\/+/, ''))
  try {
    return fs.existsSync(full)
  } catch {
    return false
  }
}

function listScreenshotFiles() {
  const dir = path.join(process.cwd(), 'public', 'screenshots')
  const allowExt = new Set(['.png', '.webp', '.jpeg', '.jpg', '.svg'])
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => allowExt.has(path.extname(f).toLowerCase()))
  } catch {
    return []
  }
}

function pickBestMatch(files, productName) {
  const slug = normalizeKey(productName)
  if (!slug) return null

  const extOrder = { '.png': 4, '.webp': 3, '.jpeg': 2, '.jpg': 1, '.svg': 0 }
  const scored = []
  for (const f of files) {
    const base = f.replace(/\.[^.]+$/, '')
    const norm = normalizeKey(base)
    let score = 0
    if (norm.startsWith(slug)) score += 100
    if (slug.startsWith(norm)) score += 80
    if (norm.includes(slug)) score += 60
    // token overlap
    const sTokens = slug.split('-').filter(Boolean)
    const fTokens = norm.split('-').filter(Boolean)
    const common = sTokens.filter(t => fTokens.includes(t)).length
    score += common * 2
    // prefer with numeric timestamp suffix
    const ts = (f.match(/(\d{8,})/) || [])[1]
    if (ts) score += 5
    // extension priority
    score += (extOrder[path.extname(f).toLowerCase()] || 0)
    if (score > 0) scored.push({ f, score })
  }
  if (!scored.length) return null
  scored.sort((a, b) => b.score - a.score)
  return scored[0].f
}

async function main() {
  console.log('🔍 Repairing product imageUrl paths against public/screenshots ...')

  const files = listScreenshotFiles()
  if (!files.length) {
    console.error('❌ No files found in public/screenshots. Aborting to avoid destructive changes.')
    process.exit(1)
  }

  const products = await prisma.product.findMany({
    where: {
      imageUrl: {
        contains: '/screenshots/'
      },
      isActive: true
    },
    select: { id: true, name: true, imageUrl: true }
  })

  let fixed = 0
  let missing = 0
  let unchanged = 0

  for (const p of products) {
    let url = String(p.imageUrl || '')
    // strip query strings like ?v=123
    const qIndex = url.indexOf('?')
    if (qIndex !== -1) url = url.slice(0, qIndex)
    if (!url.startsWith('/screenshots/')) {
      unchanged++
      continue
    }
    if (fileExists(url)) {
      unchanged++
      continue
    }

    const best = pickBestMatch(files, p.name)
    if (!best) {
      const expect = normalizeKey(p.name)
      console.log(`⚠️  No local match for: ${p.name} (expected like: ${expect}-*.{png,webp,jpeg,jpg})`) 
      missing++
      continue
    }

    const newUrl = `/screenshots/${best}`
    if (newUrl === url) {
      unchanged++
      continue
    }

    await prisma.product.update({ where: { id: p.id }, data: { imageUrl: newUrl } })
    console.log(`✅ Updated: ${p.name}\n   ${url} → ${newUrl}`)
    fixed++
  }

  console.log('\n📊 Summary')
  console.log(`   Total: ${products.length}`)
  console.log(`   Fixed: ${fixed}`)
  console.log(`   Unchanged (already valid): ${unchanged}`)
  console.log(`   Missing (no match found): ${missing}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Error:', e)
  await prisma.$disconnect()
  process.exit(1)
})


