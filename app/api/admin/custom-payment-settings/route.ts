import { NextRequest, NextResponse } from 'next/server'

interface CustomPaymentSettings {
  enabled: boolean
  title: string
  minAmount: number
  defaultAmount: number
  couponsEnabled: boolean
  targetGroups: string[]
  availableCoupons: Array<{
    code: string
    type: 'percent' | 'amount'
    value: number
    description: string
    active: boolean
  }>
}

// Simulace uložení nastavení (v produkci by se ukládalo do databáze)
let customPaymentSettings: CustomPaymentSettings = {
  enabled: true,
  title: 'Custom Amount',
  minAmount: 10,
  defaultAmount: 100,
  couponsEnabled: true,
  targetGroups: ['all'],
  availableCoupons: [
    { code: 'WELCOME20', type: 'percent', value: 20, description: '20% discount', active: true },
    { code: 'SAVE50', type: 'amount', value: 50, description: '$50 discount', active: true },
    { code: 'PREMIUM30', type: 'percent', value: 30, description: '30% discount', active: true },
    { code: 'FIRST100', type: 'amount', value: 100, description: '$100 discount', active: true }
  ]
}

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      settings: customPaymentSettings 
    })
  } catch (error) {
    console.error('Error fetching custom payment settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validace dat
    if (typeof data.enabled !== 'boolean' ||
        typeof data.title !== 'string' ||
        typeof data.minAmount !== 'number' ||
        typeof data.defaultAmount !== 'number' ||
        typeof data.couponsEnabled !== 'boolean' ||
        !Array.isArray(data.targetGroups) ||
        !Array.isArray(data.availableCoupons)) {
      return NextResponse.json({ 
        error: 'Invalid data format' 
      }, { status: 400 })
    }

    if (data.minAmount < 1 || data.defaultAmount < data.minAmount) {
      return NextResponse.json({ 
        error: 'Invalid amount values' 
      }, { status: 400 })
    }

    // Validace kuponů
    for (const coupon of data.availableCoupons) {
      if (!coupon.code || !coupon.type || !coupon.value || typeof coupon.active !== 'boolean') {
        return NextResponse.json({ 
          error: 'Invalid coupon data' 
        }, { status: 400 })
      }
      
      if (coupon.type === 'percent' && (coupon.value < 1 || coupon.value > 100)) {
        return NextResponse.json({ 
          error: 'Percent coupon value must be between 1-100' 
        }, { status: 400 })
      }
      
      if (coupon.type === 'amount' && coupon.value < 1) {
        return NextResponse.json({ 
          error: 'Amount coupon value must be at least 1' 
        }, { status: 400 })
      }
    }

    // Uložení nastavení
    customPaymentSettings = {
      enabled: data.enabled,
      title: data.title.trim(),
      minAmount: data.minAmount,
      defaultAmount: data.defaultAmount,
      couponsEnabled: data.couponsEnabled,
      targetGroups: data.targetGroups.filter((group: string) => group.trim()),
      availableCoupons: data.availableCoupons.map((coupon: any) => ({
        code: coupon.code.toUpperCase().trim(),
        type: coupon.type,
        value: coupon.value,
        description: coupon.description.trim(),
        active: coupon.active
      }))
    }

    console.log('✅ Custom payment settings updated:', customPaymentSettings)

    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully' 
    })
  } catch (error) {
    console.error('Error saving custom payment settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

 