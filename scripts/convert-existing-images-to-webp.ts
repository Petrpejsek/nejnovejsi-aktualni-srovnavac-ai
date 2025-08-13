#!/usr/bin/env ts-node
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots')
  const placeholder = '/img/placeholder.svg'

  // Ensure directory exists
  if (!fs.existsSync(screenshotsDir)) {
    console.log('No screenshots directory; nothing to convert.')
    return
  }

  const all = await prisma.product.findMany({ select: { id: true, imageUrl: true } })
  let converted = 0
  for (const p of all) {
    const url = p.imageUrl || ''
    if (!url || url === placeholder) continue

    // Only handle local screenshots
    if (!url.startsWith('/screenshots/')) continue

    // Skip if already webp
    if (url.toLowerCase().endsWith('.webp')) continue

    const abs = path.join(process.cwd(), 'public', url)
    if (!fs.existsSync(abs)) {
      console.log('Missing file, skipping:', url)
      continue
    }

    const base = url.replace(/^\/screenshots\//, '').replace(/\.[^.]+$/, '')
    const webpName = base + '.webp'
    const absWebp = path.join(screenshotsDir, webpName)

    try {
      const buf = fs.readFileSync(abs)
      const out = await sharp(buf).webp({ quality: 85 }).toBuffer()
      fs.writeFileSync(absWebp, out)

      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: `/screenshots/${webpName}` }
      })
      converted++
    } catch (e) {
      console.log('Failed converting', url, e)
    }
  }

  console.log(`Converted ${converted} images to WebP`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })


