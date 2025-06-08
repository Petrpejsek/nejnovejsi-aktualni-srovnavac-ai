import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomPaymentSettings } from '../admin/custom-payment-settings/route'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ 
        valid: false, 
        error: 'Kód je povinný' 
      }, { status: 400 })
    }

    // Načte aktuální nastavení z admin rozhraní
    const settings = getCurrentCustomPaymentSettings()
    
    if (!settings.couponsEnabled) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Slevové kódy jsou momentálně vypnuté' 
      })
    }

    // Najde odpovídající kupón
    const coupon = settings.availableCoupons.find(
      c => c.active && c.code.toUpperCase() === code.toUpperCase().trim()
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