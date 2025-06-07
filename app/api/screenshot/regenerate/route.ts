import { NextRequest, NextResponse } from 'next/server'

// Stejná funkce jako v scraping API
async function createScreenshot(url: string, productName: string): Promise<string | null> {
  try {
    // Pokus o screenshot pomocí Python serveru
    const response = await fetch('http://localhost:5000/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, name: productName })
    })

    if (!response.ok) {
      console.warn(`⚠️ Screenshot server nedostupný pro ${url}`)
      return null
    }

    const data = await response.json()
    
    console.log(`📊 Screenshot server odpověď:`, data)
    
    if (data.success && data.screenshotUrl) {
      console.log(`📸 Screenshot vytvořen: ${data.screenshotUrl}`)
      return data.screenshotUrl
    } else {
      console.warn(`⚠️ Screenshot nebyl vytvořen: ${data.error}`)
      return null
    }

  } catch (error) {
    console.warn(`⚠️ Chyba při vytváření screenshotu pro ${url}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, productName } = await request.json()

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL je vyžadována'
      }, { status: 400 })
    }

    if (!productName) {
      return NextResponse.json({
        success: false,
        error: 'Název produktu je vyžadován'
      }, { status: 400 })
    }

    console.log(`🔄 Regeneruji screenshot pro: ${url}`)

    // Vytvořit nový screenshot
    const screenshotUrl = await createScreenshot(url, productName)

    if (!screenshotUrl) {
      return NextResponse.json({
        success: false,
        error: 'Nepodařilo se vytvořit screenshot. Zkontrolujte zda je screenshot server spuštěný.'
      }, { status: 500 })
    }

    console.log(`✅ Screenshot úspěšně regenerován: ${screenshotUrl}`)

    return NextResponse.json({
      success: true,
      screenshotUrl,
      message: 'Screenshot byl úspěšně regenerován'
    })

  } catch (error) {
    console.error('❌ Chyba při regeneraci screenshotu:', error)
    return NextResponse.json({
      success: false,
      error: 'Vnitřní chyba serveru'
    }, { status: 500 })
  }
} 