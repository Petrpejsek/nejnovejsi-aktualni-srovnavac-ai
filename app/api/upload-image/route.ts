import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const productName = formData.get('productName') as string

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Soubor není přiložen'
      }, { status: 400 })
    }

    if (!productName) {
      return NextResponse.json({
        success: false,
        error: 'Název produktu je vyžadován'
      }, { status: 400 })
    }

    // Validace typu souboru a přípony
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Soubor musí být obrázek'
      }, { status: 400 })
    }

    const allowedExt = ['jpg','jpeg','png','webp']
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (ext && !allowedExt.includes(ext)) {
      return NextResponse.json({
        success: false,
        error: 'Povolené přípony: .jpg, .jpeg, .png, .webp'
      }, { status: 400 })
    }

    // Validace velikosti (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'Soubor je příliš velký (maximum 5MB)'
      }, { status: 400 })
    }

    // Vytvoření bezpečného názvu souboru
    const sanitizedProductName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)

    const timestamp = Date.now()
    const fileNameBase = `${sanitizedProductName}-${timestamp}`

    // Cesta k uložení souboru
    const uploadDir = join(process.cwd(), 'public', 'screenshots')
    await mkdir(uploadDir, { recursive: true })

    // Převod souboru na buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Konverze do WebP (kvalita 85)
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer()

    const webpName = `${fileNameBase}.webp`
    const filePath = join(uploadDir, webpName)
    await writeFile(filePath, webpBuffer)

    const imageUrl = `/screenshots/${webpName}`

    console.log(`📁 Obrázek nahrán: ${imageUrl}`)

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName: webpName,
      message: 'Obrázek byl úspěšně nahrán'
    })

  } catch (error) {
    console.error('❌ Chyba při nahrávání obrázku:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při nahrávání souboru'
    }, { status: 500 })
  }
} 