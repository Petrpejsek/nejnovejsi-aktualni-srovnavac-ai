import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ 
        valid: false, 
        error: 'Kód je povinný' 
      }, { status: 400 })
    }

    // Načte aktuální nastavení z custom payment settings
    // Používáme fetch pro získání aktuálních nastavení
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    let settings
    try {
      const response = await fetch(`${baseUrl}/api/admin/custom-payment-settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const result = await response.json()
      settings = result.settings
    } catch (error) {
      // Fallback na default nastavení
      settings = {
        couponsEnabled: true,
        availableCoupons: [
          { code: 'WELCOME20', type: 'percent', value: 20, description: '20% sleva', active: true },
          { code: 'SAVE50', type: 'amount', value: 50, description: '$50 sleva', active: true }
        ]
      }
    }
    
    if (!settings.couponsEnabled) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Slevové kódy jsou momentálně vypnuté' 
      })
    }

    // Najde odpovídající kupón
    const coupon = settings.availableCoupons.find(
      (c: any) => c.active && c.code.toUpperCase() === code.toUpperCase().trim()
    )

    if (!coupon) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Neplatný slevový kód' 
      })
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      }
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Chyba při ověřování kupónu' 
    }, { status: 500 })
  }
} 